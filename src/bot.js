const Bot = require('./lib/Bot')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')

let bot = new Bot()

// ROUTING

bot.onEvent = function(session, message) {
  switch (message.type) {
    case "Init":
      welcome(session)
      break
    case 'Message':
      onMessage(session, message)
      break
    case 'Command':
      onCommand(session, message)
      break
  }
}

function onMessage(session, message) {
  console.log('sisi', message.content.body);
  tellers(session)
}

function onCommand(session, command) {
  switch (command.content.value) {
    case 'tellers':
      tellers(session)
      break
    case 'next':
      next(session)
      break
    case 'contact':
      contact(session)
      break
    }
}

// STATES

function welcome(session) {
  sendMessage(session, `Hello from Dether!`)
}

function tellers(session) {
  // get from from addr
  // how to get txt from user
  sendMessage(session, 'Send teller here');
}

function contact(session) {
  // get telegram address
  sendMessage(session, 'Send telegram address link');
}

function next(session) {
  // next tellers
  sendMessage(session, 'Next teller');
}

// HELPERS

function sendMessage(session, message) {
  let controls = [
    {type: 'button', label: 'Get tellers', value: 'tellers'},
    {type: 'button', label: 'Next', value: 'next'},
    {type: 'button', label: 'Contact', value: 'contact'},
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}
