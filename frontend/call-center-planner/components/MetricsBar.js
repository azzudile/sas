// Metrics Bar Component
// KPI cards display

export class MetricsBar {
  constructor(options) {
    this.container = options.container;
  }

  render(state) {
    const metrics = state.metrics;

    const html = `
      <div class="metrics-grid">
        ${this.renderMetricCard('SLA Coverage', metrics.sla_coverage.value, '%', metrics.sla_coverage.trend)}
        ${this.renderMetricCard('Abandoned Rate', metrics.abandoned_rate.value, '%', metrics.abandoned_rate.trend, true)}
        ${this.renderMetricCard('Service Level (80/20)', metrics.service_level.value, '%', metrics.service_level.trend)}
        ${this.renderMetricCard('Calls Offered', metrics.calls_offered.value, '', metrics.calls_offered.trend)}
        ${this.renderMetricCard('Calls Answered', metrics.calls_answered.value, '', metrics.calls_answered.trend)}
        ${this.renderMetricCard('Abandoned Calls', metrics.abandoned_calls.value, '', metrics.abandoned_calls.trend, true)}
        ${this.renderMetricCard('Avg Handle Time', metrics.avg_handle_time.value, '', '')}
        ${this.renderMetricCard('Occupancy', metrics.occupancy.value, '%', metrics.occupancy.trend)}
      </div>
    `;

    this.container.innerHTML = html;
  }

  renderMetricCard(label, value, unit, trend, isNegative = false) {
    let trendClass = '';
    let trendIcon = '';
    
    if (trend === 'up') {
      trendClass = isNegative ? 'trend-down' : 'trend-up';
      trendIcon = isNegative ? '📉' : '📈';
    } else if (trend === 'down') {
      trendClass = isNegative ? 'trend-up' : 'trend-down';
      trendIcon = isNegative ? '📈' : '📉';
    }

    return `
      <div class="metric-card">
        <div class="metric-label">${label}</div>
        <div class="metric-value">${value}${unit}</div>
        ${trend ? `<div class="metric-trend ${trendClass}">${trendIcon} vs ieri</div>` : ''}
      </div>
    `;
  }
}
