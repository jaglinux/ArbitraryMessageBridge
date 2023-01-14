const Counter = artifacts.require('Counter.sol')

  contract('Counter', (accounts) => {
    // Setup accounts.
    const accountOne = accounts[0];
    // accountTwo is created through wallet create
    // which allows us to sign. Default truffle account
    // defaults to zero address if signed.
    var accountTwo;
    const accountThree = accounts[1];
    // Simulate 2 chain addresses
    var counterChain1;
    var counterChain2;
    var message;
    var signature;
    var weiValue;

    beforeEach(async () => {
      counterChain1 = await Counter.new();
      counterChain2 = await Counter.new();
      await web3.eth.accounts.wallet.create(1);
      accountTwo = web3.eth.accounts.wallet[0]
      message = web3.utils.soliditySha3(
        {t: 'address', v: accountTwo.address},
        {t: 'address', v: counterChain2.address},
        {t: 'uint256', v: 0},
        {t: 'uint256', v: 1},
      ).toString('hex');
      signature  = await web3.eth.accounts.sign(
        message,
        accountTwo.privateKey
      );
      weiValue = (web3.utils.toWei('0.001', 'ether')) * 1;
      await counterChain1.send(accountTwo.address, counterChain2.address, 0, 1, signature.signature,
           {value: weiValue, from: accountOne});
    });

    it('Check nonce on source chain', async () => {
      const nonce_2 = await counterChain1.nonce(accountTwo.address, 0);
      const nonce_1 = await counterChain1.nonce(accountOne, 0);
      // Nonce of accountTwo should be true.
      assert(nonce_2 == true);
      assert(nonce_1 == false);
    });

    it('Fail: Reuse nonce fails on source chain', async () => {
      // Re use nonce, expected to FAIL
      try {
        var errorFlag = 0;
        await counterChain1.send(accountTwo.address, counterChain2.address, 0, 1, signature.signature,
        {value: weiValue, from: accountOne});
      }
      catch(err) {
        errorFlag = 1
        assert.include(err.message, "revert", "The error message should contain 'revert'");
        assert.include(err.message, "nonce already used", "The error message should contain 'nonce already used'");
      }
      finally {
          assert(errorFlag == 1, 'Expected Revert');
      }
    });

    it('Increment Counter on destination chain', async () => {
      await counterChain2.increment(accountTwo.address, counterChain2.address, 0, 1, signature.signature);
      const counterVal = await counterChain2.counter();
      assert(counterVal.toString() == '1', "Counter value not incremented");
    });

    it('Check Nonce on destination chain', async () => {
      await counterChain2.increment(accountTwo.address, counterChain2.address, 0, 1, signature.signature);
      const nonce = await counterChain1.nonce(accountTwo.address, 0);
      assert(nonce == true, "nonce value not set to true");
    });

    it('FAIL: Non relayer calls increment on destination chain', async () => {
      try {
        var errorFlag = 0;
        await counterChain2.increment(accountTwo.address, counterChain2.address, 0, 1, signature.signature,
          {from:accountThree});
      }
      catch(err) {
        errorFlag = 1
        assert.include(err.message, "revert", "The error message should contain 'revert'");
        assert.include(err.message, "Only Owner", "The error message should contain 'Only Owner'");
      }
      finally {
        assert(errorFlag == 1, 'Expected Revert');
      }
    });
  })