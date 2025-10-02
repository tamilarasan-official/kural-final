import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../contexts/LanguageContext';
import { voterAPI } from '../../services/api/voter';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

type CatalogueItem = {
  _id: string;
  title: string;
  price: string;
  description: string;
  fullDescription: string;
  imageUrl: string;
  features: string[];
  category: string;
  isActive: boolean;
  sortOrder: number;
};

export default function CatalogueScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const [products, setProducts] = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCatalogueItems();
  }, []);

  const loadCatalogueItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await voterAPI.getCatalogueItems({ page: 1, limit: 50 });
      
      if (response.success && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setError('Failed to load catalogue items');
      }
    } catch (err: any) {
      console.log('Catalogue fetch error:', err?.message || err);
      setError('Failed to load catalogue items');
    } finally {
      setLoading(false);
    }
  };
  
  const handleProductPress = (product: CatalogueItem) => {
    router.push({
      pathname: '/(tabs)/product-detail',
      params: {
        productId: product._id,
        title: product.title,
        price: product.price,
        description: product.description,
        fullDescription: product.fullDescription,
        imageUrl: product.imageUrl,
        features: JSON.stringify(product.features)
      }
    });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Catalogue</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Loading catalogue items...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCatalogueItems}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.gridContainer}>
            {products.map((product) => (
              <TouchableOpacity 
                key={product._id} 
                style={styles.productCard}
                onPress={() => handleProductPress(product)}
              >
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: product.imageUrl }} 
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle}>{product.title}</Text>
                  <Text style={styles.productDescription}>{product.description}</Text>
                  <Text style={styles.productPrice}>{product.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#E3F2FD',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  productCard: {
    width: width < 400 ? '100%' : '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 140,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    padding: 16,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 6,
  },
  productDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
