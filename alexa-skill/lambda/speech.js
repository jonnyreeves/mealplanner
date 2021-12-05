function chooseOne(utternaces) {
  const idx = Math.floor(Math.random() * utternaces.length);
  return utternaces[idx];
}

module.exports = {
  mealDayPrefix(mealDay, mealTime) {
    if (mealDay === 'today' && mealTime === 'dinner') {
      return "tonight's";
    }
    if (mealDay === 'tomorrow') {
      return "tomorrow's";
    }
    return "today's";
  },

  noMealPlanned(mealDay, mealTime) {
    const prefix = this.mealDayPrefix(mealDay, mealTime);
    return chooseOne([
      `You have nothing on the meal plan for ${prefix} ${mealTime}.`,
      `There is nothing planned for ${prefix} ${mealTime}.`,
      `Hmmm, I don't see anything planned for ${mealTime} ${mealDay}.`,
    ]);
  },

  noRecipeFound(mealName) {
    return chooseOne([
      `Sorry, I couldn't find the recipe for ${mealName}.`,
    ]);
  },

  recipe(mealInfo) {
    return chooseOne([
      `You'll find the recipe for ${mealInfo.name} in ${mealInfo.recipe}.`,
      `The recipe for ${mealInfo.name} can be found in ${mealInfo.recipe}.`,
    ]);
  },

  mealPlan(meal, mealDay, mealTime) {
    console.log('MealDay and MealTime ---- ', mealDay, mealTime);
    const mealDayPrefix = this.mealDayPrefix(mealDay, mealTime);

    const output = [];

    if (!meal.lunch && !meal.dinner) {
      output.push(`You have nothing on the meal plan for ${mealDay}.`);
    } else if (!mealTime) {
      const dayPlan = [];
      dayPlan.push(chooseOne([
        `On ${mealDayPrefix} meal plan`,
        `For ${mealDay},`,
      ]));

      if (meal.lunch) {
        dayPlan.push(chooseOne([
          `you are having ${meal.lunch} for lunch,`,
          `it is ${meal.lunch} for lunch,`,
          `for lunch, it's ${meal.lunch},`,
          `you've got ${meal.lunch} for lunch,`,
        ]));
      } else {
        dayPlan.push('there is nothing planned for lunch,');
      }
      if (meal.dinner) {
        if (meal.lunch) {
          dayPlan.push(chooseOne([
            `and ${meal.dinner} for dinner.`,
            `and ${meal.dinner} in the evening.`,
            `and ${meal.dinner} for later.`,
          ]));
        } else {
          dayPlan.push('but there is nothing planned for later.');
        }
      }

      output.push(dayPlan.join(' '));
    } else if (mealTime && !meal[mealTime]) {
      output.push(this.noMealPlanned(mealDay, mealTime));
    } else {
      output.push(chooseOne([
        `${mealDayPrefix} ${mealTime} is ${meal[mealTime]}.`,
        `You have ${meal[mealTime]} planned for ${mealDayPrefix} ${mealTime}.`,
        `Looks like ${meal[mealTime]} for ${mealDayPrefix} ${mealTime}.`,
      ]));
    }

    if (meal.tomorrowsNote) {
      output.push(chooseOne([
        `By the way, for tomorrow, don't forget: ${meal.tomorrowsNote}.`,
        `Oh and by the way, don't forget: ${meal.tomorrowsNote} for tomorrow.`,
      ]));
    }

    return output.join(' ');
  },

  noResultsFoundForTag(inputTag) {
    return chooseOne([
      `Sorry, I couldn't find any meals tagged with ${inputTag}.`,
    ]);
  },
  
  schoolMealResponse(meal, mealDay) {
      if (!meal.isSchoolDay) {
          return `${mealDay} is not a school day!`;
      }
      if (!meal.lunch) {
          return `There's nothing on the spreadsheet for ${mealDay}`;
      }
      return chooseOne([
          `It's ${meal.lunch} for Max's school lunch ${mealDay}`,
          `Max is having ${meal.lunch} ${mealDay}`
      ]);
  },

  suggestMeal(meal) {
    return chooseOne([
      `How about ${meal.name}?`,
      `What about ${meal.name}?`,
      `Maybe ${meal.name}?`,
      `${meal.name}?`,
      `Hmmmmmm.... ${meal.name}?`,
      `Err.... Gosh! ${meal.name}?`,
    ]);
  },
};
