import cloneDeep from 'clone-deep';
import deepEqual from 'deep-equal';

export default class AppState {
  constructor({ api, storage }) {
    this._api = api;
    this._storage = storage;

    this._handlerMap = {
      recipes_updated: [],
      plan_updated: [],
    };

    this._recipesById = {};
    this._planByDate = {};

    this._api.addListener('plan_fetched', (planData) => this._onPlanFetched(planData));
    this._api.addListener('recipes_fetched', (recipes) => this._onRecipesFetched(recipes));
  }

  async init() {
    this._storage.bind({ appState: this });
    return Promise.all([
      (async () => {
        const planData = await this._storage.getPlanData();
        if (planData) {
          this._setPlanByDate(planData);
        }
      })(),
      (async () => {
        const recipeData = await this._storage.getRecipes();
        if (recipeData) {
          this._setRecipesById(recipeData);
        }
      })(),
    ]);
  }

  addListener(eventName, handlerFn) {
    this._handlerMap[eventName].push(handlerFn);
    return () => {
      const idx = this._handlerMap[eventName].indexOf(handlerFn);
      if (idx !== -1) {
        this._handlerMap[eventName].splice(idx, 1);
      }
    };
  }

  getPlanData() {
    return this._planByDate;
  }

  getPlanEntries() {
    return Object.values(this._planByDate);
  }

  async setPlanEntry({ date, slot, recipeName }) {
    const srcEntry = this._planByDate[date];
    this._setPlanByDate({
      ...this._planByDate,
      [date]: {
        ...srcEntry,
        [slot]: {
          ...this.findRecipeByName(recipeName),
          name: recipeName,
        },
      },
    });
    return this._api.updatePlan({ [date]: { [slot]: recipeName } });
  }

  swapPlanEntries({ src, dest }) {
    let entryMap;
    if (src.date === dest.date) {
      const prevEntry = cloneDeep(this._planByDate[src.date]);
      this._setPlanByDate({
        ...this._planByDate,
        [src.date]: {
          ...prevEntry,
          [src.slot]: { ...prevEntry[dest.slot] },
          [dest.slot]: { ...prevEntry[src.slot] },
        },
      });
      entryMap = { [src.date]: { [src.slot]: dest.recipeName, [dest.slot]: src.recipeName } };
    } else {
      const prevSrc = cloneDeep(this._planByDate[src.date]);
      const prevDest = cloneDeep(this._planByDate[dest.date]);
      this._setPlanByDate({
        ...this._planByDate,
        [src.date]: {
          ...prevSrc,
          [src.slot]: {
            ...this.findRecipeByName(dest.recipeName),
            name: dest.recipeName,
          },
        },
        [dest.date]: {
          ...prevDest,
          [dest.slot]: {
            ...this.findRecipeByName(src.recipeName),
            name: src.recipeName,
          },
        },
      });
      entryMap = {
        [src.date]: { [src.slot]: dest.recipeName },
        [dest.date]: { [dest.slot]: src.recipeName },
      };
    }
    return this._api.updatePlan(entryMap);
  }

  getRecipes() {
    return Object.values(this._recipesById);
  }

  getRecipesById() {
    return this._recipesById;
  }

  getRecipeById(recipeId) {
    return this._recipesById[recipeId] || null;
  }

  getAllTags() {
    return [...new Set(
      this.getRecipes()
        .map((item) => item.tags)
        .flat()
        .filter((item) => item !== ''),
    )];
  }

  getAllIngredients() {
    return [...new Set(
      this.getRecipes()
        .map((item) => item.ingredients.map((ing) => ing.name))
        .flat()
        .filter((item) => item !== ''),
    )];
  }

  findRecipeByName(recipeName) {
    return this.getRecipes().find((v) => v.name.toLowerCase() === recipeName.toLowerCase()) || null;
  }

  async createRecipe(fields) {
    const { recipe } = await this._api.createRecipe(fields);
    if (recipe) {
      this._recipesById = {
        ...this._recipesById,
        [recipe.id]: recipe,
      };
      this._dispatch('recipes_updated');
    }
    return recipe;
  }

  async updateRecipe(recipeId, fields) {
    const srcRecipe = this._recipesById[recipeId];
    this._setRecipesById({
      ...this._recipesById,
      [recipeId]: { ...srcRecipe, ...fields },
    });

    const updateFields = { ...fields };
    if ('ingredients' in updateFields) {
      updateFields.ingredients = updateFields.ingredients.map((ing) => ing.value);
    }
    return this._api.updateRecipe(recipeId, updateFields);
  }

  _setRecipesById(value) {
    if (!deepEqual(this._recipesById, value)) {
      this._recipesById = value;
      this._dispatch('recipes_updated');
    }
  }

  _setPlanByDate(value) {
    if (!deepEqual(this._planByDate, value)) {
      this._planByDate = value;
      this._dispatch('plan_updated');
    }
  }

  _onRecipesFetched(recipes) {
    const byId = {};
    recipes.forEach((entry) => {
      byId[entry.id] = entry;
    });
    this._setRecipesById(byId);
  }

  _onPlanFetched(planData) {
    const byDate = {};
    planData.forEach((entry) => {
      byDate[entry.date] = entry;
    });
    this._setPlanByDate(byDate);
  }

  _dispatch(eventName) {
    this._handlerMap[eventName].forEach((handlerFn) => handlerFn());
  }
}
