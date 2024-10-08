import { BrowserProvider, Eip1193Provider, ethers, JsonRpcProvider, JsonRpcSigner } from "ethers";
import { FhenixClient } from "fhenixjs";
import { useEffect, useRef } from "react";
import CampaignManager from "../../../backend/deployments/localfhenix/CampaignManager.json";
import FhunderToken from "../../../backend/deployments/localfhenix/FhunderToken.json";
import FhunderNft from "../../../backend/deployments/localfhenix/FhunderNFT.json";

const useFhenix = () => {
  const fhenixProvider = useRef<JsonRpcProvider | BrowserProvider>();
  const fhenixClient = useRef<FhenixClient>();
  const tokenContract = useRef<ethers.Contract | null>(null);
  const campaignManagerContract = useRef<ethers.Contract | null>(null);
  const nftContract = useRef<ethers.Contract | null>(null);
  const campaignManagerContractView = useRef<ethers.Contract | null>(null);
  const nftContractView = useRef<ethers.Contract | null>(null);
  const tokenContractView = useRef<ethers.Contract | null>(null);
  const signer = useRef<JsonRpcSigner | null>(null);
  const address = useRef<string | null>(null);
  const account = useRef(null);

  const initFhenixProvider = async () => {
    if (fhenixProvider.current != null) {
      return fhenixProvider.current;
    }

    // Initialize the provider.
    // @todo: Find a way not to use ethers.BrowserProvider because we already have viem and wagmi here.
    const provider = new BrowserProvider(window.ethereum as Eip1193Provider);
    fhenixProvider.current = provider;
    const tempSigner = await provider.getSigner();
    signer.current = tempSigner;
    address.current = await tempSigner.getAddress();

    // fhenixProvider.current = new JsonRpcProvider(connectedChain?.rpcUrls.default.http[0]);
  };

  const initFhenixClient = () => {
    if (fhenixClient.current != null) {
      return fhenixClient.current;
    }

    initFhenixProvider();

    fhenixClient.current = new FhenixClient({ provider: fhenixProvider.current });
  };

  const initContracts = async () => {
    campaignManagerContract.current = new ethers.Contract(
      CampaignManager.address,
      CampaignManager.abi,
      signer.current
    )

    campaignManagerContractView.current = new ethers.Contract(
      CampaignManager.address,
      CampaignManager.abi,
      fhenixProvider.current
    )

    tokenContract.current = new ethers.Contract(
      FhunderToken.address,
      FhunderToken.abi,
      signer.current
    )

    tokenContractView.current = new ethers.Contract(
      FhunderToken.address,
      FhunderToken.abi,
      fhenixProvider.current
    )

    nftContract.current = new ethers.Contract(
      FhunderNft.address,
      FhunderNft.abi,
      signer.current)

    nftContractView.current = new ethers.Contract(
      FhunderNft.address,
      FhunderNft.abi,
      fhenixProvider.current
    )

    await campaignManagerContract.current.waitForDeployment();
    await tokenContract.current.waitForDeployment();
    await nftContract.current.waitForDeployment();
    await campaignManagerContractView.current.waitForDeployment();
    await tokenContractView.current.waitForDeployment();
    await nftContractView.current.waitForDeployment();
  }

  useEffect(() => {
    const initAll = async () => { 
      await initFhenixProvider();
      await initFhenixClient();
      await initContracts();
    }
    initAll();
  }, []);

  return {
    fhenixClient: fhenixClient.current,
    fhenixProvider: fhenixProvider.current,
    signer: signer.current,
    address: address.current,
    account: account.current,
    tokenContract: tokenContract.current,
    campaignManagerContract: campaignManagerContract.current,
    nftContract: nftContract.current,
    campaignManagerContractView: campaignManagerContractView.current,
    nftContractView: nftContractView.current,
    tokenContractView: tokenContractView.current,
  };
};

export default useFhenix;
