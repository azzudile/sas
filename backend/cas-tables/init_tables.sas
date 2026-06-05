// SAS Stored Process - Initialize CAS Tables
// Sets up the data model for Call Center Planner

/* ── 0. Nessuna CASLIB da creare — usiamo CASUSER ── */
CASLIB _ALL_ ASSIGN;

/* ── 1. OPERATORS ── */
DATA WORK.operators;
  ATTRIB
    operator_id        LENGTH=$50
    operator_name      LENGTH=$100
    team               LENGTH=$50
    hired_date         LENGTH=8  FORMAT=date9.
    max_calls_per_hour LENGTH=8;
  STOP;
RUN;
PROC CASUTIL; LOAD DATA=WORK.operators OUTCASLIB="CASUSER" CASOUT="CC_OPERATORS" REPLACE; QUIT;

/* ── 2. SCHEDULING ── */
DATA WORK.scheduling;
  ATTRIB
    schedule_date    LENGTH=8  FORMAT=date9.
    operator_id      LENGTH=$50
    slot             LENGTH=$20
    current_activity LENGTH=$100
    planned_activity LENGTH=$100;
  STOP;
RUN;
PROC CASUTIL; LOAD DATA=WORK.scheduling OUTCASLIB="CASUSER" CASOUT="CC_SCHEDULING" REPLACE; QUIT;

/* ── 3. FORECASTS ── */
DATA WORK.forecasts;
  ATTRIB
    forecast_date LENGTH=8  FORMAT=date9.
    slot          LENGTH=$20
    forecast      LENGTH=8
    ci_lower      LENGTH=8
    ci_upper      LENGTH=8
    override      LENGTH=8;
  STOP;
RUN;
PROC CASUTIL; LOAD DATA=WORK.forecasts OUTCASLIB="CASUSER" CASOUT="CC_FORECASTS" REPLACE; QUIT;

/* ── 4. CAMPAIGNS ── */
DATA WORK.campaigns;
  ATTRIB
    campaign_id     LENGTH=$50
    campaign_name   LENGTH=$100
    calls_to_make   LENGTH=8
    redemption_rate LENGTH=8
    priority        LENGTH=8
    status          LENGTH=$20;
  STOP;
RUN;
PROC CASUTIL; LOAD DATA=WORK.campaigns OUTCASLIB="CASUSER" CASOUT="CC_CAMPAIGNS" REPLACE; QUIT;

/* ── 5. METRICS ── */
DATA WORK.metrics;
  ATTRIB
    metric_date  LENGTH=8  FORMAT=date9.
    metric_name  LENGTH=$100
    metric_value LENGTH=8
    target_value LENGTH=8;
  STOP;
RUN;
PROC CASUTIL; LOAD DATA=WORK.metrics OUTCASLIB="CASUSER" CASOUT="CC_METRICS" REPLACE; QUIT;

/* ── Verifica ── */
PROC CAS;
  table.tableInfo / caslib="CASUSER";
QUIT;
