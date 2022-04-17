import { getShortDayOfTheWeek, today, toShortISOString } from './date';

// The Meal Plan API starts returning entries from the rollover date (Friday);
// This logic will swap the order around so the array starts from Monday.
function toNaturalWeekOrder(entries) {
  const first3Days = entries.slice(0, 0 + 9);
  const remaining4Days = entries.slice(0 + 9, 0 + 9 + 12);
  return [].concat(remaining4Days).concat(first3Days);
}

function sortEntriesByDate(a, b) {
  const aa = a.date.split('/').join();
  const bb = b.date.split('/').join();
  // eslint-disable-next-line no-nested-ternary
  return aa < bb ? -1 : (aa > bb ? 1 : 0);
}

// Marhsalls the Meal Plan's '/plan' API response into a view ready data structure
// with the entries grouped by 'this week' and 'next week'.
export function toPlannerGridData(plans) {
  // TODO: Having the planId be part of the gridData feels hacky; although it is an easy
  // way to propigate it through the application.
  const allPlanEntries = (plans)
    .map((plan) => ({
      ...plan,
      entries: plan.entries.map((entry) => ({
        ...entry,
        planId: plan.planId,
      })),
    }))
    .map((plan) => plan.entries)
    .flat(Infinity);

  const allGridData = [];
  (allPlanEntries)
    .sort(sortEntriesByDate)
    .forEach((item) => {
      // The label item is used to denote the day of the week in the planner grid.
      allGridData.push({ id: item.date, name: getShortDayOfTheWeek(item.date), isLabel: true });

      allGridData.push({
        id: `${item.date}-lunch`,
        name: item.lunch.name,
        slot: 'lunch',
        date: item.date,
        planId: item.planId,
        recipeId: item.lunch.recipeId,
      });
      allGridData.push({
        id: `${item.date}-dinner`,
        name: item.dinner.name,
        slot: 'dinner',
        date: item.date,
        planId: item.planId,
        recipeId: item.dinner.recipeId,
      });
    });

  return {
    thisWeek: allGridData.slice(0, allGridData.length / 2),
    nextWeek: allGridData.slice(allGridData.length / 2, allGridData.length),
  };
}

export function toTodayAndTomorrowData(planEntries) {
  const t = toShortISOString(today());
  for (let i = 0; i < planEntries.length; i += 1) {
    if (planEntries[i].date === t) {
      return [planEntries[i], planEntries[i + 1]];
    }
  }
  return [];
}
