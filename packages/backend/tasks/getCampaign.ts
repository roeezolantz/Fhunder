import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { CampaignManager } from "../types";

task("task:getCampaign")
  .addParam("campaignId", "Campaign ID")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { fhenixjs, ethers, deployments } = hre;
    const [signer] = await ethers.getSigners();

    const CampaignManager = await deployments.get("CampaignManager");

    console.log(`Fetching campaign from contract at: ${CampaignManager.address}`);

    const contract = (await ethers.getContractAt(
      "CampaignManager",
      CampaignManager.address
    )) as unknown as CampaignManager;

    const campaignId = parseInt(taskArguments.campaignId);

    const result = await contract.getCampaign(campaignId);

    console.log(`Campaign ${campaignId}:`);
    console.log(`  Name: ${result.name}`);
    console.log(`  Description: ${result.description}`);
    console.log(`  Goal: ${result.goal}`);
    console.log(`  Minimum Contribution: ${result.minimumContribution}`);
    console.log(`  Deadline: ${result.deadline}`);
    console.log(`  Total Contributions: ${result.totalContributions}`);
    console.log(`  Number of Contributors: ${result.numContributors}`);
    console.log(`  Contributons Count: ${result.contributonsCount}`);
    console.log(`  Withdrawn Date: ${result.withdrawnDate}`);
  });
