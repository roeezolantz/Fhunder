// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Console } from "@fhenixprotocol/contracts/utils/debug/Console.sol";
import "@fhenixprotocol/contracts/FHE.sol";
import "./FHERC721/FhunderNFT.sol";
import { IFHERC20 } from "./FHERC20/IFHERC20.sol";

interface IFhunderNFT {
    function mintNFT(address recipient, euint128 encryptedAmount, uint256 campaignId, string memory tokenURICID) external returns (uint256);
    function balanceOf(address owner) external view returns (uint256);
}

contract CampaignManager {
    // Campaign structure
    struct Campaign {
        address creator;
        uint256 campaignId;
        string name;
        string description;
        uint128 minimumContribution;
        uint256 deadline;
        euint128 goal;
        euint128 totalContributions;
        euint32 numContributors;
        euint32 contributonsCount;
        // bool goalAchieved; // True if the goal is achieved before the deadline and funds can be released to the creator
        mapping(address => euint128) contributions;
        uint256 withdrawnDate;
    }

    // Mapping of campaign ID to campaign
    mapping(uint256 => Campaign) public campaigns;

    // Campaign counter to assign unique IDs
    uint256 public campaignCounter;

    address nftAddress;
    address tokenContractAddress;

    // Events
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        string name,
        string description,
        euint128 goal,
        uint128 minimumContribution,
        uint256 deadline
    );
    
    event ContributionMade(
        uint256 indexed campaignId,
        address indexed contributor,
        euint128 amount,
        uint256 tokenId
    );

    event Withdrawal(
        uint256 indexed campaignId,
        address indexed contributor,
        euint128 amount
    );

    error CampaignDoesNotExist();
    error OnlyCampaignCreator();
    error InvalidContribution();
    error FundingGoalNotMet();

    // Constructor to set the NFT contract address
    constructor(address _fhunderNFTAddress, address _tokenContractAddress) {
        Console.log("[Init] Setting NFT contract to ", _fhunderNFTAddress);
        nftAddress = _fhunderNFTAddress;
        tokenContractAddress = _tokenContractAddress;
    }

    // Modifier to check if a campaign exists
    modifier campaignExists(uint256 campaignId) {
        if (campaigns[campaignId].creator == address(0)) revert CampaignDoesNotExist();
        // require(campaigns[campaignId].creator != address(0), "Campaign does not exist");
        _;
    }

    // Modifier to check if the caller is the campaign creator
    modifier onlyCampaignCreator(uint256 campaignId) {
        if (campaigns[campaignId].creator != msg.sender) revert OnlyCampaignCreator();
        // require(campaigns[campaignId].creator == msg.sender, "Only the campaign creator can call this function");
        _;
    }

    // Create a new campaign
    function createCampaign(
        string memory name,
        string memory description,
        inEuint128 calldata goal,
        uint128 minimumContribution,
        uint256 duration
    ) public {
        campaignCounter++;
        uint256 newCampaignId = campaignCounter;
        
        Campaign storage newCampaign = campaigns[newCampaignId];
        newCampaign.creator = msg.sender;
        newCampaign.campaignId = newCampaignId;
        newCampaign.name = name;
        newCampaign.description = description;
        newCampaign.goal = FHE.asEuint128(goal);
        newCampaign.minimumContribution = minimumContribution;
        newCampaign.deadline = block.timestamp + duration;
        newCampaign.totalContributions = FHE.asEuint128(0);
        newCampaign.numContributors = FHE.asEuint32(0);
        newCampaign.contributonsCount = FHE.asEuint32(0);

        Console.log("Campaign created with ID:", newCampaignId);
        emit CampaignCreated(newCampaignId, msg.sender, name, description, newCampaign.goal, minimumContribution, newCampaign.deadline);
    }

    // Make a contribution to a campaign
    function contribute(uint256 campaignId, inEuint128 calldata amount) public campaignExists(campaignId) {
        Campaign storage campaign = campaigns[campaignId];
        Console.log("Contributing to campaign", campaignId);
        Console.log("Campaign deadline: ", campaign.deadline);
        Console.log("Current block timestamp: ", block.timestamp);
        Console.log("Encrypted amount: ", uint128(FHE.decrypt(FHE.asEuint128(amount))));
        Console.log("Minimum contribution: ", campaign.minimumContribution);

        // Validations & Transfers
        // require(campaign.deadline > block.timestamp, "Campaign ended already");
        euint128 encryptedAmount = FHE.asEuint128(amount);
        
        ebool isValid = FHE.gte(FHE.asEuint128(uint128(FHE.decrypt(encryptedAmount))), FHE.asEuint128(campaign.minimumContribution));
        Console.log("Is valid: ", FHE.decrypt(isValid));
        // FHE.req(isValid);    
        Console.log("Transferring...");
        euint128 transferred = IFHERC20(tokenContractAddress)._transferFromEncrypted(msg.sender, address(this), FHE.asEuint128(amount));
        Console.log("Transferred: ", uint128(FHE.decrypt(transferred)));
        require(FHE.decrypt(transferred) > 0, "Transfer failed");
        Console.log("Transferred successfully");

        // // Update the campaign's state
        ebool isNewContributor = FHE.eq(campaign.contributions[msg.sender], FHE.asEuint128(0));
        campaign.totalContributions = FHE.add(campaign.totalContributions, encryptedAmount);
        campaign.contributonsCount = FHE.add(campaign.contributonsCount, FHE.asEuint32(1));
        campaign.numContributors = FHE.add(campaign.numContributors, FHE.select(isNewContributor, FHE.asEuint32(1), FHE.asEuint32(0)));
        campaign.contributions[msg.sender] = FHE.add(campaign.contributions[msg.sender], FHE.asEuint128(amount));

        // // Mint NFT 
        // string memory tokenURICID = "QmdLi5N4SZGsKoRbKta2P1EAcp6KzWcgPnB4UCHwho1UZ8";
        // uint256 nftTokenId = FhunderNFT(nftAddress).mintNFT(msg.sender, encryptedAmount, campaignId, tokenURICID);

        // emit ContributionMade(campaignId, msg.sender, encryptedAmount, nftTokenId);
        emit ContributionMade(campaignId, msg.sender, FHE.asEuint128(amount), 0);
    }

    function withdraw(uint256 campaignId) public onlyCampaignCreator(campaignId) {
        Campaign storage campaign = campaigns[campaignId];

        // Validations
        FHE.req(FHE.gte(campaign.totalContributions, campaign.goal));
        require(block.timestamp >= campaign.deadline, "Campaign is not yet ended");

        // Transfer tokens to the creator
        IFHERC20(tokenContractAddress)._transferEncrypted(msg.sender, campaign.totalContributions);

        // Reset the campaign's state
        campaign.withdrawnDate = block.timestamp;

        // Events
        emit Withdrawal(campaignId, msg.sender, campaign.totalContributions);
    }

    function releaseFunds(uint256 campaignId) public campaignExists(campaignId) {
        Campaign storage campaign = campaigns[campaignId];

        // Check if the funding goal is not met
        // FHE.req(FHE.lte(campaign.totalContributions, campaign.goal), "Funding goal met, cannot release funds");

        // Get the contributor's contribution
        euint128 contributorAmount = campaign.contributions[msg.sender];
        // FHE.req(FHE.lte(contributorAmount, FHE.asEuint128(0)), "Nothing to release..");

        // Reset the contributor's contribution
        campaign.contributions[msg.sender] = FHE.asEuint128(0);

        // Transfer tokens back to the contributor
        // IFHERC20(tokenContractAddress)._transferEncrypted(address(this), msg.sender, FHE.asEuint128(campaign.contributions[msg.sender]));

        emit Withdrawal(campaignId, msg.sender, campaign.contributions[msg.sender]);
    }

    // Get campaign details
    function getCampaign(uint256 campaignId) 
      public 
      view 
      campaignExists(campaignId)
      returns (
        address creator,
        string memory name,
        string memory description,
        uint128 goal,
        uint128 minimumContribution,
        uint256 deadline,
        uint128 totalContributions,
        uint32 numContributors,
        uint32 contributonsCount,
        uint256 withdrawnDate
    ) {
        Campaign storage campaign = campaigns[campaignId];

        return (
            campaign.creator,
            campaign.name,
            campaign.description,
            FHE.decrypt(campaign.goal),
            campaign.minimumContribution,
            campaign.deadline,
            FHE.decrypt(campaign.totalContributions),
            FHE.decrypt(campaign.numContributors),
            FHE.decrypt(campaign.contributonsCount),
            campaign.withdrawnDate
        );
    }

    // Decrypt and get the total contributions (only for campaign creator)
    function decryptTotalContributions(uint256 campaignId) 
      public 
      view 
      campaignExists(campaignId)
      onlyCampaignCreator(campaignId)
      returns (uint128) {
        return FHE.decrypt(campaigns[campaignId].totalContributions);
    }

    // Update campaign description
    function updateCampaignDescription(uint256 campaignId, string memory newDescription) 
      public
      campaignExists(campaignId)
      onlyCampaignCreator(campaignId) {
        Campaign storage campaign = campaigns[campaignId];
        campaign.description = newDescription;
    }

    function getTime() public view returns (uint256) {
        return block.timestamp;
    }
}