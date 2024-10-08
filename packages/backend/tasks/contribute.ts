import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { CampaignManager, FhunderToken } from "../types";

task("task:contribute")
  .addParam("campaignId", "Campaign ID")
  .addParam("amount", "Contribution amount")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { fhenixjs, ethers, deployments } = hre;
    const [signer] = await ethers.getSigners();
    console.log("Trying to get contract deployment with : ", { signer });

    const CampaignManager = await deployments.get("CampaignManager");
    const FhunderToken = await deployments.get("FhunderToken");

    console.log(`Contributing to campaign on contract at: ${CampaignManager.address}`);

    const contract = await ethers.getContractAt(
      "CampaignManager",
      CampaignManager.address
    )

    const tokenContract = await ethers.getContractAt("FhunderToken", FhunderToken.address);

    const campaignId = parseInt(taskArguments.campaignId);
    console.log("Encrypting amount : ", taskArguments.amount)
    const amount = await fhenixjs.encrypt_uint128(BigInt(parseInt(taskArguments.amount)));

    let contractWithSigner = contract.connect(signer) as unknown as CampaignManager;
    // let tokenContractWithSigner = tokenContract.connect(signer) as unknown as FhunderToken;
    try {
      console.log("Approving token contract for campaign manager..");
      await tokenContract.approveEncrypted(CampaignManager.address, amount, {
        gasLimit: 1000000000,
      });
      console.log("Approved");
      console.log("Contributing...");
      const tx = await contractWithSigner.contribute(campaignId, amount, {
        gasLimit: 1000000000,
      });
      console.log(`Transaction hash: ${tx.hash}`);
      // await tx.wait();
      console.log("Contribution made successfully");
    }
    catch(err) {
      console.error("Error....", err);
    }
  });