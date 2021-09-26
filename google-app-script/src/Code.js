function debugUpdateStats() {
  var app = SpreadsheetApp.getActive();
  var thisWeek = app.getSheetByName('This Week');
  var statsSheet = app.getSheetByName('Stats');
  var thisWeeksPlan = thisWeek.getRange("B2:D8");
  _updateStats(statsSheet, thisWeeksPlan, _getMealMap(app));
}

function debugSyncRecipes() {
  var app = SpreadsheetApp.getActive();
  var thisWeek = app.getSheetByName('This Week');
  var mealMap = _getMealMap(app);

  _syncRecipes(thisWeek, mealMap);
}

function rotateWeeks () {
  var app = SpreadsheetApp.getActive();
  
  var thisWeek = app.getSheetByName('This Week');
  var nextWeek = app.getSheetByName('Next Week');
  var mealsSheet = app.getSheetByName('Meals');
  var statsSheet = app.getSheetByName('Stats');
  var configSheet = app.getSheetByName('Config');
  
  var nextWeeksPlan = nextWeek.getRange("B2:D8");
  var thisWeeksPlan = thisWeek.getRange("B2:D8");

  var mealMap = _getMealMap(app);
  
  _updateLastSyncTime(configSheet);
  _updateStats(statsSheet, thisWeeksPlan, mealMap);
  //_syncRecipes(thisWeek, mealMap);
  
  nextWeeksPlan.copyTo(thisWeeksPlan);
  nextWeeksPlan.clearContent();
}

function _updateLastSyncTime(configSheet) {
  configSheet.getRange("B2").setValue(new Date().getTime());
}

function _updateStats(statsSheet, plan, mealMap) {
  var lastRowIdx = statsSheet.getLastRow() + 1;
  var mealFreq = _createMealFreqMap(plan, mealMap);

  var statsData = [];
  if (lastRowIdx >= 3) {
    var statsRange = "A2:A" + lastRowIdx.toString();
    statsData = statsSheet.getRange(statsRange).getValues();
  }
  
  for (var i = 0; i < statsData.length; i++) {
    var rowOffset = 2; // i is indexed on zero, first data is on row two.
    var mealName = statsData[i][0];
    if (mealName in mealFreq) {
      mealFreq[mealName].key = ("B" + (i + rowOffset).toString());
    }
  }
  

  Object.keys(mealFreq).forEach(function (mealName) {
    var mealData = mealFreq[mealName];
    
    if (mealData.key) { // Meal already exists in stats
      var mealFreqRange = statsSheet.getRange(mealData.key);
      var updatedCount = parseInt(mealFreqRange.getValue()) + 1;
      mealFreqRange.setValue(updatedCount);
    } else {
      var tmpRange = statsSheet.getRange(lastRowIdx, 1, 1, 2);
      tmpRange.setValues([ [ mealName, 1 ] ]);
      lastRowIdx += 1;
    }
  });
}

function _createMealFreqMap(plan, mealMap) {
  return plan.getValues().reduce(function (acc, row) {
    var lunch = String(row[0]).toLowerCase().trim();
    var dinner = String(row[1]).toLowerCase().trim();

    if (lunch && lunch in mealMap) {      
      if (!acc[lunch]) {
        acc[lunch] =  { count: 1 };
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

function _syncRecipes(plan, mealMap) {
  var thisWeeksMeals = plan.getRange("B2:D8");
  thisWeeksMeals.getValues().forEach(function (row, rowIdx) {
    var lunch = String(row[0]).toLowerCase().trim();
    var dinner = String(row[1]).toLowerCase().trim();

    var lunchRecipe = _getRecipe(lunch, mealMap);
    var dinnerRecipe = _getRecipe(dinner, mealMap);

    console.log(lunchRecipe, dinnerRecipe, rowIdx);
  });
}

function _getRecipe(mealName, mealMap) {
  if (!mealName in mealMap) {
    return ""
  }
  return mealMap[mealName].recipe || "";
}
