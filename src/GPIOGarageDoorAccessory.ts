/**
 * GPIO Garage Door Accessory for Homebridge
 */

import {
  AccessoryPlugin,
  API,
  Logger,
  AccessoryConfig,
  CharacteristicEventTypes,
} from 'homebridge';

import { DoorSensorPort } from './DoorSensorPort';
import { SwitchPort } from './SwitchPort';
import { getCurrentDoorStateDescription } from './DoorStateExtension';

interface GPIOGarageDoorConfig extends AccessoryConfig {
  name: string;
  doorSensorPin?: number;
  isNCSensor?: boolean;
  doorSwitchPin?: number;
  doorOpensInSeconds?: number;
  id?: string;
}

export class GPIOGarageDoorAccessory implements AccessoryPlugin {
  private readonly log: Logger;
  private readonly name: string;
  private readonly config: GPIOGarageDoorConfig;

  private doorSensor?: DoorSensorPort;
  private doorSwitch?: SwitchPort;

  // Homebridge services
  private readonly informationService: any;
  private readonly garageDoorService: any;

  constructor(log: Logger, config: GPIOGarageDoorConfig, api: API) {
    this.log = log;
    this.name = config.name;
    this.config = config;

    // Create information service
    this.informationService = new api.hap.Service.AccessoryInformation()
      .setCharacteristic(api.hap.Characteristic.Manufacturer, 'GPIO Garage Door')
      .setCharacteristic(api.hap.Characteristic.Model, 'Raspberry Pi GPIO')
      .setCharacteristic(api.hap.Characteristic.SerialNumber, config.id || 'GPIO-GD-001')
      .setCharacteristic(api.hap.Characteristic.FirmwareRevision, '1.0.0');

    // Create garage door opener service
    this.garageDoorService = new api.hap.Service.GarageDoorOpener(this.name);

    // Initialize GPIO components
    this.initializeGPIO(api);

    // Add event listener for door state changes
    this.garageDoorService
      .getCharacteristic(api.hap.Characteristic.CurrentDoorState)
      .on(CharacteristicEventTypes.CHANGE, (change: any) => {
        this.log.info(
          `Garage Door state changed to ${getCurrentDoorStateDescription(change.newValue as number)}`
        );
      });
  }

  private initializeGPIO(api: API): void {
    // Initialize door sensor if configured
    if (this.config.doorSensorPin !== undefined) {
      const isNCSensor = this.config.isNCSensor === true;
      this.log.info(`Door Sensor Pin: ${this.config.doorSensorPin}`);
      this.log.info(`Is NC Sensor: ${isNCSensor}`);

      try {
        this.doorSensor = new DoorSensorPort(
          this.config.doorSensorPin,
          this.garageDoorService,
          this.log,
          isNCSensor
        );
      } catch (err) {
        this.log.error(`Failed to initialize door sensor on pin ${this.config.doorSensorPin}:`, err);
      }
    }

    // Initialize door switch if configured
    if (this.config.doorSwitchPin !== undefined) {
      const doorOpensInSeconds = this.config.doorOpensInSeconds || 15;
      this.log.info(`Door Switch Pin: ${this.config.doorSwitchPin}`);
      this.log.info(`Door Opens (in seconds): ${doorOpensInSeconds}`);

      try {
        this.doorSwitch = new SwitchPort(
          this.config.doorSwitchPin,
          this.garageDoorService,
          this.log,
          this.doorSensor,
          doorOpensInSeconds
        );
      } catch (err) {
        this.log.error(`Failed to initialize door switch on pin ${this.config.doorSwitchPin}:`, err);
      }
    }

    // Set initial characteristics if no sensor is available
    if (!this.doorSensor) {
      this.garageDoorService
        .getCharacteristic(api.hap.Characteristic.CurrentDoorState)
        .updateValue(api.hap.Characteristic.CurrentDoorState.CLOSED);
      
      this.garageDoorService
        .getCharacteristic(api.hap.Characteristic.TargetDoorState)
        .updateValue(api.hap.Characteristic.TargetDoorState.CLOSED);
    }

    // Add obstruction detected characteristic (always false for GPIO setup)
    this.garageDoorService
      .getCharacteristic(api.hap.Characteristic.ObstructionDetected)
      .updateValue(false);
  }

  getServices(): any[] {
    return [this.informationService, this.garageDoorService];
  }
}