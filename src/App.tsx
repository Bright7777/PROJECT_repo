import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
} from 'react-native';
import {Provider as PaperProvider} from 'react-native-paper';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import CameraScreen from './screens/CameraScreen';
import HomeScreen from './screens/HomeScreen';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'camera'>('home');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.CAMERA 
        : PERMISSIONS.ANDROID.CAMERA;
      
      const result = await request(permission);
      
      if (result === RESULTS.GRANTED) {
        setHasPermission(true);
      } else {
        setHasPermission(false);
        Alert.alert(
          'Camera Permission',
          'Camera access is required to detect currency notes.',
          [
            {text: 'OK', onPress: () => {}},
          ]
        );
      }
    } catch (error) {
      console.error('Permission request error:', error);
      setHasPermission(false);
    }
  };

  const navigateToCamera = () => {
    if (hasPermission) {
      setCurrentScreen('camera');
    } else {
      requestCameraPermission();
    }
  };

  const navigateToHome = () => {
    setCurrentScreen('home');
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <PaperProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
          {currentScreen === 'home' ? (
            <HomeScreen onNavigateToCamera={navigateToCamera} />
          ) : (
            <CameraScreen 
              onNavigateToHome={navigateToHome}
              hasPermission={hasPermission}
            />
          )}
        </SafeAreaView>
      </PaperProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});

export default App;