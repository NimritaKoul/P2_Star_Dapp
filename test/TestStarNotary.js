const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests
it('can add the star name and star symbol properly', async () => {
    let instance = await StarNotary.deployed();
    let starId = 6
    await instance.createStar('Star6', starId, { from: accounts[0] });
    assert.equal(await instance.symbol(), 'NS6');
    assert.equal(await instance.name(), 'NimritaStar6');
});

it('lookUptokenIdToStarInfo test', async () => {
    let instance = await StarNotary.deployed();
    let  starId = 7;
    await instance.createStar('Star7', starId, { from: accounts[0] })
    assert.equal(await instance.lookUptokenIdToStarInfo(starId), 'Star7');
});

it('lets 2 users exchange stars', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];

    let starId = 8;
    await instance.createStar('Star8', starId1, { from: user1 });

    const starId2 = 9;
    await instance.createStar('Star9', starId2, { from: user2 });

    assert.equal(await instance.ownerOf.call(starId1), user1); //Make sure stars are owned by different users
    assert.equal(await instance.ownerOf.call(starId2), user2);

    await instance.exchangeStars(starId1, starId2, { from: user1 });//Change owners
    
    assert.equal(await instance.ownerOf.call(starId1), user2); //Make sue the owners are changed
    assert.equal(await instance.ownerOf.call(starId2), user1);

});

it('lets a user transfer a star', async () => {
    
    let instance = await StarNotary.deployed();
    let starId = 10;
    let user1 = accounts[1];
    let user2 = accounts[2];
    await instance.createStar('Star10', starId, { from: user1 });//create a new star by user1

    assert.equal(await instance.ownerOf.call(starId), user1); //MAke sure the user1 and not user2 is the owner of staId
    assert.notEqual(await instance.ownerOf.call(starId), user2);

    await instance.transferStar(user2, starId, { from: user1 });//Transfer ownership of starId from user 1 to user2

    assert.notEqual(await instance.ownerOf.call(starId), user1); //Make sure that the ownership of starId is changed from user1 to user2
    assert.equal(await instance.ownerOf.call(starId), user2);
});

