const WS = require('ws');

const PORT = 3000;
const server = new WS.Server({ port: PORT });
const MY_ADDRESS = `ws://localhost:${PORT}`;
const peers = [];
const handshakes = [];
let hasVoted = false;
const surveyResults = { accepted: 0, rejected: 0 };

console.log('Listening on PORT', PORT);

server.on('connection', async (socket, req) => {
    socket.on('message', message => {
        const _message = JSON.parse(message);
        switch(_message.type) {
            case 'HANDSHAKE':
                console.log(_message);
                connect(_message.address);
                break;
            case 'SURVEY':
                castVote(_message);
                break;
            case 'VOTE':
                appendSurveyResults(_message.accepted);
                break;
        }
    });
});

async function connect(address) {
    if(!handshakes.find(peer => peer.address === address)) {
        const socket = new WS(address);
        socket.on('open', () => {
            handshakes.push({ socket, address });
            socket.send(JSON.stringify({ type: 'HANDSHAKE', address: MY_ADDRESS }));
        });
    }
}

function castVote(message) {
    const { number, address } = message;
    if(!hasVoted) {
        if(number >= 0)
            sendMessage({ type: 'VOTE', accepted: true }, address);
        else
            sendMessage({ type: 'VOTE', accepted: false }, address);
        hasVoted = true;
    }
}

function appendSurveyResults(accepted) {
    if(accepted)
        surveyResults.accepted += 1;
    else
        surveyResults.rejected += 1;
}

function sendMessage(message, address) {
    handshakes.forEach(peer => {
		if(peer.address === address) peer.socket.send(JSON.stringify(message));
	})
}

function broadcast(message) {
	handshakes.forEach(peer => {
		peer.socket.send(JSON.stringify(message));
	})
}

function surveyTimer(delay) {
    setTimeout(() => {
        console.log('Survey results', surveyResults);
    }, delay);
}

peers.forEach(peer => connect(peer));

setTimeout(() => {
    broadcast({ type: 'SURVEY', address: MY_ADDRESS, number:-1 });
    surveyTimer(10000);
}, 10000);