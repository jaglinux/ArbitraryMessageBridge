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

## Steps to deploy the contracts. <br>
truffle migrate --reset --network goerli <br>
truffle migrate --reset --network sepolia  <br>
## To run test
truffle test

## Sign transaction script and submit txn to Goerli chain 
Use the script https://github.com/jaglinux/ArbitraryMessageBridge/blob/master/scripts/transact_goerli.js <br>
to sign the txn to increment and submit it on source chain. <br>
truffle exec  scripts/transact.js --network goerli_1 <br>
goerli_1 is the second address (other than the owner) which wants to increment the counter. <br>
https://github.com/jaglinux/ArbitraryMessageBridge/blob/master/truffle-config.js#L93 <br>
The env variable PRIV_KEY represents relayer / owner key. <br>
The env variable PRIV_KEY_1 represents user or client key. <br>

## Coming up
Relayer script to submit singed txn on Sepolia chain <br>
