import { useEffect, useState } from 'react';
import { useAppState } from '../../service/context';
import { dateWithOrdinal, getShortDayOfTheWeek, getShortMonth, shortPrettyDate, today, toShortISOString } from './date';

function sortEntriesByDate(a, b) {
  const aa = a.date.split('/').join();
  const bb = b.date.split('/').join();
  // eslint-disable-next-line no-nested-ternary
  return aa < bb ? -1 : (aa > bb ? 1 : 0);
}

export function toPlannerGridData(plan) {
  // TODO: Having the planId be part of the gridData feels hacky; although it is an easy
  // way to propigate it through the application.
  const allPlanEntries = plan.entries
    .map((entry) => ({
      ...entry,
      planId: plan.planId,
    }));

  const todayIsoDate = toShortISOString(today());
  const allGridData = [];
  (allPlanEntries)
    .sort(sortEntriesByDate)
    .forEach((item) => {
      // The label item is used to denote the day of the week in the planner grid.
      allGridData.push({
        id: item.date,
        dayOfWeek: getShortDayOfTheWeek(item.date),
        shortDate: `${getShortMonth(item.date)} ${new Date(item.date).getDate()}`,
        isToday: item.date === todayIsoDate,
        isLabel: true,
      });

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
  return allGridData;
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

export const usePlanSelector = () => {
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const planData = useAppState().getPlanData();
  useEffect(() => {
    if (planData && Object.keys(planData).length > 0 && !selectedPlanId) {
      // TODO: Need to select the first active plan.
      setSelectedPlanId(Object.values(planData)[0].planId);
    }
  }, [planData]);
  return [selectedPlanId, setSelectedPlanId];
};
