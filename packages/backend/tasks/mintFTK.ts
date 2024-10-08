import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { FhunderToken } from "../types";

task("task:mintFTK", "Mints a large amount of FTK tokens to a specified address")
  .addParam("amount", "The amount of tokens to mint")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { fhenixjs, ethers, deployments } = hre;
    const [signer] = await ethers.getSigners();
    console.log("Trying to get contract deployment with : ", { signer });

    const FhunderToken = await deployments.get("FhunderToken");

    console.log(`Minting with contract at: ${FhunderToken.address}`);

    const contract = await ethers.getContractAt(
      "FhunderToken",
      FhunderToken.address
    )

    const amount = parseInt(taskArgs.amount);

    let contractWithSigner = contract.connect(signer) as unknown as FhunderToken;

    try {
        const eAmount = await fhenixjs.encrypt_uint32(amount);
        const tx = await contractWithSigner.mintEncrypted(signer.address, eAmount, {
            gasLimit: 1000000000,
        });

        console.log(`Transaction hash: ${tx.hash}`);
        // await tx.wait();
        console.log("Minted successfully");
    }
    catch(err) {
      console.error("Error....", err);
    }
  });