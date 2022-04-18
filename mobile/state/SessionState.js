export default class SessionState {
  constructor() {
    this.clearRecipeModificationState();
  }

  updateRecipeModificationState(fields) {
    console.log(`mutating modification state...${JSON.stringify(fields)}`);
    this._recipeModificationState = {
      ...this._recipeModificationState,
      ...fields,
    };
  }

  getRecipeModificationState() {
    return this._recipeModificationState;
  }

  clearRecipeModificationState() {
    this._recipeModificationState = {
      name: '',
      source: '',
      tags: [],
      ingredients: [],
    };
  }
}
