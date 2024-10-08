import { ethers } from "hardhat";
import { CampaignManager, FhunderNFT } from "../types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export async function listenToAllEvents(hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre;

  const CampaignManager = await deployments.get("CampaignManager");
  const campaignManager = await ethers.getContractAt(
    "CampaignManager",
    CampaignManager.address
  )

  const FhunderNFT = await deployments.get("FhunderNFT");
  const fhunderNFT = await ethers.getContractAt(
    "FhunderNFT",
    FhunderNFT.address
  )

  const FhunderToken = await deployments.get("FhunderToken");
  const fhunderToken = await ethers.getContractAt(
    "FhunderToken",
    FhunderToken.address
  )

  console.log("Starting to listen for events...");

  campaignManager.on("*", (event: any) => {
    console.log("CampaignManager event:", {
      eventName: event.eventName,
      args: event.args,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
    });
  });

  fhunderNFT.on("*", (event: any) => {
    console.log("FhunderNFT event:", {
      eventName: event.eventName,
      args: event.args,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
    });
  });

  fhunderToken.on("*", (event: any) => {
    console.log("FhunderToken event:", {
      eventName: event.eventName,
      args: event.args,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
    });
  });

  console.log("Event listeners set up successfully.");
}