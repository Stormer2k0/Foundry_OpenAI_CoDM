Hooks.on("chatCommandsReady", function(chatCommands) {

  // This modifies the text that will end up in the created message
  chatCommands.registerCommand(chatCommands.createCommandFromData({
    commandKey: "/openai",
    invokeOnCommand: async (chatlog, messageText, chatdata) => {
      console.log("Invoked /openai");

      ChatMessage.create({
        content: "YOUR PROMPT: " + messageText,
        whisper: [chatdata.user]
      });

      const response = await getOpenAiResponse(messageText, 'text-davinci-003');

      const text = response.choices[0].text;
      ChatMessage.create({
        content: "RESPONSE: " + text,
        whisper: [chatdata.user]
      });
    },
    shouldDisplayToChat: false,
    iconClass: "fa-sticky-note",
    description: "Talk to OpenAi"
  }));
});

async function getOpenAiResponse(prompt, model) {
  const apiKey = foundryGame.settings.get("OpenGPT-coDM", "API_key");

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
      temperature: foundryGame.settings.get("OpenGPT-coDM", "temperature"),
      max_tokens: 2048
      })
  });
      
  const responseJson = await response.json();
      
  return responseJson;
}

let foundryGame;

function getGame() {
  return game;
}

Hooks.once("init", function () {

  foundryGame = getGame();
  // Add settings option for URL of Discord Webhook
  foundryGame.settings.register("OpenGPT-coDM", "API_key", {
      name: foundryGame.i18n.localize("OpenAI API key:"),
      hint: foundryGame.i18n.localize("You can find this at: https://beta.openai.com/account/api-keys"),
      scope: "client",
      config: true,
      type: String,
      default: ""
  });

  foundryGame.settings.register("OpenGPT-coDM", "temperature", {
    name: foundryGame.i18n.localize("Temperature"),
    hint: foundryGame.i18n.localize("Sets how predictable the AI is, enter a value between 0.1 and 1"),
    scope: "client",
    config: true,
    type: Number,
    default: 0.5
  });

});