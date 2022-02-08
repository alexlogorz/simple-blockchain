const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(index, timestamp, data, prevHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.prevHash = prevHash;
        this.hash = this.calcHash();
        this.nonce = 0;
    }

    calcHash() {
        return SHA256(this.index + this.timestamp + JSON.stringify(this.data) + this.prevHash + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calcHash();
        }
        console.log('Block mined: ' + this.hash);
    }
}

class BlockChain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 5;
    }

    createGenesisBlock() {
        return new Block(0, Date.now(), "Genesis block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.prevHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
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

module.exports = { BlockChain, Block };