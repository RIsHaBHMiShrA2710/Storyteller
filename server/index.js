import express from 'express';
import bodyParser from 'body-parser';
import { config } from 'dotenv';
import OpenAIApi from 'openai';
import cors from 'cors';
import mongoose from 'mongoose';

import AbortController from 'abort-controller';

const controller = new AbortController();
config();
const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

mongoose.connect(process.env.MONGOAUTH, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});

const messageSchema = new mongoose.Schema({
  type: String,
  content: String,
});

const Message = mongoose.model('Message', messageSchema);


const openAi = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY,
    organizationId: process.env.ORG,
});

async function generateResponseFromOpenAI(inputText) {
  try {
    const response = await openAi.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: 'You are a legal advisor bot.' }, { role: 'user', content: inputText }],
        max_tokens: 1000,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating response:', error.message);
    throw new Error('An error occurred while generating the response.');
  }
}

app.get('/', (req, res) => {
  res.send('Server is ONN');
});

app.post('/generate-response', async (req, res) => {
  let inputText = req.body.inputText;
 
  inputText = inputText + "Give the response of the said query as a legal advisor bot (for india).If you think that the query is serious tell them to find contact to a laywer from the find laywer option. The answer should be strictly under 150 words";

  try {
    const openaiResponse = await generateResponseFromOpenAI(inputText);

    const userMessage = new Message({
      type: 'user',
      content: req.body.inputText,
    });
    await userMessage.save();

    const botMessage = new Message({
      type: 'bot',
      content: openaiResponse,
    });
    await botMessage.save();


    res.json({ response: openaiResponse });
  } catch (error) {
    console.error('Error generating response:', error.message);
    res
      .status(500)
      .json({ error: 'An error occurred while generating the response.' });
  }
});

app.delete('/delete-messages', async (req, res) => {
  try {
    await Message.deleteMany();
    res.json({ message: 'All messages deleted successfully.' });
  } catch (error) {
    console.error('Error deleting messages:', error.message);
    res.status(500).json({ error: 'An error occurred while deleting messages.' });
  }
});

app.get('/get-messages', async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching messages.' });
  }
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
