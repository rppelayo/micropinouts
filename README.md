# MicroPinouts - Interactive Microcontroller Pinouts

A modern, interactive web application for viewing microcontroller pinout diagrams. Currently features the PIC16F84A with plans to expand to other popular microcontrollers.

## Features

- **Interactive Pinout Diagrams**: Click on any pin to view detailed information
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with smooth animations
- **Keyboard Navigation**: Use arrow keys to navigate between pins
- **Detailed Pin Information**: Each pin shows functions, voltage ranges, and descriptions
- **Specification Panel**: Complete microcontroller specifications at a glance

## Current Microcontrollers

- **PIC16F84A**: 8-bit RISC microcontroller with 18-pin DIP package

## Getting Started

1. Clone or download the project files
2. Open `index.html` in a web browser
3. Click on any pin in the diagram to view its details
4. Use arrow keys to navigate between pins
5. Press Escape to deselect the current pin

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality and pinout data
└── README.md           # This file
```

## Technical Details

### PIC16F84A Specifications
- **Architecture**: 8-bit RISC
- **Flash Memory**: 1.75 KB
- **RAM**: 68 bytes
- **EEPROM**: 64 bytes
- **I/O Pins**: 13
- **Clock Speed**: Up to 20 MHz
- **Package**: 18-pin DIP
- **Voltage Range**: 2.0V - 5.5V

### Pin Functions
- **Port A (RA0-RA4)**: General purpose I/O
- **Port B (RB0-RB7)**: General purpose I/O with interrupt capabilities
- **Power Pins**: VDD (pin 18), VSS (pin 7)
- **Clock Pins**: OSC1/CLKIN (pin 8), OSC2/CLKOUT (pin 9)
- **Reset Pin**: MCLR/VPP (pin 1)
- **Special Functions**: Timer0 clock input, external interrupt

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Future Enhancements

- [ ] Add more microcontrollers (Arduino Uno, ESP32, Raspberry Pi Pico)
- [ ] Pin comparison tool
- [ ] Export pinout diagrams
- [ ] Search and filter functionality
- [ ] User-contributed pinout data
- [ ] Dark mode theme
- [ ] Pinout sharing URLs

## Contributing

This project is designed to be easily extensible. To add a new microcontroller:

1. Add pinout data to the JavaScript file
2. Create SVG diagram in the HTML
3. Update the specifications panel
4. Test interactivity and responsiveness

## License

This project is open source and available under the MIT License.

## Domain

This application is designed for the domain **micropinouts.com** - a perfect match for the interactive microcontroller pinout reference tool.
