"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import CampaignList from "~~/components/CampaignList";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Fhenix Crowdfunding</h1>
        <h2 className="text-2xl font-semibold mb-6">Featured Campaigns</h2>
        <CampaignList />
      </main>
    </div>
  );
};

export default Home;
