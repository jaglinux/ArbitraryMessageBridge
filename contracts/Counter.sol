// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

contract Counter {
    event messageToBridge(address from, address to, uint256 nonce, uint256 value, 
        bytes sig);
    event logCounterIncrement(address from, uint256 nonce, uint256 value);
    /**
     * @dev owner represents the relayer.
     * Make sure to deploy the contract on both source
     * and destination chain by the same owner.
     */
    address public owner;
    uint256 public counter;
    mapping(address => mapping(uint256 => bool)) public nonce;

    modifier onlyOwner() {
        require(owner == msg.sender, "Only Owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setNewOwner(address newOwner) external onlyOwner{
        require(newOwner != address(0), "Zero Address");
        owner = newOwner;
    }

    /**
     * @dev Any address can call send(), not necessary "from" address.
     * Here "from" address is the one requesting counter increment on
     * destination chain.
     * Counter on destination chain can be increment in the range of
     * 1 to 3(inclusive). It costs 0.001 ether to increment by 1.
     * The fee serves 2 purpose:
     *  1. Covers Relayers cost.
     *  2. Prevents spamming of unnecessary increment of the counter.
     * sig parameter contains signature signed by the "from" address.
     * example sign format: web3.utils.soliditySha3(
        {t: 'address', v: accountFrom},
        {t: 'address', v: destinationContract},
        {t: 'uint256', v: nonce},
        {t: 'uint256', v: incr_value},}
     * NOTE: This function increments counter on destination chain and not
     * on the source chain !
     */
    function send(address from, address to, uint256 _nonce, uint256 value, bytes calldata sig) 
        payable external {
        require(nonce[from][_nonce] == false, "nonce already used");
        require(value > 0 && value <= 3, "increment out of range");
        require(msg.value == value*0.001 ether, "Not enough ether");
        nonce[from][_nonce] = true;
        unchecked {
            emit messageToBridge(from, to, _nonce, value, sig);
        }
    }
    /**
     * @dev Only relayer can call this function.
     * If the signature is valid, the counter is incremented.
     * Fee is already collected in send function of source contract.
     */
    function increment(address from, address to, uint256 _nonce, 
        uint256 value, bytes calldata sig)  external onlyOwner {
        require(to == address(this), "wrong contract address");
        require(nonce[from][_nonce] == false, "nonce already used");
        nonce[from][_nonce] = true;
        bytes32 hash = prefixed(keccak256(abi.encodePacked(
            from, to, _nonce, value
        )));
        require(recoverSigner(hash, sig) == from, "wrong signer");
        unchecked {
            counter += value;
        }
        emit logCounterIncrement(from, _nonce, counter);
    }

    function withdraw(address payable to) onlyOwner external {
        require(to != address(0), "Zero Address");
        to.transfer(address(this).balance);
    }

    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            '\x19Ethereum Signed Message:\n32',
            hash
        ));
    }

    function recoverSigner(bytes32 message, bytes memory sig) internal pure
    returns (address)
    {
        uint8 v;
        bytes32 r;
        bytes32 s;
        (v, r, s) = splitSignature(sig);
        return ecrecover(message, v, r, s);
    }

    function splitSignature(bytes memory sig)
    internal
    pure
    returns (uint8, bytes32, bytes32)
    {
        require(sig.length == 65, "Invaid sig length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }
        return (v, r, s);
    }
}