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
  const rhdzAddress = "0x024796002074dA1Dcd91264f78cF2EdE26CED9f8";
  const Rhdz = await hre.ethers.getContractFactory("Rhdz");
  const rhdz = Rhdz.attach(rhdzAddress);

  const recipient = "0x16af037878a6cAce2Ea29d39A3757aC2F6F7aac1";
  
  const balanceData = rhdz.interface.encodeFunctionData("balanceOf", [recipient]);
  
  try {
    const responseBalance = await sendShieldedQuery(hre.ethers.provider, rhdzAddress, balanceData);
    const decodedBalance = rhdz.interface.decodeFunctionResult("balanceOf", responseBalance);
    const balance = decodedBalance[0];
    console.log("Balance of", recipient, ":", hre.ethers.formatEther(balance), "RHZ");
  } catch (error) {
    console.error("Error checking balance:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });