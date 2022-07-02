import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'
import './css/App.css'
import { Modal, Button } from 'react-bootstrap'
import { BlockChain, Block, Transaction } from './blockchain/pupCoin'

const walletAddress = '#mn6DCkhLdT7XGwoDvEHmUwkR7TzVgKeMbp'
const friends = [
  {
    fname: 'Tony',
    lname: 'Stark',
    walletAddress: '#n3QzJTKnNtg7ye5a2ohyTYVvg95JbsmjzU'
  },
  {
    fname: 'Peter',
    lname: 'Parker',
    walletAddress: '#n4aLBas85qWSMgzgG5Ac4qRhnUgv3MH4Ea'
  },
  {
    fname: 'Bruce',
    lname: 'Banner',
    walletAddress: '#mxdHMZ8GyAbATfsEvruv9YyfgAQJVA6PBV'
  },
]


function App() {
  const [balance, setBalance] = useState(0);
  const [coin, setCoin] = useState(new BlockChain());
  const [receiver, setReceiver] = useState({})
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);

  const handleShow = (receiver) => {
    setReceiver(receiver);
    setShow(true)
  };

  function sendMoneyToReceiver() {
    coin.createTransaction(new Transaction(walletAddress, receiver.walletAddress, parseInt(document.getElementById("quantity").value)))
    axios.post('http://localhost:5000/send', {coin})
    .then(function (response) {
      response.data.coin.__proto__ = BlockChain.prototype;
      console.log(response.data.coin);
      let newBalance = response.data.coin.getBalanceOfAddress(walletAddress)
      console.log(newBalance)
      setBalance(newBalance);
      printBalanceOfPeter(response.data.coin)
      printBalanceOfTony(response.data.coin)
      printBalanceOfBruce(response.data.coin)
    })
    .catch(function (error) {
      console.log(error);
    });
    setShow(false);
  }

  function printBalanceOfPeter(coin) {
    console.log('Peter has:', coin.getBalanceOfAddress('#n4aLBas85qWSMgzgG5Ac4qRhnUgv3MH4Ea'))
  }

  function printBalanceOfTony(coin) {
    console.log('Tony has:', coin.getBalanceOfAddress('#n3QzJTKnNtg7ye5a2ohyTYVvg95JbsmjzU'))
  }

  function printBalanceOfBruce(coin) {
    console.log('Bruce has:', coin.getBalanceOfAddress('#mxdHMZ8GyAbATfsEvruv9YyfgAQJVA6PBV'))
  }

  function initializeBalance() {
    coin.createTransaction(new Transaction('', walletAddress, 50))
    axios.post('http://localhost:5000/send', {coin})
    .then(function (response) {
      response.data.coin.__proto__ = BlockChain.prototype;
      console.log(response.data.coin);
      let newBalance = response.data.coin.getBalanceOfAddress(walletAddress)
      console.log(newBalance)
      setBalance(newBalance);
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  useEffect(() => {
    initializeBalance();
    console.log('Initializing balance..')
  }, []);

  return (
    <><div><h1 style={{color:'#cecece', marginBottom:15}}>Welcome, Alex. <br/>Here is your wallet.</h1></div>
    <div className="box" align='center'>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Sending to {receiver.fname} {receiver.lname}</Modal.Title>
        </Modal.Header>
        <Modal.Body> <input type="number" id="quantity" name="quantity" min="1" max="5"/></Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Nevermind
          </Button>
          <Button variant="primary" onClick={sendMoneyToReceiver}>
            Send
          </Button>
        </Modal.Footer>
      </Modal>
      <div><span style={{color: '#3BBA9C', fontSize:16, fontWeight: 'bold'}}>Address </span><span style={{color: '#cecece', fontSize:16, textTransform: 'uppercase'}}>{walletAddress}</span></div>
      <div><span style={{color: '#3BBA9C', fontSize:16, fontWeight: 'bold'}}>Balance </span><span style={{color: '#cecece', fontSize:16, textTransform: 'uppercase'}}>{balance}</span></div>
      <div>
      <span style={{color: '#3BBA9C', fontSize:16, fontWeight: 'bold'}}>You have <span style={{color: '#cecece', fontSize:16, textTransform: 'uppercase'}}>{friends.length}</span> friends</span>
        <ul style={{color: '#cecece'}}>
          {friends.map(person => <li>{person.fname + ' ' + person.lname} <Button onClick={() => {
            handleShow(person)
          }} size="sm">send</Button></li>)}
        </ul>
      </div>
    </div></>
  );
}

export default App;