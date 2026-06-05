// Main Application File
// Call Center Workforce Optimization - SAS Viya

import CONFIG from './config.js';
import { Header } from './components/Header.js';
import { MetricsBar } from './components/MetricsBar.js';
import { ForecastChart } from './components/ForecastChart.js';
import { ForecastTable } from './components/ForecastTable.js';
import { SchedulingTable } from './components/SchedulingTable.js';
import { ControlPanel } from './components/ControlPanel.js';
import { CampaignsList } from './components/CampaignsList.js';
import { loadMockData } from './utils/mockData.js';
import { API } from './utils/api.js';

class CallCenterApp {
  constructor() {
    this.state = {
      selectedDate: this.getTodayString(),
      operators: [],
      scheduling: {},
      forecasts: {},
      campaigns: [],
      metrics: {},
      coverageSlider: CONFIG.SLIDERS.COVERAGE.DEFAULT,
      prioritySlider: CONFIG.SLIDERS.PRIORITY.DEFAULT,
      isLoading: false,
      isDirty: false
    };

    this.components = {};
    this.init();
  }

  async init() {
    console.log('🚀 Initializing Call Center App...');
    
    try {
      // Load data
      await this.loadData();

      // Initialize components
      this.initializeComponents();

      // Render initial state
      this.render();

      // Setup event listeners
      this.setupEventListeners();

      console.log('✅ App initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing app:', error);
      this.showError('Errore durante l\'inizializzazione dell\'applicazione');
    }
  }

  async loadData() {
    console.log('📊 Loading data...');
    
    if (CONFIG.USE_MOCK_DATA) {
      const mockData = await loadMockData();
      this.state.operators = mockData.operators;
      this.state.scheduling = mockData.scheduling;
      this.state.forecasts = mockData.forecasts;
      this.state.campaigns = mockData.campaigns;
      this.state.metrics = mockData.metrics;
    } else {
      // Load from SAS Viya REST APIs
      try {
        this.state.operators = await API.getOperators();
        this.state.scheduling = await API.getScheduling(this.state.selectedDate);
        this.state.forecasts = await API.getForecasts(this.state.selectedDate);
        this.state.campaigns = await API.getCampaigns();
        this.state.metrics = await API.getMetrics(this.state.selectedDate);
      } catch (error) {
        console.error('Error loading data from API:', error);
        throw error;
      }
    }
  }

  initializeComponents() {
    console.log('🎨 Initializing components...');

    // Header
    this.components.header = new Header({
      container: document.getElementById('header'),
      onDateChange: (date) => this.handleDateChange(date),
      onSave: () => this.handleSave(),
      onExport: () => this.handleExport()
    });

    // Metrics Bar
    this.components.metricsBar = new MetricsBar({
      container: document.getElementById('metrics-bar'),
      data: this.state.metrics
    });

    // Forecast Chart
    this.components.forecastChart = new ForecastChart({
      container: document.getElementById('forecast-chart'),
      data: this.state.forecasts
    });

    // Forecast Table with Override
    this.components.forecastTable = new ForecastTable({
      container: document.getElementById('forecast-table'),
      data: this.state.forecasts,
      onOverrideChange: (slot, value) => this.handleForecastOverride(slot, value)
    });

    // Scheduling Table
    this.components.schedulingTable = new SchedulingTable({
      container: document.getElementById('scheduling-table'),
      operators: this.state.operators,
      scheduling: this.state.scheduling,
      onActivityChange: (operatorId, slot, activity) => 
        this.handleActivityChange(operatorId, slot, activity)
    });

    // Control Panel (Sliders)
    this.components.controlPanel = new ControlPanel({
      container: document.getElementById('control-panel'),
      coverageValue: this.state.coverageSlider,
      priorityValue: this.state.prioritySlider,
      onCoverageChange: (value) => this.handleCoverageChange(value),
      onPriorityChange: (value) => this.handlePriorityChange(value)
    });

    // Campaigns List
    this.components.campaignsList = new CampaignsList({
      container: document.getElementById('campaigns-list'),
      campaigns: this.state.campaigns,
      onPriorityChange: (campaignId, priority) => 
        this.handleCampaignPriorityChange(campaignId, priority)
    });
  }

  render() {
    Object.values(this.components).forEach(component => {
      if (component && component.render) {
        component.render(this.state);
      }
    });
  }

  setupEventListeners() {
    // Auto-save on changes (debounced)
    this.saveDebounceTimer = null;
    
    document.addEventListener('app-state-change', () => {
      this.state.isDirty = true;
      
      if (CONFIG.AUTO_SAVE_INTERVAL > 0) {
        clearTimeout(this.saveDebounceTimer);
        this.saveDebounceTimer = setTimeout(() => {
          this.handleSave();
        }, CONFIG.AUTO_SAVE_INTERVAL);
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.handleSave();
      }
    });
  }

  async handleDateChange(date) {
    console.log(`📅 Date changed to: ${date}`);
    this.state.selectedDate = date;
    
    try {
      // Reload data for new date
      const mockData = await loadMockData(date);
      this.state.scheduling = mockData.scheduling;
      this.state.forecasts = mockData.forecasts;
      this.state.metrics = mockData.metrics;
      
      this.render();
    } catch (error) {
      console.error('Error loading data for new date:', error);
    }
  }

  handleActivityChange(operatorId, slot, activity) {
    console.log(`👤 Operator ${operatorId} - Slot ${slot}: ${activity}`);
    
    if (this.state.scheduling[operatorId]) {
      const slotData = this.state.scheduling[operatorId].schedule.find(s => s.slot === slot);
      if (slotData) {
        slotData.planned = activity;
        this.state.isDirty = true;
        this.recalculateOptimization();
        this.render();
      }
    }
  }

  handleCoverageChange(value) {
    console.log(`📊 Coverage changed to: ${value}%`);
    this.state.coverageSlider = value;
    this.recalculateOptimization();
    this.render();
  }

  handlePriorityChange(value) {
    console.log(`⚖️ Priority changed to: ${value} (0=BO, 100=OB)`);
    this.state.prioritySlider = value;
    this.recalculateOptimization();
    this.render();
  }

  handleForecastOverride(slot, value) {
    console.log(`🔄 Forecast override for ${slot}: ${value}`);
    const forecast = this.state.forecasts.slots.find(s => s.slot === slot);
    if (forecast) {
      forecast.override = value;
      this.state.isDirty = true;
      this.recalculateOptimization();
      this.render();
    }
  }

  handleCampaignPriorityChange(campaignId, priority) {
    console.log(`🎯 Campaign ${campaignId} priority: ${priority}`);
    const campaign = this.state.campaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.priority = priority;
      this.state.isDirty = true;
      this.render();
    }
  }

  recalculateOptimization() {
    if (!CONFIG.AUTO_RECALCULATE) return;

    console.log('🔧 Recalculating optimization...');

    // This would call a SAS Stored Process or perform client-side calculations
    // For now, we'll just update metrics based on current state
    
    const inboundOperators = this.getInboundOperatorCount();
    const totalForecasted = this.getTotalForecasted();
    const capacityPerOperator = 4; // Calls per 30min slot
    const capacity = inboundOperators * capacityPerOperator;

    this.state.metrics.service_level.value = Math.min(
      100,
      Math.round((capacity / totalForecasted) * 100)
    );

    this.components.metricsBar?.render(this.state);
  }

  getInboundOperatorCount() {
    let count = 0;
    Object.values(this.state.scheduling).forEach(opSchedule => {
      if (opSchedule.schedule) {
        count += opSchedule.schedule.filter(s => s.planned === 'inbound').length;
      }
    });
    return Math.ceil(count / CONFIG.TOTAL_SLOTS);
  }

  getTotalForecasted() {
    return this.state.forecasts.slots.reduce((sum, slot) => {
      return sum + (slot.override || slot.forecast);
    }, 0);
  }

  async handleSave() {
    if (!this.state.isDirty) {
      console.log('No changes to save');
      return;
    }

    console.log('💾 Saving changes...');
    this.state.isLoading = true;

    try {
      if (CONFIG.USE_MOCK_DATA) {
        // Mock save - just wait a bit
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('✅ Changes saved (mock)');
      } else {
        // Save to SAS Viya
        await API.saveScheduling(this.state.selectedDate, this.state.scheduling);
        console.log('✅ Changes saved to SAS Viya');
      }

      this.state.isDirty = false;
      this.showSuccess('Pianificazione salvata con successo');
    } catch (error) {
      console.error('Error saving:', error);
      this.showError('Errore durante il salvataggio');
    } finally {
      this.state.isLoading = false;
    }
  }

  async handleExport() {
    console.log('📤 Exporting data...');
    // Implementation for export (CSV, Excel, PDF, etc.)
  }

  showSuccess(message) {
    console.log(`✅ ${message}`);
    // Show toast notification
  }

  showError(message) {
    console.error(`❌ ${message}`);
    // Show error notification
  }

  getTodayString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new CallCenterApp();
});

export { CallCenterApp };
