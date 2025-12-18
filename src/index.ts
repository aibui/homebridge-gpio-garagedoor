import { API } from 'homebridge';
import { GPIOGarageDoorAccessory } from './GPIOGarageDoorAccessory';

export = (api: API) => {
  api.registerAccessory('GPIOGarageDoor', GPIOGarageDoorAccessory);
};