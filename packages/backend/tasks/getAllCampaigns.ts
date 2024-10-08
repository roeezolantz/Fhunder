import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { CampaignManager } from "../types";

task("task:getAllCampaigns")
  .addOptionalParam("batchSize", "Number of campaigns to fetch per batch", "10")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { fhenixjs, ethers, deployments } = hre;
    const [signer] = await ethers.getSigners();

    const CampaignManager = await deployments.get("CampaignManager");

    console.log(`Fetching all campaigns from contract at: ${CampaignManager.address}`);

    const contract = (await ethers.getContractAt(
      "CampaignManager",
      CampaignManager.address
    )) as unknown as CampaignManager;

    const batchSize = parseInt(taskArguments.batchSize);
    const campaignCounter = await contract.campaignCounter();

    for (let start = 0; start < campaignCounter; start += batchSize) {
      const result = await contract.getCampaignsBatch(start, batchSize);

      for (let i = 0; i < result.campaignIds.length; i++) {
        console.log(`Campaign ${result.campaignIds[i]}:`);
        console.log(`  Name: ${result.names[i]}`);
        console.log(`  Description: ${result.descriptions[i]}`);
        console.log(`  Goal: ${result.goals[i]}`);
        console.log(`  Minimum Contribution: ${result.minimumContributions[i]}`);
        console.log(`  Deadline: ${result.deadlines[i]}`);
        console.log();
      }
    }
  });