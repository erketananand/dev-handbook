/**
 * UPI System - Console Demo Entry Point
 * 
 * Demonstrates the ConsoleInterface pattern with hybrid approach:
 * - Interactive menu mode for user-selected demonstrations
 * - Automated demo mode for running all workflows
 * 
 * Usage:
 * - Choose option 1 for automated full demo
 * - Choose options 2-11 to run specific workflows
 * - Option 0 to exit
 */

import { ConsoleDemo } from "./ConsoleDemo";

/**
 * Main entry point for the interactive demo
 * Uses ConsoleInterface implementation (ConsoleDemo)
 */
async function main(): Promise<void> {
  // Create demo instance implementing ConsoleInterface
  const demo = new ConsoleDemo();

  // Run in interactive mode - user can choose demonstrations
  await demo.runInteractive();
}

// Execute demo with proper error handling
main().catch((error) => {
  console.error("Fatal Error:", error.message);
  process.exit(1);
});
