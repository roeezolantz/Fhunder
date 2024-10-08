import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// In-memory storage for campaigns
let campaigns: any[] = [];

export const startServer = async(hre: HardhatRuntimeEnvironment) => {
  const { deployments } = hre;
  const CampaignManager = await deployments.get('CampaignManager');
  const provider = new ethers.JsonRpcProvider('http://localhost:42069'); // Adjust if needed
  const campaignManager = new ethers.Contract(CampaignManager.address, CampaignManager.abi, provider);

  // Listen for CampaignCreated events
  campaignManager.on('CampaignCreated', (campaignId, creator, name, description, goal, minimumContribution, deadline, event) => {
    console.log(`New campaign created: ${name}`);
    campaigns.push({
      id: campaignId.toString(),
      creator,
      name,
      description,
      goal: goal.toString(),
      minimumContribution: minimumContribution.toString(),
      deadline: deadline.toString(),
    });
  });

  // REST API endpoints
  app.get('/campaigns', (_, res: any) => {
    res.json(campaigns);
  });

  app.get('/campaigns/:id', (req: any, res: any) => {
    const campaign = campaigns.find(c => c.id === req.params.id);
    if (campaign) {
      res.json(campaign);
    } else {
      res.status(404).send('Campaign not found');
    }
  });

  app.listen(port, () => {
    console.log(`Campaign server listening at http://localhost:${port}`);
  });
}

// startServer().catch(console.error);