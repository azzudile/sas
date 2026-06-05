# QUICKSTART - Call Center Planner

## 🚀 5-Minute Setup

### Via Browser (Mock Data - No Backend Needed)

```bash
# 1. Clone/Download the repository
git clone https://github.com/azzudile/sas.git
cd sas

# 2. Start a simple HTTP server
python -m http.server 8000
# OR: npx http-server

# 3. Open browser
# http://localhost:8000/frontend/call-center-planner/index.html
```

**You're done!** The app loads with mock data immediately.

---

## 🔧 Full Setup with SAS Viya

### Prerequisites Checklist
- [ ] SAS Viya 3.5+ access
- [ ] SAS Studio available
- [ ] CAS session running
- [ ] Admin/developer credentials

### Step 1: Initialize CAS Tables

**In SAS Studio:**
```sas
%INCLUDE "backend/cas-tables/init_tables.sas";
```

Or via CLI:
```bash
sas-viya start job --program backend/cas-tables/init_tables.sas
```

### Step 2: Load Mock Data to CAS

**In SAS Studio:**
```sas
PROC IMPORT DATAFILE="mock-data/operators.json"
  OUT=work.operators DBMS=JSON;
RUN;

/* Load to CAS */
PROC APPEND BASE=CC.OPERATORS DATA=work.operators;
RUN;

/* Repeat for forecasts, campaigns, scheduling, metrics */
```

### Step 3: Deploy Stored Processes

Copy backend files to SAS deployment:
```bash
cp -r backend/stored-processes/* /sas/share/sasprog/call-center/
```

### Step 4: Deploy Frontend

Option A - Copy to static content:
```bash
cp -r frontend/call-center-planner /var/www/sas-viya/
```

Option B - Use Docker:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY frontend/call-center-planner .
RUN npm install -g http-server
EXPOSE 8080
CMD ["http-server", "-p", "8080", "-c-1"]
```

### Step 5: Configure API

Edit `frontend/call-center-planner/config.js`:
```javascript
export const CONFIG = {
  USE_MOCK_DATA: false,  // ← Change to false
  API_BASE_URL: 'https://your-viya-server',
  // ...
};
```

### Step 6: Test It!

Navigate to: `https://your-viya-server/call-center-planner/`

---

## 📋 Features Overview

### Main Dashboard Sections

#### 1️⃣ **Metrics Bar (Top)**
- Real-time KPI cards
- SLA Coverage, Abandoned Rate, Service Level, etc.
- Color-coded trends (↑ green, ↓ red)

#### 2️⃣ **Forecast Chart (Center-Top)**
- Line chart: Forecast vs Capacity
- Shaded confidence intervals
- Table view with override capability

#### 3️⃣ **Scheduling Table (Center)**
- Interactive per-operator scheduling
- Click cells to change activity
- Color-coded by activity type:
  - 🔵 Blue = Inbound
  - 🟠 Orange = Outbound  
  - 🟢 Green = Back-office
  - ⚫ Gray = Pausa

#### 4️⃣ **Control Panel (Right)**
- **Coverage Slider:** Adjust forecast confidence (50%-100%)
- **Priority Slider:** Balance outbound vs back-office (0-100%)
- Live recalculation

#### 5️⃣ **Active Campaigns (Right-Bottom)**
- List of outbound campaigns
- Progress bars
- Adjustable priority per campaign

---

## 🎮 How to Use

### Change Operator Activity

1. Click any cell in the scheduling table
2. Select new activity from popup menu
3. Changes auto-save (after 5 minutes or manual save)

### Adjust Optimization Parameters

1. **Coverage Slider:** 
   - Left (50%) = Risk-taking, lower staffing
   - Right (100%) = Conservative, high staffing

2. **Priority Slider:**
   - Left = Prioritize back-office work
   - Right = Prioritize outbound campaigns

3. Metrics update in real-time as you move sliders

### Override Forecasts

1. Scroll down to "Forecast Table"
2. Enter custom value in "Override" column
3. Press Enter to apply

### Manage Campaign Priorities

1. Find campaign in "Active Campaigns" list
2. Edit "Priorità" field (1.0 = normal, 2.0 = double priority)
3. Changes apply immediately

### Save & Export

- **Save:** Click "💾 Salva" button (top right)
- **Export:** Click "📤 Esporta" for CSV/Excel

---

## 🧮 Business Logic

### Service Level Calculation

```
SL = (Planned Capacity / Forecast Demand) × 100
```

If capacity < forecast → Warning (🔴)

### Required Staffing

```
Required Inbound = CEIL(Adjusted Forecast / 4 calls per operator)
```

### Optimization Algorithm

1. Get forecasts for the day
2. Apply coverage slider (adjust CI level)
3. Calculate required inbound staff
4. Use priority slider to split remaining between outbound/back-office
5. Suggest optimal schedule

---

## 📊 Sample Data

### Operators (25 total)
- Mix of teams (Team A, B, C)
- Different max call capacities
- Various hire dates

### Forecasts
- 18 half-hourly slots (9:00-18:00)
- Peak hours: 14:00-16:00
- With 95% confidence intervals

### Campaigns (5 active)
- PRESTITI_01: Loan products (4,500 calls)
- MUTUI_02: Mortgages (3,000 calls)
- ASSICURAZIONI_03: Insurance (2,000 calls)
- INVESTIMENTI_04: Investments (1,500 calls)
- CONTI_05: Premium accounts (2,500 calls)

### Metrics
- Live KPI values
- Compared to targets
- Previous day comparison

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| App doesn't load | Clear browser cache, check console (F12) |
| Charts not showing | Verify Chart.js loaded, check data format |
| Buttons not working | Ensure JavaScript enabled, check network tab |
| Can't save data | Check API connection, verify CAS tables exist |
| Data looks stale | Click "Auto-refresh" toggle in header |

---

## 📚 Documentation

- **[API Documentation](docs/API.md)** - REST endpoints and payload formats
- **[Data Model](docs/DATA_MODEL.md)** - CAS tables and relationships
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production setup

---

## 🔌 API Examples

### Get Scheduling
```bash
curl -X GET https://viya-server/api/v1/scheduling/2026-06-05 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Save Scheduling
```bash
curl -X POST https://viya-server/api/v1/scheduling/2026-06-05 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"operator_id":"OP_001", "slot":"09:00", "activity":"inbound"}'
```

### Get Forecasts
```bash
curl -X GET https://viya-server/api/v1/forecasts/2026-06-05 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎨 SAS Visual Analytics Theme

The UI follows SAS brand colors:
- **Navy Blue (#003366):** Primary elements
- **Orange (#FF6600):** Secondary/warnings
- **Forest Green (#2D7D4E):** Success/positive
- **IBM Plex Sans:** Font family

---

## 📱 Supported Browsers

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 💡 Tips & Tricks

- Use keyboard shortcut **Ctrl+S** to save
- Hover over metric values to see historical trend
- Double-click forecast override to clear it
- Use dark mode for extended viewing (toggle in header)

---

## 🚦 Performance Notes

- Large datasets (1000+ operators) may affect performance
- Charts render best with 50 or fewer operators visible
- Pagination available for operator list
- Auto-refresh interval configurable (default: 5min)

---

## 📞 Support

For issues:
1. Check browser console (F12 → Console tab)
2. Review API responses in Network tab
3. Check SAS Viya server logs
4. Contact your SAS administrator

---

**Happy workforce planning! 🎯**
