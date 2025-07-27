# Currency Detection App

A React Native application that uses camera functionality to detect and identify currency notes in real-time.

## Features

- **Real-time Currency Detection**: Point your camera at any currency note for instant identification
- **Multi-Currency Support**: Supports USD, EUR, GBP, JPY, CAD, and AUD
- **Security Features Detection**: Identifies watermarks, security threads, and other security features
- **Beautiful UI**: Modern gradient design with smooth animations
- **Camera Controls**: Flash toggle and easy navigation
- **Confidence Scoring**: Shows detection confidence levels
- **Offline Capable**: Works without internet connection

## Supported Currencies

- 🇺🇸 US Dollar (USD) - $1, $2, $5, $10, $20, $50, $100
- 🇪🇺 Euro (EUR) - €5, €10, €20, €50, €100, €200, €500
- 🇬🇧 British Pound (GBP) - £5, £10, £20, £50
- 🇯🇵 Japanese Yen (JPY) - ¥1000, ¥2000, ¥5000, ¥10000
- 🇨🇦 Canadian Dollar (CAD) - C$5, C$10, C$20, C$50, C$100
- 🇦🇺 Australian Dollar (AUD) - A$5, A$10, A$20, A$50, A$100

## Installation

### Prerequisites

- Node.js >= 16
- React Native development environment
- Android Studio (for Android development)
- Xcode (for iOS development)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CurrencyDetectionApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Android Setup**
   Make sure you have Android SDK and build tools installed.

### Running the App

**For Android:**
```bash
npm run android
```

**For iOS:**
```bash
npm run ios
```

**Start Metro bundler:**
```bash
npm start
```

## Permissions

The app requires the following permissions:

### Android
- `CAMERA` - For accessing the device camera
- `RECORD_AUDIO` - Required by camera module
- `WRITE_EXTERNAL_STORAGE` - For saving images (if needed)
- `READ_EXTERNAL_STORAGE` - For reading images (if needed)

### iOS
- `NSCameraUsageDescription` - For accessing the device camera
- `NSPhotoLibraryUsageDescription` - For accessing photo library

## Architecture

```
src/
├── components/           # Reusable UI components
│   └── CurrencyDetectionResult.tsx
├── screens/             # Screen components
│   ├── HomeScreen.tsx
│   └── CameraScreen.tsx
├── services/            # Business logic and API services
│   └── currencyDetection.ts
├── types/               # TypeScript type definitions
│   └── currency.ts
└── App.tsx             # Main application component
```

## Key Components

### HomeScreen
- Welcome interface with app introduction
- Supported currencies display
- Features overview
- Navigation to camera screen

### CameraScreen
- Real-time camera view with detection overlay
- Processing indicators and animations
- Flash control and navigation
- Detection result display

### CurrencyDetectionResult
- Detailed currency information display
- Confidence scoring with visual indicators
- Security features listing
- Action buttons for continued detection

## Technologies Used

- **React Native** - Cross-platform mobile development
- **TypeScript** - Type-safe JavaScript
- **React Native Vision Camera** - Camera functionality
- **React Native Reanimated** - Smooth animations
- **React Native Paper** - Material Design components
- **React Native Vector Icons** - Icon library
- **React Native Linear Gradient** - Gradient backgrounds
- **React Native Permissions** - Permission handling

## Mock Detection

Currently, the app uses mock detection data for demonstration purposes. The detection service simulates:
- Random currency selection from supported currencies
- Varying confidence levels (70-100%)
- Random security features detection
- Realistic processing delays

## Future Enhancements

- **Real AI Integration**: Implement actual machine learning models for currency detection
- **Enhanced Security**: Add more sophisticated security feature detection
- **Currency Exchange**: Integrate with exchange rate APIs
- **History**: Save detection history
- **Offline Storage**: Cache currency information
- **More Currencies**: Expand support to additional currencies
- **Batch Detection**: Support for multiple notes in a single frame

## Development

### Adding New Currencies

1. Update the `currencyDatabase` in `src/services/currencyDetection.ts`
2. Add currency information including denominations and metadata
3. Update the supported currencies list in `HomeScreen.tsx`

### Customizing UI

- Modify gradient colors in component styles
- Update animations in `CameraScreen.tsx`
- Customize card layouts in component files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the repository.