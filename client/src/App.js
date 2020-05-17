import React, { Component } from "react";
import MyToken from "./contracts/MyToken.json";
import MyTokenSale from "./contracts/MyTokenSale.json";
import KycContract from "./contracts/KycContract.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { loaded:false, kycAddress: "0x123...", tokenSaleAddress: null, userTokens:0, kycGuess: 0};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      this.tokenInstance = new this.web3.eth.Contract(
        MyToken.abi,
        MyToken.networks[this.networkId] && MyToken.networks[this.networkId].address,
      );

      this.tokenSaleInstance = new this.web3.eth.Contract(
        MyTokenSale.abi,
        MyTokenSale.networks[this.networkId] && MyTokenSale.networks[this.networkId].address,
      );
      this.kycInstance = new this.web3.eth.Contract(
        KycContract.abi,
        KycContract.networks[this.networkId] && KycContract.networks[this.networkId].address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenToTokenTransfer();
      this.setState({loaded:true, tokenSaleAddress:MyTokenSale.networks[this.networkId].address}, this.updateUserTokens);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  updateUserTokens = async () => {
    let userTokens = await this.tokenInstance.methods.balanceOf(this.accounts[0]).call();
    userTokens = userTokens / (10**18);
    this.setState({userTokens: userTokens});
  }

  listenToTokenTransfer = () => {
    this.tokenInstance.events.Transfer({to: this.accounts[0]}).on("data",this.updateUserTokens);
  }

  handleBuyTokens = async() => {
    try{
    await this.tokenSaleInstance.methods.buyTokens(this.accounts[0]).send({from: this.accounts[0], value: this.web3.utils.toWei("0.1","ether")});
    alert("CONGRATS YOU LUCKY MUSK HODLER!!");
  } catch(err) {
    console.log("Answer The Question", err);
    alert("YOU NEED TO ANSWER THE MOST IMPORTANT QUESTION FIRST!!");
  }
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleGuess = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleKycWhitelisting = async () => {
    await this.kycInstance.methods.setKycCompleted(this.state.kycAddress).send({from: this.accounts[0]});
    alert("KYC for "+this.state.kycAddress+" is completed");
  }

  makeGuess = async () => {
    try{
      await this.kycInstance.methods.passTheTest(this.state.kycGuess).send({from: this.accounts[0]});
      alert("KYC for "+this.accounts[0]+" is completed");
    } catch(err) {
      console.log("Think harder", err);
      alert("THE ANSWER IS 42!!");
    }
  }
  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>MUSK Token Sale</h1>
        <div class="form-group">
        <p>Answer the following question to print all the MUSK your heart desires</p>
        The Answer to the Ultimate Question of Life, The Universe, and Everything is: <input type="text" name="kycGuess" class="form-control" value={this.state.kycGuess} onChange={this.handleGuess}/>
        <button type="Button" onClick={this.makeGuess}>Give Me Central Bank Powers!</button>
        </div>
        <h2>Buy Tokens</h2>
        <p>To buy tokens send ETH here: {this.state.tokenSaleAddress}</p>
        <p>PRICE: 0.1 ETH per MUSK</p>
        <p>You currently have: {this.state.userTokens} MUSK Tokens</p>
        <button type="button" onClick={this.handleBuyTokens}>Buy One Token Here</button>
      </div>
    );
  }
}

export default App;
