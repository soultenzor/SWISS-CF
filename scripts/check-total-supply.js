const hre = require("hardhat");
const { encryptDataField, decryptNodeResponse } = require("@swisstronik/swisstronik.js");

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
  const [deployer] = await hre.ethers.getSigners();
  const rhdzAddress = "0x024796002074dA1Dcd91264f78cF2EdE26CED9f8";
  const Rhdz = await hre.ethers.getContractFactory("Rhdz");
  const rhdz = Rhdz.attach(rhdzAddress);

  try {
    // Проверка общего предложения токенов
    const totalSupplyData = rhdz.interface.encodeFunctionData("totalSupply");
    const responseTotalSupply = await sendShieldedQuery(hre.ethers.provider, rhdzAddress, totalSupplyData);
    const decodedTotalSupply = rhdz.interface.decodeFunctionResult("totalSupply", responseTotalSupply);
    const totalSupply = decodedTotalSupply[0];
    
    console.log("Total Supply:", hre.ethers.formatEther(totalSupply), "RHZ");

    // Проверка баланса адреса, развернувшего контракт
    const balanceData = rhdz.interface.encodeFunctionData("balanceOf", [deployer.address]);
    const responseBalance = await sendShieldedQuery(hre.ethers.provider, rhdzAddress, balanceData);
    const decodedBalance = rhdz.interface.decodeFunctionResult("balanceOf", responseBalance);
    const deployerBalance = decodedBalance[0];
    
    console.log("Deployer Address:", deployer.address);
    console.log("Deployer Balance:", hre.ethers.formatEther(deployerBalance), "RHZ");

  } catch (error) {
    console.error("Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });