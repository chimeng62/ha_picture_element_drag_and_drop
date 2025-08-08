# Home Assistant Picture-Elements Drag & Drop Editor

A visual editor for creating and editing Home Assistant picture-elements configurations with real-time drag & drop functionality.

## 🚀 Features

- **Visual Drag & Drop**: Drag temperature sensors and humidifiers directly on your floor plan
- **Real-time YAML Generation**: See your configuration update instantly as you move elements
- **Live Preview**: Toggle between placeholder values and actual entity names
- **YAML Editor**: Monaco editor with syntax highlighting and real-time element highlighting during drag
- **Floor Plan Support**: Multi-floor support with automatic image switching
- **Preview Tooltips**: Hover over buttons to see exactly what YAML will be generated

## 🛠️ Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Monaco Editor** for advanced YAML editing
- **@use-gesture/react** for smooth drag interactions
- **styled-components** for CSS-in-JS styling
- **js-yaml** for YAML parsing and generation

## 📦 Quick Start

### 🌐 **Online Version (GitHub Pages)**
Visit the live app: `https://chimeng62.github.io/ha_picture_element_drag_and_drop/`

### 💻 **Local Portable Version**
1. Download/clone this repository
2. Double-click `SETUP.bat` (Windows) for first-time setup
3. Double-click `launch-app.bat` to launch anytime
4. App opens at `http://localhost:3000`

### 🔧 **Development Setup**
```bash
# Clone the repository
git clone <repository-url>
cd ha_picture_element_drag_and_drop

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🎯 How to Use

### 1. **Add Floor Plan Image**
- Drag and drop your floor plan image into the preview area
- Supported formats: PNG, JPG, JPEG, GIF
- Image is automatically saved and persists between sessions

### 2. **Add Temperature Sensors**
- Select floor number (1-5)
- Select sensor ID (1-5) 
- Click "Add Sensor" to add both temperature and humidity sensors
- Sensors appear as `🌡️30.9 °C` and `1 💧76.0%` in placeholder mode

### 3. **Add Humidifiers**
- Select floor number (1-5)
- Click "Add Humidifier" to add a state-based image element
- Humidifiers show different images based on on/off/unavailable states

### 4. **Drag & Position Elements**
- Click and drag any element to reposition it
- Position updates are reflected instantly in the YAML editor
- Yellow highlighting shows which YAML lines correspond to the dragged element

### 5. **Toggle Display Modes**
- **Placeholder Mode**: Shows realistic values like `🌡️30.9 °C`
- **Entity Mode**: Shows actual entity names like `sensor.temp_1f_1_temp`

## 🎨 Interface Components

### **Toolbar (Top)**
- **Add Temperature Sensor**: Creates temperature + humidity sensor pair
- **Add Humidifier**: Creates state-based image element
- **Display Options**: Toggle between placeholder and entity display
- **Preview Tooltips**: Hover over buttons to see generated YAML

### **YAML Editor (Left - 30%)**
- Monaco editor with YAML syntax highlighting
- Dark theme for better readability
- Real-time highlighting during element dragging
- Auto-saves changes to localStorage

### **Visual Preview (Right - 70%)**
- Interactive floor plan canvas
- Drag & drop element positioning
- Real-time visual feedback
- Image drop zone for floor plans

## 📋 Generated YAML Structure

### **Temperature Sensor**
```yaml
- type: state-label
  entity: sensor.temp_1f_1_temp
  prefix: '🌡️'
  style:
    left: '3%'
    top: '5%'
    color: 'red'
    font-size: '14px'
- type: state-label
  entity: sensor.temp_1f_1_humidity
  prefix: '1 💧'
  style:
    left: '1.5%'
    top: '8%'
    color: 'red'
    font-size: '14px'
```

### **Humidifier**
```yaml
- type: image
  entity: switch.switch_humidifier_1f_floor
  state_image:
    'on': '/local/images/gif/on_humidifier.gif'
    'off': '/local/images/gif/off_humidifier.png'
    'unavailable': '/local/images/gif/off_humidifier.png'
  style:
    top: '0%'
    left: '0%'
    width: '15%'
```

## 🔧 Configuration

### **Floor Plan Images**
- Expected path format: `/local/images/floor_plan_Xst_floor.png` (where X = floor number)
- Images should be placed in your Home Assistant `www/images/` directory

### **Entity Naming Convention**
- **Temperature**: `sensor.temp_Xf_Y_temp` (X=floor, Y=sensor ID)
- **Humidity**: `sensor.temp_Xf_Y_humidity` (X=floor, Y=sensor ID)  
- **Humidifier**: `switch.switch_humidifier_Xf_floor` (X=floor)

## 💾 Data Persistence

- **YAML Configuration**: Saved to localStorage as `ha-picture-yaml`
- **Floor Plan Image**: Saved to localStorage as `ha-picture-image`
- **Display Preferences**: Saved to localStorage as `ha-show-placeholders`
- All data persists between browser sessions

## 🎯 Usage Tips

1. **Positioning**: Elements below 50% left positioning match HA exactly
2. **Multi-floor**: Changing floor in any dropdown updates the floor plan image
3. **YAML Export**: Copy the generated YAML directly into your Home Assistant configuration
4. **Highlighting**: When dragging, yellow highlights show corresponding YAML lines
5. **Preview**: Hover over "Add" buttons to preview the exact YAML that will be generated

## 🚀 Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📁 Project Structure

```
src/
├── components/
│   ├── DraggableElement.tsx    # Individual draggable elements
│   ├── ImagePreview.tsx        # Main canvas/preview area
│   ├── Toolbar.tsx             # Control panel with buttons
│   ├── YamlEditor.tsx          # Monaco-based YAML editor
│   └── GlobalStyle.tsx         # Global CSS styles
├── types/
│   └── ha-types.ts             # TypeScript type definitions
├── utils/
│   └── yaml-utils.ts           # YAML parsing and generation
├── App.tsx                     # Main application component
└── main.tsx                    # Application entry point
```

## 🔗 Integration with Home Assistant

1. Copy the generated YAML configuration
2. Add it to your `ui-lovelace.yaml` or dashboard configuration
3. Ensure your floor plan images are in `/config/www/images/`
4. Verify entity names match your actual Home Assistant entities

## � Deployment Options

### **GitHub Pages (Online)**
- See `GITHUB-PAGES.md` for deployment instructions
- Automatic deployment on every push to main
- Live at: `https://chimeng62.github.io/ha_picture_element_drag_and_drop/`

### **Portable Local App**
- See `PORTABLE-README.md` for setup instructions
- Double-click `launch-app.bat` to run locally
- No internet required, runs at `http://localhost:3000`

## �📜 License

This project is open source and available under the MIT License.