const detherGateway = require('dethergateway');

const mapboxAPI = require('./lib/MapBox');
const Bot = require('./lib/Bot')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')

let bot = new Bot()

let i = 0;

const provider = 'https://kovan.infura.io/v604Wu8pXGoPC41ARh0B';
const gpscoord = {
  lng: 2.35237,
  lat: 48.88361,
}; // france

const getTeller = latlng => {
  mapboxAPI.getcountrycode(latlng)
    .then((countrycode) => {
      console.log('countrycode -> ', countrycode)
      detherGateway.default.tellers.getZone(countrycode, provider)
        .then((tellers) => {
          // Call teller
          console.log(tellers);
          return tellers;
        })
        .catch((e) => {
          console.log(e);
          return null;
        })
    })
    .catch((e) => {
      console.log(e);
      return null;
    })
}

// const getTellers = () => {
//   getTeller(gpscoord)
//     .then((tellers) => {
//       return mapboxAPI.sortGpsCoord(gpscoord, tellers);
//     })
//     .then((sortTeller) => {
//       demo = sortTeller;
//     })
//     .catch((e) => {
//       console.log(e);
//     })
// };






let demo = [];

// [
//   {
//     name: 'ishak',
//     escrowBalance: 12.5,
//     rates: 74.5,
//     volumeTrade: 320,
//     currency: '$',
//     address: '33 rue la fayette, 75009 Paris France',
//     telegram: 'ishak',
//   },
//   {
//     name: 'ishak2',
//     escrowBalance: 12.5,
//     rates: 74.5,
//     volumeTrade: 320,
//     currency: '$',
//     address: '33 rue la fayette, 75009 Paris France',
//     telegram: 'ishak',
//   },
//   {
//     name: 'ishak3',
//     escrowBalance: 12.5,
//     rates: 74.5,
//     volumeTrade: 320,
//     currency: '$',
//     address: '33 rue la fayette, 75009 Paris France',
//     telegram: 'ishak',
//   }
// ]

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
BALANCE: ${data.escrowBalance} ETH
RATES: ${data.rates}
VOLUME TRADE: ${data.volumeTrade} ETH
CURRENCY: ${data.currency}
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

const onMessage = (session, message) => {
  getTeller(gpscoord)
    .then((tellers) => {
      return mapboxAPI.sortGpsCoord(gpscoord, tellers);
    })
    .then((sortTeller) => {
      demo = sortTeller;
      console.log(sortTeller);
      teller(session, demo[i]);
    })
    .catch((e) => {
      console.log(e);
      addrError(session);
    })

  //
  // setTimeout(() => {
  //     // console.log('sisi', message.content.body);
  //   // addrError(session);
  //   teller(session, demo[i]);
  // }, 3000)
}

const addrError = session => session.reply(
    SOFA.Message({
      body: 'Invalid address, please enter your address',
      showKeyboard: true
    })
  )

const teller = (session, teller) => session.reply(
  SOFA.Message({
  	body: formatedTeller(teller),
   	attachments: [{
    	"type": "image",
     	"url": "dether.png"
    }],
    controls: controls,
    showKeyboard: false,
  })
)

const contact = session => session.reply(
  SOFA.Message({
  	body: formatedContact(demo[i]),
   	attachments: [{
    	"type": "image",
     	"url": "dether.png"
    }],
    controls: controlsNew,
    showKeyboard: false,
  })
)

const next = session => {
  i++;
  session.reply(
    SOFA.Message({
    	body: formatedTeller(demo[i]),
     	attachments: [{
      	"type": "image",
       	"url": "dether.png"
      }],
      controls: controls,
      showKeyboard: false,
    })
  )
}
