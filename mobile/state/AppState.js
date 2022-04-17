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

    this._plansById = {};

    this._recipesById = {};
    this._listsByName = {};

    this._api.addListener('plan_fetched', (planData) => this._onPlanFetched(planData));
    this._api.addListener('recipes_fetched', (recipes) => this._onRecipesFetched(recipes));
    this._api.addListener('lists_fetched', (listData) => this._onListsFetched(listData));
  }

  async init() {
    this._storage.bind({ appState: this });
    /*
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
    */
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
    return this._plansById;
  }

  async setPlanEntry(gridItem) {
    const {
      date, slot, planId, recipeName,
    } = gridItem;

    this._setPlansById(this._makePlanMutations(gridItem));

    return this._api.updatePlan({
      [planId]: {
        [date]: {
          [slot]: {
            name: recipeName,
          },
        },
      },
    });
  }

  _makePlanMutations(...gridItems) {
    let result = { ...this._plansById };
    gridItems.forEach((gridItem) => {
      const {
        date, slot, planId, recipeName,
      } = gridItem;

      const targetPlan = result[planId];
      if (!targetPlan) throw new Error(`failed to find target planId: ${planId}`);

      const entryIdx = targetPlan.entries.findIndex((entry) => entry.date === date);
      result = ({
        ...result,
        [planId]: {
          ...targetPlan,
          entries: [
            ...targetPlan.entries.slice(0, entryIdx),
            {
              ...targetPlan.entries[entryIdx],
              [slot]: {
                name: recipeName,
              },
            },
            ...targetPlan.entries.slice(entryIdx + 1),
          ],
        },
      });
    });
    return result;
  }

  swapPlanEntries({ src, dest }) {
    this._setPlansById(
      this._makePlanMutations(
        {
          ...src,
          recipeName: dest.recipeName,
        },
        {
          ...dest,
          recipeName: src.recipeName,
        },
      ),
    );
    let entryMap;
    if (src.date === dest.date) {
      entryMap = {
        [src.planId]: {
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
      entryMap = {
        [src.planId]: {},
        [dest.planId]: {},
      };
      entryMap[src.planId][src.date] = { [src.slot]: { name: dest.recipeName } };
      entryMap[dest.planId][dest.date] = { [dest.slot]: { name: src.recipeName } };
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

  _setPlansById(value) {
    if (!deepEqual(this._plansById, value)) {
      this._plansById = value;
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
    const activePlans = planData.response.plans;

    const byId = {};
    for (let i = 0; i < activePlans.length; i += 1) {
      const thisPlan = activePlans[i];
      byId[thisPlan.planId] = thisPlan;
    }
    this._setPlansById(byId);
  }

  _onListsFetched(listData) {
    this._setListData(listData);
  }

  _dispatch(eventName) {
    this._handlerMap[eventName].forEach((handlerFn) => handlerFn());
  }
}
