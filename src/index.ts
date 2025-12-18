import { API } from 'homebridge';
import { GPIOGarageDoorAccessory } from './GPIOGarageDoorAccessory';
import { setHAPTypes as setDoorStateHAPTypes } from './DoorStateExtension';
import { setHAPTypes as setDoorSensorHAPTypes } from './DoorSensorPort';
import { setHAPTypes as setSwitchPortHAPTypes } from './SwitchPort';

export = (api: API) => {
  // Initialize HAP types for all modules
  setDoorStateHAPTypes(api);
  setDoorSensorHAPTypes(api);
  setSwitchPortHAPTypes(api);
  
  api.registerAccessory('GPIOGarageDoor', GPIOGarageDoorAccessory);
};