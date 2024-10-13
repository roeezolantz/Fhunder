import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "ethers";
import { listenToAllEvents } from "../tasks/eventListener";

const generateData: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();

  console.log("Trying to listen for events...");
  await listenToAllEvents(hre);

  // Get the deployed contract
  const CampaignManager = await hre.deployments.get('CampaignManager');
  const signer = await hre.ethers.getSigner(deployer); // Get the signer for the deployer
  const campaignManager = new ethers.Contract(CampaignManager.address, CampaignManager.abi, signer);

  // const FhunderToken = await hre.deployments.get('FhunderToken');
  // const fhunderToken = new ethers.Contract(FhunderToken.address, FhunderToken.abi, signer);

  // const encryptedAmount = await hre.fhenixjs.encrypt_uint32(150);
  // await fhunderToken.mintEncrypted(deployer, encryptedAmount);
  // console.log(`Minted tons of FTK to ${deployer}`);

  const goal = await hre.fhenixjs.encrypt_uint32(100);
  const minimumContribution = 50;
  const duration = 600;

  // wait 10 seconds
  console.log("Waiting for 10 seconds for you to get the server up...");
  await new Promise((resolve) => setTimeout(resolve, 10000));

  const tx = await campaignManager.createCampaign(
    "wowzekampein",
    "what a campaign!!!!!",
    goal,
    minimumContribution,
    duration
  );

  console.log(`Transaction hash: ${tx.hash}`);
  await tx.wait();
  console.log("Campaign created successfully");
  console.log("Waiting for events...");

  // Keep the script running
  await new Promise(() => {});

  console.log("Done!");
};

export default generateData;

generateData.tags = ["generateData"];
generateData.runAtTheEnd = true;