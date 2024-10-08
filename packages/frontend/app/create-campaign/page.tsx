"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import ImageUploader from '~~/components/ImageUploader';
import { useDeployedContractInfo, useScaffoldContractWrite } from '~~/hooks/scaffold-eth';
import { notification } from '~~/utils/scaffold-eth';
import useFhenix from '~~/hooks/fhenix/useFhenix';


const CreateCampaign = () => {
  const router = useRouter();
  const { address: connectedAddress } = useAccount();
  const { fhenixClient, campaignManagerContract } = useFhenix();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal: '',
    minimumContribution: '',
    deadline: '',
    image: '',
  });

  useEffect(() => {
    if (campaignManagerContract) {
      campaignManagerContract.on('CampaignCreated', (campaignId: string, creator: string) => {
        if (creator === connectedAddress) {
          notification.success("Campaign created successfully");

          setTimeout(() => {
            router.push(`/campaign/${campaignId}`);
          }, 1000);
        }
      });
    }
  }, [campaignManagerContract]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUploaded = (ipfsHash: string) => {
    setFormData({ ...formData, image: `https://gateway.pinata.cloud/ipfs/${ipfsHash}` });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fhenixClient || !campaignManagerContract) {
      notification.error("Please connect your wallet");
      return;
    }

    try {
      const encryptedGoal = await fhenixClient.encrypt_uint32(Number(formData.goal));

      const deadlineDate = new Date(formData.deadline);
      const durationTillDeadline = Math.floor((deadlineDate.getTime() - Date.now()) / 1000);

      const tx = await campaignManagerContract?.createCampaign(
        formData.name,
        formData.description,
        encryptedGoal,
        formData.minimumContribution,
        durationTillDeadline
      );

      const receipt = await tx.wait();
      
      console.log("receipt", receipt);
    } catch (error) {
      console.error('Error creating campaign:', error);
      notification.error("Failed to create campaign. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Create a New Campaign</h1>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-gray-50 shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Campaign Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter campaign name"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your campaign"
            rows={4}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="goal">
            Funding Goal
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline"
            id="goal"
            type="number"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            placeholder="Enter funding goal"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="minimumContribution">
            Minimum Contribution
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline"
            id="minimumContribution"
            type="number"
            name="minimumContribution"
            value={formData.minimumContribution}
            onChange={handleChange}
            placeholder="Enter minimum contribution amount"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="deadline">
            Campaign Deadline
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white leading-tight focus:outline-none focus:shadow-outline"
            id="deadline"
            type="datetime-local"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            // required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
            Campaign Image
          </label>
          <ImageUploader onImageUploaded={handleImageUploaded} />
          {formData.image && (
            <p className="mt-2 text-sm text-gray-600">Image uploaded: {formData.image}</p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Create Campaign
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;