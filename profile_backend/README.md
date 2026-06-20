# Customer Profile API

FastAPI service for accessing, filtering, searching, and paginating `v3_customer_profile`.

---

## Setup

```bash
pip install -r requirements.txt

# Set your Postgres DSN
export DATABASE_URL="postgresql://user:password@localhost:5432/yourdb"

uvicorn main:app --reload
```

Interactive docs: http://localhost:8000/docs

---

## Endpoints

### `GET /customers`
Main endpoint — list, filter, search, sort, and paginate profiles.

| Parameter | Type | Description |
|---|---|---|
| `page` | int | Page number (default 1) |
| `page_size` | int | Records per page (default 20, max 500) |
| `search` | string | Free-text search across account/name/KYC/branch/currency/etc. fields |
| `account_number` | string | Exact match on account number |
| `name` | string | Partial match on NAMES field |
| `account_type` | string | Partial match on ACCOUNT_TYPES field |
| `gender` | string | Partial match on GENDERS field |
| `branch` | string | Partial match on BRANCHES field |
| `currency` | string | Partial match inside currency_list JSON |
| `conducting_manner` | string | Partial match inside conducting_manner_list JSON |
| `sort_by` | string | Column to sort by (default: account_number) |
| `sort_dir` | string | `asc` or `desc` |
| `fields` | string | Comma-separated columns to return (omit for all) |

**Examples:**

```
# Paginate all records
GET /customers?page=2&page_size=50

# Full-text search
GET /customers?search=nostro

# Filter by branch + sort by sent total descending
GET /customers?branch=head+office&sort_by=sent_amount_total&sort_dir=desc

# Only return specific fields
GET /customers?fields=account_number,sent_amount_total,NAMES&page_size=100

# Combine filters
GET /customers?name=citi&currency=gbp&sort_by=s_and_r_amount_total&sort_dir=desc
```

---

### `GET /customers/{account_number}`
Fetch a single profile by exact account number.

```
GET /customers/1000000000365
GET /customers/1000000000365?fields=account_number,sent_amount_total,KYC_EXTENDED_JSON
```

---

### `GET /customers/range-filter/query`
Filter by numeric range on **any** numeric column.

| Parameter | Description |
|---|---|
| `column` | Numeric column to filter on |
| `min_value` | Minimum value (inclusive) |
| `max_value` | Maximum value (inclusive) |
| `page`, `page_size`, `sort_by`, `sort_dir`, `fields` | Same as above |

**Examples:**

```
# Accounts with sent_amount_total between 1M and 50M
GET /customers/range-filter/query?column=sent_amount_total&min_value=1000000&max_value=50000000

# High cash ratio accounts
GET /customers/range-filter/query?column=cash_count_ratio&min_value=0.5&sort_by=cash_count_ratio&sort_dir=desc

# Night-heavy transaction accounts
GET /customers/range-filter/query?column=night_day_frequency_ratio&min_value=0.3
```

---

### `GET /meta/columns`
Returns all column names grouped by filter capability.

```
GET /meta/columns
```

---

## Response Shape

All list endpoints return:

```json
{
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_records": 342,
    "total_pages": 18,
    "has_next": true,
    "has_prev": false
  },
  "filters_applied": { ... },
  "data": [ { ... }, ... ]
}
```

JSON string columns (`beneficiaries_list`, `NAMES`, `KYC_EXTENDED_JSON`, etc.) are automatically parsed into structured objects in the response.
