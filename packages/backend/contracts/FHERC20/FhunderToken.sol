// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19 <0.9.0;

import { Console } from "@fhenixprotocol/contracts/utils/debug/Console.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import { FHE, euint128, inEuint128 } from "@fhenixprotocol/contracts/FHE.sol";
import { IFHERC20 } from "./IFHERC20.sol";

import "@fhenixprotocol/contracts/access/Permissioned.sol";

error ErrorInsufficientFunds();
error ERC20InvalidApprover(address);
error ERC20InvalidSpender(address);

contract FhunderToken is IFHERC20, ERC20, Permissioned, Ownable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    // A mapping from address to an encrypted balance.
    mapping(address => euint128) internal _encBalances;

    // A mapping from address (owner) to a mapping of address (spender) to an encrypted amount.
    mapping(address => mapping(address => euint128)) internal _allowed;
    
    euint128 internal totalEncryptedSupply = FHE.asEuint128(0);

    uint8 private _customDecimals;

    event FhunderTransfer(address indexed from, address indexed to, uint256 amount);
    event FhunderMint(address indexed to, uint256 amount);
    event FhunderEMint(address indexed to, euint128 amount);

    constructor(string memory name, string memory symbol, uint8 decimals_, address owner_) ERC20(name, symbol) Ownable(owner_) {
        _customDecimals = decimals_;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
    }

    function decimals() public view virtual override returns (uint8) {
        return _customDecimals;
    }

    function _allowanceEncrypted(address owner, address spender) internal view returns (euint128) {
        return _allowed[owner][spender];
    }

    function allowanceEncrypted(
        address owner,
        address spender,
        Permission calldata permission
    ) public view virtual onlyPermitted(permission, owner) returns (string memory) {
        return FHE.sealoutput(_allowanceEncrypted(owner, spender), permission.publicKey);
    }

    function approveEncrypted(address spender, inEuint128 calldata value) public virtual returns (bool) {
        _approve(msg.sender, spender, FHE.asEuint128(value));
        return true;
    }

    function _approve(address owner, address spender, euint128 value) internal {
        if (owner == address(0)) {
            revert ERC20InvalidApprover(address(0));
        }
        if (spender == address(0)) {
            revert ERC20InvalidSpender(address(0));
        }
        _allowed[owner][spender] = value;
        Console.log("[_approve] Owner: ", owner);
        Console.log("[_approve] Spender: ", spender);
        Console.log("[_approve] Value: ", uint128(FHE.decrypt(_allowed[owner][spender])));
    }

    function _spendAllowance(address owner, address spender, euint128 value) internal virtual returns (euint128) {
        Console.log("[_spendAllowance] Owner: ", owner);
        Console.log("[_spendAllowance] Spender: ", spender);
        Console.log("[_spendAllowance] Value: ", uint128(FHE.decrypt(value)));
        euint128 currentAllowance = _allowanceEncrypted(owner, spender);
        Console.log("[_spendAllowance] Current allowance: ", uint128(FHE.decrypt(currentAllowance)));
        euint128 spent = FHE.min(currentAllowance, value);
        Console.log("[_spendAllowance] Spent: ", uint128(FHE.decrypt(spent)));
        _approve(owner, spender, FHE.sub(currentAllowance, spent));

        return spent;
    }

    function transferFromEncrypted(address from, address to, inEuint128 calldata value) public virtual returns (euint128) {
        return _transferFromEncrypted(from, to, FHE.asEuint128(value));
    }

    function _transferFromEncrypted(address from, address to, euint128 value) public virtual returns (euint128) {
        Console.log("[_transferFromEncrypted] Transferring from: ", from);
        Console.log("[_transferFromEncrypted] To: ", to);
        Console.log("[_transferFromEncrypted] Value: ", uint128(FHE.decrypt(value)));
        euint128 spent = _spendAllowance(from, msg.sender, value);
        Console.log("[_transferFromEncrypted] Spent: ", uint128(FHE.decrypt(spent)));
        return _transferImpl(from, to, spent);
    }

    function wrap(uint128 amount) public {
        if (balanceOf(msg.sender) < amount) {
            revert ErrorInsufficientFunds();
        }

        _burn(msg.sender, amount);
        euint128 eAmount = FHE.asEuint128(amount);
        _encBalances[msg.sender] = FHE.add(_encBalances[msg.sender], eAmount);
        totalEncryptedSupply = FHE.add(totalEncryptedSupply, eAmount);
    }

    function unwrap(uint128 amount) public {
        euint128 encAmount = FHE.asEuint128(amount);

        euint128 amountToUnwrap = FHE.select(FHE.gte(_encBalances[msg.sender], encAmount), encAmount, FHE.asEuint128(0));

        _encBalances[msg.sender] = FHE.sub(_encBalances[msg.sender], amountToUnwrap);
        totalEncryptedSupply = FHE.sub(totalEncryptedSupply, amountToUnwrap);

        _mint(msg.sender, FHE.decrypt(amountToUnwrap));
    }

    function mint(uint256 amount) public onlyRole(MINTER_ROLE) {
        emit FhunderMint(msg.sender, amount);
        _mint(msg.sender, amount);
    }

    function mintEncrypted(address to, inEuint128 calldata encryptedAmount) public onlyRole(MINTER_ROLE) {
        emit FhunderEMint(msg.sender, FHE.asEuint128(encryptedAmount));
        _mintEncrypted(to, FHE.asEuint128(encryptedAmount));
    }

    function _mintEncrypted(address to, euint128 amount) internal {
        _encBalances[to] = FHE.add(_encBalances[to], amount);
        totalEncryptedSupply = FHE.add(totalEncryptedSupply, amount);
    }

    function burnFromEncrypted(address account, inEuint128 calldata encryptedAmount) public onlyRole(BURNER_ROLE) {
        _burnFromEncrypted(account, FHE.asEuint128(encryptedAmount));
    }

    function _burnFromEncrypted(address account, euint128 amount) internal {
        euint128 amountToBurn = FHE.select(_encBalances[account].gte(amount), amount, FHE.asEuint128(0));

        _encBalances[account] = FHE.sub(_encBalances[account], amountToBurn);
        totalEncryptedSupply = FHE.sub(totalEncryptedSupply, amountToBurn);
    }

    function transferEncrypted(address to, inEuint128 calldata encryptedAmount) public returns (euint128) {
        return _transferEncrypted(to, FHE.asEuint128(encryptedAmount));
    }

    // Transfers an amount from the message sender address to the `to` address.
    function _transferEncrypted(address to, euint128 amount) public returns (euint128) {
        emit FhunderTransfer(msg.sender, to, FHE.decrypt(amount));
        return _transferImpl(msg.sender, to, amount);
    }

    // Transfers an encrypted amount.
    function _transferImpl(address from, address to, euint128 amount) internal returns (euint128) {
        Console.log("[_transferImpl] Transferring from: ", from);
        Console.log("[_transferImpl] To: ", to);
        Console.log("[_transferImpl] Value: ", uint128(FHE.decrypt(amount)));
        Console.log("[_transferImpl] Encrypted balance of from: ", uint128(FHE.decrypt(_encBalances[from])));
        // Make sure the sender has enough tokens.
        euint128 validAmount = FHE.asEuint128(uint128(FHE.decrypt(amount)));
        Console.log("[_transferImpl] Is lte : ", FHE.decrypt(FHE.lte(validAmount, _encBalances[from])));

        euint128 amountToSend = FHE.select(FHE.lte(validAmount, _encBalances[from]), validAmount, FHE.asEuint128(0));
        Console.log("[_transferImpl] Amount to send: ", uint128(FHE.decrypt(amountToSend)));

        _encBalances[to] = FHE.add(_encBalances[to], amountToSend);
        _encBalances[from] = FHE.sub(_encBalances[from], amountToSend);

        return amountToSend;
    }

    function balanceOfEncrypted(address account, Permission memory auth) public view virtual onlyPermitted(auth, account) returns (string memory) {
        return _encBalances[account].seal(auth.publicKey);
    }

    function balanceOfEncrypted() external view virtual returns (euint128) {
        return _encBalances[msg.sender];
    }

    function decryptedBalanceOf() public view virtual returns (uint256) {
        return FHE.decrypt(_encBalances[msg.sender]);
    }

    function decryptedBalanceOf(address account) public view virtual returns (uint256) {
        return FHE.decrypt(_encBalances[account]);
    }
}