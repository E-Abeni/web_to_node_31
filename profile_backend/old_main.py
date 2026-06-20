from fastapi import FastAPI, Query, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Any
import asyncpg
import os
import json
import math
from contextlib import asynccontextmanager


# ---------------------------------------------------------------------------
# Database connection pool
# ---------------------------------------------------------------------------

DB_DSN = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:admin@172.20.137.129:5432/postgres",
)

pool: asyncpg.Pool | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global pool
    pool = await asyncpg.create_pool(dsn=DB_DSN, min_size=2, max_size=10)
    yield
    await pool.close()


app = FastAPI(
    title="Customer Profile API",
    description="Flexible search, filter, and pagination over v3_customer_profile",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

TABLE = "v3_customer_profile"

# Columns that support free-text ILIKE search
SEARCHABLE_TEXT_COLUMNS = [
    "account_number",
    "NAMES",
    "FULL_NAMES",
    "OCCUPATIONS",
    "ACCOUNT_TYPES",
    "BRANCHES",
    "GENDERS",
    "PHONE_NUMBERS",
    "KYC_EXTENDED_JSON",
    "beneficiaries_list",
    "conducting_manner_list",
    "branch_list",
    "currency_list",
    "time_of_day_profile_list",
]

# Numeric columns that support range filters (min_<col> / max_<col>)
NUMERIC_COLUMNS = [
    "sent_amount_total", "sent_amount_average", "sent_amount_std", "sent_amount_count",
    "recieve_amount_total", "recieve_amount_average", "recieve_amount_std", "recieve_amount_count",
    "s_and_r_amount_total", "s_and_r_amount_average", "s_and_r_amount_std", "s_and_r_amount_count",
    "receive_percentage_by_frequency", "sent_percentage_by_frequency",
    "receive_percentage_by_amount", "sent_percentage_by_amount",
    "average_rolling_sum_1hr", "average_rolling_avg_1hr", "average_rolling_std_1hr", "average_rolling_frequency_1hr",
    "average_rolling_sum_3hr", "average_rolling_avg_3hr", "average_rolling_std_3hr", "average_rolling_frequency_3hr",
    "average_rolling_sum_6hr", "average_rolling_avg_6hr", "average_rolling_std_6hr", "average_rolling_frequency_6hr",
    "average_rolling_sum_12hr", "average_rolling_avg_12hr", "average_rolling_std_12hr", "average_rolling_frequency_12hr",
    "average_rolling_sum_1day", "average_rolling_avg_1day", "average_rolling_std_1day", "average_rolling_frequency_1day",
    "average_rolling_sum_3days", "average_rolling_avg_3days", "average_rolling_std_3days", "average_rolling_frequency_3days",
    "average_rolling_sum_7days", "average_rolling_avg_7days", "average_rolling_std_7days", "average_rolling_frequency_7days",
    "average_rolling_sum_30days", "average_rolling_avg_30days", "average_rolling_std_30days", "average_rolling_frequency_30days",
    "cash_count", "non_cash_count", "cash_amount_total", "non_cash_amount_total",
    "cash_count_ratio", "cash_amount_ratio",
    "round_1000_ratio", "same_value_ratio", "just_below_threshold_frequency", "irregular_amount_ratio",
    "night_tx_count", "day_tx_count", "night_day_frequency_ratio",
    "night_total_amount", "day_total_amount", "night_day_amount_ratio",
    "min_time_lapse", "max_time_lapse", "avg_time_lapse", "stddev_time_lapse", "lapse_count",
    "weekend_total_amount", "weekend_avg_amount", "weekend_std_amount", "weekend_count",
    "workday_total_amount", "workday_avg_amount", "workday_std_amount", "workday_count",
    "weekend_vs_workday_freq_ratio", "weekend_vs_workday_amount_ratio",
    "unique_beneficiary_ratio",
]

VALID_COLUMNS = set(SEARCHABLE_TEXT_COLUMNS + NUMERIC_COLUMNS + [
    "last_received_activity_timestamp",
    "last_sent_activity_timestamp",
    "last_activity_timestamp",
    "gap_between_last_received_and_sent",
    "weekend_receive_to_send_ratio",
    "workday_receive_to_send_ratio",
    "weekend_vs_workday_receive_send_ratio_comp",
])

SORT_DIRECTIONS = {"asc", "desc"}


async def get_db() -> asyncpg.Pool:
    if pool is None:
        raise HTTPException(status_code=503, detail="Database pool not ready")
    return pool


def _safe_column(col: str) -> str:
    """Ensure a column name is valid to prevent SQL injection."""
    if col not in VALID_COLUMNS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown column '{col}'. "
                   f"Valid columns: {sorted(VALID_COLUMNS)}",
        )
    return f'"{col}"'


def _serialize_row(row: asyncpg.Record) -> dict:
    """Convert a DB row to a plain dict, parsing embedded JSON strings."""
    result = {}
    json_keys = {
        "time_of_day_profile_list", "beneficiaries_list",
        "conducting_manner_list", "branch_list", "currency_list",
        "NAMES", "FULL_NAMES", "OCCUPATIONS", "ACCOUNT_TYPES",
        "BRANCHES", "GENDERS", "PHONE_NUMBERS", "KYC_EXTENDED_JSON",
    }
    for key, value in dict(row).items():
        if value is not None and key in json_keys and isinstance(value, str):
            try:
                value = json.loads(value)
            except (json.JSONDecodeError, TypeError):
                pass
        result[key] = value
    return result


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/customers", summary="List, filter, search and paginate customer profiles")
async def list_customers(
    # --- Pagination ---
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(20, ge=1, le=500, description="Records per page (max 500)"),

    # --- Full-text search across all searchable columns ---
    search: Optional[str] = Query(None, description="Free-text search across account/name/KYC fields"),

    # --- Exact / partial match on specific columns ---
    account_number: Optional[str] = Query(None, description="Exact account number"),
    account_type: Optional[str] = Query(None, description="ILIKE match on ACCOUNT_TYPES JSON field"),
    gender: Optional[str] = Query(None, description="ILIKE match on GENDERS JSON field"),
    branch: Optional[str] = Query(None, description="ILIKE match on BRANCHES JSON field"),
    name: Optional[str] = Query(None, description="ILIKE match on NAMES JSON field"),
    currency: Optional[str] = Query(None, description="ILIKE match inside currency_list JSON field"),
    conducting_manner: Optional[str] = Query(None, description="ILIKE match inside conducting_manner_list JSON field"),

    # --- Numeric range filters (any numeric column) ---
    # Usage: min_sent_amount_total=1000 & max_sent_amount_total=500000
    # These are parsed generically from query params in the route body below.

    # --- Sorting ---
    sort_by: str = Query("account_number", description="Column to sort by"),
    sort_dir: str = Query("asc", description="Sort direction: asc or desc"),

    # --- Column selection ---
    fields: Optional[str] = Query(
        None,
        description="Comma-separated list of columns to return. Omit to return all.",
    ),

    db: asyncpg.Pool = Depends(get_db),

    # Catch-all for dynamic min_<col> / max_<col> params is handled via Request below
) -> dict[str, Any]:
    # Validated sort
    if sort_dir.lower() not in SORT_DIRECTIONS:
        raise HTTPException(status_code=400, detail="sort_dir must be 'asc' or 'desc'")
    safe_sort = _safe_column(sort_by)

    conditions: list[str] = []
    args: list[Any] = []

    def _add(condition: str, value: Any):
        args.append(value)
        conditions.append(condition.replace("?", f"${len(args)}"))

    # --- Full-text search ---
    if search:
        sub = " OR ".join(
            f'"{col}"::text ILIKE ${len(args) + 1}' for col in SEARCHABLE_TEXT_COLUMNS
        )
        args.append(f"%{search}%")
        conditions.append(f"({sub})")

    # --- Exact / partial filters ---
    if account_number:
        _add('"account_number" = ?', account_number)
    if name:
        _add('"NAMES"::text ILIKE ?', f"%{name}%")
    if account_type:
        _add('"ACCOUNT_TYPES"::text ILIKE ?', f"%{account_type}%")
    if gender:
        _add('"GENDERS"::text ILIKE ?', f"%{gender}%")
    if branch:
        _add('"BRANCHES"::text ILIKE ?', f"%{branch}%")
    if currency:
        _add('"currency_list"::text ILIKE ?', f"%{currency}%")
    if conducting_manner:
        _add('"conducting_manner_list"::text ILIKE ?', f"%{conducting_manner}%")

    # --- Column projection ---
    if fields:
        selected = [f.strip() for f in fields.split(",") if f.strip()]
        col_clause = ", ".join(_safe_column(c) for c in selected)
    else:
        col_clause = "*"

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    offset = (page - 1) * page_size

    count_sql = f"SELECT COUNT(*) FROM {TABLE} {where_clause}"
    data_sql = (
        f"SELECT {col_clause} FROM {TABLE} {where_clause} "
        f"ORDER BY {safe_sort} {sort_dir.upper()} "
        f"LIMIT {page_size} OFFSET {offset}"
    )

    async with db.acquire() as conn:
        total = await conn.fetchval(count_sql, *args)
        rows = await conn.fetch(data_sql, *args)

    return {
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_records": total,
            "total_pages": math.ceil(total / page_size) if total else 0,
            "has_next": (page * page_size) < total,
            "has_prev": page > 1,
        },
        "filters_applied": {
            "search": search,
            "account_number": account_number,
            "name": name,
            "account_type": account_type,
            "gender": gender,
            "branch": branch,
            "currency": currency,
            "conducting_manner": conducting_manner,
            "sort_by": sort_by,
            "sort_dir": sort_dir,
        },
        "data": [_serialize_row(r) for r in rows],
    }


@app.get("/customers/{account_number}", summary="Get a single customer profile by account number")
async def get_customer(
    account_number: str,
    fields: Optional[str] = Query(None, description="Comma-separated columns to return"),
    db: asyncpg.Pool = Depends(get_db),
) -> dict[str, Any]:
    if fields:
        selected = [f.strip() for f in fields.split(",") if f.strip()]
        col_clause = ", ".join(_safe_column(c) for c in selected)
    else:
        col_clause = "*"

    sql = f'SELECT {col_clause} FROM {TABLE} WHERE "account_number" = $1 LIMIT 1'

    async with db.acquire() as conn:
        row = await conn.fetchrow(sql, account_number)

    if not row:
        raise HTTPException(status_code=404, detail=f"Account '{account_number}' not found")

    return _serialize_row(row)


@app.get("/customers/range-filter/query", summary="Filter by numeric range on any numeric column")
async def range_filter(
    column: str = Query(..., description="Numeric column to filter on"),
    min_value: Optional[float] = Query(None, description="Minimum value (inclusive)"),
    max_value: Optional[float] = Query(None, description="Maximum value (inclusive)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=500),
    sort_by: str = Query("account_number"),
    sort_dir: str = Query("asc"),
    fields: Optional[str] = Query(None),
    db: asyncpg.Pool = Depends(get_db),
) -> dict[str, Any]:
    if column not in NUMERIC_COLUMNS:
        raise HTTPException(
            status_code=400,
            detail=f"'{column}' is not a filterable numeric column. "
                   f"Choose from: {sorted(NUMERIC_COLUMNS)}",
        )
    if min_value is None and max_value is None:
        raise HTTPException(status_code=400, detail="Provide at least min_value or max_value")
    if sort_dir.lower() not in SORT_DIRECTIONS:
        raise HTTPException(status_code=400, detail="sort_dir must be 'asc' or 'desc'")

    safe_col = _safe_column(column)
    safe_sort = _safe_column(sort_by)

    conditions, args = [], []

    def _add(cond, val):
        args.append(val)
        conditions.append(cond.replace("?", f"${len(args)}"))

    if min_value is not None:
        _add(f"{safe_col} >= ?", min_value)
    if max_value is not None:
        _add(f"{safe_col} <= ?", max_value)

    col_clause = "*"
    if fields:
        selected = [f.strip() for f in fields.split(",") if f.strip()]
        col_clause = ", ".join(_safe_column(c) for c in selected)

    where = "WHERE " + " AND ".join(conditions)
    offset = (page - 1) * page_size

    count_sql = f"SELECT COUNT(*) FROM {TABLE} {where}"
    data_sql = (
        f"SELECT {col_clause} FROM {TABLE} {where} "
        f"ORDER BY {safe_sort} {sort_dir.upper()} "
        f"LIMIT {page_size} OFFSET {offset}"
    )

    async with db.acquire() as conn:
        total = await conn.fetchval(count_sql, *args)
        rows = await conn.fetch(data_sql, *args)

    return {
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_records": total,
            "total_pages": math.ceil(total / page_size) if total else 0,
            "has_next": (page * page_size) < total,
            "has_prev": page > 1,
        },
        "filter": {"column": column, "min_value": min_value, "max_value": max_value},
        "data": [_serialize_row(r) for r in rows],
    }


@app.get("/meta/columns", summary="List all available columns and their filter capabilities")
async def list_columns() -> dict[str, Any]:
    return {
        "numeric_columns": sorted(NUMERIC_COLUMNS),
        "searchable_text_columns": sorted(SEARCHABLE_TEXT_COLUMNS),
        "all_columns": sorted(VALID_COLUMNS),
    }
