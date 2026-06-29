from fastapi import FastAPI, Query, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
import asyncpg
import os
import json
import math
from contextlib import asynccontextmanager
from datetime import datetime
import jwt  # Installed via: pip install "PyJWT[cryptography]"

# ---------------------------------------------------------------------------
# Global Environment & System Settings
# ---------------------------------------------------------------------------
DB_DSN = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:admin@172.27.23.130:5432/postgres",
)

# Authentication server endpoint for token refreshes or status checks
CTMS_AUTH_URL = "http://172.27.23.213:3001" 

# Provided EC P-256 Public Key for local cryptographic verification
CTMS_PUBLIC_KEY = """-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEjM98cnQ+950yGc1dtiXRdFj0tsrt
+zfFs0gRGyJZfWagqcb/aW9oFmxgjikMJdA8AYsFARX8b+OZCqgNdkvjDQ==
-----END PUBLIC KEY-----"""

security = HTTPBearer()

# ---------------------------------------------------------------------------
# DRBAC Security Guard Class (Middleware Layer)
# ---------------------------------------------------------------------------
class SecurityGuard:
    """
    Enforces CTMS local verification parameters: Algorithm ES256, 
    issuer ctms-auth, audience ctms-api, and permission checks.
    """
    def __init__(self, required_permission: str):
        self.required_permission = required_permission

    def __call__(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
        token = credentials.credentials
        
        try:
            # Verify ES256 signature, issuer (iss), audience (aud), and expiration (exp)
            payload = jwt.decode(
                token,
                CTMS_PUBLIC_KEY,
                algorithms=["ES256"],
                audience="ctms-api",  # 'aud' must equal ctms-api
                issuer="ctms-auth"    # 'iss' must equal ctms-auth
            )
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
        except jwt.InvalidSignatureError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signature")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        # Enforce Access Token constraint (rejects refresh tokens)
        if payload.get("token_type") != "access":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Wrong token type for API call")

        # Verify Endpoint Permissions against DRBAC claims array
        permissions: List[str] = payload.get("permissions", [])
        if self.required_permission not in permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Insufficient permissions"
            )

        # Build & map context back to route for audits
        return {
            "user_id": payload.get("sub"),
            "role": payload.get("role"),
            "entity_id": payload.get("entity_id"),
            "permissions": permissions
        }

# ---------------------------------------------------------------------------
# Database Helpers & Validation
# ---------------------------------------------------------------------------
TABLE = "v6_customer_profile"

SEARCHABLE_TEXT_COLUMNS = [
    "account_number", "NAMES", "FULL_NAMES", "OCCUPATIONS", "ACCOUNT_TYPES",
    "BRANCHES", "GENDERS", "PHONE_NUMBERS", "KYC_EXTENDED_JSON",
    "beneficiaries_list", "conducting_manner_list", "branch_list",
    "currency_list", "time_of_day_profile_list",
]

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
    "last_received_activity_timestamp", "last_sent_activity_timestamp",
    "last_activity_timestamp", "gap_between_last_received_and_sent",
    "weekend_receive_to_send_ratio", "workday_receive_to_send_ratio",
    "weekend_vs_workday_receive_send_ratio_comp",
])

SORT_DIRECTIONS = {"asc", "desc"}

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

async def get_db() -> asyncpg.Pool:
    if pool is None:
        raise HTTPException(status_code=503, detail="Database pool not ready")
    return pool

def _safe_column(col: str) -> str:
    if col not in VALID_COLUMNS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown column '{col}'. Valid columns: {sorted(VALID_COLUMNS)}",
        )
    return f'"{col}"'

def _serialize_row(row: asyncpg.Record) -> dict:
    result = {}
    json_keys = {
        "time_of_day_profile_list", "beneficiaries_list", "conducting_manner_list", 
        "branch_list", "currency_list", "NAMES", "FULL_NAMES", "OCCUPATIONS", 
        "ACCOUNT_TYPES", "BRANCHES", "GENDERS", "PHONE_NUMBERS", "KYC_EXTENDED_JSON",
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
# Authenticated & Authorized Routes
# ---------------------------------------------------------------------------

@app.get("/customers", summary="List, filter, search and paginate customer profiles")
async def list_customers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=500),
    search: Optional[str] = Query(None),
    account_number: Optional[str] = Query(None),
    account_type: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    name: Optional[str] = Query(None),
    currency: Optional[str] = Query(None),
    conducting_manner: Optional[str] = Query(None),
    sort_by: str = Query("account_number"),
    sort_dir: str = Query("asc"),
    fields: Optional[str] = Query(None),
    db: asyncpg.Pool = Depends(get_db),
    # Enforce token validation and require "SearchPersons" permission
    current_user: dict = Depends(SecurityGuard("SearchPersons"))
) -> dict[str, Any]:
    if sort_dir.lower() not in SORT_DIRECTIONS:
        raise HTTPException(status_code=400, detail="sort_dir must be 'asc' or 'desc'")
    safe_sort = _safe_column(sort_by)

    conditions: list[str] = []
    args: list[Any] = []

    def _add(condition: str, value: Any):
        args.append(value)
        conditions.append(condition.replace("?", f"${len(args)}"))

    if search:
        sub = " OR ".join(f'"{col}"::text ILIKE ${len(args) + 1}' for col in SEARCHABLE_TEXT_COLUMNS)
        args.append(f"%{search}%")
        conditions.append(f"({sub})")

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
            "page": page, "page_size": page_size, "total_records": total,
            "total_pages": math.ceil(total / page_size) if total else 0,
            "has_next": (page * page_size) < total, "has_prev": page > 1,
        },
        "filters_applied": {
            "search": search, "account_number": account_number, "name": name,
            "account_type": account_type, "gender": gender, "branch": branch,
            "currency": currency, "conducting_manner": conducting_manner,
            "sort_by": sort_by, "sort_dir": sort_dir,
        },
        "data": [_serialize_row(r) for r in rows],
    }

@app.get("/customers/{account_number}", summary="Get a single customer profile by account number")
async def get_customer(
    account_number: str,
    fields: Optional[str] = Query(None),
    db: asyncpg.Pool = Depends(get_db),
    # Enforce token validation and require "SearchPersons" permission
    current_user: dict = Depends(SecurityGuard("SearchPersons"))
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
    column: str = Query(...),
    min_value: Optional[float] = Query(None),
    max_value: Optional[float] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=500),
    sort_by: str = Query("account_number"),
    sort_dir: str = Query("asc"),
    fields: Optional[str] = Query(None),
    db: asyncpg.Pool = Depends(get_db),
    # Enforce token validation and require "SearchPersons" permission
    current_user: dict = Depends(SecurityGuard("SearchPersons"))
) -> dict[str, Any]:
    if column not in NUMERIC_COLUMNS:
        raise HTTPException(
            status_code=400,
            detail=f"'{column}' is not a filterable numeric column.",
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
            "page": page, "page_size": page_size, "total_records": total,
            "total_pages": math.ceil(total / page_size) if total else 0,
            "has_next": (page * page_size) < total, "has_prev": page > 1,
        },
        "filter": {"column": column, "min_value": min_value, "max_value": max_value},
        "data": [_serialize_row(r) for r in rows],
    }

@app.get("/meta/columns", summary="List all available columns and their filter capabilities")
async def list_columns(
    # Enforce token validation and require "SearchPersons" permission
    current_user: dict = Depends(SecurityGuard("SearchPersons"))
) -> dict[str, Any]:
    return {
        "numeric_columns": sorted(NUMERIC_COLUMNS),
        "searchable_text_columns": sorted(SEARCHABLE_TEXT_COLUMNS),
        "all_columns": sorted(VALID_COLUMNS),
    }

@app.post("/sar-reports", summary="Submit a Suspicious Activity Report")
async def create_sar(
    report: dict[str, Any],
    db: asyncpg.Pool = Depends(get_db),
    # Enforce verification and require explicit permission to modify audit entities
    current_user: dict = Depends(SecurityGuard("SubmitSAR"))
) -> dict[str, Any]:
    # Extract the actor user id for the mandatory system audit log requirement
    actor_id = current_user["user_id"]

    reported_at_str = report.get("reported_at")
    reported_at_dt = None

    if reported_at_str:
        try:
            reported_at_dt = datetime.fromisoformat(
                reported_at_str.replace('Z', '+00:00')
            ).replace(tzinfo=None) 
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format for reported_at")

    sql = """
        INSERT INTO sar_reports (
            account_number,
            account_holder_name,
            risk_score,
            risk_level,
            suspicion_type,
            findings,
            risk_breakdown,
            transaction_stats,
            reported_at,
            actor_id,
            created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        RETURNING id, created_at
    """
    
    async with db.acquire() as conn:
        # Added tracking actor_id column directly to schema script for compliance tracking
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS sar_reports (
                id SERIAL PRIMARY KEY,
                account_number TEXT NOT NULL,
                account_holder_name TEXT,
                risk_score NUMERIC(5,2),
                risk_level TEXT,
                suspicion_type TEXT,
                findings TEXT,
                risk_breakdown JSONB,
                transaction_stats JSONB,
                reported_at TIMESTAMP,
                actor_id TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        
        row = await conn.fetchrow(
            sql,
            report.get("account_number"),
            report.get("account_holder_name"),
            report.get("risk_score"),
            report.get("risk_level"),
            report.get("suspicion_type"),
            report.get("findings"),
            json.dumps(report.get("risk_breakdown", [])),
            json.dumps(report.get("transaction_stats", {})),
            reported_at_dt,
            actor_id,  # Inserted actor_id context safely
        )
    
    return {
        "success": True,
        "sar_id": row["id"],
        "created_at": row["created_at"].isoformat(),
        "message": "SAR submitted successfully"
    }

@app.get("/sar-reports", summary="List all SAR reports")
async def list_sars(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    risk_level: Optional[str] = Query(None),
    account_number: Optional[str] = Query(None),
    db: asyncpg.Pool = Depends(get_db),
    # Guarding endpoint with explicit access permission
    current_user: dict = Depends(SecurityGuard("ViewSAR"))
) -> dict[str, Any]:
    conditions = []
    args = []
    
    if risk_level:
        args.append(risk_level.upper())
        conditions.append(f"risk_level = ${len(args)}")
    
    if account_number:
        args.append(account_number)
        conditions.append(f"account_number = ${len(args)}")
    
    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    offset = (page - 1) * page_size
    
    count_sql = f"SELECT COUNT(*) FROM sar_reports {where}"
    data_sql = f"SELECT * FROM sar_reports {where} ORDER BY created_at DESC LIMIT {page_size} OFFSET {offset}"
    
    async with db.acquire() as conn:
        table_exists = await conn.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'sar_reports'
            )
        """)
        
        if not table_exists:
            return {
                "pagination": {"page": page, "page_size": page_size, "total_records": 0, "total_pages": 0},
                "data": []
            }
        
        total = await conn.fetchval(count_sql, *args)
        rows = await conn.fetch(data_sql, *args)
    
    return {
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_records": total,
            "total_pages": math.ceil(total / page_size) if total else 0,
        },
        "data": [dict(r) for r in rows],
    }