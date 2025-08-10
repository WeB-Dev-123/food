export type MenuItem = {
  id: string;
  name: string;
  price: number; // i DKK
  image?: string;
};

export type CartLine = {
  item: MenuItem;
  qty: number;
};
