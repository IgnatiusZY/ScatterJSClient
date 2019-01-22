import ScatterJS from 'scatterjs-core';
import ScatterEOS from 'scatterjs-plugin-eosjs';
import Eos from 'eosjs';
import dotenv from 'dotenv';

dotenv.config();

// Instantiate ScatterJS and the selected Plugins
ScatterJS.plugins( new ScatterEOS() );

// Network Congfiguration to Connect (Reference) to Blockchain Endpoint Nodeconst network = ScatterJS.Network.fromJson({
const network = ScatterJS.Network.fromJson({
    blockchain: process.env.BLOCKCHAIN,
    chainId: process.env.CHAIN_ID,
    host: process.env.HOST,
    port: process.env.PORT,
    protocol: process.env.PROTOCOL
});

// Connect to Available User's Wallet - If Connected - Call API methods on ScatterJS
ScatterJS.connect('ScatterJSClient', {network}).then(connected => {

    if (!connected) return console.error('No Scatter');

    const eos = ScatterJS.eos(network, Eos);

    // Login with the Network passed to ScatterJS.connect()
    ScatterJS.login().then(id => {
        if (!id) return console.error('No IDENTITY');

        const account = ScatterJS.account(process.env.BLOCKCHAIN);
        const options = { authorization: [`${account.name}@${account.authority}`] };

        eos.transfer(account.name, 'safetransfer', '0.0001 EOS', account.name, options)
            .then(res => {
                console.log('Sent: ', res);
            }).catch(err => {
                console.log('Error: ', err);
            });
    }).then(res => {
        console.log('Successful Login with IDENTITY: ', res);
    }).catch(err => {
        console.error('Login Error: ', err);
        process.exit();
    });
});