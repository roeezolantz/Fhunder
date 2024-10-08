import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { CampaignManager } from "../types";

task("task:getTime")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { fhenixjs, ethers, deployments } = hre;

    const CampaignManager = await deployments.get("CampaignManager");

    console.log(`Fetching campaign from contract at: ${CampaignManager.address}`);

    const contract = (await ethers.getContractAt(
      "CampaignManager",
      CampaignManager.address
    )) as unknown as CampaignManager;

    const result = await contract.getTime();

    console.log(`Time: ${result}`);
  });
