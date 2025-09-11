# MicroPinouts - TODO List

## Bugs to Fix

### Pin Name Alignment Issue
- **Issue**: Pin names (labels) are not perfectly aligned with the thick rectangle pins
- **Description**: The pin names are positioned slightly off from their corresponding pins, particularly noticeable at the top and bottom
- **Priority**: Medium
- **Status**: Open
- **Notes**: Pin names need precise positioning to match the exact pin locations (6-8%, 17-19%, 28-30%, etc.)

### PDF Specifications Positioning Bug
- **Issue**: Specifications section disappears from PDF when positioned after pin table
- **Description**: When calculating position for specifications after the pin table, the content goes off the page
- **Priority**: High
- **Status**: Open
- **Notes**: Need to fix position calculation or implement page break handling for specifications

## Future Enhancements

### Pinout Creator Tool
- [ ] **Dynamic pinout generator** based on chip specifications
- [ ] **Package type support**: DIP, SSOP, QFP, BGA, etc.
- [ ] **Pin count configuration**: Automatic layout generation for any pin count
- [ ] **Custom pin naming**: User-defined pin names and functions
- [ ] **Pin spacing calculator**: Automatic spacing based on package dimensions
- [ ] **Export functionality**: Generate SVG, PNG, or PDF pinout diagrams
- [ ] **Template system**: Save and reuse custom pinout layouts

### Additional Microcontrollers
- [ ] Add more microcontrollers (Arduino Uno, ESP32, Raspberry Pi Pico)
- [ ] Pin comparison tool
- [ ] Search and filter functionality
- [ ] User-contributed pinout data

### UI/UX Improvements
- [ ] Dark mode theme
- [ ] Pinout sharing URLs
- [ ] Interactive pin highlighting on hover
- [ ] Pin function descriptions with more detail
- [ ] Mobile-optimized touch interactions

## Completed Features

- [x] Basic PIC16F84A pinout diagram
- [x] Interactive pin selection
- [x] Pin information display
- [x] Responsive design
- [x] Three-column layout (left pins, chip body, right pins)
- [x] Thick rectangle pins sticking out of chip body
- [x] Pin numbers inside chip body
- [x] Pin 1 indicator (red circle)
- [x] Professional styling and animations

## Technical Architecture Notes

### Current Layout Structure
The current PIC16F84A implementation provides a solid foundation for the pinout creator:

**Layout Components:**
- **Three-column flexbox layout**: Left pins, chip body, right pins
- **Dynamic pin positioning**: CSS-based positioning system using percentages
- **Pin spacing calculation**: Mathematical approach for even distribution
- **Responsive design**: Scales appropriately across devices

**Key CSS Patterns:**
- **Pin positioning**: Uses `nth-child` selectors with percentage-based `top` values
- **Pin spacing**: Calculated as `(total_height - pin_height * pin_count) / gaps`
- **Pin connectors**: CSS gradients for thick rectangle pins
- **Interactive elements**: Hover effects and selection states

**Reusable Elements:**
- **Pin data structure**: JavaScript object with pin information
- **CSS positioning system**: Percentage-based layout that scales
- **Interactive functionality**: Click handlers and keyboard navigation
- **Responsive breakpoints**: Mobile, tablet, desktop layouts

This architecture can be extended to support:
- **Variable pin counts** (8, 14, 16, 20, 24, 28, 32, 40, 44, 48, 64+ pins)
- **Different package types** (DIP, SSOP, QFP, BGA, etc.)
- **Custom pin configurations** (single-sided, dual-sided, quad-sided)
- **Dynamic spacing calculations** based on package dimensions
