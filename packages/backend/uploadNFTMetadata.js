const { PinataSDK } = require("pinata");
require("dotenv").config();

const run = async () => {
  const pinata = new PinataSDK({
    pinataJwt: process?.env?.PINATA_JWT,
    pinataGateway: "gateway.pinata.cloud",
  });

  const upload = await pinata.upload.json({
    name: "FhunderNFT",
    description: "A Pinnie NFT from Pinata",
    image: "https://gateway.pinata.cloud/ipfs/QmdLi5N4SZGsKoRbKta2P1EAcp6KzWcgPnB4UCHwho1UZ8"
  });

  console.log("done.", { upload });
};

run();