export type Product = {
  id: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string;
  shortDescription: string;
  productUrl: string;
  category: string | null;
  availability: string | null;
};

export type CartItem = {
  productId: string;
  name: string;
  imageUrl: string;
  qty: number;
  unitPrice: number;
  currency: string;
};

export type CheckoutMethod = "DELIVERY" | "PICKUP";
