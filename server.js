const express = require('express');
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { BlockChain, Block, Transaction } = require('./blockchain/pupCoin');

app.use(cors());
app.use(express.json());

const pupCoin = new BlockChain();

// console.log('Mining..')
// pupCoin.addBlock(new Block(1, Date.now(), { amount: 10 }));
// console.log('Mining..')
// pupCoin.addBlock(new Block(2, Date.now(), { amount: 20 }));
// pupCoin.chain[1].data = {amount: 100};
// console.log(pupCoin.isChainValid());

pupCoin.createTransaction(new Transaction(null, 'my address', 50));

pupCoin.minePendingTransactions('miners address');
pupCoin.minePendingTransactions('miners address2');

console.log(pupCoin.getBalanceOfAddress('miners address'));
console.log(pupCoin.isChainValid());
app.listen(port, () => console.log(`listening on port ${port}`));