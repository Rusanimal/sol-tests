import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("TestContract", function () {
    async function deployOneYearLockFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const name = "test";
        const symbol = "tst";
        const amount = 10000000000000;
        const decimal = 10;
        const Lock = await ethers.getContractFactory("TestContract");
        const lock = await Lock.deploy(amount, decimal, symbol, name);

        return { lock, owner, otherAccount };
    }

    describe("Init", function(){
        it("Should initial contract right", async function(){
            const { lock } = await loadFixture(
                deployOneYearLockFixture
            );
            
            expect(await lock.name()).to.equal('test');
            expect(await lock.symbol()).to.equal('tst');
            expect(await lock.totalSupply()).to.equal(10000000000000);
            expect(await lock.decimal()).to.equal(10);
        });
    });

    describe("Methods", function () {
        describe("deposit", function(){
        it("should return EtherLessThanRequired", async function (){
            const { lock, owner } = await loadFixture(
                deployOneYearLockFixture
            );

            let val = "1235";

            await expect(lock.deposit(val, {value: 10**7})).to.be.revertedWithCustomError(lock, "EtherLessThanRequired")
            .withArgs(owner, 10**7, 10000000000000);
        });

        it("should return BalanceWouldBeOverflow", async function (){
            const { lock, owner } = await loadFixture(
                deployOneYearLockFixture
            );

            let val = "10000000000001";

            await expect(lock.deposit(val, {value: 10**14})).to.be.revertedWithCustomError(lock, "BalanceWouldBeOverflow")
            .withArgs(owner, 10000000000001, 10000000000000);
        });

        it("should topup balance", async function (){
            const { lock, owner } = await loadFixture(
                deployOneYearLockFixture
            );

            let val = "1000";
            let etherVal = 10**14;
            const tx = lock.deposit(val, {value: etherVal});
            await expect(tx).to.changeEtherBalance(owner, -etherVal);
            await expect(tx).to.changeTokenBalance(lock, owner, val);

            expect(await lock.balanceOf(owner)).to.equal(val);
        });
    });

    describe("transfer", function() {

        it("should return InsufficientBalance", async function (){
            const { lock, owner, otherAccount } = await loadFixture(
                deployOneYearLockFixture
            );

            let val = "1000";

            await expect(lock.transfer(otherAccount, val)).to.be.revertedWithCustomError(lock, "InsufficientBalance")
            .withArgs(owner, 0, val);
        });


        it("should transfer success", async function (){
            const { lock, owner, otherAccount } = await loadFixture(
                deployOneYearLockFixture
            );

            let val = "1000";
            await lock.deposit(val, {value: 10**14});

            await expect(lock.transfer(otherAccount, val)).to.changeTokenBalances(lock, [owner, otherAccount], [-val, val]);
        });
    });

    });
});