# Data Model Documentation

## Overview

The Call Center Planner uses a normalized data model optimized for both OLTP (scheduling updates) and OLAP (reporting/analytics).

## CAS Tables

### CC.OPERATORS

Stores operator information and capabilities.

```
operator_id          VARCHAR(20)  PRIMARY KEY
operator_name        VARCHAR(100)
team                 VARCHAR(50)
hired_date           DATE
max_calls_per_hour   INT
status               VARCHAR(20)  /* ACTIVE, INACTIVE, ON_LEAVE */
```

**Indexes:**
- PRIMARY: operator_id
- SECONDARY: team

---

### CC.SCHEDULING

Stores the daily operator scheduling (planned activities).

```
schedule_id          INT          PRIMARY KEY
schedule_date        DATE
operator_id          VARCHAR(20)  FOREIGN KEY -> CC.OPERATORS
slot                 VARCHAR(5)   /* HH:MM format */
current_activity     VARCHAR(20)  /* inbound, outbound, back-office, pausa */
planned_activity     VARCHAR(20)
created_at           DATETIME
updated_at           DATETIME
created_by           VARCHAR(50)
```

**Indexes:**
- PRIMARY: schedule_id
- SECONDARY: (schedule_date, operator_id, slot)
- SECONDARY: schedule_date

**Partitioning:** By schedule_date (DAILY)

---

### CC.FORECASTS

Stores inbound call forecasts with confidence intervals.

```
forecast_id          INT          PRIMARY KEY
forecast_date        DATE
slot                 VARCHAR(5)   /* HH:MM format */
forecast             INT          /* Expected number of calls */
ci_lower             INT          /* 95% CI Lower bound */
ci_upper             INT          /* 95% CI Upper bound */
override             INT          /* Manual override value */
method               VARCHAR(50)  /* ARIMA, ML_MODEL, MANUAL */
created_at           DATETIME
```

**Indexes:**
- PRIMARY: forecast_id
- SECONDARY: (forecast_date, slot)

**Partitioning:** By forecast_date (DAILY)

---

### CC.CAMPAIGNS

Stores active outbound campaigns.

```
campaign_id          VARCHAR(20)  PRIMARY KEY
campaign_name        VARCHAR(100)
description          VARCHAR(500)
calls_to_make        INT
redemption_rate      DOUBLE       /* 0.0 to 1.0 */
priority             DOUBLE       /* 0.1 to 10.0 */
status               VARCHAR(20)  /* ACTIVE, PAUSED, COMPLETED */
start_date           DATE
end_date             DATE
created_at           DATETIME
```

**Indexes:**
- PRIMARY: campaign_id
- SECONDARY: status
- SECONDARY: start_date

---

### CC.METRICS

Time-series metrics table for KPI tracking.

```
metric_id            INT          PRIMARY KEY
metric_date          DATE
metric_hour          INT
metric_name          VARCHAR(50)  /* SLA_COVERAGE, ABANDONED_RATE, etc */
metric_value         DOUBLE
target_value         DOUBLE
previous_value       DOUBLE
calculated_at        DATETIME
```

**Indexes:**
- SECONDARY: (metric_date, metric_name)

**Partitioning:** By metric_date (DAILY)

---

### CC.ACTIVITIES_LOG (Audit)

Logs all user actions for audit and analysis.

```
log_id               BIGINT       PRIMARY KEY
log_date             DATETIME
user_id              VARCHAR(50)
action               VARCHAR(100)
operator_id          VARCHAR(20)
slot                 VARCHAR(5)
old_value            VARCHAR(50)
new_value            VARCHAR(50)
ip_address           VARCHAR(50)
```

**Indexes:**
- SECONDARY: (log_date, user_id)
- SECONDARY: (log_date, action)

**Partitioning:** By log_date (MONTHLY)

---

## Data Relationships

```
CC.OPERATORS
    ↓
CC.SCHEDULING (operator_id FK → OPERATORS.operator_id)
    ↓
CC.METRICS (aggregate from SCHEDULING)
    
CC.FORECASTS
    ↓
CC.METRICS (compare against)
    ↓
CC.CAMPAIGNS (combined for optimization)
```

---

## View: V_STAFFING_ANALYSIS

Combines scheduling and forecasts for analysis:

```sql
CREATE VIEW CC.V_STAFFING_ANALYSIS AS
SELECT 
  s.schedule_date,
  s.slot,
  f.forecast,
  COUNT(CASE WHEN s.planned_activity = 'inbound' THEN 1 END) as inbound_staff,
  COUNT(CASE WHEN s.planned_activity = 'outbound' THEN 1 END) as outbound_staff,
  COUNT(CASE WHEN s.planned_activity = 'back-office' THEN 1 END) as backoffice_staff,
  COUNT(CASE WHEN s.planned_activity = 'pausa' THEN 1 END) as on_pause
FROM CC.SCHEDULING s
LEFT JOIN CC.FORECASTS f ON s.schedule_date = f.forecast_date AND s.slot = f.slot
WHERE s.current_activity = s.planned_activity
GROUP BY s.schedule_date, s.slot, f.forecast;
```

---

## View: V_CAMPAIGN_PROGRESS

Tracks campaign execution:

```sql
CREATE VIEW CC.V_CAMPAIGN_PROGRESS AS
SELECT 
  c.campaign_id,
  c.campaign_name,
  c.calls_to_make,
  c.redemption_rate,
  COUNT(a.log_id) as calls_made_today,
  ROUND(COUNT(a.log_id) * c.redemption_rate) as expected_conversions,
  ROUND((COUNT(a.log_id) / c.calls_to_make) * 100) as pct_complete
FROM CC.CAMPAIGNS c
LEFT JOIN CC.ACTIVITIES_LOG a 
  ON c.campaign_id = SUBSTR(a.new_value, 1, 20)
  AND DATE(a.log_date) = CURDATE()
WHERE c.status = 'ACTIVE'
GROUP BY c.campaign_id, c.campaign_name, c.calls_to_make, c.redemption_rate;
```

---

## Data Flow

### Scheduling Update Flow

1. **Frontend** sends: `POST /api/v1/scheduling/{date}`
2. **API** receives scheduling changes
3. **Stored Process** `save_scheduling.sas` updates `CC.SCHEDULING` table
4. **Audit Log** records all changes in `CC.ACTIVITIES_LOG`
5. **Frontend** receives confirmation and re-renders

### Optimization Calculation Flow

1. **Frontend** sends: `POST /api/v1/optimize` with coverage & priority
2. **API** calls: `calculate_optimization.sas`
3. **SAS Process** queries:
   - `CC.FORECASTS` for demand
   - `CC.SCHEDULING` for current state
   - `CC.CAMPAIGNS` for priorities
4. **SAS Process** computes recommended scheduling
5. **API** returns suggestions to Frontend
6. **Frontend** displays recommendations (non-destructive preview)

---

## Data Quality

### Validation Rules

- `forecast` >= 0
- `ci_lower` <= `forecast` <= `ci_upper`
- `redemption_rate` between 0.0 and 1.0
- `priority` between 0.1 and 10.0
- `slot` format must be HH:MM
- Activity must be one of: inbound, outbound, back-office, pausa

### Referential Integrity

- All `operator_id` in SCHEDULING must exist in OPERATORS
- All `campaign_id` references must exist in CAMPAIGNS

---

## Retention Policy

| Table | Retention | Partitioning | Compression |
|-------|-----------|-------------|------------|
| OPERATORS | Indefinite | None | None |
| SCHEDULING | 24 months | Daily | YES |
| FORECASTS | 12 months | Daily | YES |
| CAMPAIGNS | Current + 12mo archive | None | None |
| METRICS | 36 months | Daily | YES |
| ACTIVITIES_LOG | 24 months | Monthly | YES |

---

## Performance Optimization

### Statistics

Maintain CAS statistics on:
```sas
PROC CAS;
  TABLE.CASSTATS RESULT=r / table="SCHEDULING", caslib="CC";
  TABLE.CASSTATS RESULT=r / table="FORECASTS", caslib="CC";
RUN;
```

### Query Optimization

Common slow queries and optimizations:

**Query:** Daily metrics calculation
```sas
/* Inefficient */
SELECT * FROM SCHEDULING WHERE DATE(updated_at) = TODAY();

/* Optimized */
SELECT * FROM SCHEDULING WHERE schedule_date = TODAY();
```

**Query:** Forecast join with scheduling
```sas
/* Use hash join */
PROC SQL _method JOIN=HASH;
SELECT ...
FROM FORECASTS f
INNER HASH JOIN SCHEDULING s
ON f.slot = s.slot AND f.forecast_date = s.schedule_date;
QUIT;
```
