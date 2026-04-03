/**
 * Main entry point for LinkedIn system demo
 */

import { LinkedInDemo } from "./console";

async function main(): Promise<void> {
  const demo = new LinkedInDemo();
  await demo.runInteractive();
}

main().catch(error => {
  console.error("Error:", error);
  process.exit(1);
});
