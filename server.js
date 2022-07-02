var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
const WS = require('ws');
const nodes = ['ws://localhost:3001', 'ws://localhost:3002', 'ws://localhost:3003']
// const nodes = ['ws://localhost:3001']
const handshakes = []
const { BlockChain, Block, Transaction } = require('./blockchain/pupCoin');
let coin = null;
var cors = require('cors')

//middleware
app.use(cors())
app.use(express.json());

// app.use(function (req, res, next) {
//   req.testing = 'testing';
//   return next();
// });

//send out chain
app.post('/send', function(req, res, next){
  // const { firstName, lastName } = req.body
  console.log('\x1b[33m%s\x1b[0m', '----ORIGINAL CHAIN----')
  console.log(req.body.coin)
  sendChain(req.body.coin);
  setTimeout(() => {
    console.log("\x1b[32m", 'SENDING SURVEY ====>');
    handshakes.forEach(peer => {
      peer.socket.send(JSON.stringify({type: 'SURVEY', address: 'ws://localhost:5000'}));
    })
    setTimeout(() => {
      console.log("\x1b[32m", '<==== RETRIEVING CURRENT OLDEST')
      res.send({coin})
    }, 2000)
  }, 8000);
});

// receive socket messages
app.ws('/', function(ws, req) {
  ws.on('message', function(msg) {
    const _msg = JSON.parse(msg);
    if(_msg.type === 'UPDATE_CHAIN') {
      console.log('\x1b[33m%s\x1b[0m', '----CURRENT OLDEST----');
      coin = _msg.currentOldestValid;
      console.log(coin);
    } 
    // else if(_msg.type === 'HANDSHAKE') {
    //    console.log({ type: 'HANDSHAKE', address: _msg.address })
    // }
    // coin.__proto__ = BlockChain.prototype;
  });
});


//connect to the network
function connectToNodes() {
  nodes.forEach(address => {
    const socket = new WS(address);
    handshakes.push({socket, address});
    socket.on('open', () => {
      socket.send(JSON.stringify({ type: 'HANDSHAKE', address: 'ws://localhost:5000' }));
    });
  }); 
}

//get the balance of the user client
function checkWalletBalance(walletAddress) {
  let balance = coin.getBalanceOfAddress(walletAddress);
  return balance;
}

//send survey for consensus on the oldest valid chain
// function sendSurvey() {
//   setTimeout(() => {
//     handshakes.forEach(peer => {
//       peer.socket.send(JSON.stringify({type: 'SURVEY', address: 'ws://localhost:5000'}));
//     })
//   }, 7);
// }

//send the initial chain to the network
// function sendChain(coin) {
//   //create initial chain with some transactions
//   // coin = new BlockChain();
//   // coin.createTransaction(new Transaction('', 'alexs wallet', 150));
//   //check balance
//   // console.log('alexs balance:', checkWalletBalance('alexs wallet'));
//   handshakes.forEach(node => {
//     node.socket.on('open', () => {
//       node.socket.send(JSON.stringify({type: 'USER_PRGM_CHAIN', pupCoin: coin}));  
//     })
//   })
// }

async function sendChain(coin) {
	handshakes.forEach(peer => {
		peer.socket.send(JSON.stringify({type: 'USER_PRGM_CHAIN', pupCoin: coin}));
	})
}


connectToNodes();
 
// sendChain();

// sendSurvey();

// checkWalletBalance('alexs wallet');

app.listen(5000, ()=> console.log('listening on port ' + 5000));