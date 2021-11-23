export default class SessionState {
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
    this._recipeModificationState = {};
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
