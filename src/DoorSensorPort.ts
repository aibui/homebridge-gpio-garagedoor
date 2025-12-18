/**
 * Door Sensor Port for monitoring garage door state
 */

import { Logger } from 'homebridge';
import { Service, Characteristic } from 'hap-nodejs';
import { GPIOPort } from './GPIOPort';
import { getCurrentDoorState, getTargetDoorState } from './DoorStateExtension';

export class DoorSensorPort extends GPIOPort {
  private service: Service;
  private log: Logger;
  private closedSensorValue: number;
  public isClosed: boolean = false;

  constructor(pin: number, service: Service, log: Logger, isNCSensor: boolean) {
    super(pin, 'in', 'both');
    this.service = service;
    this.log = log;
    this.closedSensorValue = isNCSensor ? 0 : 1;

    // Watch for GPIO changes
    this.watch((err, value) => {
      if (err) {
        this.log.error('GPIO watch error:', err);
        return;
      }

      this.isClosed = value === this.closedSensorValue;
      this.handleStateChange();
    });

    this.reset();
  }

  private handleStateChange(): void {
    const currentState = getCurrentDoorState(this.service);
    
    // Don't update state if door is currently operating
    switch (currentState) {
      case Characteristic.CurrentDoorState.CLOSING:
      case Characteristic.CurrentDoorState.OPENING:
        return;
      default:
        this.updateCurrentDoorState();
    }

    // Handle external state change (manual door operation)
    const targetState = getTargetDoorState(this.service);
    if (
      (this.isClosed && targetState === Characteristic.TargetDoorState.OPEN) ||
      (!this.isClosed && targetState === Characteristic.TargetDoorState.CLOSED)
    ) {
      this.service
        .getCharacteristic(Characteristic.TargetDoorState)
        .updateValue(
          this.isClosed
            ? Characteristic.TargetDoorState.CLOSED
            : Characteristic.TargetDoorState.OPEN
        );
    }
  }

  reset(): void {
    this.isClosed = this.getState() === this.closedSensorValue;
    this.updateCurrentDoorState();
  }

  updateCurrentDoorState(): void {
    const newState = this.isClosed
      ? Characteristic.CurrentDoorState.CLOSED
      : Characteristic.CurrentDoorState.OPEN;
    
    this.service
      .getCharacteristic(Characteristic.CurrentDoorState)
      .updateValue(newState);
  }
}