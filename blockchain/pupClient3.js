const WS = require('ws');

const PORT = 3002;
const server = new WS.Server({ port: PORT });
const MY_ADDRESS = `ws://localhost:${PORT}`;
const peers = ['ws://localhost:3000', 'ws://localhost:3001'];
const handshakes = [];

console.log('Listening on PORT', PORT);

server.on('connection', async (socket, req) => {
    socket.on('message', message => {
        const _message = JSON.parse(message);
        console.log(_message);
        if(_message.type === 'handshake') {
            connect(_message.address);
        }
        else if(_message.type === 'msg') {
            console.log(_message.value);
        }
    });
});

async function connect(address) {
    if(!handshakes.find(peer => peer.address === address)) {
        const socket = new WS(address);
        socket.on('open', () => {
            handshakes.push({socket, address});
            socket.send(JSON.stringify({type: 'handshake', address: MY_ADDRESS}));
        });
    }
}

function broadcast(message) {
	handshakes.forEach(peer => {
		peer.socket.send(JSON.stringify(message));
	})
}

peers.forEach(peer => connect(peer));
