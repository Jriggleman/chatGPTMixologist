const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
  const openai = new OpenAIApi(configuration);

//middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

//inputs from webpage
let inputArray = []

//serve the HTML file
app.get('/', (req, res) => {
    res.sendFile('.\\public\\index.html')
})

//route to handle form submission
app.post('/process', (req, res) => {
    const inputText = req.body.inputText
    if (inputText) {
        inputArray.push(inputText)
        console.log('Input received:', inputText)
    }
    else {
        console.log('Please provide at least one drink')
    }
    res.redirect('/') //redirect back to the home page
});

app.get('/sendData', (req, res) => {
    console.log(inputArray)

    //
    //make it so it checks if amount <= 0 too
    //
    if(inputArray.length <= 0) {
        console.log('Please provide at least one drink')
        res.send('Please provide at least one drink')
        return
    }

    else{

    //create prompt
    const chatGPTMessage = [
        {role: "system", content: 'You are a mixologist'},
        {role: "user", content: `What alcoholic drinks can I make with ${inputArray}?
                                 Limit response to the 2 most popular drinks. 
                                 Write the name of the drink. Then Write "Ingredients:" then bullet point the ingredients. Make sure the ingedients use both provided drinks. 
                                 Then Write "Instructions:" and bullet point the instructions.
                                 Do that for each drink and add spaces between the drinks. Write no further text.`}
      ]
      
      //create chat completion and get model and message passed in chatGPTMessage
      let chatGPT = async (message) => {
        try {
          const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: message
          });
          const content = response.data.choices[0].message.content
          return content
        } catch (error) {
          console.error(error)
          throw error
        }
      }
      
      //log message in console
      chatGPT(chatGPTMessage)
        .then((content) => {
          console.log(content)
            inputArray = []
        })
        .catch((error) => {
          console.error(error)
        })

    res.send('Data sent successfully')
}})

// Start the server
app.listen(5000, () => {
    console.log('Server is running on port 5000')
});
