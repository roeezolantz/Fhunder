import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { getPermit, SupportedProvider } from "fhenixjs";
import useFhenix from "~~/hooks/fhenix/useFhenix";
import FhunderTokenABI from "../../../backend/deployments/localfhenix/FhunderToken.json";

export const FhunderBalance = () => {
  const [balance, setBalance] = useState<string>("0");
  const { address } = useAccount();
  const { fhenixProvider, fhenixClient } = useFhenix();

  useEffect(() => {
    const fetchBalance = async () => {
      if (address && fhenixProvider && fhenixClient) {
        const contract = new ethers.Contract(
          FhunderTokenABI.address,
          FhunderTokenABI.abi,
          fhenixProvider
        );
        
        try {
          const permit = await getPermit(FhunderTokenABI.address, fhenixProvider as SupportedProvider);
          await fhenixClient?.storePermit(permit!);
          const balanceEncrypted = await contract.balanceOfEncrypted(address, fhenixClient?.extractPermitPermission(permit!));
          const unsealed = await fhenixClient?.unseal(FhunderTokenABI.address, balanceEncrypted);

          setBalance(unsealed?.toString() ?? "0");
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 5000);

    return () => clearInterval(interval);
  }, [address, fhenixProvider, fhenixClient]);

  if (!address) return null;

  return (
    <div className="btn btn-sm btn-ghost flex flex-col font-normal items-center hover:bg-transparent">
      <span>{parseFloat(balance).toFixed(4)}</span>
      <span className="text-[0.8em] font-bold">FTK</span>
    </div>
  );
};