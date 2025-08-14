// frontend/api/api.ts
const baseUrl = 'http://10.0.2.2:3000';

// ← Indsæt dit restaurant-ID fra seed-loggen:
// fx: "Seed done ✅ Restaurant ID: cme8qoj4j0000tvxgt5rlrnjn"
const RESTAURANT_ID = 'cme8qoj4j0000tvxgt5rlrnjn';

export async function getMenu() {
  const r = await fetch(`${baseUrl}/menu?r=${RESTAURANT_ID}`);
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new Error(`menu failed: ${r.status} ${text}`);
  }
  const rows = await r.json();
  return rows.map((x: { id:string; code:string; name:string; price:number }) => ({
    id: x.code,   // vi bruger stadig vare-koden som id i kurven
    name: x.name,
    price: x.price,
  }));
}

export async function submitOrder(payload: { lines:{id:string;qty:number}[]; total:number }) {
  const r = await fetch(`${baseUrl}/orders?r=${RESTAURANT_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new Error(`order failed: ${r.status} ${text}`);
  }
  return r.json() as Promise<{ orderId: string }>;
}

// (r er ikke nødvendig her, men må gerne være med – backend slår op på orderId)
export async function getOrder(id: string) {
  const r = await fetch(`${baseUrl}/orders/${id}`);
  if (!r.ok) throw new Error(`order ${id} not found`);
  return r.json() as Promise<{ orderId:string; status:string; total:number; createdAt:number }>;
}
