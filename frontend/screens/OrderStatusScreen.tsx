import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Button, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/Navigation';
import { getOrder } from '../api/api';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderStatus'>;

export default function OrderStatusScreen({ route, navigation }: Props) {
  const { orderId } = route.params;
  const [data, setData] = useState<{status:string; total:number} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    let timer: NodeJS.Timeout;

    async function fetchOnce() {
      try {
        const o = await getOrder(orderId);
        if (!alive) return;
        setData({ status: o.status, total: o.total });
      } catch (e) {
        if (!alive) return;
        Alert.alert('Fejl', 'Kunne ikke hente ordrestatus.');
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchOnce();
    timer = setInterval(fetchOnce, 10000);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [orderId]);

  if (loading) {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex:1, padding:16, gap:12 }}>
      <Text style={{ fontSize:18, fontWeight:'700' }}>Ordre: {orderId}</Text>
      <Text style={{ fontSize:16 }}>Status: {data?.status}</Text>
      <Text style={{ fontSize:16 }}>Total: {data?.total} kr</Text>

      <Button title="Opdater nu" onPress={() => { setLoading(true); }} />
      <Button title="Til forsiden" onPress={() => navigation.popToTop()} />
    </View>
  );
}
