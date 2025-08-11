// frontend/screens/CartScreen.tsx
import React, { useState } from 'react';
import { View, Text, Button, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useCart } from '../contexts/CartContext';
import { submitOrder } from '../api/api';

export default function CartScreen({ navigation }: any) {
  const { state, inc, dec, clear, total } = useCart();
  const [busy, setBusy] = useState(false);

 const onCheckout = async () => {
  if (!state.lines.length) {
    Alert.alert('Tom kurv', 'Læg noget i kurven først.');
    return;
  }
  try {
    setBusy(true);
    const payload = {
      lines: state.lines.map(l => ({ id: l.item.id, qty: l.qty })),
      total,
    };
    const res = await submitOrder(payload);
    const id = res.orderId;

    clear(); // tøm kurven efter succes

    // Navigér til status-skærmen i stedet for Alert
    (navigation as any).navigate('OrderStatus', { orderId: id });
  } catch (e) {
    Alert.alert('Fejl', 'Bestilling gik ikke igennem. Prøv igen.');
    console.error(e);
  } finally {
    setBusy(false);
  }
};


  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <FlatList
        data={state.lines}
        keyExtractor={(l) => l.item.id}
        ListEmptyComponent={<Text>Kurven er tom</Text>}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text>{item.item.name} x {item.qty}</Text>
            <View style={{ flexDirection: 'row' }}>
              <Button title="-" onPress={() => dec(item.item.id)} />
              <View style={{ width: 8 }} />
              <Button title="+" onPress={() => inc(item.item.id)} />
            </View>
          </View>
        )}
      />

      <Text style={{ fontSize: 16, fontWeight: '600' }}>Total: {total} kr</Text>

      {busy ? (
        <ActivityIndicator />
      ) : (
        <>
          <Button title="Betal" onPress={onCheckout} />
          <View style={{ height: 8 }} />
          <Button title="Tøm kurv" onPress={clear} />
        </>
      )}
    </View>
  );
}
