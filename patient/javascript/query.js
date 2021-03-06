/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {FileSystemWallet, Gateway} = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'basic-network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

async function main() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);


        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {wallet, identity: 'admin', discovery: {enabled: false}});

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('patient');

        let myArgs = process.argv.slice(2);

        // Evaluate the specified transaction.
        // queryPatient transaction - requires 1 argument, ex: ('queryPatient', 'user1', 'PATIENT3')
        // queryAllPatients transaction - requires no arguments, ex: ('queryAllPatients', 'user1')
        // getLedgerHistory transaction - requires no arguments, ex: ('getLedgerHistory', 'patient0')
        switch (myArgs[0]) {
        case 'queryPatient':
            var result = await contract.evaluateTransaction(myArgs[0], myArgs[1], myArgs[2]);
            break;
        case 'queryAllPatients':
            var result = await contract.evaluateTransaction(myArgs[0], myArgs[1]);
            break;
        case 'getLedgerHistory':
            var tmp_result = await contract.evaluateTransaction(myArgs[0], myArgs[1]);

            var result = '';

            JSON.parse(tmp_result).data.forEach(function (element) {
                result = result + String.fromCharCode(element);
            });

            break;
        }

        console.log(result.toString());

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

main();
