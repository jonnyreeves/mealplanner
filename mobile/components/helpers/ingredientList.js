const alphabetically = (a, b) => {
  const aa = a.toLowerCase();
  const bb = b.toLowerCase();
  if (aa === bb) return 0;
  if (aa > bb) return 1;
  return -1;
};

export function toIngredientList(planEntries, recipes) {
  const recipeByName = {};
  const byIngredient = {};
  const unknownMeals = [];

  recipes.forEach((recipe) => {
    recipeByName[recipe.name] = recipe;
  });

  planEntries.forEach((entry) => {
    if (entry.isLabel || !entry.name) {
      return;
    }

    const recipe = recipeByName[entry.name];
    if (!recipe) {
      unknownMeals.push({ name: entry.name, date: entry.date, slot: entry.slot });
      return;
    }
    recipe.ingredients.forEach((ing) => {
      const e = byIngredient[ing.name];
      if (!e) {
        byIngredient[ing.name] = {
          qty: ing.quantity,
          meals: [{ name: entry.name, date: entry.date, slot: entry.slot }],
        };
      } else {
        const [num, unit] = /[0-9]+(.*)/.exec(e.qty) || [];
        e.qty = `${parseInt(e.qty, 10) + parseInt(num, 10)}${unit}`;
        e.meals.push({ name: entry.name, date: entry.date, slot: entry.slot });
      }
    });
  });

  const knownIngredients = Object.keys(byIngredient)
    .map((ingName) => ({
      ingredient: ingName, qty: byIngredient[ingName].qty, meals: byIngredient[ingName].meals,
    }))
    .sort((a, b) => alphabetically(a.ingredient, b.ingredient));

  return {
    knownIngredients,
    unknownMeals,
  };
}
