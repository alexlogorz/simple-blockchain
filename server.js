const express = require('express');
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { BlockChain, Block } = require('./blockchain/blockchain');

app.use(cors());
app.use(express.json());

const alexsCoin = new BlockChain();

console.log('Mining..')
alexsCoin.addBlock(new Block(1, Date.now(), { amount: 10 }));

app.listen(port, () => console.log(`listening on port ${port}`));