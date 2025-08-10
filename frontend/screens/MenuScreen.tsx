import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useCart } from '../contexts/CartContext';
import { getMenu } from '../api/api';

export default function MenuScreen({ navigation }: any) {
  const { add } = useCart();
  const [menu, setMenu] = useState<{ id: string; name: string; price: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getMenu();
        if (alive) setMenu(data);
      } catch (e) {
        Alert.alert('Fejl', 'Kunne ikke hente menuen');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={menu}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 10, borderBottomWidth: 0.5, borderColor: '#ddd' }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
            <Text style={{ marginBottom: 6 }}>{item.price} kr</Text>
            <Button title="Tilføj" onPress={() => add(item)} />
          </View>
        )}
      />
      <View style={{ marginTop: 16, gap: 8 }}>
        <Button title="Gå til kurv" onPress={() => navigation.navigate('Cart')} />
      </View>
    </View>
  );
}
