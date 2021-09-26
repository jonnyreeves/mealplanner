import { getShortDayOfTheWeek, today, toShortISOString } from './date';

const daysOfTheWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// The Meal Plan API starts returning entries from the rollover date (Friday);
// This logic will swap the order around so the array starts from Monday.
function toNaturalWeekOrder(entries) {
  const headers = [{ id: 'blank', isHeader: true, name: '' }, { id: 'lunch', isHeader: true, name: 'Lunch' }, { id: 'dinner', isHeader: true, name: 'Dinner' }];
  const first3Days = entries.slice(0, 0 + 9);
  const remaining4Days = entries.slice(0 + 9, 0 + 9 + 12);
  return headers.concat(remaining4Days).concat(first3Days);
}

// Marhsalls the Meal Plan's '/plan' API response into a view ready data structure
// with the entries grouped by 'this week' and 'next week'.
export function toPlannerGridData(planEntries) {
  const allGridData = [];
  (planEntries).forEach((item) => {
    // The label item is used to denote the day of the week in the planner grid.
    allGridData.push({ id: item.date, name: getShortDayOfTheWeek(item.date), isLabel: true });
    allGridData.push({
      id: `${item.date}-lunch`, name: item.lunch.name, slot: 'lunch', date: item.date,
    });
    allGridData.push({
      id: `${item.date}-dinner`, name: item.dinner.name, slot: 'dinner', date: item.date,
    });
  });

  return {
    thisWeek: toNaturalWeekOrder(allGridData.slice(0, allGridData.length / 2)),
    nextWeek: toNaturalWeekOrder(allGridData.slice(allGridData.length / 2, allGridData.length)),
  };
}

export function toTodayAndTomorrowData(planEntries) {
  const t = today().toISOString();
  for (let i = 0; i < planEntries.length; i++) {
    if (planEntries[i].date === t) {
      return [planEntries[i], planEntries[i + 1]];
    }
  }
  return [];
}
