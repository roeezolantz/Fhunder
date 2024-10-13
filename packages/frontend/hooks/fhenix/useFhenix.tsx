import { BrowserProvider, Eip1193Provider, ethers, JsonRpcProvider, JsonRpcSigner } from "ethers";
import { FhenixClient, generatePermit, getPermit, SupportedProvider } from "fhenixjs";
import { useEffect, useRef, useState } from "react";
import CampaignManager from "../../../backend/deployments/localfhenix/CampaignManager.json";
import FhunderToken from "../../../backend/deployments/localfhenix/FhunderToken.json";
import FhunderNft from "../../../backend/deployments/localfhenix/FhunderNFT.json";
import { useTargetNetwork } from "../scaffold-eth/useTargetNetwork";

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
  const { targetNetwork } = useTargetNetwork();
  const [campaignManagerContractState, setCampaignManagerContractState] = useState<ethers.Contract | null>(campaignManagerContract.current);
  const [tokenContractState, setTokenContractState] = useState<ethers.Contract | null>(tokenContract.current);
  const [nftContractState, setNftContractState] = useState<ethers.Contract | null>(nftContract.current);
  const [addressState, setAddressState] = useState<string | null>(address.current);
  const [accountState, setAccountState] = useState<any>(null);
  const [signerState, setSignerState] = useState<JsonRpcSigner | null>(signer.current);
  const [fhenixClientState, setFhenixClientState] = useState<FhenixClient | null>(fhenixClient.current ?? null);
  const [fhenixProviderState, setFhenixProviderState] = useState<JsonRpcProvider | BrowserProvider | null>(fhenixProvider.current ?? null);
  const [campaignManagerContractViewState, setCampaignManagerContractViewState] = useState<ethers.Contract | null>(campaignManagerContractView.current ?? null);
  const initFhenixClient = async () => {
    if (fhenixClient.current != null) {
      return fhenixClient.current;
    }

    // Initialize the provider.
    // @todo: Find a way not to use ethers.BrowserProvider because we already have viem and wagmi here.
    let browserProvider: BrowserProvider;
    // const jsonRpcProvider = new JsonRpcProvider(targetNetwork.rpcUrls.default.http[0]);
    if (fhenixProvider.current == null) {
      fhenixProvider.current = new BrowserProvider(window.ethereum as Eip1193Provider);
      setFhenixProviderState(fhenixProvider.current);
    }

    const tempSigner = await fhenixProvider.current.getSigner();
    signer.current = tempSigner;
    setSignerState(signer.current);

    address.current = await tempSigner.getAddress();
    setAddressState(address.current);

    fhenixClient.current = new FhenixClient({ provider: fhenixProvider.current as SupportedProvider });
    setFhenixClientState(fhenixClient.current);

    // const campaignManagerPermit = await generatePermit(CampaignManager.address, fhenixProvider.current as SupportedProvider);
    // fhenixClient.current.storePermit(campaignManagerPermit!);

    // const tokenPermit = await generatePermit(FhunderToken.address, fhenixProvider.current as SupportedProvider);
    // fhenixClient.current.storePermit(tokenPermit!);

    // const nftPermit = await generatePermit(FhunderNft.address, fhenixProvider.current as SupportedProvider);
    // fhenixClient.current.storePermit(nftPermit!);
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
      new BrowserProvider(window.ethereum as Eip1193Provider)
    )

    tokenContract.current = new ethers.Contract(
      FhunderToken.address,
      FhunderToken.abi,
      signer.current
    )

    // tokenContractView.current = new ethers.Contract(
    //   FhunderToken.address,
    //   FhunderToken.abi,
    //   fhenixProvider.current
    // )

    nftContract.current = new ethers.Contract(
      FhunderNft.address,
      FhunderNft.abi,
      signer.current)

    // nftContractView.current = new ethers.Contract(
    //   FhunderNft.address,
    //   FhunderNft.abi,
    //   fhenixProvider.current
    // )

    const code = await campaignManagerContract.current.getDeployedCode();
    if (!code || !code.length) {
      await campaignManagerContract.current.waitForDeployment();
    }
    setCampaignManagerContractState(campaignManagerContract.current);

    const tokenCode = await tokenContract.current.getDeployedCode();
    if (!tokenCode || !tokenCode.length) {
      await tokenContract.current.waitForDeployment();
    }
    setTokenContractState(tokenContract.current);

    const nftCode = await nftContract.current.getDeployedCode();
    if (!nftCode || !nftCode.length) {
      await nftContract.current.waitForDeployment();
    }
    setNftContractState(nftContract.current);

    const campaignManagerViewCode = await campaignManagerContractView.current.getDeployedCode();
    if (!campaignManagerViewCode || !campaignManagerViewCode.length) {
      await campaignManagerContractView.current.waitForDeployment();
    }
    setCampaignManagerContractViewState(campaignManagerContractView.current);

    // await tokenContractView.current.waitForDeployment();
    // await nftContractView.current.waitForDeployment();
  }

  useEffect(() => {
    console.log("[useFhenix] Initializing Fhenix client and contracts");
    const initAll = async () => { 
      await initFhenixClient();
      await initContracts();
    }
    initAll();
  }, []);

  return {
    fhenixClient: fhenixClientState,
    fhenixProvider: fhenixProviderState,
    signer: signerState,
    address: addressState,
    account: accountState,
    tokenContract: tokenContractState,
    campaignManagerContract: campaignManagerContractState,
    nftContract: nftContractState,
    campaignManagerContractView: campaignManagerContractViewState,
    // nftContractView: nftContractView.current,
    // tokenContractView: tokenContractView.current,
  };
};

export default useFhenix;
