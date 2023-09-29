const OpenAIApi = require('openai');
const { OPENAI_API_KEY, ORG } = require('./dotenvConfig');

const openAi = new OpenAIApi({
    apiKey: OPENAI_API_KEY,
    organizationId: ORG,
});

module.exports = openAi;