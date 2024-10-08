import { task } from "hardhat/config";

task("task:checkNFTOwnership", "Checks NFT ownership for an address")
  .addParam("address", "The address to check")
  .addOptionalParam("tokenId", "The token ID to check")
  .setAction(async (taskArgs, hre) => {
    const { deployments, ethers } = hre;
    const { address, tokenId } = taskArgs;

    const FhunderNFT = await deployments.get("FhunderNFT");
    const fhunderNFT = await ethers.getContractAt(
      "FhunderNFT",
      FhunderNFT.address
    )

    console.log("FhunderNFT deployed to:", FhunderNFT.address);
  
    try {
        const counter = await fhunderNFT.getCounter();
        console.log(`Total counter is: ${counter}`);
      
        const balance = await fhunderNFT.balanceOf(address);
        console.log(`NFT balance of address ${address} is: ${balance}`);

    } catch (error) {
        console.error("Error checking NFT ownership:", error);
    }
  });