function debugUpdateStats() {
  const app = SpreadsheetApp.getActive();
  const thisWeek = app.getSheetByName('This Week');
  const statsSheet = app.getSheetByName('Stats');
  const thisWeeksPlan = thisWeek.getRange('B2:D8');
  _updateStats(statsSheet, thisWeeksPlan, _getMealMap(app));
}

function debugSyncAlexaShoppingList() {
  alexaUtils.syncShoppingList();
}

function debugReplaceList() {
  const listItems = [ "foo", "bar", "baz" ];
  const app = SpreadsheetApp.getActive();
  const list = app.getSheetByName('list_alexa-shopping');
  list.clear();
  const transformed = [];
      for (let i = 0; i < listItems.length; i++) {
        transformed[i] = [ listItems[i] ];
      }
  list.getRange(1, 1, listItems.length, 1).setValues(transformed);
}

function debugSyncRecipes() {
  const app = SpreadsheetApp.getActive();
  const thisWeek = app.getSheetByName('This Week');
  const mealMap = _getMealMap(app);

  _syncRecipes(thisWeek, mealMap);
}

function rotateWeeks() {
  const app = SpreadsheetApp.getActive();

  const thisWeek = app.getSheetByName('This Week');
  const nextWeek = app.getSheetByName('Next Week');
  const mealsSheet = app.getSheetByName('Meals');
  const statsSheet = app.getSheetByName('Stats');
  const configSheet = app.getSheetByName('Config');
  const regularsSheet = app.getSheetByName('list_regulars');

  const nextWeeksPlan = nextWeek.getRange('B2:D8');
  const thisWeeksPlan = thisWeek.getRange('B2:D8');

  const mealMap = _getMealMap(app);

  _updateLastSyncTime(configSheet);
  _updateStats(statsSheet, thisWeeksPlan, mealMap);
  _resetRegularsLists(regularsSheet);
  // _syncRecipes(thisWeek, mealMap);

  nextWeeksPlan.copyTo(thisWeeksPlan);
  nextWeeksPlan.clearContent();
}

function _updateLastSyncTime(configSheet) {
  configSheet.getRange('B2').setValue(new Date().getTime());
}

function _updateStats(statsSheet, plan, mealMap) {
  let lastRowIdx = statsSheet.getLastRow() + 1;
  const mealFreq = _createMealFreqMap(plan, mealMap);

  let statsData = [];
  if (lastRowIdx >= 3) {
    const statsRange = `A2:A${lastRowIdx.toString()}`;
    statsData = statsSheet.getRange(statsRange).getValues();
  }

  for (let i = 0; i < statsData.length; i++) {
    const rowOffset = 2; // i is indexed on zero, first data is on row two.
    const mealName = statsData[i][0];
    if (mealName in mealFreq) {
      mealFreq[mealName].key = (`B${(i + rowOffset).toString()}`);
    }
  }

  Object.keys(mealFreq).forEach((mealName) => {
    const mealData = mealFreq[mealName];

    if (mealData.key) { // Meal already exists in stats
      const mealFreqRange = statsSheet.getRange(mealData.key);
      const updatedCount = parseInt(mealFreqRange.getValue()) + 1;
      mealFreqRange.setValue(updatedCount);
    } else {
      const tmpRange = statsSheet.getRange(lastRowIdx, 1, 1, 2);
      tmpRange.setValues([[mealName, 1]]);
      lastRowIdx += 1;
    }
  });
}

function _createMealFreqMap(plan, mealMap) {
  return plan.getValues().reduce((acc, row) => {
    const lunch = String(row[0]).toLowerCase().trim();
    const dinner = String(row[1]).toLowerCase().trim();

    if (lunch && lunch in mealMap) {
      if (!acc[lunch]) {
        acc[lunch] = { count: 1 };
      } else {
        acc[lunch].count += 1;
      }
    }
    if (dinner && dinner in mealMap) {
      if (!acc[dinner]) {
        acc[dinner] = { count: 1 };
      } else {
        acc[dinner].count += 1;
      }
    }
    return acc;
  }, {});
}

function _resetRegularsLists(regularsSheet) {
  regularsSheet.getRange("B1:B").clearContent();
}

function _syncRecipes(plan, mealMap) {
  const thisWeeksMeals = plan.getRange('B2:D8');
  thisWeeksMeals.getValues().forEach((row, rowIdx) => {
    const lunch = String(row[0]).toLowerCase().trim();
    const dinner = String(row[1]).toLowerCase().trim();

    const lunchRecipe = _getRecipe(lunch, mealMap);
    const dinnerRecipe = _getRecipe(dinner, mealMap);

    console.log(lunchRecipe, dinnerRecipe, rowIdx);
  });
}

function _getRecipe(mealName, mealMap) {
  if (!mealName in mealMap) {
    return '';
  }
  return mealMap[mealName].recipe || '';
}
