// frontend/screens/OrderStatusScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import io, { Socket } from 'socket.io-client';
import { RootStackParamList } from '../types/Navigation';
import { getOrder } from '../api/api';

// Android-emulator -> backend:
const SOCKET_URL = 'http://10.0.2.2:3000';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderStatus'>;

export default function OrderStatusScreen({ route, navigation }: Props) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<{ status: string; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let mounted = true;

    // 1) Hent initial ordre én gang
    (async () => {
      try {
        const o = await getOrder(orderId);
        if (mounted) setOrder({ status: o.status, total: o.total });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // 2) Åbn socket og join ordre-room
    const s = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = s;

    s.on('connect', () => {
      s.emit('order:join', { orderId });
    });

    s.on('order:update', (p: { orderId: string; status: string }) => {
      if (p?.orderId === orderId) {
        setOrder(prev => (prev ? { ...prev, status: p.status } : prev));
      }
    });

    // 3) Ryd op ved unmount
    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [orderId]);

  if (loading || !order) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>Ordre: {orderId}</Text>
      <Text style={{ fontSize: 16 }}>Status: {order.status}</Text>
      <Text style={{ fontSize: 16 }}>Total: {order.total} kr</Text>

      <Button title="Til forsiden" onPress={() => navigation.popToTop()} />
    </View>
  );
}


