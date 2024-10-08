"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { ethers } from 'ethers';
import { FhenixClient } from 'fhenixjs';
import { useAccount } from 'wagmi';
import useFhenix from '~~/hooks/fhenix/useFhenix';
import { notification } from '~~/utils/scaffold-eth';

interface Campaign {
  id: string;
  name: string;
  description: string;
  goal: string;
  minimumContribution: string;
  deadline: number;
  image: string;
  creator: string;
}

const parseCampaignData = (id: string, campaignData: any): Campaign => {
    const [creatorAddress, name, description, goal, minimumContribution, deadline, totalContributions, numContributors, contributonsCount, withdrawnDate] = campaignData;
    return {
        id,
        name,
        description,
        goal,
        minimumContribution,
        deadline,
        creator: creatorAddress,
        image: '',
    }
};

const CampaignPage = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const { address } = useAccount();
  const { fhenixClient, campaignManagerContract, tokenContract, campaignManagerContractView} = useFhenix();

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/campaigns/${id}`);
        // const rawCampaignData = await campaignManagerContractView?.getCampaign(Number(id));
        // const parsedCampaignData = parseCampaignData(id.toString(), rawCampaignData);
        // debugger;
        setCampaign(response.data);
      } catch (error) {
        console.error('Error fetching campaign:', error);
      }
    };

    if (id && campaignManagerContractView) {
      fetchCampaign();
    }
  }, [id, campaignManagerContractView]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    if (date < new Date()) {
      return <span className='text-red-500'>Ended</span>;
    }
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '');
  };

  const handleContribute = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!contributionAmount || isNaN(Number(contributionAmount))) {
      alert('Please enter a valid contribution amount');
      return;
    }

    if (!fhenixClient) {
      notification.error("Please connect your wallet");
      return;
    }

    try {
        // Encrypt the contribution amount
        const encryptedContribution = await fhenixClient.encrypt_uint32(Number(contributionAmount));

        // Call the contribute function on the contract
        debugger;

        const approveFor = await campaignManagerContract?.getAddress();
        const approveTx = await tokenContract?.approveEncrypted(approveFor, encryptedContribution);
        await approveTx.wait();
        console.log("Approved");

        const tx = await campaignManagerContract?.contribute(id, encryptedContribution);
        await tx.wait();

        alert('Contribution successful!');
        setContributionAmount('');
        } catch (error) {
        console.error('Error contributing:', error);
        alert('Error contributing. Please try again.');
    }
  };

  if (!campaign) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="text-primary hover:underline mb-4 inline-block">&larr; Back to Campaigns</Link>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Image
          src={campaign.image || '/placeholder-image.jpg'}
          alt={campaign.name}
          width={1200}
          height={400}
          className="w-full h-64 object-cover"
        />
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{campaign.name}</h1>
          <p className="text-gray-600 mb-6">{campaign.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Campaign Details</h2>
              <p>Goal: <span className="text-red-400 italic text-sm">ENCRYPTED</span></p>
              <p>Minimum Contribution: {campaign.minimumContribution}</p>
              <p>Deadline: {formatDate(campaign.deadline)}</p>
              <p>Creator: {campaign.creator}</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Contribute</h2>
              <input
                type="text"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                placeholder="Enter amount in ETH"
                className="w-full p-2 mb-2 border rounded"
              />
              <button
                onClick={handleContribute}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors w-full"
              >
                Contribute Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignPage;