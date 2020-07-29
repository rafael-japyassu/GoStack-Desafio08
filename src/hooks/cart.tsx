import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const item = await AsyncStorage.getItem('cart_items');
      setProducts(item ? JSON.parse(item) : []);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async (product: Product) => {
    // TODO ADD A NEW ITEM TO THE CART
    product.quantity = 1;

    const cart = await AsyncStorage.getItem('cart_items');
    const listItem: Product[] = [];
    if (cart) {
      const cartItems = JSON.parse(cart);
      if (cartItems.length === 0) {
        listItem.push(product);
        await AsyncStorage.setItem('cart_items', JSON.stringify(listItem));
        setProducts(listItem);
      } else {
        // cartItems.push(product);

        const verifyList = cartItems.filter(
          (item: Product) => item.id === product.id,
        );

        if (verifyList.length > 0) {
          const filterList = cartItems.filter((item: Product) => {
            if (item.id === product.id) {
              item.quantity += 1;
            }
            return item;
          });
          listItem.push(...filterList);
          await AsyncStorage.setItem('cart_items', JSON.stringify(listItem));
          setProducts(listItem);
        } else {
          listItem.push(...cartItems);
          listItem.push(product);
          await AsyncStorage.setItem('cart_items', JSON.stringify(listItem));
          setProducts(listItem);
        }
      }
    } else {
      listItem.push(product);
      await AsyncStorage.setItem('cart_items', JSON.stringify(listItem));
      setProducts(listItem);
    }
  }, []);

  const increment = useCallback(
    async id => {
      const filterList = products.filter((item: Product) => {
        if (item.id === id) {
          item.quantity += 1;
        }
        return item;
      });
      await AsyncStorage.setItem('cart_items', JSON.stringify(filterList));
      setProducts(filterList);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newItems = products.filter(product => {
        if (product.id === id && product.quantity > 0) {
          product.quantity -= 1;
        }
        return product.quantity !== 0;
      });

      setProducts(newItems);
      await AsyncStorage.setItem('cart_items', JSON.stringify(newItems));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
