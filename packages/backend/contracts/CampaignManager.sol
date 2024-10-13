// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Console } from "@fhenixprotocol/contracts/utils/debug/Console.sol";
import "@fhenixprotocol/contracts/FHE.sol";
import "./FHERC721/FhunderNFT.sol";
import { IFHERC20 } from "./FHERC20/IFHERC20.sol";

interface IFhunderNFT {
    function mintNFT(address recipient, euint128 encryptedAmount, uint32 campaignId, string memory tokenURICID) external returns (uint32);
    function balanceOf(address owner) external view returns (uint32);
}

contract CampaignManager {
    // Campaign structure
    struct Campaign {
        address creator;
        uint32 campaignId;
        string name;
        string description;
        uint32 minimumContribution;
        uint256 deadline;
        euint32 goal;
        euint32 totalContributions;
        euint32 numContributors;
        euint32 contributonsCount;
        // bool goalAchieved; // True if the goal is achieved before the deadline and funds can be released to the creator
        mapping(address => euint32) contributions;
        uint256 withdrawnDate;
        euint32 leftToWithdraw;
    }

    // Mapping of campaign ID to campaign
    mapping(uint32 => Campaign) public campaigns;

    // Campaign counter to assign unique IDs
    uint32 public campaignCounter;

    address nftAddress;
    address tokenContractAddress;

    // Events
    event CampaignCreated(
        uint32 indexed campaignId,
        address indexed creator,
        string name,
        string description,
        euint32 goal,
        uint32 minimumContribution,
        uint256 deadline
    );
    
    event ContributionMade(
        uint32 indexed campaignId,
        address indexed contributor,
        euint32 amount,
        uint256 tokenId
    );

    event Withdrawal(
        uint32 indexed campaignId,
        address indexed contributor,
        euint32 amount
    );

    event ContributionReleased(
        uint32 indexed campaignId,
        address indexed contributor,
        euint32 amount
    );

    error CampaignDoesNotExist();
    error OnlyCampaignCreator();
    error InvalidContribution();
    error FundingGoalNotMet();

    // Constructor to set the NFT contract address§
    constructor(address _fhunderNFTAddress, address _tokenContractAddress) {
        Console.log("[Init] Setting NFT contract to ", _fhunderNFTAddress);
        nftAddress = _fhunderNFTAddress;
        tokenContractAddress = _tokenContractAddress;
    }

    // Modifier to check if a campaign exists
    modifier campaignExists(uint32 campaignId) {
        if (campaigns[campaignId].creator == address(0)) revert CampaignDoesNotExist();
        // require(campaigns[campaignId].creator != address(0), "Campaign does not exist");
        _;
    }

    // Modifier to check if the caller is the campaign creator
    modifier onlyCampaignCreator(uint32 campaignId) {
        Console.log("Campaign creator: ", campaigns[campaignId].creator);
        Console.log("Message sender: ", msg.sender);
        if (campaigns[campaignId].creator != msg.sender) revert OnlyCampaignCreator();
        // require(campaigns[campaignId].creator == msg.sender, "Only the campaign creator can call this function");
        _;
    }

    // Create a new campaign
    function createCampaign(
        string memory name,
        string memory description,
        inEuint32 calldata goal,
        uint32 minimumContribution,
        uint32 duration
    ) public {
        campaignCounter++;
        uint32 newCampaignId = campaignCounter;
        
        Campaign storage newCampaign = campaigns[newCampaignId];
        newCampaign.creator = msg.sender;
        newCampaign.campaignId = newCampaignId;
        newCampaign.name = name;
        newCampaign.description = description;
        newCampaign.goal = FHE.asEuint32(goal);
        newCampaign.minimumContribution = minimumContribution;
        newCampaign.deadline = block.timestamp + duration;
        newCampaign.totalContributions = FHE.asEuint32(0);
        newCampaign.numContributors = FHE.asEuint32(0);
        newCampaign.contributonsCount = FHE.asEuint32(0);
        newCampaign.leftToWithdraw = FHE.asEuint32(0);

        Console.log("Campaign created with ID:", newCampaignId);
        emit CampaignCreated(newCampaignId, msg.sender, name, description, newCampaign.goal, minimumContribution, newCampaign.deadline);
    }

    // Make a contribution to a campaign
    function contribute(uint32 campaignId, inEuint32 calldata amount) public campaignExists(campaignId) {
        Campaign storage campaign = campaigns[campaignId];

        // Validations & Transfers
        require(campaign.deadline > block.timestamp, "Campaign ended already");
        euint32 encryptedAmount = FHE.asEuint32(amount);
        
        ebool isValid = FHE.gte(FHE.asEuint32(uint32(FHE.decrypt(encryptedAmount))), FHE.asEuint32(campaign.minimumContribution)); // TODO : Remove decryption
        Console.log("Is valid: ", FHE.decrypt(isValid));
        FHE.req(isValid);    
        euint128 transferred = IFHERC20(tokenContractAddress)._transferFromEncrypted(msg.sender, address(this), FHE.asEuint128(encryptedAmount));
        require(FHE.decrypt(transferred) > 0, "Transfer failed"); // TODO : Remove decryption
        Console.log("Transferred successfully");

        // Update the campaign's state
        ebool isNewContributor = FHE.eq(campaign.contributions[msg.sender], FHE.asEuint32(0));
        campaign.contributonsCount = FHE.add(FHE.asEuint32(FHE.asEuint64(campaign.contributonsCount)), FHE.asEuint32(1));
        campaign.numContributors = FHE.add(campaign.numContributors, FHE.select(isNewContributor, FHE.asEuint32(1), FHE.asEuint32(0)));

        euint32 leftTW = FHE.add(FHE.asEuint32(FHE.decrypt(campaign.leftToWithdraw)), FHE.asEuint32(FHE.decrypt(encryptedAmount)));
        Console.log("Left to withdraw: ", FHE.decrypt(leftTW));
        campaign.leftToWithdraw = leftTW;

        // TODO : Remove decryption, when add stops crashing
        // campaign.totalContributions = FHE.add(campaign.totalContributions, encryptedAmount);
        euint32 totalContributions = FHE.add(FHE.asEuint32(FHE.decrypt(campaign.totalContributions)), FHE.asEuint32(FHE.decrypt(encryptedAmount)));
        campaign.totalContributions = totalContributions;
        
        // TODO : Remove decryption, when add stops crashing
        // campaign.contributions[msg.sender] = FHE.add(campaign.contributions[msg.sender], encryptedAmount);
        campaign.contributions[msg.sender] = FHE.asEuint32(FHE.decrypt(campaign.contributions[msg.sender]) + FHE.decrypt(encryptedAmount));

        // Mint NFT 
        string memory tokenURICID = "QmdLi5N4SZGsKoRbKta2P1EAcp6KzWcgPnB4UCHwho1UZ8";
        uint256 nftTokenId = FhunderNFT(nftAddress).mintNFT(msg.sender, encryptedAmount, campaignId, tokenURICID);

        emit ContributionMade(campaignId, msg.sender, encryptedAmount, nftTokenId);
    }

    function withdraw(uint32 campaignId) public onlyCampaignCreator(campaignId) {
        Campaign storage campaign = campaigns[campaignId];

        Console.log("Campaign total contributions: ", FHE.decrypt(campaign.totalContributions));
        Console.log("Campaign goal: ", FHE.decrypt(campaign.goal));
        ebool isGoalMet = FHE.gte(FHE.asEuint32(FHE.decrypt(campaign.totalContributions)), FHE.asEuint32(FHE.decrypt(campaign.goal)));
        Console.log("Is goal met: ", FHE.decrypt(isGoalMet));
        FHE.req(isGoalMet);
        require(block.timestamp >= campaign.deadline, "Campaign is not yet ended");

        // Transfer tokens to the creator
        IFHERC20(tokenContractAddress)._transferEncrypted(msg.sender, FHE.asEuint128(campaign.totalContributions));

        // Reset the campaign's state
        campaign.withdrawnDate = block.timestamp;
        campaign.leftToWithdraw = FHE.asEuint32(0);

        // Events
        emit Withdrawal(campaignId, msg.sender, campaign.totalContributions);
    }

    function releaseFunds(uint32 campaignId) public campaignExists(campaignId) {
        Campaign storage campaign = campaigns[campaignId];

        Console.log("Campaign total contributions: ", FHE.decrypt(campaign.totalContributions));
        Console.log("Campaign goal: ", FHE.decrypt(campaign.goal));
        Console.log("Is goal met: ", FHE.decrypt(FHE.lt(campaign.totalContributions, campaign.goal)));
        // Check if the funding goal is not met
        FHE.req(FHE.lt(campaign.totalContributions, campaign.goal));

        // Get the contributor's contribution
        euint32 contributorAmount = campaign.contributions[msg.sender];
        Console.log("Contributor address: ", msg.sender);
        Console.log("Contributor amount: ", FHE.decrypt(contributorAmount));
        ebool hasContribution = FHE.gt(contributorAmount, FHE.asEuint32(0));
        Console.log("Has contribution: ", FHE.decrypt(hasContribution));
        FHE.req(hasContribution);
        Console.log("Has contribution is true, releasing funds");
        // Reset the contributor's contribution
        euint128 amountToTransfer = FHE.asEuint128(campaign.contributions[msg.sender]);
        campaign.contributions[msg.sender] = FHE.asEuint32(0);
        campaign.leftToWithdraw = FHE.sub(campaign.leftToWithdraw, contributorAmount);
        Console.log("Contributor amount after reset: ", FHE.decrypt(campaign.contributions[msg.sender]));

        // Transfer tokens back to the contributor
        IFHERC20(tokenContractAddress)._transferEncrypted(msg.sender, amountToTransfer);

        emit ContributionReleased(campaignId, msg.sender, contributorAmount);
    }

    // Get campaign details
    function getCampaign(uint16 campaignId) 
      public 
      view 
      campaignExists(campaignId)
      returns (
        address creator,
        string memory name,
        string memory description,
        uint32 goal,
        uint32 minimumContribution,
        uint256 deadline,
        uint32 totalContributions,
        uint32 numContributors,
        uint32 contributonsCount,
        uint256 withdrawnDate,
        uint32 leftToWithdraw
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
            campaign.withdrawnDate,
            FHE.decrypt(campaign.leftToWithdraw)
        );
    }

    function getMyCampaign(uint32 campaignId, bytes32 publicKey) 
      public 
      view 
      campaignExists(campaignId) 
      onlyCampaignCreator(campaignId) 
      returns (
        address creator,
        string memory name,
        string memory description,
        uint32 minimumContribution,
        uint256 deadline,
        uint256 withdrawnDate,
        uint32 leftToWithdraw,
        string memory sealedGoal,
        string memory sealedTotalContributions
        // string memory sealedNumContributors,
        // string memory sealedContributionsCount
    ) {
        Campaign storage campaign = campaigns[campaignId];
        // uint32 a = FHE.decrypt(campaign.goal);
        // uint32 b = FHE.decrypt(campaign.totalContributions);
        // uint32 c = FHE.decrypt(campaign.numContributors);
        // uint32 d = FHE.decrypt(campaign.contributonsCount);
        // uint128 op2 = uint128(a) << 96 | uint128(b) << 64 | uint128(c) << 32 | uint128(d);
        // sealedValue = FHE.asEuint128(op2).seal(publicKey);
        // FHE.shl(FHE.asEuint128(campaign.goal), FHE.asEuint128(96)) | FHE.shl(FHE.asEuint128(campaign.totalContributions), FHE.asEuint128(64)) | FHE.shl(FHE.asEuint128(campaign.numContributors), FHE.asEuint128(32)) | FHE.asEuint128(campaign.contributonsCount);
        // euint128 concatenated = FHE.shl(FHE.asEuint128(campaign.goal), FHE.asEuint128(96));
        // concatenated = FHE.add(concatenated, FHE.shl(FHE.asEuint128(campaign.totalContributions), FHE.asEuint128(64)));
        // concatenated = FHE.add(concatenated, FHE.shl(FHE.asEuint128(campaign.numContributors), FHE.asEuint128(32)));
        // concatenated = FHE.add(concatenated, FHE.asEuint128(campaign.contributonsCount));
        // sealedValue = FHE.sealoutput(concatenated, publicKey);

        sealedGoal = FHE.sealoutput(campaign.goal, publicKey);
        sealedTotalContributions = FHE.sealoutput(campaign.totalContributions, publicKey);
        // sealedNumContributors = FHE.sealoutput(campaign.numContributors, publicKey);
        // sealedContributionsCount = FHE.sealoutput(campaign.contributonsCount, publicKey);
        
        return (
            campaign.creator,
            campaign.name,
            campaign.description,
            campaign.minimumContribution,
            campaign.deadline,
            campaign.withdrawnDate,
            FHE.decrypt(campaign.leftToWithdraw),
            sealedGoal,
            sealedTotalContributions
        );
    }

    // Decrypt and get the total contributions (only for campaign creator)
    function decryptTotalContributions(uint32 campaignId) 
      public 
      view 
      campaignExists(campaignId)
      onlyCampaignCreator(campaignId)
      returns (uint32) {
        return FHE.decrypt(campaigns[campaignId].totalContributions);
    }

    // Update campaign description
    function updateCampaignDescription(uint32 campaignId, string memory newDescription) 
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