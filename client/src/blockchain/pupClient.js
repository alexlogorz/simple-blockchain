const WS = require('ws');
const PORT = 3000;
const server = new WS.Server({ port: PORT });
const MY_ADDRESS = `ws://localhost:${PORT}`;
const peers = [];
const handshakes = [];
const arrayOfChains = [];
const { Block, BlockChain, Transaction } = require('./pupCoin');

console.log('Listening on PORT', PORT);

server.on('connection', async (socket, req) => {
    socket.on('message', message => {
        const _message = JSON.parse(message);
        switch(_message.type) {
            case 'HANDSHAKE':
                connect(_message.address);
                break;
            // case 'VOTE':
            //     _message.currentOldestValid.__proto__ = BlockChain.prototype;
            //     if(_message.address != MY_ADDRESS) {
            //         if(oldestValid != null) {
            //             if(_message.currentOldestValid.getLatestBlock().timestamp < oldestValid.getLatestBlock().timestamp) {
            //                 oldestValid = _message.currentOldestValid;
            //             }
            //         } else {
            //             oldestValid = _message.currentOldestValid;
            //         }
            //     }
            //     break;
            case 'SURVEY':
                if(_message.address != MY_ADDRESS) {
                    let currentOldestValid = arrayOfChains[0];
                    for(let i = 0; i < arrayOfChains.length; i++) {
                        if(arrayOfChains[i].getLatestBlock().timestamp < currentOldestValid.getLatestBlock().timestamp) {
                            currentOldestValid = arrayOfChains[i];
                        }    
                    }
                    sendMessage({ type: 'UPDATE_CHAIN', address: MY_ADDRESS, currentOldestValid }, _message.address);
                }
                break;
            case 'PEER_CHAIN':
                _message.pupCoin.__proto__ = BlockChain.prototype;
                arrayOfChains.push(_message.pupCoin);
                break;
            case 'USER_PRGM_CHAIN':
                _message.pupCoin.__proto__ = BlockChain.prototype;
                _message.pupCoin.minePendingTransactions(MY_ADDRESS);
                if(_message.pupCoin.isChainValid()) arrayOfChains.push(_message.pupCoin);
                broadcast({type: 'PEER_CHAIN', address: MY_ADDRESS, pupCoin: _message.pupCoin});
                break;
            default:
                console.log('error');
                break;
        }
    });
});

function connect(address) {
    if(!handshakes.find(peer => peer.address === address)) {
        const socket = new WS(address);
        socket.on('open', () => {
            handshakes.push({ socket, address });
            // if(address != 5000)
            //     socket.send(JSON.stringify({ type: 'HANDSHAKE', address: MY_ADDRESS }));
        });
    }
}

function sendMessage(message, address) {
    handshakes.forEach(peer => {
		if(peer.address === address) peer.socket.send(JSON.stringify(message));
	})
}

async function broadcast(message) {
	handshakes.forEach(peer => {
		peer.socket.send(JSON.stringify(message));
	})
}

peers.forEach(peer => connect(peer));
