function buildShoppingList() {
  var app = SpreadsheetApp.getActive();
  
  var mealMap = _getMealMap(app);
  var ingredientMap = _getIngredientMap(app);
  
  var mealNames = _getMealNames(app, "Next Week");
  var myMeals = mealNames.map(n => mealMap[n] || { name: n, ingredients: [] });

  var grouped = {};
  var unkownMeals = [];

  myMeals.forEach(m => {
    var required = _getRequiredIngredientsFor(m, ingredientMap);
    if (required.length === 0) {
      unkownMeals.push(m);
      return;
    }
    required.forEach(i => {
      if (!grouped[i.name]) {
        grouped[i.name] = {
          name: i.name,
          quantity: i.quantity,
          productUrl: i.productUrl,
          meals: m.name
        }
      } else {
        grouped[i.name].quantity += i.quantity;
        grouped[i.name].meals += ", " + m.name; // TODO: Dedupe!
      }
    })
  })

  var listSheet = app.getSheetByName("Shopping List");
  
  var listRange
  if (listSheet.getLastRow() > 1) {
    listRange = listSheet.getRange(2, 1, listSheet.getLastRow(), listSheet.getLastColumn());
    listRange.clearContent();
  }
  

  var mapped = Object.keys(grouped).map(k => {
    var v = grouped[k];
    return [ "", v.name, v.quantity, v.productUrl, v.meals ]
  })
  unkownMeals.forEach(m => {
    mapped.push([ "", "???", "", "", m.name ]);
  })
  
  console.log(mapped);

  var listRange = listSheet.getRange(2, 1, mapped.length, 5);  
  listRange.setValues(mapped);
}

function _getMealMap(app) {
  var mealsSheet = app.getSheetByName("Meals");
  var lastRowIdx = mealsSheet.getLastRow();
  var mealsData = mealsSheet.getRange(2, 1, lastRowIdx, 4).getValues();
  var result = {};
  for (var i = 0; i < mealsData.length; i++) {
    var mealName = mealsData[i][0];
    result[mealName.toLowerCase()] = {
      name: mealName,
      recipe: mealsData[i][1],
      ingredients: _parseMealIngredient(mealsData[i][2]).filter(v => v !== null)
    }
  }
  return result;
}

function _parseMealIngredient(str) {
  return _parseCSV(str).map(v => {
    if (!v) return null;

    var name = v;
    var quantity = 1;

    var matches = /^([0-9]+)x (.*)$/.exec(v);
    if (matches !== null) {
      name = matches[2];
      quantity = parseInt(matches[1]);
    }

    return { name: name.toLowerCase(), quantity };
  });
}

function _getIngredientMap(app) {
  var ingredientsSheet = app.getSheetByName("Ingredients");
  var lastRowIdx = ingredientsSheet.getLastRow();
  var cells = ingredientsSheet.getRange(2, 1, lastRowIdx + 1, 4).getValues();
  var result = {};
  for (var i = 0; i < cells.length; i++) {
    var name = cells[i][0];
    var data = {
      name,
      productUrl: cells[i][1],
    }
    result[name.toLowerCase().trim()] = data

    var aliases = _parseCSV(cells[i][2]);
    aliases.forEach(v => result[v.toLowerCase()] = data);
  }
  return result;
}

function _getRequiredIngredientsFor(meal, ingredientMap) {
  console.log("Get ings for ", meal);
  return meal.ingredients.map(rIng => {
    var known = ingredientMap[rIng.name];
    if (known) {
      return {
        ...known,
        quantity: rIng.quantity
      }
    }
    return {
      name: rIng.name,
      quantity: rIng.quantity
    }
  });
}

function _getMealNames(app, sheetName) {
  var sheet = app.getSheetByName(sheetName);
  var values = sheet.getRange(2, 2, 7, 2).getValues();
  var result = []
  values.forEach(v => {
    if (v[0]) result.push(v[0]);
    if (v[1]) result.push(v[1]);
  });
  return result.map(v => v.trim().toLowerCase());

}

function _parseCSV(str) {
  return str.split(",").map(v => v.trim());
}
