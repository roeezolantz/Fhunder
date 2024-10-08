import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { CampaignManager } from "../types";

task("task:decryptTotalContributions")
  .addParam("campaignId", "Campaign ID")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { fhenixjs, ethers, deployments } = hre;
    const [signer] = await ethers.getSigners();

    const CampaignManager = await deployments.get("CampaignManager");

    console.log(`Decrypting total contributions for campaign on contract at: ${CampaignManager.address}`);

    const contract = (await ethers.getContractAt(
      "CampaignManager",
      CampaignManager.address
    )) as unknown as CampaignManager;

    const campaignId = await fhenixjs.encrypt_uint32(parseInt(taskArguments.campaignId));

    const result = await contract.decryptTotalContributions(campaignId);

    console.log(`Total contributions: ${result.toString()}`);
  });