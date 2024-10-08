import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { CampaignManager } from "../types";

task("task:createCampaign")
  .addParam("name", "Campaign name")
  .addParam("description", "Campaign description")
  .addParam("goal", "Campaign goal")
  .addParam("minimumContribution", "Minimum contribution amount")
  .addParam("duration", "Campaign duration till finish")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { fhenixjs, ethers, deployments } = hre;
    const [signer] = await ethers.getSigners();

    const CampaignManager = await deployments.get("CampaignManager");

    console.log(`Creating campaign on contract at: ${CampaignManager.address}`);

    const contract = (await ethers.getContractAt(
      "CampaignManager",
      CampaignManager.address
    )) as unknown as CampaignManager;

    const goal = await fhenixjs.encrypt_uint32(parseInt(taskArguments.goal));
    const minimumContribution = parseInt(taskArguments.minimumContribution);
    const duration = parseInt(taskArguments.duration);

    const tx = await contract.createCampaign(
      taskArguments.name,
      taskArguments.description,
      goal,
      minimumContribution,
      duration
    );

    console.log(`Transaction hash: ${tx.hash}`);
    await tx.wait();
    console.log("Campaign created successfully");
  });