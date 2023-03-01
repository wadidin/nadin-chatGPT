const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

async function generateResponse(text) {
    const response = await openai.createCompletion({
        model: "code-davinci-003",
        prompt: text,
        temperature: 0.3,
        max_tokens: 2000,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0
    });
    return console.log(response.data.choices[0].text);
}

async function main() {
    const result = await generateResponse("what is meaning of life?");
    console.log(result);
}
main();