import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { CampaignManager } from "../types";

task("task:getCampaignCounter")
  .setAction(async function (_taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const CampaignManager = await deployments.get("CampaignManager");

    console.log(`Getting campaign counter from contract at: ${CampaignManager.address}`);

    const contract = (await ethers.getContractAt(
      "CampaignManager",
      CampaignManager.address
    )) as unknown as CampaignManager;

    const counter = await contract.campaignCounter();

    console.log(`Current campaign counter: ${counter}`);
  });