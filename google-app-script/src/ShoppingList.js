function buildShoppingList() {
  const app = SpreadsheetApp.getActive();

  const mealMap = _getMealMap(app);
  const ingredientMap = _getIngredientMap(app);

  const mealNames = _getMealNames(app, 'Next Week');
  const myMeals = mealNames.map((n) => mealMap[n] || { name: n, ingredients: [] });

  const grouped = {};
  const unkownMeals = [];

  myMeals.forEach((m) => {
    const required = _getRequiredIngredientsFor(m, ingredientMap);
    if (required.length === 0) {
      unkownMeals.push(m);
      return;
    }
    required.forEach((i) => {
      if (!grouped[i.name]) {
        grouped[i.name] = {
          name: i.name,
          quantity: i.quantity,
          productUrl: i.productUrl,
          meals: m.name,
        };
      } else {
        grouped[i.name].quantity += i.quantity;
        grouped[i.name].meals += `, ${m.name}`; // TODO: Dedupe!
      }
    });
  });

  const listSheet = app.getSheetByName('Shopping List');

  var listRange;
  if (listSheet.getLastRow() > 1) {
    listRange = listSheet.getRange(2, 1, listSheet.getLastRow(), listSheet.getLastColumn());
    listRange.clearContent();
  }

  const mapped = Object.keys(grouped).map((k) => {
    const v = grouped[k];
    return ['', v.name, v.quantity, v.productUrl, v.meals];
  });
  unkownMeals.forEach((m) => {
    mapped.push(['', '???', '', '', m.name]);
  });

  console.log(mapped);

  var listRange = listSheet.getRange(2, 1, mapped.length, 5);
  listRange.setValues(mapped);
}

function _getMealMap(app) {
  const mealsSheet = app.getSheetByName('Meals');
  const lastRowIdx = mealsSheet.getLastRow();
  const mealsData = mealsSheet.getRange(2, 1, lastRowIdx, 4).getValues();
  const result = {};
  for (let i = 0; i < mealsData.length; i++) {
    const mealName = mealsData[i][0];
    result[mealName.toLowerCase()] = {
      name: mealName,
      recipe: mealsData[i][1],
      ingredients: _parseMealIngredient(mealsData[i][2]).filter((v) => v !== null),
    };
  }
  return result;
}

function _parseMealIngredient(str) {
  return _parseCSV(str).map((v) => {
    if (!v) return null;

    let name = v;
    let quantity = 1;

    const matches = /^([0-9]+)x (.*)$/.exec(v);
    if (matches !== null) {
      name = matches[2];
      quantity = parseInt(matches[1]);
    }

    return { name: name.toLowerCase(), quantity };
  });
}

function _getIngredientMap(app) {
  const ingredientsSheet = app.getSheetByName('Ingredients');
  const lastRowIdx = ingredientsSheet.getLastRow();
  const cells = ingredientsSheet.getRange(2, 1, lastRowIdx + 1, 4).getValues();
  const result = {};
  for (let i = 0; i < cells.length; i++) {
    const name = cells[i][0];
    var data = {
      name,
      productUrl: cells[i][1],
    };
    result[name.toLowerCase().trim()] = data;

    const aliases = _parseCSV(cells[i][2]);
    aliases.forEach((v) => result[v.toLowerCase()] = data);
  }
  return result;
}

function _getRequiredIngredientsFor(meal, ingredientMap) {
  console.log('Get ings for ', meal);
  return meal.ingredients.map((rIng) => {
    const known = ingredientMap[rIng.name];
    if (known) {
      return {
        ...known,
        quantity: rIng.quantity,
      };
    }
    return {
      name: rIng.name,
      quantity: rIng.quantity,
    };
  });
}

function _getMealNames(app, sheetName) {
  const sheet = app.getSheetByName(sheetName);
  const values = sheet.getRange(2, 2, 7, 2).getValues();
  const result = [];
  values.forEach((v) => {
    if (v[0]) result.push(v[0]);
    if (v[1]) result.push(v[1]);
  });
  return result.map((v) => v.trim().toLowerCase());
}

function _parseCSV(str) {
  return str.split(',').map((v) => v.trim());
}
