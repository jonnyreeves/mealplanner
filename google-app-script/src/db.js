/* global dateUtils uuidv4 */

const ROLLOVER_DAY_OF_WEEK = 5; // Friday.

const RecipeCols = {
  id: 0,
  name: 1,
  source: 2,
  ingredients: 3,
  tags: 4,
};

class MealPlannerDb {
  constructor(ss) {
    this.ss = ss;
    this.sheets = {
      thisWeek() {
        if (!this._thisWeek) {
          this._thisWeek = ss.getSheetByName('This Week');
        }
        return this._thisWeek;
      },
      nextWeek() {
        if (!this._nextWeek) {
          this._nextWeek = ss.getSheetByName('Next Week');
        }
        return this._nextWeek;
      },
      meals() {
        if (!this._meals) {
          this._meals = ss.getSheetByName('Meals');
        }
        return this._meals;
      },
      getList(listName) {
        const listSheet = ss.getSheetByName(`list_${listName}`);
        if (!listSheet) {
          throw new Error(`expected sheet named: 'list_${listName}'`);
        }
        return listSheet;
      },
    };
  }

  getPlan() {
    const startDate = dateUtils.addDays(this.getNextRolloverDate(dateUtils.today()), -7);
    return [
      ...this.sheets.thisWeek().getRange(ROLLOVER_DAY_OF_WEEK + 1, 1, 8 - ROLLOVER_DAY_OF_WEEK, 4).getValues(),
      ...this.sheets.thisWeek().getRange(2, 1, ROLLOVER_DAY_OF_WEEK - 1, 4).getValues(),
      ...this.sheets.nextWeek().getRange(ROLLOVER_DAY_OF_WEEK + 1, 1, 8 - ROLLOVER_DAY_OF_WEEK, 4).getValues(),
      ...this.sheets.nextWeek().getRange(2, 1, ROLLOVER_DAY_OF_WEEK - 1, 4).getValues(),
    ].map((row, idx) => this.rowMapper(row, dateUtils.addDays(startDate, idx)));
  }

  rowMapper(row, date) {
    return {
      date: dateUtils.toShortISOString(date),
      lunch: this.getMeal(row[1]),
      dinner: this.getMeal(row[2]),
      note: row[3],
    };
  }

  getPlanByRange(startIsoDate, endIsoDate) {
    const todaysDate = dateUtils.today();

    let startDate = dateUtils.fromISOString(startIsoDate);
    const endDate = dateUtils.fromISOString(endIsoDate);
    const { nextRolloverDate, prevRolloverDate } = this.getRolloverDates(todaysDate);

    const plannedMeals = [];
    const queryPlan = [];

    let numRows;
    let startRowIdx;
    const queryNextWeek = endDate.getTime() >= nextRolloverDate.getTime();
    const queryThisWeek = startDate.getTime() < nextRolloverDate.getTime();

    // Don't allow queries to return data from before the previous rollover date.
    if (startDate.getTime() < prevRolloverDate.getTime()) {
      startDate = prevRolloverDate;
    }

    if (queryThisWeek) {
      startRowIdx = this.dayToRowIdx(startDate.getDay());
      numRows = Math.min(dateUtils.daysBetween(startDate, endDate), dateUtils.daysBetween(startDate, nextRolloverDate) - 1);
      const endRowIdx = Math.min(((startRowIdx + numRows) - 1), 8);
      queryPlan.push({ sheet: 'this-week', startRow: startRowIdx, numRows: (endRowIdx - startRowIdx) + 1 });
      if ((startRowIdx + numRows) > 8) {
        const remainingRows = (numRows - (endRowIdx - startRowIdx) - 1);
        queryPlan.push({ sheet: 'this-week', startRow: 2, numRows: remainingRows });
      }
    }

    if (queryNextWeek) {
      startRowIdx = this.dayToRowIdx(nextRolloverDate.getDay());
      numRows = dateUtils.daysBetween(nextRolloverDate, endDate);
      numRows = Math.min(numRows, 7); // Clamp results for NextWeek at 7 - we can't go any further than that!
      const endRowIdx = Math.min(((startRowIdx + numRows) - 1), 9);
      queryPlan.push({ sheet: 'next-week', startRow: startRowIdx, numRows: (endRowIdx - startRowIdx) + 1 });
      if ((startRowIdx + numRows) > 9) {
        const remainingRows = (numRows - (endRowIdx - startRowIdx));
        queryPlan.push({ sheet: 'next-week', startRow: 2, numRows: remainingRows });
      }
    }

    const values = [];
    queryPlan.forEach((query) => {
      const targetSheet = (query.sheet === 'this-week') ? this.sheets.thisWeek() : this.sheets.nextWeek();
      values.push(...targetSheet.getRange(query.startRow, 1, query.numRows, 4).getValues());
    });

    plannedMeals.push(
      ...values.map((row, idx) => ({
        date: dateUtils.addDays(startDate, idx),
        lunch: this.getMeal(row[1]),
        dinner: this.getMeal(row[2]),
        note: row[3],
      })),
    );

    return plannedMeals;
  }

  getMeal(name) {
    this._initMealCache();

    const mealInfo = this._mealCache[name.toLowerCase()];
    if (!mealInfo) {
      return {
        name,
        recipe: '',
        ingredients: [],
        tags: [],
      };
    }
    return mealInfo;
  }

  setPlanEntry(isoDate, entry) {
    const todaysDate = dateUtils.today();
    const entryDate = dateUtils.fromISOString(isoDate);
    const { prevRolloverDate, nextRolloverDate } = this.getRolloverDates(todaysDate);

    const entryTime = entryDate.getTime();
    let targetSheet;
    if (entryTime >= prevRolloverDate.getTime() && entryTime < nextRolloverDate.getTime()) {
      targetSheet = this.sheets.thisWeek();
    } else if (entryTime >= nextRolloverDate.getTime() && entryTime < dateUtils.addDays(nextRolloverDate, 7).getTime()) {
      targetSheet = this.sheets.nextWeek();
    }
    if (!targetSheet) {
      return {
        success: false,
        message: `entryDate must fall within range: ${dateUtils.toShortISOString(prevRolloverDate)} and ${dateUtils.toShortISOString(dateUtils.addDays(nextRolloverDate, 7))}`,
      };
    }

    const rowIdx = this.dayToRowIdx(entryDate.getUTCDay());
    if ('lunch' in entry) {
      targetSheet.getRange(rowIdx, 2).setValue(entry.lunch);
    }
    if ('dinner' in entry) {
      targetSheet.getRange(rowIdx, 3).setValue(entry.dinner);
    }
    if ('note' in entry) {
      targetSheet.getRange(rowIdx, 4).setValue(entry.note);
    }

    return {
      success: true,
      message: `Modified row ${rowIdx} in sheet: ${targetSheet.getName()}`,
    };
  }

  getAllRecipes() {
    this._initMealCache();
    return Object.values(this._mealCache);
  }

  createRecipe(fields) {
    if (!fields.name || String(fields.name).trim() === '') {
      throw new Error('recipe name must not be empty');
    }
    const existing = this.getAllRecipes().find((v) => v.name === fields.name);
    if (existing) {
      throw new Error(`a recipe named '${fields.name}' already exists'`);
    }
    const newId = uuidv4();
    const tagStr = fields.tags.join(',');
    const ingredientsStr = fields.ingredients.map((ing) => ing.value).join(',');
    this.sheets.meals().appendRow([newId, fields.name, fields.source, ingredientsStr, tagStr]);

    return {
      id: newId,
      ...fields,
    };
  }

  updateRecipe(id, fields) {
    const recipe = this.getAllRecipes().find((v) => v.id === id);
    if (!recipe) {
      throw new Error(`No recipe found with id: ${id}`);
    }
    const updateValueIfPresent = (fieldName) => {
      if (fields[fieldName] !== undefined) {
        const colIdx = RecipeCols[fieldName] + 1;
        const newValue = Array.isArray(fields[fieldName]) ? fields[fieldName].join(',') : fields[fieldName];
        this.sheets.meals().getRange(recipe.rowIdx, colIdx).setValue(newValue);
      }
    };
    updateValueIfPresent('name');
    updateValueIfPresent('source');
    updateValueIfPresent('tags');
    updateValueIfPresent('ingredients');
  }

  getMealsByIngredient(ingredient) {
    this._initMealCache();
    const meals = [];

    Object.keys(this._mealCache).forEach((mealName) => {
      const thisMeal = this._mealCache[mealName];
      for (let i = 0; i < thisMeal.ingredients.length; i += 1) {
        if (thisMeal.ingredients[i].name.toLowerCase() === ingredient.toLowerCase()) {
          meals.push(thisMeal);
        }
      }
    });

    return meals;
  }

  _initMealCache() {
    if (this._mealCache) return;

    this._mealCache = {};
    const values = this.sheets.meals().getDataRange().getValues();
    values.shift(); // Remove the header row

    for (let i = 0; i < values.length; i += 1) {
      const recipe = this._parseRecipeRow(values[i]);
      const mealCacheKey = String(recipe.name).toLowerCase();
      this._mealCache[mealCacheKey] = { ...recipe, rowIdx: (i + 2) };
    }
  }

  _parseRecipeRow(row) {
    const ingredientMapper = (str) => str.split(',').map((v) => {
      const val = v.trim();
      let quantity = '1';
      let name = val;

      const matches = /([0-9]+)(x|g|ml)(.*)/.exec(val);
      if (matches) {
        if (matches[2] === 'x') {
          // eslint-disable-next-line prefer-destructuring
          quantity = matches[1];
        } else {
          quantity = matches[1] + matches[2];
        }
        // eslint-disable-next-line prefer-destructuring
        name = matches[3];
      }

      return {
        name: name.trim(),
        quantity,
        value: val,
      };
    });
    return {
      id: row[RecipeCols.id],
      name: row[RecipeCols.name],
      source: row[RecipeCols.source],
      recipe: row[RecipeCols.source], // TODO: 'recipe' field is deprecated by 'source' field.
      ingredients: ingredientMapper(row[RecipeCols.ingredients]).filter((v) => !!v.name),
      tags: (row[RecipeCols.tags] || '').split(',').map((item) => item.trim()).filter((v) => v !== ''),
    };
  }

  dayToRowIdx(jsDay) {
    // JS Date API has Sunday as 0, through Saturday as 6; source spreadsheet as Monday as row 1.
    if (jsDay === 0) {
      return 8;
    }
    return jsDay + 1;
  }

  getRolloverDates(todaysDate) {
    let nextRolloverDate = this.getNextRolloverDate(todaysDate);
    let prevRolloverDate;

    if (nextRolloverDate.getTime() === todaysDate.getTime()) {
      prevRolloverDate = nextRolloverDate;
      nextRolloverDate = dateUtils.addDays(nextRolloverDate, 7);
    } else {
      prevRolloverDate = dateUtils.addDays(nextRolloverDate, -7);
    }
    return { nextRolloverDate, prevRolloverDate };
  }

  getNextRolloverDate(startDate) {
    const res = new Date(startDate.getTime());
    let daysUntilNextRollover = ROLLOVER_DAY_OF_WEEK - startDate.getDay();
    if (daysUntilNextRollover < 0) {
      daysUntilNextRollover = ROLLOVER_DAY_OF_WEEK + Math.abs(daysUntilNextRollover);
    } else if (daysUntilNextRollover === 0) {
      daysUntilNextRollover = 7;
    }
    res.setDate(startDate.getDate() + daysUntilNextRollover);
    dateUtils.zeroHMS(res);
    return res;
  }

  getList(listName) {
    const values = this.sheets.getList(listName).getDataRange().getValues();
    return values.map((value) => ({ item: value[0], checked: Boolean(value[1]) }));
  }

  modifyList(listName, { action, item }) {
    const listSheet = this.sheets.getList(listName);
    const values = listSheet.getDataRange().getValues();
    if (action === 'add') {
      listSheet.appendRow([item]);
    } else {
      const rowIdx = values.findIndex((row) => row[0] === item);
      if (rowIdx === -1) {
        throw new Error(`expected to find item '${item}' in list: '${listName}'`);
      }
      if (action === 'tick') {
        const currentValue = listSheet.getRange(rowIdx, 1).getValue();
        const newValue = (currentValue === 1) ? 0 : 1;
        listSheet.getRange(rowIdx, 1).setValue(newValue);
      } else if (action === 'delete') {
        listSheet.deleteRow(rowIdx);
      }
    }
  }
}

MealPlannerDb.init = () => new MealPlannerDb(SpreadsheetApp.getActive());
