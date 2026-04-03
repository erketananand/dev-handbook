/**
 * ConsoleInterface - Contract for console operations
 */

import { UUID } from "../utils";

export interface ConsoleInterface {
  /**
   * Run interactive menu-driven mode
   */
  runInteractive(): Promise<void>;

  /**
   * Run automated demo showing all features
   */
  runDemo(): Promise<void>;
}

// Re-export UUID for console module
export { UUID };

