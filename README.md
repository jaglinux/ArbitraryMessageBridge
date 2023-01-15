# ArbitraryMessageBridge

Counter.sol is the main contract which will be deployed on both source and destination chains. <br>
Here source chain refers to goerli chain and destination chain refers to sepolia chain. <br>
Message is passed from source to destination chain i.e counter is incremented on destination chain <br>
but instructions to increment the counter is authorized  on source chain. <br>

Goerli chain 
https://goerli.etherscan.io/address/0x0c597ae30417ad1310367a0f168c109f24c3e151

Sepolia chain
https://sepolia.etherscan.io/address/0xd4367053379ccb9ac98606627bbe9dc1f99e6c9d

Sucessful txn which incremented the counter
https://sepolia.etherscan.io/tx/0xbffa1e45085d76402759a45132b03cae1a0a45644e024eda4dd403c0ea71806b
## Setup instructions<br>
*git clone https://github.com/jaglinux/ArbitraryMessageBridge.git* <br>
*yarn install*<br>
*truffle compile* <br>
## Steps to deploy the contracts. <br>
*truffle migrate --reset --network goerli* <br>
*truffle migrate --reset --network sepolia* <br>
## To run test
Source Code @ https://github.com/jaglinux/ArbitraryMessageBridge/blob/master/test/Counter.js <br>
*truffle test*

## Helper scripts
Use the script https://github.com/jaglinux/ArbitraryMessageBridge/blob/master/scripts/send_transaction_goerli.js <br>
to sign the txn from Account[1] and sends the txn over goerli. <br>
Use --nonce to send the desired nonce value.

*truffle exec  scripts/send_transaction_goerli.js --network goerli --nonce 9* <br>

### To print only signature <br>
*truffle exec  scripts/print_signature_goerli.js --network goerli --nonce 9* <br>

## Account and ENV KEYS
Account[1] is derived from PRIV_KEY_1. This account is considered as user account interested in incrementing the counter. <br>
Account[0] is the deployer, ownner, relayer.
https://github.com/jaglinux/ArbitraryMessageBridge/blob/master/truffle-config.js#L93 <br>

The env variable PRIV_KEY represents relayer / owner key (Account[0]). <br>
The env variable PRIV_KEY_1 represents user or client key (Account[1]). <br>
The env variable PROJECT_ID represents Infura key. <br>

## Coming up
Relayer script to submit singed txn on Sepolia chain <br>
