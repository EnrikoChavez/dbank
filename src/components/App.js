import { Tabs, Tab } from 'react-bootstrap'
import dBank from '../abis/dBank.json'
import React, { Component } from 'react';
import Token from '../abis/Token.json'
import dbank from '../dbank.png';
import Web3 from 'web3';
import './App.css';

//h0m3w0rk - add new tab to check accrued interest

class App extends Component {

  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  //only made to load 1 account at a time, loading 2 may only connect the first account connected
  async loadBlockchainData(dispatch) {
    //check if MetaMask exists
    if (typeof window.ethereum!=='undefined'){
      //assign to values to variables: web3, netId, accounts
      const web3 = new Web3(window.ethereum)
      const netId = await web3.eth.net.getId()
      const accounts = await web3.eth.requestAccounts()
      //check if account is detected, then load balance&setStates, elsepush alert
      if (typeof accounts[0] !== 'undefined'){
        const balance = await web3.eth.getBalance(accounts[0])
        this.setState({account: accounts[0], balance: balance, web3: web3})
      }
      else{
        window.alert('Please log in with metamask')
      }

      //in try block load contracts
      try{
        const dBankAddress = dBank.networks[netId].address
        const token = new web3.eth.Contract(Token.abi, Token['networks'][netId]['address'])
        const dbank = new web3.eth.Contract(dBank.abi, dBankAddress)
        const tokenBalanceWei = await token.methods.balanceOf(this.state.account).call()
        const tokenBalance = web3.utils.fromWei(tokenBalanceWei)
        console.log(tokenBalance)
        this.setState({token: token, dbank: dbank, dBankAddress: dBankAddress, tokenBalance: tokenBalance})
        console.log(dBankAddress)
      }
      catch(err){
        console.log('Error', err)
        window.alert('Contracts not deployed to the current network')
      }
      
      
    }
    //if MetaMask not exists push alert
    else{
      window.alert('please install metamask to connect to website')
    }
  }

  async deposit(amount) {
    if(this.state.dbank!=='undefined'){
      try{
        await this.state.dbank.methods.deposit().send({value: amount.toString(), from: this.state.account})
      }
      catch (err){
        console.log('Error when depositing: ', err)
      }
    }
  }

  async withdraw(e) {
    e.preventDefault()
    if(this.state.dbank!=='undefined'){
      try{
        await this.state.dbank.methods.withdraw().send({from: this.state.account})
      }
      catch (err){
        console.log('Error when withdrawing: ', err)
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      dbank: null,
      balance: 0,
      dBankAddress: null,
      tokenBalance: 0
    }
  }

  render() {
    return (
      <div className='text-monospace'>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
        <img src={dbank} className="App-logo" alt="logo" height="32"/>
          <b>dBank</b>
        </a>
        </nav>
        <div className="container-fluid mt-5 text-center">
        <br></br>
          <h1>Welcome to dBank</h1>
          <h2>{this.state.account}</h2>
          <h3>Amount of DBC token gained: {this.state.tokenBalance}</h3>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
              <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                <Tab eventKey="deposit" title="deposit">
                  <div>
                    <br/>
                    How much do you want to deposit?
                    <br/>
                    (minimum amount is 0.01 ETH)
                    <br/>
                    (1 deposit is possible at a time given how the smart contract deployed on the blockchain is written)
                    <br/>
                    <form onSubmit={(e)=>{
                      e.preventDefault()
                      let amount = this.depositedAmount.value
                      amount = amount * 10**18 //convert to wei, could use web3 utility too
                      this.deposit(amount)
                    }}>
                      <div className="form-group mr-sm-2">
                      <br/>
                        <input
                        id='depositAmount'
                        step="0.01"
                        type='number'
                        className="form-control form-control-md"
                        placeholder='amount to deposit'
                        required
                        ref={(input)=>{this.depositedAmount=input}}
                        />
                      </div>
                      <button type='submit' className='btn btn-primary'>DEPOSIT</button>
                    </form>
                  </div>
                </Tab>
                <Tab eventKey="withdraw" title="withdraw">
                  <br/>
                  Do you want to withdraw and take interest?
                  <br/>
                  <br/>
                  <div> 
                    <button type='submit' className='btn btn-primary' onClick={(e)=>this.withdraw(e)}>WITHDRAW</button>
                  </div>
                </Tab>
              </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;