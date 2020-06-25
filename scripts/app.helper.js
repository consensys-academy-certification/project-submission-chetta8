/*
    This Javascript script file is to test your use and implementation of the 
    web3.js library.

    Using the web3.js library in the Javascript files of a front-end application
    will likely be similar to the implementation required here, but could
    have significant differences as well.
*/

let Web3 = require('web3')
const ProjectSubmission = artifacts.require('ProjectSubmission')
let gasAmount = 3000000

let App = {

    /*
        These state variables will be checked by the test.app.js test file. 

        Save the instantiated web3 object, ProjectSubmission contract, provided
        Ethereum account and corresponding contract state variables.

        When sending transactions to the contract, set the "from" account to
        web3.eth.defaultAccount. The default account is changed in the ../test/test.app.js
        file to simulate sending transactions from different accounts.
          - i.e. myContract.myMethod({ from: web3.eth.defaultAccount ... })

        Each function in the App object should return the full transaction object provided by
        web3.js. For example 

        async myFunction(){
            let result = await myContract.myMethod({ from: web3.eth.defaultAccount ... })
            return result
        }
    */

    web3:          null,
    networkId:     null,
    contract:      null,
    account:       null,
    contractOwner: null,

    // The init() function will be called after the Web3 object is set in the test file
    // This function should update App.web3, App.networkId and App.contract
    async init() {
        this.web3 = web3 || new Web3(Web3.givenProvider || "ws://localhost:8545");
        this.networkId = await web3.eth.net.getId();
        this.contract = await new web3.eth.Contract(
            ProjectSubmission.abi,
            ProjectSubmission.networks[this.networkId]
            && ProjectSubmission.networks[this.networkId].address
        );
    },

    // This function should get the account made available by web3 and update App.account
    async getAccount(){
        this.account = web3.eth.defaultAccount;
    },

    // Read the owner state from the contract and update App.contractOwner
    // Return the owner address
    async readOwnerAddress(){
        this.contractOwner = await this.contract.methods.owner().call();
        return this.contractOwner;
    },

    // Read the owner balance from the contract
    // Return the owner balance
    async readOwnerBalance(){
        return await this.contract.methods.ownerBalance().call();
    },

    // Read the state of a provided University account
    // This function takes one address parameter called account    
    // Return the state object 
    async readUniversityState(account){
        return await this.universities(account);
    },

    universities(account) {
        return new Promise(resolve => {
            this.contract.methods.universities(account).call()
                .then( (receipt) => {
                    return resolve( receipt);
                });
        });
    },

    // Register a university when this function is called
    // This function takes one address parameter called account
    // Return the transaction object
    async registerUniversity(account){
        return await this.registerUniversityPromise(account);
    },

    registerUniversityPromise(account) {
        return new Promise(resolve => {
            this.contract.methods
                .registerUniversity(account)
                .send({from: web3.eth.defaultAccount, gas: gasAmount})
                .on('receipt', function (receipt) {
                    return resolve({receipt: receipt});
                });
        });
    },

    // Disable the university at the provided address when this function is called
    // This function takes one address parameter called account
    // Return the transaction object
    async disableUniversity(account){
        return await this.disableUniversityPromise(account);
    },

    disableUniversityPromise(account) {
        return new Promise(resolve => {
            this.contract.methods
                .disableUniversity(account)
                .send({ from: web3.eth.defaultAccount, gas: gasAmount })
                .on('receipt', function (receipt) {
                    return resolve({receipt: receipt});
                });
        });
    },

    // Submit a new project when this function is called
    // This function takes 3 parameters
    //   - a projectHash, an address (universityAddress), and a number (amount to send with the transaction)
    // Return the transaction object
    async submitProject(projectHash, universityAddress, amount){
        return await this.submitProjectPromise(projectHash, universityAddress, amount);
    },

    submitProjectPromise(projectHash, universityAddress, amount) {
        return new Promise((resolve, reject) => {
            try {
                this.contract.methods
                    .submitProject(projectHash, universityAddress)
                    .send({
                        from: web3.eth.defaultAccount, gas: gasAmount,
                        gasPrice: 10000000000,
                        value: web3.utils.toHex(web3.utils.toWei(amount.toString(), "ether"))
                    })
                    .on('receipt', function (receipt) {
                        return resolve({receipt: receipt});
                    });
            } catch(exc) {
                console.log('ERROR ON SUBMITPROJECT');
                return reject({receipt: null});
            }
        });
    },

    // Review a project when this function is called
    // This function takes 2 parameters
    //   - a projectHash and a number (status)
    // Return the transaction object
    async reviewProject(projectHash, status){
        return await this.reviewProjectPromise(projectHash, status);
    },

    reviewProjectPromise(projectHash, status) {
        return new Promise(resolve => {
            this.contract.methods
                .reviewProject(projectHash, status)
                .send({ from: web3.eth.defaultAccount, gas: gasAmount })
                .on('receipt', function (receipt) {
                    return resolve({receipt: receipt});
                });
        });
    },

    // Read a projects' state when this function is called
    // This function takes 1 parameter
    //   - a projectHash
    // Return the transaction object
    async readProjectState(projectHash){
        return await this.projects(projectHash);
    },

    projects(projectHash) {
        return new Promise(resolve => {
            this.contract.methods.projects(projectHash).call()
                .then( (receipt) => {
                    return resolve( receipt);
                });
        });
    },

    // Make a donation when this function is called
    // This function takes 2 parameters
    //   - a projectHash and a number (amount)
    // Return the transaction object
    async donate(projectHash, amount){
        return await this.donatePromise(projectHash, amount);
    },

    donatePromise(projectHash, amount) {
        return new Promise((resolve, reject) => {
            try {
                this.contract.methods.donate(projectHash).send({
                    from: web3.eth.defaultAccount,
                    gas: gasAmount,
                    gasPrice: 10000000000,
                    value: web3.utils.toHex(web3.utils.toWei(amount.toString(), "ether"))
                })
                    .on('receipt', function (receipt) {
                        return resolve({receipt: receipt});
                    });
            } catch(exc) {
                console.log('ERROR ON donate');
                return reject({receipt: null});
            }
        });
    },

    // Allow a university or the contract owner to withdraw their funds when this function is called
    // Return the transaction object
    async withdraw(){
        return await this.withdrawPromise();
    },

    withdrawPromise() {
        return new Promise(resolve => {
            this.contract.methods
                .withdraw()
                .send({ from: web3.eth.defaultAccount, gas: gasAmount })
                .on('receipt', function (receipt) {
                    return resolve({receipt: receipt});
                });
        });
    },

    // Allow a project author to withdraw their funds when this function is called
    // This function takes 1 parameter
    //   - a projectHash
    // Use the following format to call this function: this.contract.methods['withdraw(bytes32)'](...)
    // Return the transaction object
    async authorWithdraw(projectHash){
        return await this.authorWithdrawPromise(projectHash);
    },

    authorWithdrawPromise(projectHash) {
        return new Promise(resolve => {
            this.contract.methods
                .withdraw(projectHash)
                .send({ from: web3.eth.defaultAccount, gas: gasAmount })
                .on('receipt', function (receipt) {
                    return resolve({receipt: receipt});
                });
        });
    }
} 

module.exports = App
