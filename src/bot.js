const detherGateway = require('dethergateway');

const mapboxAPI = require('./lib/MapBox');
const Bot = require('./lib/Bot')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')

let bot = new Bot()

// DATA
let i = 0;

const provider = 'https://kovan.infura.io/v604Wu8pXGoPC41ARh0B';

const gpscoord = {
  lng: 2.35237,
  lat: 48.88361,
}; // france

let allTellers = [];

const FIAT_CURRENCIES = ['USD', 'EUR', 'CNY', 'KRW', 'JPY'];

const AVATARS = [
  'dashboard-face_noface',
  'dashboard-face_women1',
  'dashboard-face_men1',
  'dashboard-face_women2',
  'dashboard-face_men2',
  'dashboard-face_women3',
  'dashboard-face_men3',
  'dashboard-face_women4',
  'dashboard-face_men4',
];


const controls = [
  {type: 'button', label: 'Next', value: 'next'},
  {type: 'button', label: 'Contact', value: 'contact'},
  {type: 'button', label: 'New address', value: 'new'},
]

const controlsNew = [
  {type: 'button', label: 'Next', value: 'next'},
  {type: 'button', label: 'New address', value: 'new'},
]

const formatedTeller = data => `
NAME: ${data.name}
BALANCE: ${Math.round(data.escrowBalance * 10000) / 10000} ETH
RATES: ${data.rates}
VOLUME TRADE: ${Math.round(data.volumeTrade * 10000) / 10000} ETH
CURRENCY: ${FIAT_CURRENCIES[data.currencyId]}
ADDRESS:\n${data.address}
`

const formatedContact = data => `
NAME: ${data.name}
TELEGRAM: ${data.telegram}
`








// ROUTING
bot.onEvent = (session, message) => {
  switch (message.type) {
    case 'Init':
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

const onCommand = (session, command) => {
  switch (command.content.value) {
    case 'contact':
      contact(session)
      break;
    case 'next':
      next(session)
      break;
    case 'new':
      welcome(session)
      break;
  }
}









// STATES
const welcome = session =>
  session.reply(
    SOFA.Message({
      body: 'Hello from Dether! Please enter your address to locate the closest tellers',
      showKeyboard: true
    })
  )

const getTeller = latlng =>
  new Promise((res, rej) => {
    mapboxAPI.getcountrycode(latlng)
      .then((countrycode) => detherGateway.default.tellers.getZone(countrycode, provider))
      .then((tellers) => res(tellers))
      .catch((e) => rej(e))
  })

const onMessage = (session, message) => {
  getTeller(gpscoord)
    .then(tellers => mapboxAPI.sortGpsCoord(gpscoord, tellers))
    .then((sortTeller) => {
      allTellers = sortTeller.slice(0, 10);
      teller(session, allTellers[i]);
    })
    .catch(e => addrError(session))
}






// FORMATED DATA
const addrError = session => session.reply(
    SOFA.Message({
      body: 'Invalid address, please enter a valid address',
      showKeyboard: true
    })
  )

const teller = (session, teller) => session.reply(
  SOFA.Message({
  	body: formatedTeller(teller),
   	attachments: [{
    	"type": "image",
     	"url": `${AVATARS[allTellers[i].avatarId]}.png`
    }],
    controls: controls,
    showKeyboard: false,
  })
)

const contact = session => session.reply(
  SOFA.Message({
  	body: formatedContact(allTellers[i]),
   	attachments: [{
    	"type": "image",
     	"url": `${AVATARS[allTellers[i].avatarId]}.png`
    }],
    controls: controlsNew,
    showKeyboard: false,
  })
)

const next = session => {
  i++;
  if (i > 9) return welcome(session);
  session.reply(
    SOFA.Message({
    	body: formatedTeller(allTellers[i]),
     	attachments: [{
      	"type": "image",
       	"url": `${AVATARS[allTellers[i].avatarId]}.png`
      }],
      controls: controls,
      showKeyboard: false,
    })
  )
}
