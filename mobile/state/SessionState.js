export default class SessionState {
  constructor() {
    this.clearRecipeModificationState();
  }

  updateRecipeModificationState(fields) {
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

  autoFocusRecipeSearchbar() {
    this._aFRS = true;
  }

  shouldAutoFocusRecipeSearchbar() {
    const af = this._aFRS;
    this._aFRS = false;
    return af;
  }
}
