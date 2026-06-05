// SAS Stored Process - Initialize CAS Tables
// Sets up the data model for Call Center Planner

CASLIB _ALL_ ASSIGN;

/* ── 1. OPERATORS ── */
DATA WORK._operators;
  ATTRIB
    operator_id        LENGTH=$20
    operator_name      LENGTH=$100
    team               LENGTH=$50
    hired_date         LENGTH=8   FORMAT=date9.
    max_calls_per_hour LENGTH=8
    status             LENGTH=$20;
  STOP;
RUN;
PROC CASUTIL;
  LOAD DATA=WORK._operators OUTCASLIB="CASUSER" CASOUT="CC_OPERATORS" REPLACE;
QUIT;

/* ── 2. SCHEDULING ── */
DATA WORK._scheduling;
  ATTRIB
    schedule_id      LENGTH=8
    schedule_date    LENGTH=8   FORMAT=date9.
    operator_id      LENGTH=$20
    slot             LENGTH=$5
    current_activity LENGTH=$20
    planned_activity LENGTH=$20
    created_at       LENGTH=8   FORMAT=datetime20.
    updated_at       LENGTH=8   FORMAT=datetime20.
    created_by       LENGTH=$50;
  STOP;
RUN;
PROC CASUTIL;
  LOAD DATA=WORK._scheduling OUTCASLIB="CASUSER" CASOUT="CC_SCHEDULING" REPLACE;
QUIT;

/* ── 3. FORECASTS ── */
DATA WORK._forecasts;
  ATTRIB
    forecast_id   LENGTH=8
    forecast_date LENGTH=8   FORMAT=date9.
    slot          LENGTH=$5
    forecast      LENGTH=8
    ci_lower      LENGTH=8
    ci_upper      LENGTH=8
    override      LENGTH=8
    method        LENGTH=$50
    created_at    LENGTH=8   FORMAT=datetime20.;
  STOP;
RUN;
PROC CASUTIL;
  LOAD DATA=WORK._forecasts OUTCASLIB="CASUSER" CASOUT="CC_FORECASTS" REPLACE;
QUIT;

/* ── 4. CAMPAIGNS ── */
DATA WORK._campaigns;
  ATTRIB
    campaign_id     LENGTH=$20
    campaign_name   LENGTH=$100
    description     LENGTH=$500
    calls_to_make   LENGTH=8
    redemption_rate LENGTH=8
    priority        LENGTH=8
    status          LENGTH=$20
    start_date      LENGTH=8   FORMAT=date9.
    end_date        LENGTH=8   FORMAT=date9.
    created_at      LENGTH=8   FORMAT=datetime20.;
  STOP;
RUN;
PROC CASUTIL;
  LOAD DATA=WORK._campaigns OUTCASLIB="CASUSER" CASOUT="CC_CAMPAIGNS" REPLACE;
QUIT;

/* ── 5. METRICS ── */
DATA WORK._metrics;
  ATTRIB
    metric_id      LENGTH=8
    metric_date    LENGTH=8   FORMAT=date9.
    metric_hour    LENGTH=8
    metric_name    LENGTH=$50
    metric_value   LENGTH=8
    target_value   LENGTH=8
    previous_value LENGTH=8
    calculated_at  LENGTH=8   FORMAT=datetime20.;
  STOP;
RUN;
PROC CASUTIL;
  LOAD DATA=WORK._metrics OUTCASLIB="CASUSER" CASOUT="CC_METRICS" REPLACE;
QUIT;

/* ── 6. ACTIVITIES_LOG ── */
DATA WORK._activities_log;
  ATTRIB
    log_id      LENGTH=8
    log_date    LENGTH=8   FORMAT=datetime20.
    user_id     LENGTH=$50
    action      LENGTH=$100
    operator_id LENGTH=$20
    slot        LENGTH=$5
    old_value   LENGTH=$50
    new_value   LENGTH=$50
    ip_address  LENGTH=$50;
  STOP;
RUN;
PROC CASUTIL;
  LOAD DATA=WORK._activities_log OUTCASLIB="CASUSER" CASOUT="CC_ACTIVITIES_LOG" REPLACE;
QUIT;

/* ── Verifica ── */
PROC CAS;
  table.tableInfo / caslib="CASUSER";
QUIT;
