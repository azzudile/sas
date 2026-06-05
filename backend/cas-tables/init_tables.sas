// SAS Stored Process - Initialize CAS Tables
// Sets up the data model for Call Center Planner

/*
  Creates the following CAS tables:
  - CC.OPERATORS
  - CC.SCHEDULING
  - CC.FORECASTS
  - CC.CAMPAIGNS
  - CC.METRICS
*/

CASLIB _ALL_ ASSIGN;

/* 1. OPERATORS Table */
PROC CAS;
  TABLE.DROPTABLE RESULT=r / name="operators" caslib="CC" quiet=1;
  
  TABLE.ADDTABLE RESULT=r / name="operators" caslib="CC"
    dataSource={name="CC_OPERATORS", caslib="CC"}
    columns={
      {name="operator_id", type="varchar"},
      {name="operator_name", type="varchar"},
      {name="team", type="varchar"},
      {name="hired_date", type="date"},
      {name="max_calls_per_hour", type="int"}
    };
QUIT;

/* 2. SCHEDULING Table */
PROC CAS;
  TABLE.DROPTABLE RESULT=r / name="scheduling" caslib="CC" quiet=1;
  
  TABLE.ADDTABLE RESULT=r / name="scheduling" caslib="CC"
    columns={
      {name="schedule_date", type="date"},
      {name="operator_id", type="varchar"},
      {name="slot", type="varchar"},
      {name="current_activity", type="varchar"},
      {name="planned_activity", type="varchar"}
    };
QUIT;

/* 3. FORECASTS Table */
PROC CAS;
  TABLE.DROPTABLE RESULT=r / name="forecasts" caslib="CC" quiet=1;
  
  TABLE.ADDTABLE RESULT=r / name="forecasts" caslib="CC"
    columns={
      {name="forecast_date", type="date"},
      {name="slot", type="varchar"},
      {name="forecast", type="int"},
      {name="ci_lower", type="int"},
      {name="ci_upper", type="int"},
      {name="override", type="int"}
    };
QUIT;

/* 4. CAMPAIGNS Table */
PROC CAS;
  TABLE.DROPTABLE RESULT=r / name="campaigns" caslib="CC" quiet=1;
  
  TABLE.ADDTABLE RESULT=r / name="campaigns" caslib="CC"
    columns={
      {name="campaign_id", type="varchar"},
      {name="campaign_name", type="varchar"},
      {name="calls_to_make", type="int"},
      {name="redemption_rate", type="double"},
      {name="priority", type="double"},
      {name="status", type="varchar"}
    };
QUIT;

/* 5. METRICS Table */
PROC CAS;
  TABLE.DROPTABLE RESULT=r / name="metrics" caslib="CC" quiet=1;
  
  TABLE.ADDTABLE RESULT=r / name="metrics" caslib="CC"
    columns={
      {name="metric_date", type="date"},
      {name="metric_name", type="varchar"},
      {name="metric_value", type="double"},
      {name="target_value", type="double"}
    };
QUIT;

PROC PRINT;
  TITLE "CAS Tables initialized for Call Center Planner";
RUN;
