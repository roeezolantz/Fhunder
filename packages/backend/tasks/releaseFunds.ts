import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { CampaignManager, FhunderToken } from "../types";

task("task:releaseFunds")
  .addParam("campaignId", "Campaign ID")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { fhenixjs, ethers, deployments } = hre;
    const [signer] = await ethers.getSigners();
    console.log("Trying to get contract deployment with : ", { signer });

    const CampaignManager = await deployments.get("CampaignManager");

    console.log(`Releasing funds from campaign on contract at: ${CampaignManager.address}`);

    const contract = await ethers.getContractAt(
      "CampaignManager",
      CampaignManager.address
    )

    const campaignId = parseInt(taskArguments.campaignId);

    let contractWithSigner = contract.connect(signer) as unknown as CampaignManager;
    try {
      console.log("releasing funds...");
      const tx = await contractWithSigner.releaseFunds(campaignId, {
        gasLimit: 1000000000,
      });
      console.log(`Transaction hash: ${tx.hash}`);
      // await tx.wait();
      console.log("Release successful");
    }
    catch(err) {
      console.error("Error....", err);
    }
  });