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

const listenForCampaignEvents = async(campaignManager: ethers.Contract) => {
  console.log("Listening for CampaignCreated events...");

  // Listen for CampaignCreated events
  await campaignManager.off('CampaignCreated');
  await campaignManager.on('CampaignCreated', (campaignId, creator, name, description, goal, minimumContribution, deadline, event) => {
    try {
      console.log(`New campaign created: ${name}`);
      campaigns.push({
        id: campaignId.toString(),
        creator,
        name,
        description,
        goal: goal.toString(),
        minimumContribution: minimumContribution.toString(),
        deadline: deadline.toString(),
        image: 'https://righticksfoundation.org/wp-content/uploads/2023/11/wordpress-crowdfunding.png',
      });
    } catch (error) {
      console.error('Error processing CampaignCreated event:', error);
    }
  });

  console.log("Listening for Withdrawal events...");
  await campaignManager.off('Withdrawal');
  await campaignManager.on('Withdrawal', (campaignId, contributor, amount) => {
    try {
      console.log(`Withdrawal: ${campaignId} - ${contributor} - ${amount}`);
      const campaign = campaigns.find(c => c.id === campaignId.toString());
      if (campaign) {
        campaign.withdrawnDate = Date.now();
      } else {
        console.log('Campaign withdrawal event arrived, but campaign not found');
      }
    } catch (error) {
      console.error('Error processing Withdrawal event:', error);
    }
  });
}

const checkFilterNotFoundPattern = (obj: any) =>
  obj?.action === "receiveRpcResult" &&
  obj?.result?.some(({ error }: { error: any }) =>
    /filter .* not found/.test(error?.message),
  );

const resetEventWatcherOnError = (campaignManager: ethers.Contract) => async (obj: any) => {
  if (checkFilterNotFoundPattern(obj)) {
    console.log("Filter not found, reinitializing event listener...");
    await listenForCampaignEvents(campaignManager);
  }
};

const infiniteListener = async (campaignManager: ethers.Contract) => {
  while (true) {
    try {
      console.log('Starting event listener...');
      await listenForCampaignEvents(campaignManager);
      
      // Keep the listener running indefinitely
      await new Promise(() => {});
    } catch (error: any) {
      console.error('Error in event listener:', error);

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Attempt to remove all listeners before reinitializing
      try {
        console.log('Removing all listeners before reinitializing...');
        await campaignManager.removeAllListeners();
      } catch (removeError) {
        console.error('Error removing listeners:', removeError);
      }
    }
  }
}

export const startServer = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments } = hre;
  let campaignManager: ethers.Contract;

  try {
    const CampaignManager = await deployments.get('CampaignManager');
    const provider = new ethers.JsonRpcProvider('http://localhost:42069', undefined, { polling: true }); // Adjust if needed

    campaignManager = new ethers.Contract(CampaignManager.address, CampaignManager.abi, provider);

    provider.on("debug", resetEventWatcherOnError(campaignManager));
  } catch (error) {
    console.error('Error initializing CampaignManager contract:', error);
    process.exit(1);
  }

  // REST API endpoints
  app.get('/campaigns', (_: express.Request, res: express.Response) => {
    try {
      console.log(`Returned ${campaigns.length} campaigns`);
      res.json(campaigns);
    } catch (error) {
      console.error('Error handling /campaigns request:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/campaigns/:id', (req: express.Request, res: express.Response) => {
    try {
      const campaign = campaigns.find(c => c.id === req.params.id);
      if (campaign) {
        console.log(`Returned campaign ${campaign.name}`);
        res.json(campaign);
      } else {
        console.log(`Campaign ${req.params.id} not found`);
        res.status(404).send('Campaign not found');
      }
    } catch (error) {
      console.error('Error handling /campaigns/:id request:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/campaigns/user/:id', (req: express.Request, res: express.Response) => {
    try {
      const userCampaigns = campaigns.filter(c => c.creator === req.params.id);
      console.log(`Returned ${userCampaigns.length} campaigns for user ${req.params.id}`);
      res.json(userCampaigns);
    } catch (error) {
      console.error('Error handling /campaigns/user/:id request:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.listen(port, () => {
    console.log(`Campaign server listening at http://localhost:${port}`);
  });

  infiniteListener(campaignManager).then(() => {
    console.log("Infinite listener finished");
  }).catch(error => {
    console.error('Fatal error in infiniteListener:', error);
    process.exit(1);
  });
}

// startServer().catch(console.error);
