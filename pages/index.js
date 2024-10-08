import CampaignForm from '../packages/frontend/components/CampaignForm';
import CampaignList from '../packages/frontend/components/CampaignList';

const Home = () => {
  return (
    <div>
      <h1>Fhunder Crowdfunding Platform</h1>
      <CampaignForm />
      <CampaignList />
    </div>
  );
};

export default Home;