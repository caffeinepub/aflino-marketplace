export interface Product {
  id: number;
  title: string;
  seller: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Wireless Bluetooth Headphones",
    seller: "TechZone Store",
    category: "Electronics",
    price: 2499,
    stock: 50,
    rating: 4.5,
  },
  {
    id: 2,
    title: "Smart LED Desk Lamp",
    seller: "TechZone Store",
    category: "Electronics",
    price: 1299,
    stock: 30,
    rating: 4.2,
  },
  {
    id: 3,
    title: "USB-C Hub 7-in-1",
    seller: "TechZone Store",
    category: "Electronics",
    price: 1899,
    stock: 25,
    rating: 4.0,
  },
  {
    id: 4,
    title: "Mechanical Keyboard RGB",
    seller: "TechZone Store",
    category: "Electronics",
    price: 3499,
    stock: 15,
    rating: 4.7,
  },
  {
    id: 5,
    title: "Men's Casual Linen Shirt",
    seller: "Fashion Hub",
    category: "Fashion",
    price: 899,
    stock: 100,
    rating: 3.8,
  },
  {
    id: 6,
    title: "Women's Floral Maxi Dress",
    seller: "Fashion Hub",
    category: "Fashion",
    price: 1499,
    stock: 80,
    rating: 4.3,
  },
  {
    id: 7,
    title: "Unisex Canvas Sneakers",
    seller: "Fashion Hub",
    category: "Fashion",
    price: 1199,
    stock: 60,
    rating: 4.1,
  },
  {
    id: 8,
    title: "Ceramic Dinner Set (6pc)",
    seller: "HomeGoods Co.",
    category: "Home & Kitchen",
    price: 2199,
    stock: 20,
    rating: 4.6,
  },
  {
    id: 9,
    title: "Bamboo Cutting Board",
    seller: "HomeGoods Co.",
    category: "Home & Kitchen",
    price: 499,
    stock: 45,
    rating: 3.9,
  },
  {
    id: 10,
    title: "Aromatherapy Diffuser",
    seller: "HomeGoods Co.",
    category: "Beauty",
    price: 1099,
    stock: 35,
    rating: 4.4,
  },
];

export const CATEGORIES = [
  "All",
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Beauty",
  "Sports",
];
