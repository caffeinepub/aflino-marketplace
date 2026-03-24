export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  price: number;
  stock: number;
}

export interface Product {
  id: number;
  title: string;
  seller: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  variants?: ProductVariant[];
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
    variants: [
      {
        id: "v1-1",
        size: "S",
        color: "Midnight Black",
        colorHex: "#1C1C1E",
        price: 2299,
        stock: 20,
      },
      {
        id: "v1-2",
        size: "M",
        color: "Midnight Black",
        colorHex: "#1C1C1E",
        price: 2499,
        stock: 15,
      },
      {
        id: "v1-3",
        size: "M",
        color: "Pearl White",
        colorHex: "#F5F5F0",
        price: 2549,
        stock: 10,
      },
      {
        id: "v1-4",
        size: "L",
        color: "Pearl White",
        colorHex: "#F5F5F0",
        price: 2699,
        stock: 8,
      },
    ],
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
    variants: [
      {
        id: "v5-1",
        size: "S",
        color: "Sky Blue",
        colorHex: "#87CEEB",
        price: 849,
        stock: 30,
      },
      {
        id: "v5-2",
        size: "M",
        color: "Sky Blue",
        colorHex: "#87CEEB",
        price: 899,
        stock: 25,
      },
      {
        id: "v5-3",
        size: "L",
        color: "Olive Green",
        colorHex: "#6B7C45",
        price: 899,
        stock: 20,
      },
      {
        id: "v5-4",
        size: "XL",
        color: "Olive Green",
        colorHex: "#6B7C45",
        price: 949,
        stock: 15,
      },
      {
        id: "v5-5",
        size: "M",
        color: "Crimson Red",
        colorHex: "#DC143C",
        price: 899,
        stock: 18,
      },
    ],
  },
  {
    id: 6,
    title: "Women's Floral Maxi Dress",
    seller: "Fashion Hub",
    category: "Fashion",
    price: 1499,
    stock: 80,
    rating: 4.3,
    variants: [
      {
        id: "v6-1",
        size: "S",
        color: "Blush Pink",
        colorHex: "#FFB6C1",
        price: 1399,
        stock: 25,
      },
      {
        id: "v6-2",
        size: "M",
        color: "Blush Pink",
        colorHex: "#FFB6C1",
        price: 1499,
        stock: 20,
      },
      {
        id: "v6-3",
        size: "L",
        color: "Lavender",
        colorHex: "#E6E6FA",
        price: 1549,
        stock: 12,
      },
      {
        id: "v6-4",
        size: "XL",
        color: "Lavender",
        colorHex: "#E6E6FA",
        price: 1599,
        stock: 8,
      },
    ],
  },
  {
    id: 7,
    title: "Unisex Canvas Sneakers",
    seller: "Fashion Hub",
    category: "Fashion",
    price: 1199,
    stock: 60,
    rating: 4.1,
    variants: [
      {
        id: "v7-1",
        size: "6",
        color: "Pure White",
        colorHex: "#FFFFFF",
        price: 1099,
        stock: 20,
      },
      {
        id: "v7-2",
        size: "7",
        color: "Pure White",
        colorHex: "#FFFFFF",
        price: 1149,
        stock: 18,
      },
      {
        id: "v7-3",
        size: "8",
        color: "Charcoal Grey",
        colorHex: "#4A4A4A",
        price: 1199,
        stock: 15,
      },
      {
        id: "v7-4",
        size: "9",
        color: "Charcoal Grey",
        colorHex: "#4A4A4A",
        price: 1249,
        stock: 10,
      },
      {
        id: "v7-5",
        size: "10",
        color: "Navy Blue",
        colorHex: "#1B3A6B",
        price: 1299,
        stock: 8,
      },
    ],
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
