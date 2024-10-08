import { task } from "hardhat/config";
import { startServer } from "../campaignServer";

task("task:start-server", "Start the web server")
.setAction(async function (_, hre) {
    await startServer(hre);
    
    // Keep the script running
    await new Promise(() => {});
  });