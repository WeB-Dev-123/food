// Simuleret API – senere bytter du baseUrl + fetch ud med rigtig backend
export type ApiMenuItem = { id: string; name: string; price: number };

export async function getMenu(): Promise<ApiMenuItem[]> {
  // Simuler netværk
  await new Promise(r => setTimeout(r, 400));
  return [
    { id: 'b1', name: 'Cheeseburger', price: 65 },
    { id: 'p1', name: 'Pepperoni Pizza', price: 95 },
    { id: 's1', name: 'Kyllingesalat', price: 79 },
  ];
}

export async function submitOrder(payload: {
  lines: { id: string; qty: number }[];
  total: number;
}) {
  await new Promise(r => setTimeout(r, 600));
  // Returnér et fiktivt ordre-id
  return { orderId: Math.random().toString(36).slice(2, 8).toUpperCase() };
}
