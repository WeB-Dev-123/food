import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartLine, MenuItem } from '../types/models';

type CartState = { lines: CartLine[] };

type CartAction =
  | { type: 'ADD'; item: MenuItem }
  | { type: 'INC'; id: string }
  | { type: 'DEC'; id: string }
  | { type: 'CLEAR' }
  | { type: 'SET'; lines: CartLine[] };

const STORAGE_KEY = '@cart_v1';

const CartContext = createContext<{
  state: CartState;
  add: (item: MenuItem) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  clear: () => void;
  total: number;
  isHydrated: boolean; // true når data er læst fra storage
} | null>(null);

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const idx = state.lines.findIndex(l => l.item.id === action.item.id);
      if (idx >= 0) {
        const lines = [...state.lines];
        lines[idx] = { ...lines[idx], qty: lines[idx].qty + 1 };
        return { lines };
      }
      return { lines: [...state.lines, { item: action.item, qty: 1 }] };
    }
    case 'INC':
      return { lines: state.lines.map(l => (l.item.id === action.id ? { ...l, qty: l.qty + 1 } : l)) };
    case 'DEC': {
      const lines = state.lines
        .map(l => (l.item.id === action.id ? { ...l, qty: l.qty - 1 } : l))
        .filter(l => l.qty > 0);
      return { lines };
    }
    case 'CLEAR':
      return { lines: [] };
    case 'SET':
      return { lines: action.lines };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [] });
  const [isHydrated, setIsHydrated] = useState(false);

  // LOAD fra storage én gang ved start
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as CartLine[];
          dispatch({ type: 'SET', lines: parsed });
        }
      } catch (e) {
        console.warn('Kunne ikke læse kurv fra storage', e);
      } finally {
        setIsHydrated(true);
      }
    })();
  }, []);

  const total = useMemo(
    () => state.lines.reduce((sum, l) => sum + l.item.price * l.qty, 0),
    [state.lines]
  );

  // SAVE til storage – med lille debounce så vi ikke skriver hvert millisekund
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!isHydrated) return; // gem først efter initial load
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines));
      } catch (e) {
        console.warn('Kunne ikke gemme kurv til storage', e);
      }
    }, 300);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state.lines, isHydrated]);

  const value = useMemo(() => ({
    state,
    add: (item: MenuItem) => dispatch({ type: 'ADD', item }),
    inc: (id: string) => dispatch({ type: 'INC', id }),
    dec: (id: string) => dispatch({ type: 'DEC', id }),
    clear: () => dispatch({ type: 'CLEAR' }),
    total,
    isHydrated,
  }), [state, total, isHydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
