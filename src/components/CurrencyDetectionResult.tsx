import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {Card, Title, Paragraph, Chip} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {DetectedCurrency} from '../types/currency';

interface CurrencyDetectionResultProps {
  currency: DetectedCurrency;
  onReset: () => void;
}

const {width} = Dimensions.get('window');

const CurrencyDetectionResult: React.FC<CurrencyDetectionResultProps> = ({
  currency,
  onReset,
}) => {
  const getCurrencySymbol = (currencyCode: string): string => {
    const symbols: {[key: string]: string} = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
    };
    return symbols[currencyCode] || currencyCode;
  };

  const getCurrencyFlag = (currencyCode: string): string => {
    const flags: {[key: string]: string} = {
      USD: '🇺🇸',
      EUR: '🇪🇺',
      GBP: '🇬🇧',
      JPY: '🇯🇵',
      CAD: '🇨🇦',
      AUD: '🇦🇺',
    };
    return flags[currencyCode] || '💰';
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return '#4CAF50';
    if (confidence >= 0.7) return '#FF9800';
    return '#F44336';
  };

  const getConfidenceText = (confidence: number): string => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  };

  return (
    <Card style={styles.container} elevation={8}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.currencyFlag}>
              {getCurrencyFlag(currency.currency)}
            </Text>
            <View style={styles.headerText}>
              <Text style={styles.denomination}>
                {getCurrencySymbol(currency.currency)}{currency.denomination}
              </Text>
              <Text style={styles.country}>{currency.country}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onReset}>
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Card.Content style={styles.content}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Description:</Text>
          <Text style={styles.value}>{currency.description}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Currency Code:</Text>
          <Text style={styles.value}>{currency.currency}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Confidence:</Text>
          <View style={styles.confidenceContainer}>
            <View
              style={[
                styles.confidenceIndicator,
                {backgroundColor: getConfidenceColor(currency.confidence)},
              ]}
            />
            <Text style={styles.confidenceText}>
              {getConfidenceText(currency.confidence)} ({Math.round(currency.confidence * 100)}%)
            </Text>
          </View>
        </View>

        {currency.features && currency.features.length > 0 && (
          <View style={styles.featuresSection}>
            <Text style={styles.featuresLabel}>Security Features:</Text>
            <View style={styles.featuresContainer}>
              {currency.features.map((feature, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  style={styles.featureChip}
                  textStyle={styles.featureText}
                  icon={() => <Icon name="check-circle" size={16} color="#4CAF50" />}>
                  {feature}
                </Chip>
              ))}
            </View>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onReset}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.buttonGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}>
              <Icon name="camera-alt" size={20} color="#fff" />
              <Text style={styles.buttonText}>Scan Another</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.timestamp}>
          <Icon name="access-time" size={16} color="#999" />
          <Text style={styles.timestampText}>
            Detected at {new Date(currency.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencyFlag: {
    fontSize: 32,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  denomination: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  country: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingTop: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  confidenceIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  confidenceText: {
    fontSize: 16,
    color: '#666',
  },
  featuresSection: {
    marginTop: 20,
  },
  featuresLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    marginBottom: 8,
    marginRight: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#333',
  },
  actionButtons: {
    marginTop: 24,
    marginBottom: 16,
  },
  actionButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  timestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  timestampText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
});

export default CurrencyDetectionResult;