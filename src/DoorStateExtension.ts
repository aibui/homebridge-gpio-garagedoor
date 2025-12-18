/**
 * Door State utilities for Homebridge Characteristic values
 */

import { Characteristic, Service } from 'hap-nodejs';

export function getCurrentDoorState(service: Service): number {
  return service.getCharacteristic(Characteristic.CurrentDoorState).value as number;
}

export function getTargetDoorState(service: Service): number {
  return service.getCharacteristic(Characteristic.TargetDoorState).value as number;
}

export function asDoorState(targetState: number): number {
  switch (targetState) {
    case Characteristic.TargetDoorState.OPEN:
      return Characteristic.CurrentDoorState.OPEN;
    case Characteristic.TargetDoorState.CLOSED:
      return Characteristic.CurrentDoorState.CLOSED;
    default:
      return Characteristic.CurrentDoorState.STOPPED;
  }
}

export function asOperationState(targetState: number): number {
  switch (targetState) {
    case Characteristic.TargetDoorState.OPEN:
      return Characteristic.CurrentDoorState.OPENING;
    case Characteristic.TargetDoorState.CLOSED:
      return Characteristic.CurrentDoorState.CLOSING;
    default:
      return Characteristic.CurrentDoorState.STOPPED;
  }
}

export function getCurrentDoorStateDescription(doorState: number): string {
  switch (doorState) {
    case Characteristic.CurrentDoorState.OPEN:
      return 'OPEN';
    case Characteristic.CurrentDoorState.OPENING:
      return 'OPENING';
    case Characteristic.CurrentDoorState.CLOSING:
      return 'CLOSING';
    case Characteristic.CurrentDoorState.CLOSED:
      return 'CLOSED';
    case Characteristic.CurrentDoorState.STOPPED:
      return 'STOPPED';
    default:
      return 'UNKNOWN';
  }
}

export function getTargetDoorStateDescription(doorState: number): string {
  switch (doorState) {
    case Characteristic.TargetDoorState.OPEN:
      return 'OPEN';
    case Characteristic.TargetDoorState.CLOSED:
      return 'CLOSED';
    default:
      return 'UNKNOWN';
  }
}