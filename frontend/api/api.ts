// services/api.ts

// Vigtigt: 10.0.2.2 bruges af Android-emulatoren som "localhost"
const baseUrl = 'http://10.0.2.2:3000';

export async function getMenu() {
  const r = await fetch(`${baseUrl}/menu`);
  if (!r.ok) throw new Error('menu failed');
  return r.json();
}

export async function submitOrder(payload: { lines:{id:string;qty:number}[]; total:number }) {
  const r = await fetch(`${baseUrl}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('order failed');
  return r.json() as Promise<{ orderId: string }>;
}
