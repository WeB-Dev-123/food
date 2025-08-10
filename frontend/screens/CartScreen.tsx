import React from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { useCart } from '../contexts/CartContext';

export default function CartScreen() {
  const { state, inc, dec, clear, total } = useCart();

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <FlatList
        data={state.lines}
        keyExtractor={(l) => l.item.id}
        ListEmptyComponent={<Text>Kurven er tom</Text>}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text>{item.item.name} x {item.qty}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button title="-" onPress={() => dec(item.item.id)} />
              <Button title="+" onPress={() => inc(item.item.id)} />
            </View>
          </View>
        )}
      />
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Total: {total} kr</Text>
      <Button title="Tøm kurv" onPress={clear} />
      {/* Checkout-knap kommer senere (Stripe) */}
    </View>
  );
}
