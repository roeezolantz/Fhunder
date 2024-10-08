import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { listenToAllEvents } from "../tasks/eventListener";

enum Color {
  Blue = "\x1b[44m",
  Green = "\x1b[42m",
  Yellow = "\x1b[43m",
  Red = "\x1b[41m",
  Reset = "\x1b[0m",
}

Object.assign(console, {
  blue: (message: string) => console.log(`${Color.Blue}${message}${Color.Reset}`),
  green: (message: string) => console.log(`${Color.Green}${message}${Color.Reset}`),
  yellow: (message: string) => console.log(`${Color.Yellow}${message}${Color.Reset}`),
  red: (message: string) => console.log(`${Color.Red}${message}${Color.Reset}`),
});

const colorLog = (message: string, color: Color) => {
  console.log(`${color}${message}${Color.Reset}`);
};

const deployCampaignManager: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Fund the account before deploying if on localfhenix network
  if (hre.network.name === "localfhenix") {
    const signers = await hre.ethers.getSigners();

    if ((await hre.ethers.provider.getBalance(signers[0].address)).toString() === "0") {
      await hre.fhenixjs.getFunds(signers[0].address);
      console.log("Received tokens from the local faucet. Ready to deploy...");
    }
  }

  const baseTokenURI = "https://cdn.openart.ai/uploads/image_neTE8YKU_1727168204579_raw.jpg";

  // Deploy the FhunderNFT contract with the initialOwner parameter
  const nftResult = await deploy("FhunderNFT", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.green(`[DEPLOY] FhunderNFT deployed to ${nftResult.address}`);

  const fhunderTokenResult = await deploy("FhunderToken", {
    from: deployer,
    args: ["FhunderToken", "FTK", 18, deployer],
    log: true,
    autoMine: true,
  });

  console.green(`[DEPLOY] FhunderToken deployed to ${fhunderTokenResult.address}`);

  // Deploy the CampaignManager contract with the address of the FhunderNFT contract
  const managerResult = await deploy("CampaignManager", {
    from: deployer,
    args: [nftResult.address, fhunderTokenResult.address],
    log: true,
    autoMine: true,
  });

  console.green(`[DEPLOY] CampaignManager deployed to ${managerResult.address}`, Color.Green);

  // Get the deployed contract
  const campaignManager = await hre.ethers.getContractAt("CampaignManager", managerResult.address);

  // Log the initial campaign counter
  const initialCounter = await campaignManager.campaignCounter();
  console.log(`Initial campaign counter: ${initialCounter}`);

  console.log("Trying to listen for events...");
  await listenToAllEvents(hre);

  // Mint FTK to the deployer
  const fhunderToken = await hre.ethers.getContractAt("FhunderToken", fhunderTokenResult.address);
  const encryptedAmount = await hre.fhenixjs.encrypt_uint32(150);;
  await fhunderToken.mintEncrypted(deployer, encryptedAmount);
  console.log(`Minted tons of FTK to ${deployer}`);

  const goal = await hre.fhenixjs.encrypt_uint128(BigInt(100));
  const minimumContribution = 50;
  const duration = 50;

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

  // Keep the script running
  await new Promise(() => {});
};

export default deployCampaignManager;

deployCampaignManager.tags = ["CampaignManager"];