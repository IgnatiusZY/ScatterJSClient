import ScatterJS        from "scatterjs-core";
import ScatterEOS       from "scatterjs-plugin-eosjs2";
import { Api, JsonRpc } from "eosjs";

export default class ScatterClient {
    
    constructor(network, appName) {

        this.appName = appName; 

        // Instantiate ScatterJS and the selected Plugins
        ScatterJS.plugins(new ScatterEOS());

        this.scatter = ScatterJS.scatter;

        // Network Configuration to Connect (Reference) to Blockchain Endpoint Node
        /**
         * const network = ScatterJS.Network.fromJson({
         *      blockchain: process.env.BLOCKCHAIN,
         *      chainId:    process.env.CHAIN_ID,
         *      host:       process.env.HOST,
         *      port:       process.env.PORT,
         *      protocol:   process.env.PROTOCOL
         * });
         */
        this.network = network;

        // Blockchain Wrapper to Wrap the actual Blockchain Libraries (eosjs)
        /**
         * const rpc = new JsonRpc(network.fullhost());
         */
        const rpc = new JsonRpc(`${network.protocol}://${network.host}:${network.port}`);

        this.rpc = rpc;
        this.currentAccount = null;
        this.reqFields = { accounts: [network] };

        // Signature (PROXY) Provider
        /**
         * const eos = ScatterJS.eos(network, Api, {rpc, beta3:true});
         */
        this.api = this.scatter.eos(network, Api, {rpc, beta3: true});

        this.isConnected = false;
        
        window.ScatterJS = null;
        window.ScatterEOS = null;

    }

    connect = async () => {
        this.isConnected = await this.scatter.connect(this.appName);
    }

    login = async () => {
        if (this.isConnected) {
            await this.scatter.login(this.reqFields);
            this.currentAccount = this.scatter.identity.accounts.find(x => x.blockchain === `eos`);
            alert('Login Successful to Scatter');
        } else {
            alert('Login Fail - Please Login to Scatter');
        }
    }

    logout = async () => {
        this.scatter.logout();
        alert('Logout Successful');
    }

    sendTx = async (actions) => {
        if ([actions].length) {
            try {
                return await this.api.transact({
                    actions: [actions]
                }, { blocksBehind: 3, expireSeconds: 30 });
            } catch (e) {
                console.error('Trx Error: ', e);
            }
        } else console.log('Trx Error');
    }

    makeAction = async (contract, actionName, data, perm = { actor: this.currentAccount.name, permission: this.currentAccount.authority }) => {
        return {
            account: contract,
            name: actionName,
            authorization: [perm],
            data: data
        };
    }
}
