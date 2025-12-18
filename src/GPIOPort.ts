/**
 * GPIO Port wrapper for onoff library
 */

import { Gpio } from 'onoff';

export enum GPIOState {
  On = 1,
  Off = 0,
}

export type GPIODirection = 'in' | 'out' | 'high' | 'low';
export type GPIOEdge = 'none' | 'rising' | 'falling' | 'both';

export class GPIOPort extends Gpio {
  constructor(gpio: number, direction: GPIODirection, edge?: GPIOEdge) {
    // Validate GPIO pin number
    if (!GPIOPort.isValidPin(gpio)) {
      throw new Error(`Invalid GPIO pin ${gpio}. Valid pins are: 2-27 (except 4,14,15)`);
    }

    // Check if GPIO is already exported
    if (GPIOPort.isPinExported(gpio)) {
      throw new Error(`GPIO pin ${gpio} is already in use. Please choose a different pin or check if another process is using it.`);
    }

    try {
      super(gpio, direction, edge);
    } catch (err: any) {
      if (err.code === 'EINVAL') {
        throw new Error(`Failed to initialize GPIO pin ${gpio}. This may be due to:
        - Pin already in use by another process
        - Insufficient permissions (try running as root or add user to gpio group)
        - Hardware issue with the pin
        - Pin reserved by system
        Original error: ${err.message}`);
      }
      throw err;
    }
    
    // Clean up GPIO on process exit
    const cleanup = () => {
      try {
        this.unexport();
      } catch (err) {
        // Ignore errors during cleanup
      }
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);
  }

  static isValidPin(pin: number): boolean {
    // Valid GPIO pins on Raspberry Pi (excluding reserved pins)
    const validPins = [2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27];
    return validPins.includes(pin);
  }

  static isPinExported(pin: number): boolean {
    try {
      const fs = require('fs');
      return fs.existsSync(`/sys/class/gpio/gpio${pin}`);
    } catch {
      return false;
    }
  }

  getState(retryCount: number = 3): GPIOState {
    let val: number = 0;
    for (let i = 0; i < retryCount; i++) {
      val = this.readSync();
      if (val === 1) {
        break;
      }
    }
    return val as GPIOState;
  }

  async readAsync(): Promise<GPIOState> {
    return new Promise<GPIOState>((resolve, reject) => {
      this.read((err, value) => {
        if (err) {
          reject(err);
        } else {
          resolve(value as GPIOState);
        }
      });
    });
  }

  async writeAsync(state: GPIOState): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.write(state, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}