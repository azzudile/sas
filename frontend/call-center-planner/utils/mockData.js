// Utility Functions - Mock Data Loader
// Loads mock data for development/demo

import OPERATORS from '../mock-data/operators.json' assert { type: 'json' };
import FORECASTS from '../mock-data/forecasts.json' assert { type: 'json' };
import CAMPAIGNS from '../mock-data/campaigns.json' assert { type: 'json' };
import METRICS from '../mock-data/metrics.json' assert { type: 'json' };
import SCHEDULING from '../mock-data/scheduling.json' assert { type: 'json' };

export async function loadMockData(date = null) {
  console.log('📦 Loading mock data...');

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Generate full scheduling for all operators
  const fullScheduling = {};
  OPERATORS.forEach(operator => {
    fullScheduling[operator.id] = {
      operator_id: operator.id,
      operator_name: operator.name,
      schedule: generateDailySchedule()
    };
  });

  return {
    operators: OPERATORS,
    scheduling: fullScheduling,
    forecasts: FORECASTS,
    campaigns: CAMPAIGNS,
    metrics: METRICS
  };
}

function generateDailySchedule() {
  const schedule = [];
  const activities = ['inbound', 'outbound', 'back-office', 'pausa'];
  const slots = getTimeSlots();

  slots.forEach(slot => {
    // Random activity with bias towards inbound
    const rand = Math.random();
    let activity = 'inbound';
    if (rand < 0.15) activity = 'pausa';
    else if (rand < 0.25) activity = 'back-office';
    else if (rand < 0.35) activity = 'outbound';

    schedule.push({
      slot: slot,
      current: activity,
      planned: activity
    });
  });

  return schedule;
}

function getTimeSlots() {
  const slots = [];
  const start = 9;
  const end = 18;

  for (let hour = start; hour < end; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
    slots.push(`${String(hour).padStart(2, '0')}:30`);
  }

  return slots;
}

export default loadMockData;
