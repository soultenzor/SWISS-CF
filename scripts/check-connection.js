const hre = require("hardhat");
const { ethers } = require("ethers");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  console.log("Signer address:", signer.address);

  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log("Balance:", ethers.formatEther(balance), "SWTR");

  const blockNumber = await hre.ethers.provider.getBlockNumber();
  console.log("Current block number:", blockNumber);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Error:", error);
    process.exit(1);
  });