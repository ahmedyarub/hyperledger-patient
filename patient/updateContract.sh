#!/bin/bash
#

rm -Rf javascript/wallet

cd ../basic-network/
./stop.sh
./teardown.sh

docker rmi dev-peer0.org1.example.com-patient-1.0-1e340af5e396df79db7957f48efcf4a46997f2c1159afe36d438e53ee0a41841 -f
docker rmi hyperledger/fabric-peer -f
docker container prune -f

cd ../patient/
./startPatient.sh javascript

cd javascript
node enrollAdmin.js
node registerUser.js
