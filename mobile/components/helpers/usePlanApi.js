import { useContext } from 'react';
import { MealPlanServiceCtx } from '../../service/context';

export const usePlanApi = () => {
  const mealPlanService = useContext(MealPlanServiceCtx);

  const getPlan = () => mealPlanService.getPlan();
  const setMeal = ({ date, slot, recipeName }) => mealPlanService.updatePlan({
    [date]: { [slot]: recipeName },
  });
  const clearMeal = ({ date, slot }) => mealPlanService.updatePlan({
    [date]: { [slot]: '' },
  });
  const swapMeal = ({ src, dest }) => {
    let entryMap;
    if (src.date === dest.date) {
      entryMap = { [src.date]: { [src.slot]: dest.recipeName, [dest.slot]: src.recipeName } };
    } else {
      entryMap = {
        [src.date]: { [src.slot]: dest.recipeName },
        [dest.date]: { [dest.slot]: src.recipeName },
      };
    }
    return mealPlanService.updatePlan(entryMap);
  };
  const updateRecipe = ({ recipeId, fields }) => mealPlanService.updateRecipe(recipeId, fields);
  return {
    getPlan, setMeal, clearMeal, swapMeal, updateRecipe,
  };
};
