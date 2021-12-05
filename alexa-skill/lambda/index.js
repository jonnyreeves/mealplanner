const Alexa = require('ask-sdk-core');
const assert = require('assert');

const sheetApi = require('./sheet');
const restApi = require("./restapi");
const speech = require('./speech');
const utils = require('./util');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speakOutput = 'Meal Plan opened, what do you want to do?';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('You can ask me for help if you are unsure.')
      .getResponse();
  },
};

const MealQueryIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MealQueryIntent';
  },
  async handle(handlerInput) {
    try {
      const { requestEnvelope } = handlerInput;
      const mealTime = Alexa.getSlotValue(requestEnvelope, 'MealTime');
      const mealDay = utils.getDefaultSlotResolution(Alexa.getSlot(requestEnvelope, 'MealDay'), 'today');

      //const meal = await sheetApi.getMeal(await sheetApi.initSheet(), mealDay);
      
      const meal = await restApi.getMeal(mealDay);
      const speakOutput = speech.mealPlan(meal, mealDay, mealTime);

      return handlerInput.responseBuilder
        .speak(speakOutput)
      // .reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse();
    } catch (e) {
      console.log('MealQueryIntentHandler Error caught', e);
      throw e;
    }
  },
};

const RecipeQueryIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RecipeQueryIntent';
  },
  async handle(handlerInput) {
    try {
      const { requestEnvelope } = handlerInput;
      const mealTime = Alexa.getSlotValue(requestEnvelope, 'MealTime');
      const mealDay = utils.getDefaultSlotResolution(Alexa.getSlot(requestEnvelope, 'MealDay'), 'today');

      assert.ok(mealTime, 'MealTime Slot not present');

      const sheet = await sheetApi.initSheet();
      const meal = await sheetApi.getMeal(sheet, mealDay);

      let speakOutput = '';
      const mealName = meal[mealTime];

      if (!mealName) {
        speakOutput = speech.noMealPlanned(mealDay, mealTime);
      } else {
        const mealInfo = await sheetApi.findMealInfo(sheet, mealName);
        if (!mealInfo.recipe) {
          speakOutput = speech.noRecipeFound(mealName);
        } else {
          speakOutput = speech.recipe(mealInfo);
        }
      }

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    } catch (e) {
      console.log('RecipeQueryIntentHandler Error caught', e);
      throw e;
    }
  },
};

const SuggestMealIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SuggestMealIntent';
  },
  async handle(handlerInput) {
    try {
      const { requestEnvelope, attributesManager } = handlerInput;
      const sessionAttributes = attributesManager.getSessionAttributes();

      const inputTag = utils.getDefaultSlotResolution(Alexa.getSlot(requestEnvelope, 'MealTag'), '');
      let speakOutput = '';

      // Clear stale suggestions from a previous search.
      if (!sessionAttributes.isInSuggestionRetryLoop && sessionAttributes.searchTag !== inputTag) {
        console.log('Clearing out SuggestMealIntent sessionAttributes');
        sessionAttributes.searchTag = '';
        sessionAttributes.suggestions = null;
      }
      sessionAttributes.isInSuggestionRetryLoop = false;

      if (Array.isArray(sessionAttributes.suggestions)) {
        console.log(`Resuming search for tag: ${sessionAttributes.searchTag}, which has ${sessionAttributes.suggestions.length} suggestions remaining.`);
        if (sessionAttributes.suggestions.length === 0) {
          sessionAttributes.suggestions = null;
          speakOutput = 'Sorry I am out of ideas.';
        } else {
          speakOutput = speech.suggestMeal(sessionAttributes.suggestions.shift());
        }
      } else {
        console.log(`Starting new search for tag: ${inputTag}, slot value: ${Alexa.getSlotValue(requestEnvelope, 'MealTag')}`);
        const sheet = await sheetApi.initSheet();
        const results = await sheetApi.searchTag(sheet, inputTag);

        if (results.length === 0) {
          speakOutput = speech.noResultsFoundForTag(Alexa.getSlotValue(requestEnvelope, 'MealTag'));
        } else {
          const suggestions = utils.shuffle(results);
          sessionAttributes.suggestions = suggestions;
          sessionAttributes.searchTag = inputTag;
          speakOutput = speech.suggestMeal(suggestions.shift());
        }
      }

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .withShouldEndSession(false)
        .getResponse();
    } catch (e) {
      console.log('SuggestMealIntentHandler Error caught', e);
      throw e;
    }
  },
};

const MaxIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MaxIntent';
  },
  handle(handlerInput) {
    const names = ['Daddy', 'Mummy', 'Max', 'Ben'];
    const rand = Math.floor(Math.random() * names.length);

    console.log('RAND', rand);

    const speakOutput = `${names[rand]} is awesome`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

const MaxSchoolMealQueryIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MaxSchoolMealQueryIntent';
  },
  async handle(handlerInput) {
    try {
      const { requestEnvelope } = handlerInput;
      const mealTime = Alexa.getSlotValue(requestEnvelope, 'MealTime');
      const mealDay = utils.getDefaultSlotResolution(Alexa.getSlot(requestEnvelope, 'MealDay'), 'today');

      const meal = await sheetApi.getSchoolMeal(await sheetApi.initSheet(), mealDay);
      const speechOutput = speech.schoolMealResponse(meal, mealDay);

        
        return handlerInput.responseBuilder
        .speak(speechOutput)
        .getResponse();
    } catch (e) {
      console.log('MealQueryIntentHandler Error caught', e);
      throw e;
    }
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'You can use me to make queries against the meal plan. You can look up a specific meal by asking me what\'s for dinner. You can ask me for a recipe by asking me, how do I make dinner. Or you can have me suggest a meal, for example, ask me to suggest dinner.';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('What would you like to try?')
      .getResponse();
  },
};

const YesNoIntentHandler = {
  canHandle(handlerInput) {
    const { attributesManager, requestEnvelope } = handlerInput;
    const intentName = Alexa.getIntentName(requestEnvelope);

    const isYesOrNoIntent = Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (intentName === 'AMAZON.YesIntent' || intentName === 'AMAZON.NoIntent');

    if (!isYesOrNoIntent) {
      return false;
    }

    const sessionAttributes = attributesManager.getSessionAttributes();
    const isInMealSuggestion = (sessionAttributes.searchTag !== '' && Array.isArray(sessionAttributes.suggestions));

    return isInMealSuggestion;
  },
  handle(handlerInput) {
    const { attributesManager, requestEnvelope } = handlerInput;
    const intentName = Alexa.getIntentName(requestEnvelope);
    const sessionAttributes = attributesManager.getSessionAttributes();

    console.log('YesNoHandler: sessionAttributes', sessionAttributes);
    let speakOutput = 'OK';

    const isInMealSuggestion = (sessionAttributes.searchTag !== '' && Array.isArray(sessionAttributes.suggestions));
    if (isInMealSuggestion && intentName === 'AMAZON.NoIntent') {
      sessionAttributes.isInSuggestionRetryLoop = true;
      return SuggestMealIntentHandler.handle(handlerInput);
    }
    if (isInMealSuggestion && intentName === 'AMAZON.YesIntent') {
      speakOutput = 'Cool.';
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();

    let speakOutput = '';

    if (Array.isArray(sessionAttributes.suggestions)) {
      sessionAttributes.searchTag = '';
      sessionAttributes.suggestions = null;
      speakOutput = 'OK!';
    } else {
      speakOutput = 'Goodbye!';
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
  },
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents
 * by defining them above, then also adding them to the request handler chain below
 * */
const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName}`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
    // .reprompt('add a reprompt if you want to keep the session open for the user to respond')
      .getResponse();
  },
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below
 * */
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom
 * */
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    MealQueryIntentHandler,
    RecipeQueryIntentHandler,
    SuggestMealIntentHandler,
    YesNoIntentHandler,
    MaxIntentHandler,
    MaxSchoolMealQueryIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler,
  )
  .addErrorHandlers(
    ErrorHandler,
  )
  .withCustomUserAgent('sample/hello-world/v1.2')
  .lambda();
