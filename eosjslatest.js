import ScatterJS        from 'scatterjs-core';
import ScatterEOS       from 'scatterjs-plugin-eosjs2';
import { JsonRpc, Api } from 'eosjs';
import dotenv           from 'dotenv';

dotenv.config();

// Instantiate ScatterJS and the selected Plugins
console.log("Step 1: Instantiate ScatterJS and the selected Plugins");
ScatterJS.plugins( new ScatterEOS() );

// Network Configuration to Connect (Reference) to Blockchain Endpoint Node
console.log("Step 2: Network Congfiguration to Connect (Reference) to Blockchain Endpoint Node");
const network = ScatterJS.Network.fromJson({
    blockchain: `${process.env.BLOCKCHAIN}`,
    chainId:    `${process.env.CHAINID}`,
    host:       `${process.env.HOST}`,
    port:       `${process.env.PORT}`,
    protocol:   `${process.env.PROTOCOL}`
});

// Blockchain Wrapper to Wrap the actual Blockchain Libraries (eosjs)
const rpc = new JsonRpc(network.fullhost());

// Connect to Available User's Wallet - If Connected - Call API methods on ScatterJS
console.log("Step 3: Connect to Available User's Wallet");
ScatterJS.connect('ScatterJSClient', {network}).then(connected => {

    if (!connected) return console.error('No Scatter');

    // Signature (PROXY) Provider
    const eos = ScatterJS.eos(network, Api, {rpc, beta3:true});

    // Login with the Network passed to ScatterJS.connect()
    console.log("Step 4: Login with the Network passed to ScatterJS.connect()");
    ScatterJS.login().then(id => {
        
        if (!id) return console.error("No IDENTITY");

        console.log('ID: ', id);

        console.log("Step 5: Successful Login with IDENTITY, will be available at ScatterJS.IDENTITY - If a User Refresh the Page & is Logged in - ScatterJS.IDENTITY will be Auto-filled");
        const account = ScatterJS.account(`${process.env.BLOCKCHAIN}`);
        console.log('Account: ', account);
        
        eos.transact({
            actions: [{
                account: 'eosio.token',
                name: 'transfer',
                authorization: [{
                    actor: account.name,
                    permission: account.authority,
                }],
                data: {
                    from: account.name,
                    to: 'emanateissue',
                    quantity: '0.0001 EOS',
                    memo: account.name,
                },
            }]
        }, {
            blocksBehind:  3,
            expireSeconds: 30,
        }).then(res => {
            console.log('Trx Sent: ', res);
        }).catch(err => {
            console.error('Trx Error: ', err);
        });
    });
});