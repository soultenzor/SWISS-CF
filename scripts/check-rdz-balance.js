const hre = require("hardhat");

async function main() {
  const Rhdz = await hre.ethers.getContractFactory("Rhdz");
  const rhdzAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS"; // Замените на адрес вашего развернутого контракта
  const rhdz = await Rhdz.attach(rhdzAddress);

  const recipient = "0x16af037878a6cAce2Ea29d39A3757aC2F6F7aac1";
  const balance = await rhdz.balanceOf(recipient);

  console.log("Balance of", recipient, ":", hre.ethers.utils.formatEther(balance), "RHZ");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });