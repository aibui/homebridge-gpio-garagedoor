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
import { GPIOPort } from './GPIOPort';
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

    // Validate configuration
    GPIOGarageDoorAccessory.validateConfig(config, log);

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

  private checkGPIOSystem(): void {
    const fs = require('fs');
    
    // Check if running on a system with GPIO support
    if (!fs.existsSync('/sys/class/gpio')) {
      this.log.warn('⚠️  GPIO system not detected. This plugin requires a Raspberry Pi or compatible system.');
      return;
    }

    // Check GPIO permissions
    try {
      fs.accessSync('/sys/class/gpio/export', fs.constants.W_OK);
      this.log.info('✅ GPIO permissions OK');
    } catch {
      this.log.warn('⚠️  GPIO permission issue detected. Consider running:');
      this.log.warn('   sudo usermod -a -G gpio $(whoami)');
      this.log.warn('   sudo chown root.gpio /sys/class/gpio/export');
      this.log.warn('   sudo chmod g+w /sys/class/gpio/export');
    }
  }

  private initializeGPIO(api: API): void {
    this.checkGPIOSystem();
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
        this.log.info(`✅ Door sensor initialized successfully on pin ${this.config.doorSensorPin}`);
      } catch (err: any) {
        this.log.error(`❌ Failed to initialize door sensor on pin ${this.config.doorSensorPin}:`);
        this.log.error(`   ${err.message}`);
        this.log.warn(`   Garage door will work without position feedback. Consider:`);
        this.log.warn(`   - Using a different GPIO pin`);
        this.log.warn(`   - Checking if pin is already in use: lsof /dev/gpiomem`);
        this.log.warn(`   - Adding user to gpio group: sudo usermod -a -G gpio homebridge`);
        this.log.warn(`   - Running: sudo chown root.gpio /dev/gpiomem && sudo chmod g+rw /dev/gpiomem`);
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
        this.log.info(`✅ Door switch initialized successfully on pin ${this.config.doorSwitchPin}`);
      } catch (err: any) {
        this.log.error(`❌ Failed to initialize door switch on pin ${this.config.doorSwitchPin}:`);
        this.log.error(`   ${err.message}`);
        this.log.error(`   Garage door control will not work. This is a critical error.`);
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

  // Static method to validate configuration
  static validateConfig(config: GPIOGarageDoorConfig, log: Logger): void {
    log.info('🔍 Validating GPIO configuration...');
    
    if (!config.doorSensorPin && !config.doorSwitchPin) {
      log.warn('⚠️  No GPIO pins configured. At least one pin should be specified.');
      return;
    }

    // Validate pin numbers
    if (config.doorSensorPin !== undefined) {
      if (!GPIOPort.isValidPin(config.doorSensorPin)) {
        log.error(`❌ Invalid door sensor pin: ${config.doorSensorPin}`);
        log.error('   Valid pins: 2,3,5,6,7,8,9,10,11,12,13,16,17,18,19,20,21,22,23,24,25,26,27');
      }
    }

    if (config.doorSwitchPin !== undefined) {
      if (!GPIOPort.isValidPin(config.doorSwitchPin)) {
        log.error(`❌ Invalid door switch pin: ${config.doorSwitchPin}`);
        log.error('   Valid pins: 2,3,5,6,7,8,9,10,11,12,13,16,17,18,19,20,21,22,23,24,25,26,27');
      }
    }

    // Check for pin conflicts
    if (config.doorSensorPin === config.doorSwitchPin) {
      log.error(`❌ Pin conflict: Both sensor and switch using pin ${config.doorSensorPin}`);
    }

    log.info('✅ Configuration validation complete');
  }
}