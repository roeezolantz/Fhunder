import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { CampaignManager } from "../types";

task("task:updateCampaignDescription")
  .addParam("campaignId", "Campaign ID")
  .addParam("newDescription", "New campaign description")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { fhenixjs, ethers, deployments } = hre;
    const [signer] = await ethers.getSigners();

    const CampaignManager = await deployments.get("CampaignManager");

    console.log(`Updating campaign description on contract at: ${CampaignManager.address}`);

    const contract = (await ethers.getContractAt(
      "CampaignManager",
      CampaignManager.address
    )) as unknown as CampaignManager;

    const campaignId = await fhenixjs.encrypt_uint32(parseInt(taskArguments.campaignId));

    const tx = await contract.updateCampaignDescription(campaignId, taskArguments.newDescription);

    console.log(`Transaction hash: ${tx.hash}`);
    await tx.wait();
    console.log("Campaign description updated successfully");
  });