import React, {useRef, useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import {Camera, useCameraDevices, useFrameProcessor} from 'react-native-vision-camera';
import {Card, Title, Paragraph, ActivityIndicator} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {runOnJS} from 'react-native-reanimated';
import CurrencyDetectionResult from '../components/CurrencyDetectionResult';
import {DetectedCurrency} from '../types/currency';
import {detectCurrency} from '../services/currencyDetection';

interface CameraScreenProps {
  onNavigateToHome: () => void;
  hasPermission: boolean | null;
}

const {width, height} = Dimensions.get('window');

const CameraScreen: React.FC<CameraScreenProps> = ({
  onNavigateToHome,
  hasPermission,
}) => {
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices.back;

  const [isActive, setIsActive] = useState(true);
  const [detectedCurrency, setDetectedCurrency] = useState<DetectedCurrency | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startPulseAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const onCurrencyDetected = useCallback((currency: DetectedCurrency) => {
    setDetectedCurrency(currency);
    setIsProcessing(false);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    if (!isProcessing) {
      runOnJS(setIsProcessing)(true);
      
      // Simulate currency detection with mock data
      setTimeout(() => {
        runOnJS(onCurrencyDetected)({
          currency: 'USD',
          denomination: 20,
          confidence: 0.95,
          country: 'United States',
          description: 'Twenty Dollar Bill',
          features: [
            'Serial number visible',
            'Watermark detected',
            'Security thread present',
          ],
          timestamp: Date.now(),
        });
      }, 1500);
    }
  }, [isProcessing]);

  const toggleFlash = () => {
    setFlashMode(flashMode === 'off' ? 'on' : 'off');
  };

  const resetDetection = () => {
    setDetectedCurrency(null);
    setIsProcessing(false);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Checking camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Icon name="camera-alt" size={80} color="#ccc" />
        <Title style={styles.permissionTitle}>Camera Access Required</Title>
        <Paragraph style={styles.permissionText}>
          Please enable camera access in your device settings to use currency detection.
        </Paragraph>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateToHome}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={styles.camera}
        device={device}
        isActive={isActive}
        frameProcessor={frameProcessor}
        torch={flashMode}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onNavigateToHome}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Currency Detector</Text>
        <TouchableOpacity style={styles.headerButton} onPress={toggleFlash}>
          <Icon 
            name={flashMode === 'on' ? 'flash-on' : 'flash-off'} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>

      {/* Scanning overlay */}
      <View style={styles.overlay}>
        <View style={styles.scanningArea}>
          <Animated.View 
            style={[
              styles.scanningFrame,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <View style={styles.corner} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </Animated.View>
          
          {!detectedCurrency && !isProcessing && (
            <Text style={styles.instructionText}>
              Point camera at a currency note
            </Text>
          )}
          
          {isProcessing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.processingText}>Detecting currency...</Text>
            </View>
          )}
        </View>
      </View>

      {/* Detection result */}
      {detectedCurrency && (
        <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
          <CurrencyDetectionResult
            currency={detectedCurrency}
            onReset={resetDetection}
          />
        </Animated.View>
      )}

      {/* Instructions */}
      {!detectedCurrency && !isProcessing && (
        <View style={styles.instructionsContainer}>
          <Card style={styles.instructionCard}>
            <Card.Content>
              <View style={styles.instructionRow}>
                <Icon name="center-focus-strong" size={20} color="#667eea" />
                <Text style={styles.instructionItem}>Center the note in the frame</Text>
              </View>
              <View style={styles.instructionRow}>
                <Icon name="wb-sunny" size={20} color="#667eea" />
                <Text style={styles.instructionItem}>Ensure good lighting</Text>
              </View>
              <View style={styles.instructionRow}>
                <Icon name="pan-tool" size={20} color="#667eea" />
                <Text style={styles.instructionItem}>Hold steady for best results</Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
    color: '#333',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    color: '#666',
    lineHeight: 24,
  },
  backButton: {
    marginTop: 30,
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningArea: {
    width: width * 0.8,
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningFrame: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
    borderWidth: 3,
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    top: 'auto',
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  instructionText: {
    position: 'absolute',
    bottom: -50,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  processingContainer: {
    alignItems: 'center',
  },
  processingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  resultContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  instructionCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionItem: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
  },
});

export default CameraScreen;