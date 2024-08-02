const hre = require("hardhat");
const { ethers } = require("ethers");
const { encryptDataField, decryptNodeResponse } = require("@swisstronik/swisstronik.js");

const sendShieldedTransaction = async (signer, destination, data, value) => {
  const rpclink = hre.network.config.url;
  const [encryptedData] = await encryptDataField(rpclink, data);
  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

const sendShieldedQuery = async (provider, destination, data) => {
  const rpclink = hre.network.config.url;
  const [encryptedData, usedEncryptedKey] = await encryptDataField(rpclink, data);
  const response = await provider.call({
    to: destination,
    data: encryptedData,
  });
  return await decryptNodeResponse(rpclink, response, usedEncryptedKey);
};

async function main() {
  const contractAddress = "0x024796002074dA1Dcd91264f78cF2EdE26CED9f8";
  const [signer] = await hre.ethers.getSigners();

  console.log("Signer address:", signer.address);

  const Rhdz = await hre.ethers.getContractFactory("Rhdz");
  const contract = Rhdz.attach(contractAddress);

  // Проверяем текущее общее предложение токенов
  const totalSupplyData = contract.interface.encodeFunctionData("totalSupply");
  const totalSupplyResponse = await sendShieldedQuery(hre.ethers.provider, contractAddress, totalSupplyData);
  const [totalSupply] = contract.interface.decodeFunctionResult("totalSupply", totalSupplyResponse);
  console.log("Current total supply:", ethers.formatEther(totalSupply), "RHZ");

  // Проверяем баланс подписанта
  const balanceOfData = contract.interface.encodeFunctionData("balanceOf", [signer.address]);
  const balanceResponse = await sendShieldedQuery(hre.ethers.provider, contractAddress, balanceOfData);
  const [signerBalance] = contract.interface.decodeFunctionResult("balanceOf", balanceResponse);
  console.log("Signer balance:", ethers.formatEther(signerBalance), "RHZ");

  // Выполняем дополнительный минтинг
  const amountToMint = ethers.parseEther("1000");  // Минтим 1000 дополнительных токенов
  console.log("Minting additional 1000 RHZ tokens...");
  
  try {
    const mintData = contract.interface.encodeFunctionData("mint", [signer.address, amountToMint]);
    const mintTx = await sendShieldedTransaction(signer, contractAddress, mintData, 0);
    await mintTx.wait();
    console.log("Additional tokens minted. Transaction hash:", mintTx.hash);

    // Проверяем новое общее предложение и баланс после минтинга
    const newTotalSupplyResponse = await sendShieldedQuery(hre.ethers.provider, contractAddress, totalSupplyData);
    const [newTotalSupply] = contract.interface.decodeFunctionResult("totalSupply", newTotalSupplyResponse);
    
    const newBalanceResponse = await sendShieldedQuery(hre.ethers.provider, contractAddress, balanceOfData);
    const [newSignerBalance] = contract.interface.decodeFunctionResult("balanceOf", newBalanceResponse);
    
    console.log("New total supply:", ethers.formatEther(newTotalSupply), "RHZ");
    console.log("New signer balance:", ethers.formatEther(newSignerBalance), "RHZ");
  } catch (error) {
    console.error("Error during minting:", error.message);
    // Проверка владельца контракта
    const ownerData = contract.interface.encodeFunctionData("owner");
    const ownerResponse = await sendShieldedQuery(hre.ethers.provider, contractAddress, ownerData);
    const [owner] = contract.interface.decodeFunctionResult("owner", ownerResponse);
    console.log("Contract owner:", owner);
    console.log("Signer address:", signer.address);
    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
      console.log("The signer is not the current owner of the contract. This may be why minting failed.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });