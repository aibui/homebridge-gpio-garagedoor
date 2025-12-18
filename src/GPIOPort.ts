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
    super(gpio, direction, edge);
    
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