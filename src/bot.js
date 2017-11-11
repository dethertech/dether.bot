const DetherJS = require('detherjs');
const mapboxAPI = require('./lib/MapBox');
const Bot = require('./lib/Bot')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')

// DATA

let dether = new DetherJS({
  network: process.env.DETHER_BOT_PROVIDER,
});

let bot = new Bot()
let i = 0;
let allTellers

const FIAT_CURRENCIES = ['USD', 'EUR', 'CNY', 'KRW', 'JPY']

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
]

const controls = [
  {type: 'button', label: 'Trade', value: 'contact'},
  {type: 'button', label: 'New seller', value: 'next'},
  {type: 'button', label: 'New location', value: 'new'},
]

const controlsNext = [
  {type: 'button', label: 'New seller', value: 'next'},
  {type: 'button', label: 'New location', value: 'new'},
]

const formatedTeller = data => `
Hi, my name is ${data.name}.
I can sell you ${Math.round(data.escrowBalance * 10000) / 10000} ETH.
I take a fee of ${data.rates / 100}%.
So far, I have traded ${Math.round(data.volumeTrade * 10000) / 10000} ETH.
I accept ${FIAT_CURRENCIES[data.currencyId]}.

Want to trade?
`

const formatedContact = data => `
Cool!

We can meet up around ${data.address}.

Click on this Telegram link so we can chat to organize a meeting:

http://telegram.me/${data.messengerAddr}
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
      break
    case 'next':
      next(session)
      break
    case 'new':
      welcome(session)
      break
  }
}





// STATES
const welcome = session =>
  session.reply(
    SOFA.Message({
      body: 'Hello from Dether!\nPlease enter your location to find the closest ether sellers.',
      showKeyboard: true
    })
  )


const onMessage = (session, message) => {
  let latlng;
  mapboxAPI.geocode(message.body)
    .then((res) => {
      latlng = { lng: res.center[0], lat: res.center[1] };
      return getTeller(latlng)
    })
    .then(tellers => mapboxAPI.sortGpsCoord(latlng, tellers))
    .then((sortTeller) => {
      allTellers = sortTeller.slice(0, 10);
      teller(session, allTellers[i]);
    })
    .catch(() => addrError(session))
}

const contact = session => session.reply(
  SOFA.Message({
  	body: formatedContact(allTellers[i]),
   	attachments: [{
    	"type": "image",
     	"url": `${AVATARS[allTellers[i].avatarId]}.png`
    }],
    controls: controlsNext,
    showKeyboard: false,
  })
)

const next = session => {
  i++;
  if (i > 9 || !allTellers[i]) return welcome(session);

  mapboxAPI.reverseGeocode({ lat: allTellers[i].lat, lng: allTellers[i].lng })
    .then((res) => {
      allTellers[i].address = res;
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
    })
    .catch(() => next(session))
}




// FORMATED DATA

const getTeller = latlng =>
  new Promise((res, rej) => {
    mapboxAPI.getcountrycode(latlng)
      .then(countrycode => dether.getTellersInZone(countrycode))
      .then(tellers => res(tellers))
      .catch(e => rej(e))
  })

const addrError = session => session.reply(
    SOFA.Message({
      body: 'Invalid address, please enter a valid address',
      showKeyboard: true
    })
  )

const teller = (session, teller) => {
  mapboxAPI.reverseGeocode({ lat: teller.lat, lng: teller.lng })
    .then((res) => {
      teller.address = res;
      return session.reply(
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
    })
    .catch(() => next(session))
}
