// Test.
const ROLLOVER_DAY_OF_WEEK = 5; // Friday.

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
    };
  }

  getPlan() {
    const startDate = dateUtils.addDays(this.getNextRolloverDate(new Date()), -7);

    return [
      ...this.sheets.thisWeek().getRange(ROLLOVER_DAY_OF_WEEK + 1, 1, 8 - ROLLOVER_DAY_OF_WEEK, 4).getValues(),
      ...this.sheets.thisWeek().getRange(2, 1, ROLLOVER_DAY_OF_WEEK - 1, 4).getValues(),
      ...this.sheets.nextWeek().getRange(ROLLOVER_DAY_OF_WEEK + 1, 1, 8 - ROLLOVER_DAY_OF_WEEK, 4).getValues(),
      ...this.sheets.nextWeek().getRange(2, 1, ROLLOVER_DAY_OF_WEEK - 1, 4).getValues(),
    ].map((row, idx) => ({
      date: dateUtils.addDays(startDate, idx),
      lunch: this.getMeal(row[1]),
      dinner: this.getMeal(row[2]),
      note: row[3],
    }));
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

  getMealsByIngredient(ingredient) {
    this._initMealCache();
    const meals = [];

    Object.keys(this._mealCache).forEach((mealName) => {
      const thisMeal = this._mealCache[mealName];
      for (let i = 0; i < thisMeal.ingredients.length; i++) {
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
    let thisRow;

    const ingredientMapper = (str) => str.split(',').map((val) => {
      let quantity = '1';
      let name = val;

      const matches = /([0-9]+)(x|g|ml)(.*)/.exec(val);
      if (matches) {
        if (matches[2] == 'x') {
          quantity = matches[1];
        } else {
          quantity = matches[1] + matches[2];
        }
        name = matches[3];
      }

      return {
        name: name.trim(),
        quantity,
      };
    });

    for (let i = 0; i < values.length; i++) {
      thisRow = values[i];
      const mealName = String(thisRow[0]).toLowerCase();
      this._mealCache[mealName] = {
        name: thisRow[0],
        recipe: thisRow[1],
        ingredients: ingredientMapper(thisRow[2]),
        tags: (thisRow[3] || '').split(','),
      };
    }
  }

  dayToRowIdx(jsDay) {
    // JS Date API has Sunday as 0, through Saturday as 6; source spreadsheet as Monday as row 1.
    if (jsDay == 0) {
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
    res.setDate(startDate.getDate() + (7 + ROLLOVER_DAY_OF_WEEK - startDate.getDay()) % 7);
    dateUtils.zeroHMS(res);
    return res;
  }
}

MealPlannerDb.init = () => new MealPlannerDb(SpreadsheetApp.getActive());
