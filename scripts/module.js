Hooks.on("chatCommandsReady", function(chatCommands) {

  // register /openai command
  chatCommands.registerCommand(chatCommands.createCommandFromData({
    commandKey: "/openai",
    invokeOnCommand: async (chatlog, messageText, chatdata) => {

      // outputs your prompt to chat
      ChatMessage.create({
        content: "<strong> YOUR PROMPT: </strong></br>" + messageText,
        whisper: [chatdata.user]
      });

      // interact with the api
      const response = await getOpenAiResponse(messageText, 'text-davinci-003');

      //get the part of the response or error I want\
      const text
      try {text= response.choices[0].text; }
      catch(error){
        ChatMessage.create({
          content: "<strong> RESPONSE: </strong></br>" + response.error.message,
          whisper: [chatdata.user]
        }); 
        return;
      }

      //formats the response to html
      const formattedresponse = text.replace(/\n/g, '<br>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

      //outputs the response to chat
      ChatMessage.create({
        content: "<strong> RESPONSE: </strong>" + formattedresponse,
        whisper: [chatdata.user]
      });
    },

    //settings of the command
    shouldDisplayToChat: false,
    iconClass: "fa-sticky-note",
    description: "Talk to OpenAi",
    gmOnly: foundryGame.settings.get("OpenAI_CoDM", "DM-Only")
  }));
});

//fetch function
async function getOpenAiResponse(prompt, model) {
  const apiKey = foundryGame.settings.get("OpenAI_CoDM", "API_key");

    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: prompt,
        model: model,
        temperature: foundryGame.settings.get("OpenAI_CoDM", "temperature"),
        max_tokens: 2048
        })
    });  

    //turn the response into a json and return
    const responseJson = await response.json();
    return responseJson;
}


//select the game, needed for settings
let foundryGame;
function getGame() {
  return game;
}

Hooks.once("init", function () {


  foundryGame = getGame();

  //create api key setting
  foundryGame.settings.register("OpenAI_CoDM", "API_key", {
      name: foundryGame.i18n.localize("OpenAI API key:"),
      hint: foundryGame.i18n.localize("You can find this at: https://beta.openai.com/account/api-keys"),
      scope: "world",
      config: true,
      type: String,
      default: ""
  });

  //create temperature setting
  foundryGame.settings.register("OpenAI_CoDM", "temperature", {
    name: foundryGame.i18n.localize("Temperature"),
    hint: foundryGame.i18n.localize("Sets how predictable the AI is, enter a value between 0.1 and 1, 1 being the least predicatble"),
    scope: "client",
    config: true,
    type: Number,
    default: 0.8
  });

  //create dm-only setting
  foundryGame.settings.register("OpenAI_CoDM", "DM-Only", {
    name: foundryGame.i18n.localize("DM-only"),
    hint: foundryGame.i18n.localize("Sets who can use the openai command, default is dm-only to prevent players from burning your tokens"),
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

});
