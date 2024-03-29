// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface ITestToken {
    error EtherLessThanRequired(
        address sender,
        uint256 balance,
        uint256 needed
    );

    error BalanceWouldBeOverflow(
        address sender,
        uint256 balanceAfterAdd,
        uint256 maxBalance
    );

    error InsufficientBalance(address sender, uint256 balance, uint256 amount);
}

contract TestContract is ITestToken {
    mapping(address account => uint256 balance) private _balances;
    address private _owner;
    uint8 private immutable _decimal;
    string private _name;
    string private _symbol;
    uint256 private immutable _totalSupply;

    constructor(
        uint256 totalSupply_,
        uint8 decimal_,
        string memory symbol_,
        string memory name_
    ) payable {
        _symbol = symbol_;
        _name = name_;
        _totalSupply = totalSupply_;
        _decimal = decimal_;
        _owner = msg.sender;
        _balances[address(0)] = totalSupply_;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimal() public view returns (uint8) {
        return _decimal;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function deposit(uint256 amount) external payable {
        if (msg.value <= 0.00001 ether) {
            revert EtherLessThanRequired(msg.sender, msg.value, 0.00001 ether);
        }

        uint256 tokenBalance = _balances[address(0)];

        if (tokenBalance < amount) {
            revert InsufficientBalance(msg.sender, tokenBalance, amount);
        }

        unchecked {
            _balances[address(0)] = tokenBalance - amount;
            _balances[msg.sender] += amount;
        }
    }

    function transfer(address account, uint256 amount) external {
        uint256 balanceSender = _balances[msg.sender];

        if (balanceSender < amount) {
            revert InsufficientBalance(msg.sender, balanceSender, amount);
        }

        unchecked {
            _balances[msg.sender] = balanceSender - amount;
            _balances[account] += amount;
        }
    }
}
