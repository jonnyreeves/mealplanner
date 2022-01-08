const alexaSkill = {
  ALEXA_USER_ID: '<not set>',
  CLIENT_SECRET: '<not set>',

  _fetchAlexaMessagingToken() {
    const url = 'https://api.amazon.com/auth/o2/token';
    const clientSecret = this.CLIENT_SECRET;
    const formData = {
      grant_type: 'client_credentials',
      client_id: 'amzn1.application-oa2-client.e530eba5fa0345c8961d94b33e296494',
      client_secret: clientSecret,
      scope: 'alexa:skill_messaging',
    };
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      payload: formData,
    });
    if (response.getResponseCode() !== 200) {
      throw new Error(`fetch Alexa Skill Messaging Token failed, responseCode=${response.getResponseCode()}`);
    }
    const responsePayload = JSON.parse(response.getContentText());
    return {
      accessToken: responsePayload.access_token,
    };
  },

  _sendAlexaSkillMessage({ messageData }) {
    const { accessToken } = this._fetchAlexaMessagingToken();
    const url = `https://api.eu.amazonalexa.com/v1/skillmessages/users/${this.ALEXA_USER_ID}`;
    console.log(`Sending skill message to: ${url}`);
    const response = UrlFetchApp.fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify({
        data: messageData,
        expiresAfterSeconds: 60,
      }),
    });
    console.log('Skill Message Response...');
    console.log(response.getContentText());
  },

  completeShoppingListItem({ itemName }) {
    const messageData = {
      action: 'complete_shopping_list_item',
      itemName,
    };
    this._sendAlexaSkillMessage({ messageData });
  },

  syncShoppingList() {
    console.log('syncShoppingList');
    const messageData = {
      action: 'sync_shopping_list_items',
    };
    this._sendAlexaSkillMessage({ messageData });
  },
};

// Inject secrets from Google AppScript Env.
alexaSkill.ALEXA_USER_ID = PropertiesService.getScriptProperties().getProperty('JONNY_ALEXA_USER_ID');
alexaSkill.CLIENT_SECRET = PropertiesService.getScriptProperties().getProperty('ALEXA_SKILL_CLIENT_SECRET');
