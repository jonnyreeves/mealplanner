import { useEffect, useState } from 'react';
import { useAppState } from '../../service/context';
import { dateWithOrdinal, getShortDayOfTheWeek, getShortMonth, shortPrettyDate, today, toShortISOString } from './date';


function sortByDate(key) {
  return (a, b) => {
    const aa = a[key].split('/').join();
    const bb = b[key].split('/').join();
    // eslint-disable-next-line no-nested-ternary
    return aa < bb ? -1 : (aa > bb ? 1 : 0);
  };
}

const planEntrySorter = sortByDate('date');
const planSorter = sortByDate('startDate');

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
    .sort(planEntrySorter)
    .forEach((item) => {
      // The label item is used to denote the day of the week in the planner grid.
      allGridData.push({
        id: `${item.date}-label`,
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

export const sortedPlans = (planData) => Object.values(planData).sort(planSorter);

export const usePlanSelector = () => {
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);

  const planData = useAppState().getPlanData();
  const plans = sortedPlans(planData);

  useEffect(() => {
    if (!selectedPlanId && plans.length > 0) {
      setSelectedPlanId(plans[0].planId);
    }
  }, [planData]);

  // Syncronise the Planner Grid Carousel with the Plan Selector
  useEffect(() => {
    if (plans.length > 0) {
      const idx = plans.findIndex((plan) => plan.planId === selectedPlanId);
      if (idx !== -1 && carouselIndex !== idx) {
        setCarouselIndex(idx);
      }
    }
  }, [selectedPlanId]);

  // Syncronise the Plan Selector with the Planner Grid Carousel.
  useEffect(() => {
    if (plans.length > 0 && carouselIndex >= 0 && carouselIndex < plans.length) {
      if (selectedPlanId !== plans[carouselIndex].planId) {
        setSelectedPlanId(plans[carouselIndex].planId);
      }
    }
  }, [carouselIndex]);
  return {
    selectedPlanId, setSelectedPlanId, carouselIndex, setCarouselIndex,
  };
};
