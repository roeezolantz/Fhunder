"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import useFhenix from '~~/hooks/fhenix/useFhenix';
import { notification } from '~~/utils/scaffold-eth';
import { fhenixjs } from 'fhenixjs';
import { ethers } from 'ethers';

interface Campaign {
  id: string;
  creator: string;
  name: string;
  description: string;
  goal: number;
  minimumContribution: number;
  deadline: number;
  image: string;
  totalContributions: number;
  withdrawnDate: number;
  numContributors: number;
  contributionsCount: number;
  leftToWithdraw: number;
}

function base64ToHex(str: string) {
    // Decode the base64 string to a binary string
    const binaryStr = atob(str);

    // Convert the binary string to a hexadecimal string
    let hexStr = '';
    for (let i = 0; i < binaryStr.length; i++) {
        const hex = binaryStr.charCodeAt(i).toString(16);
        hexStr += hex.padStart(2, '0');
    }
    return hexStr;
}

function toString(str: string) {
    return str.split('').map(char => {
        const s = char.charCodeAt(0).toString();
        return s;
    }).join('');  
}

// Convert the decrypted string to a byte array
function stringToByteArray(str: string) {
  let byteArray = new Uint8Array(str.length);

  for (let i = 0; i < str.length; i++) {
    byteArray[i] = str.charCodeAt(i) & 0xFF; // Get the byte value for each character
  }

  return byteArray;
}

// Extract a uint32 from the byte array
function extractUint32(byteArray: Uint8Array, startIndex: number) {
  // Create a buffer to hold the 4 bytes
  let buffer = new ArrayBuffer(4);
  let dataView = new DataView(buffer);

  // Set the bytes in the DataView from the byte array
  for (let i = 0; i < 4; i++) {
    dataView.setUint8(i, byteArray[startIndex + i]);
  }

  // Assuming little-endian; change to false if big-endian
  return dataView.getUint32(0, true); 
}

// Main parsing function
const parseConcatenatedSealedValue = (decryptedValue: string) => {
  const byteArray = stringToByteArray(decryptedValue);

  // Debugging: Log the byte array
  console.log("Byte array:", byteArray);

  // Extract the uint32 values
  const goal = extractUint32(byteArray, 0);
  const totalContributions = extractUint32(byteArray, 4);
  const numContributors = extractUint32(byteArray, 8);
  const contributionsCount = extractUint32(byteArray, 12);

  // Log the extracted values
  console.log({ goal, totalContributions, numContributors, contributionsCount });

  return { goal, totalContributions, numContributors, contributionsCount };
};

const MyCampaigns = () => {
  const [myCampaigns, setMyCampaigns] = useState<Campaign[]>([]);
  const [decryptedCampaignsData, setDecryptedCampaignsData] = useState<Record<string, Campaign>>({});
  const [visibleCampaigns, setVisibleCampaigns] = useState<Record<string, boolean>>({});
  const { address } = useAccount();
  const { campaignManagerContract, campaignManagerContractView, fhenixProvider, fhenixClient } = useFhenix();

  useEffect(() => {
    if (address && campaignManagerContract) {
        console.log("[MyCampaigns] Fetching my campaigns");
      fetchMyCampaigns();
    } else {
        console.log("[MyCampaigns] No address or contracts");
    }
  }, [address, campaignManagerContract]);

  useEffect(() => {
    console.log({ decryptedCampaignsData });
  }, [decryptedCampaignsData]);

  const fetchRealData = async (campaignId: string) => {
    try {
        const accounts = await window?.ethereum?.request({ method: 'eth_requestAccounts' });
        const keyResult = await fhenixProvider?.send('eth_getEncryptionPublicKey',[accounts?.[0]]);
        const pk = `0x${base64ToHex(keyResult)}`;
        const campaignData = await campaignManagerContract?.getMyCampaign(campaignId, pk);
        const [creator, name, description, minimumContribution, deadline, withdrawnDate, sealedValue, leftToWithdraw] = campaignData;

        const rawDecryptedValue = await fhenixProvider?.send('eth_decrypt', [sealedValue, accounts?.[0]]);
        const { goal, totalContributions, numContributors, contributionsCount } = parseConcatenatedSealedValue(rawDecryptedValue);
        return { 
          creator, 
          name, 
          description, 
          minimumContribution, 
          deadline, 
          withdrawnDate, 
          goal, 
          totalContributions, 
          numContributors, 
          contributionsCount,
          leftToWithdraw
        };
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        notification.error('Failed to fetch campaigns!!!');
    }
  }

  const fetchMyCampaigns = async () => {
    if (!address || !campaignManagerContract) return;

    try {
      const response = await axios.get(`http://localhost:3000/campaigns/user/${address}`);
      setMyCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      notification.error('Failed to fetch campaigns');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const text = date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '');
    
    if (isCampaignEnded(timestamp)) {
      return `${text} (Ended)`;
    }
    return text;
  };

  const isCampaignEnded = (deadline: number) => {
    const date = new Date(deadline * 1000);
    return date < new Date()
  };

  const handleWithdraw = async (campaignId: string) => {
    if (!campaignManagerContract) return;

    try {
      const tx = await campaignManagerContract.withdraw(campaignId);
      await tx.wait();
      notification.success('Funds withdrawn successfully');
      
      setDecryptedCampaignsData((prev) => {
        const newState = { ...prev };
        delete newState[campaignId];
        return newState;
      });
      fetchMyCampaigns();
    } catch (error: any) {
      notification.error(`Failed to withdraw funds: ${error?.reason || 'Unknown error'}`);
      console.error('Error withdrawing funds:', error);
    }
  };

  const decryptCampaign = async (campaignId: string) => {
    // Toggle the visibility of the campaign
    setVisibleCampaigns((prev) => ({ ...prev, [campaignId]: !prev[campaignId] }));

    try {
      if (decryptedCampaignsData[campaignId]) {
        return;
      }

      // Fetch the real data for the campaign in the first time only
      const campaignData = await fetchRealData(campaignId);
      const {
        creator = '', 
        name = '', 
        description = '', 
        minimumContribution = 0, 
        deadline = 0, 
        withdrawnDate = 0, 
        goal = 0, 
        totalContributions = 0, 
        numContributors = 0, 
        contributionsCount = 0,
        leftToWithdraw = 0
      } = campaignData || {};
      setDecryptedCampaignsData((prev) => ({ 
        ...prev, 
        [campaignId]: {
          id: campaignId, 
          creator, 
          name, 
          description, 
          minimumContribution, 
          deadline, 
          withdrawnDate, 
          goal, 
          totalContributions, 
          numContributors, 
          contributionsCount,
          image: '',
          leftToWithdraw
        } as Campaign
      }));
    } catch (error) {
      console.error('Error decrypting campaign data:', error);
      notification.error('Failed to decrypt campaign data');
    }
  }

  const getWithdrawnDate = (campaign: Campaign) => {
    if (campaign.withdrawnDate) {
      return campaign.withdrawnDate / 1000;
    } else if (decryptedCampaignsData[campaign.id]?.withdrawnDate) {
      return decryptedCampaignsData[campaign.id]?.withdrawnDate;
    }
    return 0;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Campaigns</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {myCampaigns.length === 0 && (
          <p className="text-center text-gray-600 dark:text-gray-300">No campaigns found, let's go create one!</p>
        )}
        {myCampaigns.map((campaign) => (
          <div key={campaign.id} className="card-background rounded-lg shadow-md overflow-hidden">
            <Image
              src={campaign.image}
              alt={campaign.name}
              width={400}
              height={200}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="title-text mb-2">{campaign.name}</h2>
              <p className="data-text mb-2">Ends: {formatDate(campaign.deadline)}</p>
              { decryptedCampaignsData[campaign.id] && visibleCampaigns[campaign.id] && (
                <div className="flex flex-col">
                  <p className='data-text'>Goal: {decryptedCampaignsData[campaign.id].goal.toString()}</p>
                  <p className='data-text'>Total Contributions: {decryptedCampaignsData[campaign.id].totalContributions.toString()}</p>
                  <p className='data-text'>Number of Contributors: {decryptedCampaignsData[campaign.id].numContributors.toString()}</p>
                  <p className='data-text'>Contributions Count: {decryptedCampaignsData[campaign.id].contributionsCount.toString()}</p>
                  <p className='data-text'>Left to Withdraw: {decryptedCampaignsData[campaign.id].leftToWithdraw.toString()}</p>
                </div>
              )}
              <Link 
                href={`/campaign/${campaign.id}`} 
                className="block text-center bg-slate-500 hover:bg-primary-dark  dark:hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors w-full mb-4"
              >
                View Campaign Page
              </Link>
              <button
                onClick={() => decryptCampaign(campaign.id)}
                className="bg-violet-500 text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors w-full mb-4"
              >
                Toggle Decrypted Campaign Data
              </button>
              {getWithdrawnDate(campaign) ? (
                <span className="text-gray-600 dark:text-gray-300 mb-4">Withdrawn: {formatDate(getWithdrawnDate(campaign))}</span>
              ) : (
                <button
                  onClick={() => handleWithdraw(campaign.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors w-full mb-4"
                  // disabled={!isCampaignEnded(campaign.deadline)}
                >
                  Withdraw Funds
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCampaigns;
