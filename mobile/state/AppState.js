import cloneDeep from 'clone-deep';

export default class AppState {
  constructor({ api }) {
    this._api = api;
    this._handlerMap = {
      recipes_updated: [],
      plan_updated: [],
    };

    this._recipesById = {};
    this._planByDate = {};

    this._api.addListener('plan_fetched', (planData) => this._onPlanFetched(planData));
    this._api.addListener('recipes_fetched', (recipes) => this._onRecipesFetched(recipes));
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

  setPlanEntry({ date, slot, recipeName }) {
    const srcEntry = this._planByDate[date];
    this._planByDate = {
      ...this._planByDate,
      [date]: {
        ...srcEntry,
        [slot]: {
          ...this.findRecipeByName(recipeName),
          name: recipeName,
        },
      },
    };
    this._dispatch('plan_updated');
    this._api.updatePlan({ [date]: { [slot]: recipeName } });
  }

  swapPlanEntries({ src, dest }) {
    let entryMap;
    if (src.date === dest.date) {
      const prevEntry = cloneDeep(this._planByDate[src.date]);
      this._planByDate = {
        ...this._planByDate,
        [src.date]: {
          ...prevEntry,
          [src.slot]: { ...prevEntry[dest.slot] },
          [dest.slot]: { ...prevEntry[src.slot] },
        },
      };
      entryMap = { [src.date]: { [src.slot]: dest.recipeName, [dest.slot]: src.recipeName } };
    } else {
      const prevSrc = cloneDeep(this._planByDate[src.date]);
      const prevDest = cloneDeep(this._planByDate[dest.date]);
      this._planByDate = {
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
      };
      entryMap = {
        [src.date]: { [src.slot]: dest.recipeName },
        [dest.date]: { [dest.slot]: src.recipeName },
      };
    }
    console.log(this._planByDate);

    return this._api.updatePlan(entryMap);
  }

  getRecipes() {
    return Object.values(this._recipesById);
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

  findRecipeByName(recipeName) {
    return this.getRecipes().find((v) => v.name.toLowerCase() === recipeName.toLowerCase()) || null;
  }

  updateRecipe(recipeId, fields) {
    const srcRecipe = this._recipesById[recipeId];
    this._recipesById = {
      ...this._recipesById,
      [recipeId]: { ...srcRecipe, ...fields },
    };
    this._dispatch('recipes_updated');
    this._api.updateRecipe(recipeId, fields);
  }

  autoFocusRecipeSearchbar() {
    this._aFRS = true;
  }

  shouldAutoFocusRecipeSearchbar() {
    const af = this._aFRS;
    this._aFRS = false;
    return af;
  }

  _onRecipesFetched(recipes) {
    this._recipesById = {};
    recipes.forEach((entry) => {
      this._recipesById[entry.id] = entry;
    });
    this._dispatch('recipes_updated');
  }

  _onPlanFetched(planData) {
    this._planByDate = {};
    planData.forEach((entry) => {
      this._planByDate[entry.date] = entry;
    });
    this._dispatch('plan_updated');
  }

  _dispatch(eventName) {
    this._handlerMap[eventName].forEach((handlerFn) => handlerFn());
  }
}
