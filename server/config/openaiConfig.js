const OpenAIApi = require('openai');
const { OPENAI_API_KEY} = require('./dotenvConfig');

const openAi = new OpenAIApi({
    apiKey: OPENAI_API_KEY,
});

module.exports = openAi;