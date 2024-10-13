import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const response = await axios.get('http://localhost:3000/campaigns');
      setCampaigns(response.data);
    };

    fetchCampaigns();
  }, []);

  const isCampaignEnded = (deadline) => {
    return new Date(deadline * 1000) < new Date();
  };

  const formatDate = (dateString) => {
    if (isCampaignEnded(dateString)) {
      return <span className='text-red-500'>Ended</span>;
    }
    const date = new Date(dateString * 1000);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {campaigns.map((campaign, index) => (
        <Link href={`/campaign/${campaign.id}`} key={index}>
          <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
            <Image
              src={campaign.image}
              alt={campaign.name}
              width={400}
              height={200}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2 text-black">{campaign.name}</h3>
              <div className="flex flex-col justify-between text-sm">
                <p className="text-gray-600 text-sm mb-4">{campaign.description}</p>
                <div className="flex flex-col text-gray-500">
                  <span>Minimum contribution: {campaign.minimumContribution}</span>
                  <span>Goal: <span className="text-red-400 italic text-xs">ENCRYPTED</span></span>
                  <span>Ends at: {formatDate(campaign.deadline)}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CampaignList;