import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import {Card, Button, Title, Paragraph} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface HomeScreenProps {
  onNavigateToCamera: () => void;
}

const {width, height} = Dimensions.get('window');

const HomeScreen: React.FC<HomeScreenProps> = ({onNavigateToCamera}) => {
  const supportedCurrencies = [
    {name: 'US Dollar', code: 'USD', flag: '🇺🇸'},
    {name: 'Euro', code: 'EUR', flag: '🇪🇺'},
    {name: 'British Pound', code: 'GBP', flag: '🇬🇧'},
    {name: 'Japanese Yen', code: 'JPY', flag: '🇯🇵'},
    {name: 'Canadian Dollar', code: 'CAD', flag: '🇨🇦'},
    {name: 'Australian Dollar', code: 'AUD', flag: '🇦🇺'},
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <View style={styles.headerContent}>
          <Icon name="camera-alt" size={60} color="#fff" />
          <Title style={styles.headerTitle}>Currency Detector</Title>
          <Paragraph style={styles.headerSubtitle}>
            Instantly identify currency notes using your camera
          </Paragraph>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Card style={styles.mainCard}>
          <Card.Content>
            <View style={styles.cardContent}>
              <Icon name="visibility" size={48} color="#667eea" />
              <Title style={styles.cardTitle}>How it works</Title>
              <Paragraph style={styles.cardDescription}>
                Point your camera at any currency note and our AI will instantly
                identify the denomination, country, and provide detailed information.
              </Paragraph>
            </View>
          </Card.Content>
        </Card>

        <TouchableOpacity
          style={styles.startButton}
          onPress={onNavigateToCamera}
          activeOpacity={0.8}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.buttonGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            <Icon name="camera-alt" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Start Detection</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Card style={styles.featuresCard}>
          <Card.Content>
            <Title style={styles.featuresTitle}>Supported Currencies</Title>
            <View style={styles.currencyGrid}>
              {supportedCurrencies.map((currency, index) => (
                <View key={index} style={styles.currencyItem}>
                  <Text style={styles.currencyFlag}>{currency.flag}</Text>
                  <Text style={styles.currencyCode}>{currency.code}</Text>
                  <Text style={styles.currencyName}>{currency.name}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Icon name="flash-on" size={24} color="#4CAF50" />
              <Text style={styles.infoText}>Real-time detection</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="security" size={24} color="#2196F3" />
              <Text style={styles.infoText}>Secure and private</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="offline-pin" size={24} color="#FF9800" />
              <Text style={styles.infoText}>Works offline</Text>
            </View>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  mainCard: {
    marginBottom: 20,
    elevation: 4,
    borderRadius: 12,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
  },
  cardDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    color: '#666',
    lineHeight: 24,
  },
  startButton: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  featuresCard: {
    marginBottom: 20,
    elevation: 4,
    borderRadius: 12,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  currencyItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  currencyFlag: {
    fontSize: 24,
    marginBottom: 4,
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  currencyName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: 20,
    elevation: 4,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
});

export default HomeScreen;