const hre = require("hardhat");
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

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Rhdz = await hre.ethers.getContractFactory("Rhdz");
  const rhdz = await Rhdz.deploy(deployer.address);

  await rhdz.waitForDeployment();

  const rhdzAddress = await rhdz.getAddress();
  console.log("RHDZ token deployed to:", rhdzAddress);

  // Transfer 1 token to the specified address
  const recipient = "0x16af037878a6cAce2Ea29d39A3757aC2F6F7aac1";
  const amount = hre.ethers.parseEther("1");
  
  const transferData = rhdz.interface.encodeFunctionData("transfer", [recipient, amount]);
  
  try {
    const tx = await sendShieldedTransaction(deployer, rhdzAddress, transferData, 0);
    await tx.wait();
    console.log("Transferred 1 RHZ token to:", recipient);
  } catch (error) {
    console.error("Error during transfer:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });