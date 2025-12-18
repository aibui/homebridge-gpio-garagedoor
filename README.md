# homebridge-gpio-garagedoor

[![npm version](https://badge.fury.io/js/homebridge-gpio-garagedoor.svg)](https://badge.fury.io/js/homebridge-gpio-garagedoor)
[![Downloads](https://img.shields.io/npm/dm/homebridge-gpio-garagedoor.svg)](https://www.npmjs.com/package/homebridge-gpio-garagedoor)

[Raspberry Pi](https://www.raspberrypi.org) GPIO based Garage Door plugin for [Homebridge](https://homebridge.io)

This plugin allows you to control and monitor your garage door using Raspberry Pi GPIO pins through HomeKit.

## Features

- **Door Control**: Open/close garage door via HomeKit
- **Door Status**: Real-time monitoring of door position (open/closed)
- **Safety**: Prevents operation while door is moving
- **Configurable**: Support for both Normally Open (NO) and Normally Closed (NC) sensors
- **Modern**: Built for Homebridge v1.6+ with full TypeScript support

## Requirements

- **Homebridge v1.6.0** or higher
- **Node.js v18.15.0** or higher
- **Raspberry Pi** with GPIO access
- **Garage door relay** connected to GPIO pin
- **Door position sensor** (optional but recommended)

## Installation

### Option 1: Homebridge Config UI X (Recommended)

1. Search for `homebridge-gpio-garagedoor` in the Homebridge Config UI X plugin store
2. Install the plugin
3. Configure using the graphical interface

### Option 2: Command Line

```bash
npm install -g homebridge-gpio-garagedoor
```

## Configuration

### Basic Configuration

```json
{
  "accessories": [
    {
      "accessory": "GPIOGarageDoor",
      "name": "Garage Door",
      "doorSwitchPin": 23,
      "doorSensorPin": 24,
      "isNCSensor": false,
      "doorOpensInSeconds": 15
    }
  ]
}
```

### Configuration Options

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `accessory` | string | ✅ | - | Must be `"GPIOGarageDoor"` |
| `name` | string | ✅ | - | Display name for the garage door |
| `doorSwitchPin` | number | - | - | GPIO pin connected to garage door relay |
| `doorSensorPin` | number | - | - | GPIO pin connected to door position sensor |
| `isNCSensor` | boolean | - | `false` | Set to `true` if using Normally Closed sensor |
| `doorOpensInSeconds` | number | - | `15` | Time for door to fully open/close |
| `id` | string | - | auto-generated | Unique identifier for the accessory |

### Hardware Setup

#### Door Switch (Relay)
- Connect relay control pin to specified `doorSwitchPin`
- Relay should momentarily activate garage door opener (like a button press)
- Typical activation time: 1 second

#### Door Sensor (Optional but Recommended)
- **Magnetic Reed Switch**: Mount magnet on door, sensor on frame
- **Limit Switch**: Mechanical switch activated when door is closed
- **Normally Open (NO)**: Circuit closed when door is closed (default)
- **Normally Closed (NC)**: Circuit open when door is closed (set `isNCSensor: true`)

## Wiring Diagram

```
Raspberry Pi                  Garage Door System
                             
GPIO Pin (Switch) ──→ Relay ──→ Door Opener Terminals
                             
GPIO Pin (Sensor) ──→ Door Position Sensor
Ground           ──→ Common Ground
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Run Homebridge with proper GPIO permissions
   ```bash
   sudo usermod -a -G gpio homebridge
   ```

2. **GPIO Already in Use**: Check if other processes are using the GPIO pins
   ```bash
   lsof /dev/gpiomem
   ```

3. **Door State Incorrect**: Check sensor wiring and `isNCSensor` setting

### Debug Mode

Enable debug logging by setting the Homebridge debug mode:
```bash
DEBUG=* homebridge
```

## Hardware Compatibility

- **Raspberry Pi**: All models with 40-pin GPIO header
- **GPIO Library**: Uses `onoff` library for GPIO control
- **Door Operators**: Compatible with most garage door openers that accept dry contact closure

## Version History

- **v1.0.0**: Modern Homebridge v1.6+ support, TypeScript rewrite, improved error handling
- **v0.2.2**: Legacy version (Homebridge v0.2.5+)

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/kraigm/homebridge-gpio-garagedoor).

## License

ISC License - see LICENSE file for details.
