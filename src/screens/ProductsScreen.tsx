import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Button,
  Card,
  Input,
  LoadingOverlay,
  SuccessMessage,
} from '../components';
import LinkrunnerService from '../services/LinkrunnerService';
import { Screen, RootStackParamList } from '../types';

type ProductsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  Screen.PRODUCTS
>;

interface Product {
  id: string;
  name: string;
  price: number;
}

const PRODUCTS: Product[] = [
  { id: 'prod_1', name: 'Premium Subscription', price: 9.99 },
  { id: 'prod_2', name: 'Extended License', price: 29.99 },
  { id: 'prod_3', name: 'Enterprise Package', price: 99.99 },
  { id: 'prod_4', name: 'Basic Add-on', price: 4.99 },
];

/**
 * Products Screen
 * 
 * Demonstrates:
 * - Tracking ecommerce events (view, add to cart)
 * - Capturing revenue/payments
 * - Handling purchase workflows
 * - Removing/refunding payments
 * 
 * DEVELOPER EXPERIENCE OBSERVATIONS:
 * - Revenue tracking is well-structured with clear payment types
 * - Ecommerce events require proper data formatting for Meta sync
 * - Payment removal for refunds is straightforward
 * - SDK only stores events for attributed users (important!)
 */
export const ProductsScreen: React.FC<ProductsScreenProps> = ({
  navigation,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [cartItems, setCartItems] = useState<Array<{ product: Product; qty: number }>>([]);

  const handleViewProduct = async (product: Product) => {
    try {
      setSelectedProduct(product);
      setLoading(true);

      await LinkrunnerService.trackViewContent(
        product.id,
        product.name,
        product.price
      );

      console.log('[ProductsScreen] View product tracked:', product.id);
    } catch (err) {
      console.error('[ProductsScreen] Error tracking view:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      setLoading(true);

      await LinkrunnerService.trackAddToCart(
        product.id,
        product.name,
        product.price
      );

      // Add to local cart
      const existingItem = cartItems.find(item => item.product.id === product.id);
      if (existingItem) {
        existingItem.qty += 1;
      } else {
        setCartItems([...cartItems, { product, qty: 1 }]);
      }

      setSuccessMessage(`${product.name} added to cart`);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);

      console.log('[ProductsScreen] Add to cart tracked:', product.id);
    } catch (err) {
      console.error('[ProductsScreen] Error tracking add to cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      if (!userId.trim()) {
        alert('Please enter a User ID to complete purchase');
        return;
      }

      if (cartItems.length === 0) {
        alert('Cart is empty');
        return;
      }

      setLoading(true);

      const orderId = `order_${Date.now()}`;
      const totalValue = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.qty,
        0
      );

      await LinkrunnerService.capturePurchase(
        orderId,
        userId,
        cartItems.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.qty,
        })),
        totalValue
      );

      setSuccessMessage('Purchase captured successfully!');
      setSuccess(true);
      setCartItems([]);
      setUserId('');

      setTimeout(() => setSuccess(false), 2000);
      console.log('[ProductsScreen] Purchase captured:', orderId);
    } catch (err) {
      console.error('[ProductsScreen] Error capturing purchase:', err);
      alert('Error capturing purchase');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (orderId: string) => {
    try {
      if (!userId.trim()) {
        alert('Please enter a User ID');
        return;
      }

      setLoading(true);

      await LinkrunnerService.removePayment(userId, orderId);

      setSuccessMessage('Refund processed');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);

      console.log('[ProductsScreen] Refund processed:', orderId);
    } catch (err) {
      console.error('[ProductsScreen] Error processing refund:', err);
      alert('Error processing refund');
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay visible={loading} message="Processing..." />
      <SuccessMessage visible={success} message={successMessage} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Products & Ecommerce</Text>
          <Text style={styles.subtitle}>
            Track viewing, cart additions, and purchases
          </Text>
        </View>

        <Card title="Available Products">
          <FlatList
            scrollEnabled={false}
            data={PRODUCTS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.productItem}
                onPress={() => handleViewProduct(item)}
              >
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                </View>
                <Button
                  title="Add to Cart"
                  onPress={() => handleAddToCart(item)}
                />
              </TouchableOpacity>
            )}
          />
        </Card>

        {selectedProduct && (
          <Card title="Selected Product">
            <Text style={styles.productDetail}>
              {`Name: ${selectedProduct.name}\n`}
              {`Price: $${selectedProduct.price.toFixed(2)}\n`}
              {`Product ID: ${selectedProduct.id}`}
            </Text>
          </Card>
        )}

        {cartItems.length > 0 && (
          <Card title={`Shopping Cart (${cartItems.length} items)`}>
            {cartItems.map((item, idx) => (
              <View key={idx} style={styles.cartItem}>
                <Text style={styles.cartItemName}>
                  {item.product.name} × {item.qty}
                </Text>
                <Text style={styles.cartItemPrice}>
                  ${(item.product.price * item.qty).toFixed(2)}
                </Text>
              </View>
            ))}
            <View style={styles.cartTotal}>
              <Text style={styles.cartTotalLabel}>Total:</Text>
              <Text style={styles.cartTotalPrice}>
                ${cartTotal.toFixed(2)}
              </Text>
            </View>
          </Card>
        )}

        <Card title="Complete Purchase">
          <Input
            label="User ID *"
            placeholder="Enter the user ID to associate with purchase"
            value={userId}
            onChangeText={setUserId}
          />

          <Text style={styles.hint}>
            Purchase data is associated with this user ID. The user must be
            registered via the Signup screen for revenue to be tracked.
          </Text>

          <Button
            title={`Purchase (${cartItems.length} items)`}
            onPress={handlePurchase}
            disabled={cartItems.length === 0 || !userId.trim()}
          />

          {cartItems.length === 0 && (
            <Text style={styles.emptyCartText}>
              Add items to cart to complete purchase
            </Text>
          )}
        </Card>

        <Card title="Refund Management">
          <Input
            label="Order ID to Refund"
            placeholder="e.g., order_1234567890"
            value={userId}
            onChangeText={setUserId}
          />

          <Button
            title="Process Refund"
            variant="danger"
            onPress={() => handleRefund(userId)}
            disabled={!userId.trim()}
          />

          <Text style={styles.hint}>
            Enter the order ID to refund. This removes the payment record.
          </Text>
        </Card>

        <Card title="💡 Developer Notes">
          <Text style={styles.noteText}>
            • Ecommerce events require Meta-formatted data{'\n'}
            • Revenue is only tracked for attributed users{'\n'}
            • <Text style={styles.code}>capturePayment()</Text> for all revenue{'\n'}
            • <Text style={styles.code}>removePayment()</Text> for refunds{'\n'}
            • Include <Text style={styles.code}>amount</Text> in trackEvent for ad network optimization{'\n'}
            • Order ID should be unique for each transaction
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 4,
  },
  productDetail: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cartItemName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  cartTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
  },
  cartTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  cartTotalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  hint: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  emptyCartText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  code: {
    fontFamily: 'Courier',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 4,
    color: '#333',
  },
});
