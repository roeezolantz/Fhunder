// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import { Console } from "@fhenixprotocol/contracts/utils/debug/Console.sol";
import "@fhenixprotocol/contracts/FHE.sol";

contract FhunderNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 public _tokenIdCounter;

    struct NFTData {
        euint128 encryptedAmount;
        uint256 campaignId;
    }

    mapping(uint256 => NFTData) public nftData;

    event NFTMinted(uint256 indexed tokenId, address indexed recipient, uint256 indexed campaignId, euint128 encryptedAmount);

    constructor()
        ERC721("FhunderNFT", "FNFT")
        Ownable(msg.sender)
    {
        Console.log("FhunderNFT contract deployed. owner is : ", owner());
        _tokenIdCounter = 0;
    }

    function mintNFT(address recipient, euint128 encryptedAmount, uint256 campaignId, string memory tokenURICID) external returns (uint256) {
        Console.log("Minting NFT for recipient: ", recipient);
        _tokenIdCounter = _tokenIdCounter + 1;
        uint256 newTokenId = _tokenIdCounter;

        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURICID);

        nftData[newTokenId] = NFTData(encryptedAmount, campaignId);
        Console.log("NFT minted successfully with tokenId: ", newTokenId);

        emit NFTMinted(newTokenId, recipient, campaignId, encryptedAmount);
        
        return newTokenId;
    }

    function getEncryptedAmount(uint256 tokenId) external view returns (euint128) {
        require(ownerOf(tokenId) == msg.sender, "You do not own this token");
        return nftData[tokenId].encryptedAmount;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        string memory uri = super.tokenURI(tokenId);
        Console.log("tokenURI: ", uri);
        return uri;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        bool isSupported = super.supportsInterface(interfaceId);
        Console.log("Checking isSupported: ", isSupported);
        return isSupported;
    }

    function balanceOf(address owner) public view override(ERC721, IERC721) returns (uint256) {
        uint256 balance = super.balanceOf(owner);
        Console.log("NFT balance is : ", balance);
        return balance;
    }

    function ownerOf(uint256 tokenId) public view override(ERC721, IERC721) returns (address) {
        address owner = super.ownerOf(tokenId);
        Console.log("NFT owner is : ", owner);
        return owner;
    }

    function getCounter() external view returns (uint256) {
        Console.log("Counter is : ", _tokenIdCounter);
        return _tokenIdCounter;
    }
}
