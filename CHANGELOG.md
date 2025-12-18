# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-18

### 🚀 Major Update - Homebridge v1.6+ Support

This is a complete rewrite of the plugin to support modern Homebridge versions.

### Added
- **Modern Homebridge API**: Full compatibility with Homebridge v1.6.0+
- **TypeScript Rewrite**: Complete TypeScript implementation with proper types
- **Configuration Schema**: JSON schema for Homebridge Config UI X integration
- **Better Error Handling**: Improved error messages and graceful failure handling
- **Enhanced Logging**: More detailed debug information and better log structure
- **Process Safety**: Proper GPIO cleanup on process termination
- **Modern Dependencies**: Updated to use latest `onoff` library (v6.0.3)

### Changed
- **Breaking**: Minimum Node.js version is now v18.15.0
- **Breaking**: Minimum Homebridge version is now v1.6.0
- **Breaking**: Removed dependency on `bluebird` promises (using native async/await)
- **API Structure**: Completely modernized plugin architecture
- **Build System**: New TypeScript build process with proper output structure

### Improved
- **Performance**: Better async handling with native promises
- **Reliability**: More robust GPIO state management
- **Maintainability**: Clean, modern codebase with proper TypeScript types
- **Documentation**: Comprehensive README with hardware setup guides

### Removed
- **Legacy Support**: Dropped support for old Homebridge versions (< v1.6.0)
- **Old Dependencies**: Removed `bluebird` and legacy TypeScript definitions
- **Complex Inheritance**: Simplified class structure without runtime prototype manipulation

### Technical Details
- Migrated from callback-based to async/await pattern
- Replaced deprecated Homebridge APIs with modern equivalents  
- Implemented proper AccessoryPlugin interface
- Added comprehensive error boundary handling
- Updated to ES2020 target with modern JavaScript features

## [0.2.2] - 2016-07-XX

### Legacy Version
- Initial implementation for Homebridge v0.2.5+
- Basic GPIO garage door control
- Door sensor and switch support
- Bluebird promise-based async handling

---

## Migration Guide from v0.2.2 to v1.0.0

### Prerequisites
1. **Update Node.js**: Ensure you're running Node.js v18.15.0 or higher
2. **Update Homebridge**: Upgrade to Homebridge v1.6.0 or higher

### Configuration Changes
The configuration format remains the same, but some improvements:
- Better validation through JSON schema
- Enhanced error messages for invalid configurations
- Optional parameters are now properly optional

### Installation
```bash
# Remove old version
npm uninstall -g homebridge-gpio-garagedoor

# Install new version  
npm install -g homebridge-gpio-garagedoor@^1.0.0
```

### Compatibility
- **Hardware**: No changes required - same GPIO setup
- **HomeKit**: Seamless upgrade - no re-pairing needed
- **Configuration**: Existing config files work without modification