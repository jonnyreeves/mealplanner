import cloneDeep from 'clone-deep';
import deepEqual from 'deep-equal';

export default class AppState {
  constructor({ api, storage }) {
    this._api = api;
    this._storage = storage;

    this._handlerMap = {
      recipes_updated: [],
      plan_updated: [],
      lists_updated: [],
    };

    this._recipesById = {};
    this._planByDate = {};
    this._listsByName = {};

    // This is being used to shim plan api v1 => v2
    this._hack_planIdByDate = {};

    this._api.addListener('plan_fetched', (planData) => this._onPlanFetched(planData));
    this._api.addListener('recipes_fetched', (recipes) => this._onRecipesFetched(recipes));
    this._api.addListener('lists_fetched', (listData) => this._onListsFetched(listData));
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
    throw new Error("unused getPlanEntries!");
    return Object.values(this._planByDate);
  }

  async setPlanEntry({ date, slot, recipeName }) {
    const srcEntry = this._planByDate[date];
    const recipe = this.findRecipeByName(recipeName);
    this._setPlanByDate({
      ...this._planByDate,
      [date]: {
        ...srcEntry,
        [slot]: {
          ...recipe,
          name: recipeName,
        },
      },
    });
    return this._api.updatePlan({
      [this._hack_planIdByDate[date]]: {
        [date]: {
          [slot]: {
            name: recipeName,
          },
        },
      },
    });
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
      entryMap = {
        [this._hack_planIdByDate[src.date]]: {
          [src.date]: {
            [src.slot]: {
              name: dest.recipeName,
            },
            [dest.slot]: {
              name: src.recipeName,
            },
          },
        },
      };
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

      const srcPlanId = this._hack_planIdByDate[src.date];
      const destPlanId = this._hack_planIdByDate[dest.date];

      entryMap = {};
      entryMap[srcPlanId] = {};
      entryMap[destPlanId] = {};

      entryMap[srcPlanId][src.date] = { [src.slot]: { name: dest.recipeName } };
      entryMap[destPlanId][dest.date] = { [dest.slot]: { name: src.recipeName } };
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

  toggleListItem(listName, item) {
    const targetList = this._listsByName[listName];
    const targetItemIdx = targetList.findIndex((v) => v.item === item);

    console.log(`Change ${listName} - ${item}, idx=${targetItemIdx}`);
    if (targetItemIdx !== -1) {
      const newState = !targetList[targetItemIdx].checked;
      this._setListData({
        ...this._listsByName,
        [listName]: [
          ...targetList.slice(0, targetItemIdx),
          { item, checked: newState },
          ...targetList.slice(targetItemIdx + 1),
        ],
      });
      this._api.modifyListItem(listName, { item, action: 'tick' });
    }
  }

  getListByName(listKey) {
    return this._listsByName[listKey] || [];
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

  _setListData(value) {
    this._listsByName = value;
    this._dispatch('lists_updated');
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
    const activePlans = planData.response.plans;

    for (let i = 0; i < activePlans.length; i += 1) {
      const thisPlan = activePlans[i];
      thisPlan.entries.forEach((entry) => {
        byDate[entry.date] = entry;
        this._hack_planIdByDate[entry.date] = thisPlan.planId;
      });
    }

    this._setPlanByDate(byDate);
  }

  _onListsFetched(listData) {
    this._setListData(listData);
  }

  _dispatch(eventName) {
    this._handlerMap[eventName].forEach((handlerFn) => handlerFn());
  }
}
