import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
// import { FhenixClient, getPermit } from 'fhenixjs';
// import { JsonRpcProvider } from 'ethers';
import { FhunderToken } from "../types";

task("task:getFTK", "Gets the FTK balance of the given address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { fhenixjs, ethers, deployments } = hre;
    const [signer] = await ethers.getSigners();

    const FhunderToken = await deployments.get("FhunderToken");
    console.log(`FhunderToken address: ${FhunderToken.address}`)
    // const permit = await hre.fhenixjs.createPermit(FhunderToken.address)
    // console.log(`Permit: ${permit}`)
    // fhenixjs.storePermit(permit!);
    // console.log(`Permit stored`)

    // const permission = fhenixjs.extractPermitPermission(permit!);
    // console.log(`Permission: ${permission}`)
    const contract = await ethers.getContractAt(
      "FhunderToken",
      FhunderToken.address
    )
    // let contractWithSigner = contract.connect(signer) as unknown as FhunderToken;
    const response = await contract.decryptedBalanceOf()

    // const plaintext = fhenixjs.unseal(FhunderToken.address, response.toString());

    console.log(`My Balance: ${response}`)
  });