// Campaigns List Component
// Active outbound campaigns with priority management

export class CampaignsList {
  constructor(options) {
    this.container = options.container;
    this.campaigns = options.campaigns;
    this.onPriorityChange = options.onPriorityChange;
  }

  render(state) {
    this.campaigns = state.campaigns;

    const html = `
      <div class="campaigns-container">
        <h3>📞 Campagne Outbound Attive</h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${this.campaigns.map(campaign => this.renderCampaignCard(campaign)).join('')}
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  renderCampaignCard(campaign) {
    const progress = (campaign.calls_completed_today / campaign.daily_target) * 100;

    return `
      <div class="campaign-item" id="campaign-${campaign.id}">
        <div class="campaign-name">${campaign.name}</div>
        <div style="font-size: 11px; color: var(--sas-text-light); margin-bottom: 8px;">
          ${campaign.description}
        </div>
        
        <div class="campaign-stats">
          <div class="campaign-stat">
            <span class="campaign-stat-label">Chiamate:</span>
            <span class="campaign-stat-value">${campaign.calls_to_make}</span>
          </div>
          <div class="campaign-stat">
            <span class="campaign-stat-label">Redemption:</span>
            <span class="campaign-stat-value">${(campaign.redemption_rate * 100).toFixed(1)}%</span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <div style="flex: 1; height: 4px; background: #E0E0E0; border-radius: 2px; overflow: hidden;">
            <div style="height: 100%; background: var(--sas-orange); width: ${progress}%;"></div>
          </div>
          <span style="font-size: 10px; color: var(--sas-text-light);">
            ${campaign.calls_completed_today}/${campaign.daily_target}
          </span>
        </div>

        <!-- Priority Input -->
        <div class="campaign-priority">
          <span class="campaign-priority-label">Priorità:</span>
          <input 
            type="number" 
            min="0.1"
            max="10"
            step="0.1"
            value="${campaign.priority}"
            class="campaign-priority-input"
            data-campaign-id="${campaign.id}"
          >
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const priorityInputs = this.container.querySelectorAll('.campaign-priority-input');
    priorityInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const campaignId = e.target.dataset.campaignId;
        const priority = parseFloat(e.target.value);
        this.onPriorityChange(campaignId, priority);
      });
    });
  }
}
