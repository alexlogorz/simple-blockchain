const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(timestamp, transactions, prevHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.prevHash = prevHash;
        this.hash = this.calcHash();
        this.nonce = 0;
    }

    calcHash() {
        return SHA256(this.timestamp + JSON.stringify(this.transactions) + this.prevHash + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calcHash();
        }
        console.log('Block mined: ' + this.hash);
    }
}

class Transaction {
    
    constructor(sender, receiver, amount) {
        this.sender = sender;
        this.receiver = receiver;
        this.amount = amount;
    }


}

class BlockChain {
    constructor() {
        this.chain = [new Block(Date.now(), [], "0")]; //genesis
        this.pendingTransactions = [];
        this.difficulty = 4;
        this.miningReward = 100;
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    createTransaction(transaction) {
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address) {
        let balance = 0;
        for(const block of this.chain) {
            for(const trans of block.transactions) {
                if(trans.sender === address)
                    balance -= trans.amount;
                if(trans.receiver === address)
                    balance += trans.amount;
            }
        }
        return balance;
    }

    minePendingTransactions(miningRewardAddress) {
        const newBlock = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
        this.pendingTransactions = [new Transaction(null, miningRewardAddress, this.miningReward)]
    }

    isChainValid() {
        for(let i = 1; i < this.chain.length; i++) {
            const currBlock = this.chain[i];
            const prevBlock = this.chain[i - 1];
            if(currBlock.hash !== currBlock.calcHash()) return false;
            if(currBlock.prevHash !== prevBlock.hash) return false;
        }
        return true;
    }
}

module.exports = { BlockChain, Block, Transaction };