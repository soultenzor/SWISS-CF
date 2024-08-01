const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Rhdz = await hre.ethers.getContractFactory("Rhdz");
  const rhdz = await Rhdz.deploy(deployer.address);

  await rhdz.deployed();

  console.log("RHDZ token deployed to:", rhdz.address);

  // Transfer 1 token to the specified address
  const recipient = "0x16af037878a6cAce2Ea29d39A3757aC2F6F7aac1";
  await rhdz.transfer(recipient, hre.ethers.utils.parseEther("1"));
  console.log("Transferred 1 RHZ token to:", recipient);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });