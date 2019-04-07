/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {Contract} = require('fabric-contract-api');

class Patient extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const patients = [
            {
                id: '1',
                tests: 'glucos: 1mgs/ml',
                access: ','
            }
        ];

        for (let i = 0; i < patients.length; i++) {
            patients[i].docType = 'patientrecord';
            await ctx.stub.putState('PATIENT' + i, Buffer.from(JSON.stringify(patients[i])));
            console.info('Added <--> ', patients[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryPatient(ctx, user, patientNumber) {
        const patientAsBytes = await ctx.stub.getState(patientNumber); // get the patient from chaincode state
        if (!patientAsBytes || patientAsBytes.length === 0) {
            throw new Error(`${patientNumber} does not exist`);
        }

        const patient = JSON.parse(patientAsBytes.toString());

        if (user != 'admin' && !patient.access.includes(',' + user + ',')) {
            throw new Error(`Access denied for user ${user}`);
        }

        console.log(patientAsBytes.toString());
        return patientAsBytes.toString();
    }

    async createPatient(ctx, patientNumber, id) {
        console.info('============= START : Create Patient Record ===========');

        const patient = {
            id,
            docType: 'patient',
            tests: '',
            access: ','
        };

        patient.docType = 'patientrecord';

        await ctx.stub.putState(patientNumber, Buffer.from(JSON.stringify(patient)));
        console.info('============= END : Create Patient Record ===========');
    }

    async queryAllPatients(ctx, user) {
        const startKey = 'PATIENT0';
        const endKey = 'PATIENT999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }

                if (user == 'admin' || Record.access.includes(',' + user + ',')) {
                    console.info('Can access:' + Record);
                    allResults.push({Key, Record});
                } else {
                    console.info('Cannot access:' + Record);
                }
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    async updatePatientRecord(ctx, patientNumber, newTests) {
        console.info('============= START : updatePatientRecord ===========');

        const patientAsBytes = await ctx.stub.getState(patientNumber); // get the patient from chaincode state
        if (!patientAsBytes || patientAsBytes.length === 0) {
            throw new Error(`${patientNumber} does not exist`);
        }
        const patient = JSON.parse(patientAsBytes.toString());
        patient.tests = newTests;

        await ctx.stub.putState(patientNumber, Buffer.from(JSON.stringify(patient)));
        console.info('============= END : updatePatientRecord ===========');
    }

    async grantDoctor(ctx, doctorName, patientNumber) {
        console.info('============= START : grantDoctor ===========');

        const patientAsBytes = await ctx.stub.getState(patientNumber); // get the patient from chaincode state
        if (!patientAsBytes || patientAsBytes.length === 0) {
            throw new Error(`${patientNumber} does not exist`);
        }

        console.info('Getting patient data');
        const patient = JSON.parse(patientAsBytes.toString());

        if (patient.access.includes(doctorName) === false) {
            console.info('Adding permission');
            patient.access += doctorName + ',';

            await ctx.stub.putState(patientNumber, Buffer.from(JSON.stringify(patient)));
        }
        console.info('============= END : grantDoctor ===========');
    }


    async ungrantDoctor(ctx, doctorName, patientNumber) {
        console.info('============= START : grantDoctor ===========');

        const patientAsBytes = await ctx.stub.getState(patientNumber); // get the patient from chaincode state
        if (!patientAsBytes || patientAsBytes.length === 0) {
            throw new Error(`${patientNumber} does not exist`);
        }

        console.info('Getting patient data');
        const patient = JSON.parse(patientAsBytes.toString());

        if (patient.access.includes(doctorName) === true) {
            console.info('Adding permission');
            patient.access = patient.access.replace(doctorName + ',', '');

            await ctx.stub.putState(patientNumber, Buffer.from(JSON.stringify(patient)));
        }
        console.info('============= END : grantDoctor ===========');
    }
}

module.exports = Patient;
