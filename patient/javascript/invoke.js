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
        console.log(`Wallet path: ${walletPath}`);

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {wallet, identity: 'admin', discovery: {enabled: false}});

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('patient');

        var myArgs = process.argv.slice(2);

        // Submit the specified transaction.
        // createPatient transaction - requires 2 arguments, ex: ('createPatient', patientNumber, id)
        // updatePatientRecord transaction - requires 2 args , ex: ('updatePatientRecord', patientNumber, doctor, diagnosis, treatment)
        // grantDoctor transaction - requires 2 args , ex: ('grantDoctor', 'user1', 'PATIENT0)
        // ungrantDoctor transaction - requires 2 args , ex: ('grantDoctor', 'user1', 'PATIENT0)
        switch (myArgs[0]) {
            case 'createPatient':
                await contract.submitTransaction(myArgs[0], myArgs[1], myArgs[2]);
                break;
            case 'updatePatientRecord':
                var diagnosis = '';

                await contract.submitTransaction(myArgs[0], myArgs[1], myArgs[2], fs.readFileSync(myArgs[3].toString()).toString(), fs.readFileSync(myArgs[4].toString()).toString());
                break;
            case 'grantDoctor':
                await contract.submitTransaction(myArgs[0], myArgs[1], myArgs[2]);
                break;
            case 'ungrantDoctor':
                await contract.submitTransaction(myArgs[0], myArgs[1], myArgs[2]);
                break;
        }
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
