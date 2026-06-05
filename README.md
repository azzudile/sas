# Call Center Workforce Optimization - SAS Viya Application

## 📊 Overview

Applicazione per l'**ottimizzazione della pianificazione del workforce** in un call center.
Permette di:
- Visualizzare e modificare le attività dei singoli operatori (inbound, outbound, back-office, pausa)
- Confrontare il forecast di chiamate inbound con la capacità pianificata
- Simulare l'impatto di modifiche tramite sliders di ottimizzazione
- Gestire le priorità delle campagne outbound
- Monitorare metriche KPI in tempo reale

## 🏗️ Architettura

```
Frontend (SAS Viya Web App)
    ↓
REST APIs (SAS Viya)
    ↓
Stored Processes (SAS 9.4 / Viya)
    ↓
CAS / Database
```

## 📁 Struttura Progetto

```
.
├── README.md                      # Questo file
├── frontend/
│   └── call-center-planner/
│       ├── index.html             # Entry point
│       ├── app.js                 # Main application
│       ├── components/
│       │   ├── Header.js
│       │   ├── MetricsBar.js
│       │   ├── SchedulingTable.js
│       │   ├── ForecastChart.js
│       │   ├── ForecastTable.js
│       │   ├── ControlPanel.js
│       │   └── CampaignsList.js
│       ├── styles/
│       │   ├── main.css           # SAS Visual Analytics theme
│       │   └── components.css
│       ├── utils/
│       │   ├── api.js             # API calls
│       │   ├── calculations.js    # Business logic
│       │   └── mockData.js        # Mock data loader
│       └── config.js              # Configuration
├── backend/
│   └── stored-processes/
│       ├── get_scheduling_data.sas
│       ├── save_scheduling.sas
│       ├── calculate_optimization.sas
│       ├── get_forecasts.sas
│       └── get_campaigns.sas
├── mock-data/
│   ├── operators.json
│   ├── scheduling.json
│   ├── forecasts.json
│   ├── campaigns.json
│   └── metrics.json
└── docs/
    ├── DEPLOYMENT.md
    ├── API.md
    └── DATA_MODEL.md
```

## 🚀 Quick Start

### Option 1: Mock Frontend (Demo)
```bash
cd frontend/call-center-planner
# Apri index.html in un browser
# Usa dati mockati da mock-data/
```

### Option 2: SAS Viya Deployment
```bash
# 1. Upload frontend files su Viya
# 2. Deploy Stored Processes
# 3. Configurare REST API endpoints in config.js
# 4. Accedi da: https://your-viya-server/call-center-planner
```

## 🎨 SAS Visual Analytics Styling

L'applicazione utilizza il design system SAS:
- **Colori**: Navy Blue (#003366), SAS Orange (#FF6600), Forest Green (#2D7D4E)
- **Typography**: IBM Plex Sans
- **Componenti**: Cards, Tables, Charts con hover interattivo
- **Dark Mode Support**: Toggle disponibile

## 📊 Componenti Principali

### 1. **Metrics Bar** (Top)
- SLA Coverage
- Abandoned Rate
- Service Level
- Calls Offered / Answered
- Average Handle Time
- Occupancy Rate

### 2. **Forecast vs Capacity Chart** (Centro Alto)
- Grafico a linee: Forecast inbound con intervalli di confidenza
- Overlay: Capacità pianificata
- Tabella sottostante con override manuale

### 3. **Scheduling Table** (Centro)
- Righe: Operatori
- Colonne: Slot 30min (9:00-18:00)
- Celle: Attività corrente / seleziona futura

### 4. **Control Panel** (Destra)
- Slider: Coverage (0-100%)
- Slider: Priority outbound vs back-office (0-100%)
- Recalcola ottimizzazione in tempo reale

### 5. **Active Campaigns** (Destra Basso)
- Lista campagne outbound
- Chiamate da fare, tasso redemption
- Priority settabile per campagna

## 🔧 Configurazione

Modifica `frontend/call-center-planner/config.js`:

```javascript
export const CONFIG = {
  // API Endpoints
  API_BASE_URL: 'https://your-viya-server',
  API_VERSION: 'v1',
  
  // Dati Mock
  USE_MOCK_DATA: true,
  MOCK_DATA_PATH: '../mock-data/',
  
  // Timeframe
  WORK_START: '09:00',
  WORK_END: '18:00',
  SLOT_MINUTES: 30,
  
  // Attività
  ACTIVITIES: ['inbound', 'outbound', 'back-office', 'pausa'],
  
  // Tema
  THEME: 'light' // 'light' | 'dark'
};
```

## 📡 API Reference

### GET /api/scheduling/{date}
Ottiene la pianificazione per il giorno

### POST /api/scheduling/{date}
Salva la pianificazione

### GET /api/forecasts/{date}
Ottiene i forecast di chiamate inbound

### GET /api/campaigns
Ottiene le campagne outbound attive

### POST /api/optimize
Calcola l'ottimizzazione data la configurazione

[Vedi API.md per dettagli completi]

## 🧮 Business Logic

### Calcolo Capacità Pianificata
```
Capacità = Count(operatori con "inbound") * Chiamate_per_operatore
```

### Calcolo Service Level
```
SL = (Forecast_Calls / Capacità) * 100
Se SL < 80% → Warning
```

### Ottimizzazione Dinamica
L'app ricalcola ogni volta che:
- Coverage slider cambia
- Priority slider cambia
- Una cella della tabella è modificata

## 💾 Data Models

Vedi `docs/DATA_MODEL.md` per:
- Schema tabelle CAS
- Struttura JSON mock data
- Mappature campi

## 🔐 Autenticazione

- **SAS Viya**: Usa OAuth2 integrato di Viya
- **Mock Mode**: Nessuna autenticazione

## 📝 License

[Da compilare]

## 👥 Support

Per domande o issues, contatta il team sviluppo.

---

**Versione**: 1.0.0 MVP  
**Ultimo aggiornamento**: 2026-06-05
