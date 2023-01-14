module.exports = async function(callback) {
    const address = await web3.eth.getAccounts();
    console.log(address)
    const nonce = 0;
    const accountFrom = '0xdb50cb3eb91d1856dae9ff72be86d75c62f899a9';
    // desstination contract on Sepolia network
    const destinationContract = '0xd4367053379Ccb9AC98606627BBe9DC1f99e6C9d';
    const incr_value = 1;
    const message = web3.utils.soliditySha3(
        {t: 'address', v: accountFrom},
        {t: 'address', v: destinationContract},
        {t: 'uint256', v: nonce},
        {t: 'uint256', v: incr_value},
    ).toString('hex');

    const signature  = web3.eth.accounts.sign(
        message,
        process.env.PRIV_KEY_1
    );
    console.log(signature)
    const Counter = artifacts.require('Counter.sol')
    const counter = await Counter.deployed();
    const data = await counter.counter()
    console.log(data.toString())
    console.log(counter.address)

    const weiValue = (web3.utils.toWei('0.001', 'ether')) * incr_value;
    console.log(weiValue);
    const txn = await counter.send(accountFrom, destinationContract, nonce, incr_value, signature.signature,
         {value: weiValue, from:address[0]})
    console.log(txn)

    callback();
}