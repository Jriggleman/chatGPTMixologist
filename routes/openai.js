const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();
const cookieParser = require('cookie-parser');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// amount of drinks given
let amount = 2;

// middleware
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser());

// serve the HTML file
router.get('/', (req, res) => {
    res.sendFile('.\\public\\index.html');
});

// route to handle form submission
router.post('/process', (req, res) => {
    const inputText = req.body.inputText;
    const inputArray = req.cookies.inputArray || [];
    
    if (inputText) {

      // check if drink already exists in the array. If so, do not duplicate
      if (inputArray.includes(inputText)) {
        console.log('Input already exists:', inputText);
      }

      else {
        inputArray.push(inputText);
        console.log('Input received:', inputText);
      }
    }

    else {
      console.log('Please provide a drink');
    }
    

  res.cookie('inputArray', inputArray, {maxAge: 300000}); // store user drinks in a cookie

  res.redirect('/'); // redirect back to the home page
});

router.get('/sendData', (req, res) => {
  const inputArray = req.cookies.inputArray || [];

  console.log(inputArray);

  if (inputArray.length <= 0) {
    console.log('Please provide at least one drink');
    res.send('Please provide at least one drink');
    return;
  } 
  
  else {
    // create prompt
    const chatGPTMessage = [
      { role: 'system', content: 'You are a mixologist' },
      {
        role: 'user',
        content: `What alcoholic drinks can I make with ${inputArray}?
                    Limit response to the ${amount} most popular drink(s). 
                    Write the name of the drink and number it. Then Write "Ingredients:" then bullet point the ingredients. Make sure the ingredients use both provided drinks. 
                    Then Write "Instructions:" and bullet point the instructions.
                    Do that for each drink and add spaces between the drinks. Write no further text.`,
      },
    ];

    // create chat completion and get model and message passed in chatGPTMessage
    let chatGPT = async (message) => {
      try {
        const response = await openai.createChatCompletion({
          model: 'gpt-3.5-turbo',
          messages: message,
        });
        const content = response.data.choices[0].message.content;

        formattedContent = content.replace(/\n/g, '<br>');

        res.send(formattedContent);
        
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    chatGPT(chatGPTMessage);

    // clear array
    res.cookie('inputArray', []);

  }
});

module.exports = router;