const assert = require('assert');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const googleSheetID = '1l7_1XuF9qpfymly6xEA6sRx20MZTT3R9xG6Z8GtYE3E';
const clientSecret = require('./client_secret.json');

const MS_IN_ONE_DAY = 24 * 60 * 60 * 1000;

function makeMeal(row) {
  return {
    name: row.Name,
    recipe: row.Recipe,
    ingredients: (row['Key Ingredients'] || '').split(','),
    tags: (row.Tags || '').split(',').map((tag) => tag.trim().toLowerCase()),
  };
}

function getRowIdxForDay(mealDay) {
    // Date API has Sunday as 0, through Saturday as 6; source spreadsheet as Monday as 0.
    let todayIdx = new Date().getDay() - 1;

    if (todayIdx === -1) {
      todayIdx = 6; // Handle Sunday.
    }

    let tomorrowIdx = todayIdx + 1;
    if (tomorrowIdx === 7) {
      tomorrowIdx = 0; // Wrap around back to Monday.
    }
    
    return [ todayIdx, tomorrowIdx ];
}

async function getLastSyncTime(sheet) {
  const cfg = sheet.sheetsByTitle.Config;
  const cfgRows = await cfg.getRows();
  return cfgRows[0].value;
}

module.exports = {
  async initSheet() {
    const sheet = new GoogleSpreadsheet(googleSheetID);
    await sheet.useServiceAccountAuth(clientSecret);
    await sheet.loadInfo();
    return sheet;
  },

  async getMeal(sheet, mealDay) {
    assert.ok(sheet !== null, 'Expected sheet object');
    assert.ok(mealDay === 'today' || mealDay === 'tomorrow', 'Invalid mealDay argument');

    const thisWeek = sheet.sheetsByIndex[0];
    const nextWeek = sheet.sheetsByIndex[1];

    // Date API has Sunday as 0, through Saturday as 6; source spreadsheet as Monday as 0.
    let todayIdx = new Date().getDay() - 1;

    if (todayIdx === -1) {
      todayIdx = 6; // Handle Sunday.
    }

    let tomorrowIdx = todayIdx + 1;
    if (tomorrowIdx === 7) {
      tomorrowIdx = 0; // Wrap around back to Monday.
    }

    console.log(`getMeal - Querying for mealDay: ${mealDay}, todayIdx: ${todayIdx}, tomorrowIdx: ${tomorrowIdx}`);

    let rows = await thisWeek.getRows();

    console.log('getMeal - Got Rows', rows);

    const dayIdx = (mealDay === 'today') ? todayIdx : tomorrowIdx;
    const mealRow = rows[dayIdx] || { Lunch: '', Dinner: '' };

    // If we are looking up Wednesday's meal then we need to look at next week's
    // mean plan unless the cron job has already transferred plans. We can check if this
    // has occured by looking at the `last_sync` value in the Config sheet which gets
    // set by the cron job.
    if (dayIdx === 2) {
      const syncDelta = Date.now() - await getLastSyncTime(sheet);
      const hasUpdatedToday = MS_IN_ONE_DAY > syncDelta;
      if (!hasUpdatedToday) {
        console.log('Looking at next weeks plan for Dinner');
        rows = await nextWeek.getRows();
        mealRow.Dinner = rows[dayIdx].Dinner;
      }
    }

    let tomorrowsNote = '';
    if (rows[tomorrowIdx]) {
      tomorrowsNote = rows[tomorrowIdx].Note || '';
    }

    const result = {
      lunch: mealRow.Lunch,
      dinner: mealRow.Dinner,
      tomorrowsNote,
    };
    console.log('getMeal - Returning result', result);
    return result;
  },
  
  async getSchoolMeal(sheet, mealDay) {
      const schoolMeals = sheet.sheetsByTitle["Max School Dinners"];
      const [ todayIdx, tomorrowIdx ] = getRowIdxForDay(mealDay);
      const dayIdx = (mealDay === 'today') ? todayIdx : tomorrowIdx;
      
      console.log("getSchoolMeal, dayIdx=", dayIdx);
      
      let rows = await schoolMeals.getRows();
      const mealRow = rows[dayIdx] || { Lunch: '', Dinner: '' };
      
      const result = {
        lunch: mealRow.Lunch,
        dinner: mealRow.Dinner,
        isSchoolDay: (dayIdx <= 4),
      };
      
      console.log("getSchoolMeal result", result);
      return result;
  },

  async findMealInfo(sheet, mealName) {
    assert.ok(sheet !== null, 'Expected sheet object');
    assert.ok(mealName, 'Invalid mealName argument');

    const mealsSheet = sheet.sheetsByIndex[2];
    const rows = await mealsSheet.getRows();

    for (let i = 0; i < rows.length; i += 1) {
      const thisRow = rows[i];
      if (typeof thisRow.Name === 'string' && thisRow.Name.toLowerCase() === mealName.toLowerCase()) {
        return makeMeal(thisRow);
      }
    }
    console.log(`No meal found for: '${mealName}'. Searched ${rows.length} rows.`);
    return {
      name: '',
      recipe: '',
      ingredients: [],
      tags: [],
    };
  },

  async searchTag(sheet, inputTag) {
    assert.ok(sheet !== null, 'Expected sheet object');
    assert.ok(inputTag, 'Invalid inputTag argument');

    const mealsSheet = sheet.sheetsByIndex[2];
    const rows = await mealsSheet.getRows();

    const results = [];
    for (let i = 0; i < rows.length; i += 1) {
      const thisRow = rows[i];
      if (typeof thisRow.Tags === 'string' && thisRow.Tags !== '') {
        const thisTags = thisRow.Tags.split(',').map((tag) => tag.trim().toLowerCase());
        if (thisTags.includes(inputTag.toLowerCase())) {
          results.push(makeMeal(thisRow));
        }
      }
    }

    console.log(`Searching for ${inputTag} returned ${results.length} hits`);
    return results;
  },
};
