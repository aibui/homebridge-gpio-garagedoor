/**
 * Switch Port for controlling garage door relay
 */

import { Logger, CharacteristicEventTypes } from 'homebridge';
import { Service, Characteristic, CharacteristicValue } from 'hap-nodejs';
import { GPIOPort, GPIOState } from './GPIOPort';
import { DoorSensorPort } from './DoorSensorPort';
import { asDoorState, asOperationState, getCurrentDoorState } from './DoorStateExtension';

export class SwitchPort extends GPIOPort {
  private isOperating: boolean = false;
  private service: Service;
  private log: Logger;
  private doorSensor?: DoorSensorPort;
  private doorOpensInSeconds: number;

  constructor(
    pin: number,
    service: Service,
    log: Logger,
    doorSensor: DoorSensorPort | undefined,
    doorOpensInSeconds: number = 15
  ) {
    super(pin, 'out');
    this.service = service;
    this.log = log;
    this.doorSensor = doorSensor;
    this.doorOpensInSeconds = doorOpensInSeconds;

    // Set up target door state handler
    const targetState = service.getCharacteristic(Characteristic.TargetDoorState);
    targetState.onSet(this.handleTargetStateChange.bind(this));

    this.refresh();
  }

  private async handleTargetStateChange(value: CharacteristicValue): Promise<void> {
    const state = value as number;
    try {
      const curState = getCurrentDoorState(this.service);

      // Check if door is currently operating
      switch (curState) {
        case Characteristic.CurrentDoorState.OPENING:
        case Characteristic.CurrentDoorState.CLOSING:
          throw new Error('Must wait until operation is finished');
        default:
          // If the target state is equal to current state, do nothing
          if (asDoorState(state) === curState) {
            return;
          }
          break;
      }

      this.isOperating = true;
      this.log.debug('Started operation');

      // Activate relay
      await this.writeAsync(GPIOState.On);
      
      // Update to operating state
      this.service.setCharacteristic(Characteristic.CurrentDoorState, asOperationState(state));

      // Deactivate relay after 1 second
      await this.delay(1000);
      await this.writeAsync(GPIOState.Off);

      // Wait for door operation to complete
      await this.delay(this.doorOpensInSeconds * 1000);

      this.isOperating = false;
      this.log.debug('Finished operation');

      // Reset sensor and refresh state
      if (this.doorSensor) {
        this.doorSensor.reset();
      }
      this.refresh();

    } catch (err) {
      this.log.error('Switch operation error:', err);
      this.isOperating = false;
      throw err;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  refresh(): void {
    if (this.isOperating) return;

    const currentState = getCurrentDoorState(this.service);
    const targetState = currentState === Characteristic.CurrentDoorState.OPEN
      ? Characteristic.TargetDoorState.OPEN
      : Characteristic.TargetDoorState.CLOSED;

    this.service
      .getCharacteristic(Characteristic.TargetDoorState)
      .updateValue(targetState);
  }
}