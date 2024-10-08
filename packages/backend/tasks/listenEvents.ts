import { task } from "hardhat/config";
import { listenToAllEvents } from "./eventListener";

task("listen-events", "Listens to all events from deployed contracts")
.setAction(async function (_, hre) {
    console.log("Trying to listen for events...");
    await listenToAllEvents(hre);
    
    // Keep the script running
    await new Promise(() => {});
  });