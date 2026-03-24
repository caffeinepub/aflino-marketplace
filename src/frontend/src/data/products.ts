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
  description?: string;
  specifications?: Record<string, string>;
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
    description:
      "Premium wireless headphones with active noise cancellation and 30-hour battery life. Features Hi-Res Audio certification, aptX HD support, and a comfortable over-ear design with memory foam cushions. The built-in microphone ensures crystal-clear calls, while the foldable design makes it easy to carry on the go.",
    specifications: {
      "Driver Size": "40mm Dynamic Driver",
      "Frequency Response": "20Hz – 20kHz",
      "Battery Life": "30 Hours (ANC Off)",
      "Charging Time": "2 Hours (USB-C)",
      Bluetooth: "5.0",
      Weight: "250g",
      "Noise Cancellation": "Active (ANC)",
    },
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
    description:
      "Intelligent LED desk lamp with touch controls, 5 color temperatures, and 10 brightness levels. Features a USB charging port, auto-dimming sensor, and a flexible gooseneck arm. Perfect for studying, reading, or working late nights with eye-care technology that reduces strain.",
  },
  {
    id: 3,
    title: "USB-C Hub 7-in-1",
    seller: "TechZone Store",
    category: "Electronics",
    price: 1899,
    stock: 25,
    rating: 4.0,
    description:
      "Compact 7-in-1 USB-C hub with 4K HDMI output, 100W Power Delivery, SD/microSD card reader, and 3 USB-A 3.0 ports. Plug-and-play with no drivers required. Compatible with all USB-C laptops including MacBook, Dell XPS, and Surface Pro.",
  },
  {
    id: 4,
    title: "Mechanical Keyboard RGB",
    seller: "TechZone Store",
    category: "Electronics",
    price: 3499,
    stock: 15,
    rating: 4.7,
    description:
      "TKL mechanical keyboard with Cherry MX Blue switches for a satisfying tactile click. Full per-key RGB backlighting with 20+ lighting effects. Aircraft-grade aluminum top plate, double-shot PBT keycaps, and N-key rollover for accurate input. Compatible with Windows and Mac.",
  },
  {
    id: 5,
    title: "Men's Casual Linen Shirt",
    seller: "Fashion Hub",
    category: "Fashion",
    price: 899,
    stock: 100,
    rating: 3.8,
    description:
      "Crafted from 100% premium linen, this casual shirt is perfect for both formal and relaxed occasions. The breathable fabric keeps you cool in summers while the classic collar and button-down placket ensure a timeless look. Available in a range of versatile colors with a regular fit that suits all body types. Machine washable and easy to maintain.",
    specifications: {
      Material: "100% Premium Linen",
      Fit: "Regular Fit",
      Collar: "Classic Spread Collar",
      Occasion: "Casual / Semi-Formal",
      Care: "Machine Wash Cold",
      Closure: "Button Down",
    },
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
    description:
      "Elegant floral maxi dress perfect for summer outings, beach days, or casual get-togethers. Made from lightweight chiffon fabric with a flattering A-line silhouette. Features a smocked waist, adjustable spaghetti straps, and a flowing skirt that falls to the ankle. Available in multiple vibrant floral prints.",
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
    description:
      "Classic canvas sneakers with a timeless low-top silhouette. Features a vulcanized rubber sole for durability, a cushioned insole for all-day comfort, and a reinforced toe cap. Available in multiple colors to match any casual outfit. Suitable for men and women.",
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
    description:
      "Elegant 6-piece ceramic dinner set with a minimalist design, perfect for everyday dining or special occasions. Dishwasher-safe and microwave-safe, made from high-quality stoneware with a chip-resistant glaze. Includes 6 dinner plates, side plates, and bowls.",
  },
  {
    id: 9,
    title: "Bamboo Cutting Board",
    seller: "HomeGoods Co.",
    category: "Home & Kitchen",
    price: 499,
    stock: 45,
    rating: 3.9,
    description:
      "Eco-friendly bamboo cutting board with juice grooves and a non-slip bottom. Harder than wood, gentler on knife blades. Naturally antibacterial and odor-resistant. Dimensions: 45cm x 30cm x 1.5cm. Ideal for chopping vegetables, fruits, and meats.",
  },
  {
    id: 10,
    title: "Aromatherapy Diffuser",
    seller: "HomeGoods Co.",
    category: "Beauty",
    price: 1099,
    stock: 35,
    rating: 4.4,
    description:
      "Ultrasonic aromatherapy diffuser with 7-color LED mood lighting and auto shut-off feature. Covers up to 300 sq ft, runs for up to 6 hours on a full tank. Whisper-quiet operation makes it perfect for bedrooms, offices, and meditation rooms. Compatible with all essential oils.",
  },
  {
    id: 11,
    title: "ProMax Smartphone 5G",
    seller: "TechZone Store",
    category: "Electronics",
    price: 10000,
    stock: 50,
    rating: 4.6,
    description:
      "The ProMax 5G redefines flagship performance with its blazing-fast Snapdragon processor and ultra-smooth 120Hz AMOLED display. Capture stunning photos with the 108MP triple-camera system. The massive 5000mAh battery with 65W fast charging keeps you powered all day. Featuring 5G connectivity, IP68 water resistance, and an under-display fingerprint sensor for a premium experience.",
    specifications: {
      Processor: "Snapdragon 8 Gen 2",
      Display: '6.7" 120Hz AMOLED',
      Camera: "108MP + 12MP + 5MP",
      Battery: "5000mAh + 65W Fast Charge",
      OS: "Android 14",
      Connectivity: "5G, WiFi 6E, Bluetooth 5.3",
      "Water Resistance": "IP68",
    },
    variants: [
      {
        id: "v11-1",
        size: "4GB+64GB",
        color: "Midnight Black",
        colorHex: "#1C1C1E",
        price: 10000,
        stock: 20,
      },
      {
        id: "v11-2",
        size: "4GB+64GB",
        color: "Space Silver",
        colorHex: "#C0C0C0",
        price: 10500,
        stock: 15,
      },
      {
        id: "v11-3",
        size: "8GB+256GB",
        color: "Midnight Black",
        colorHex: "#1C1C1E",
        price: 15000,
        stock: 10,
      },
      {
        id: "v11-4",
        size: "8GB+256GB",
        color: "Space Silver",
        colorHex: "#C0C0C0",
        price: 15500,
        stock: 8,
      },
    ],
  },
  {
    id: 12,
    title: "Samsung Double Door Refrigerator",
    seller: "HomeGoods Co.",
    category: "Home & Kitchen",
    price: 28000,
    stock: 10,
    rating: 4.5,
    description:
      "Experience fresh food for longer with the Samsung Double Door Refrigerator. Features Digital Inverter Technology for energy efficiency, a large vegetable box, and a toughened glass shelf. Ideal for families of 3-5 members. The All-Around Cooling system delivers cold air through multiple vents to maintain uniform temperature throughout the fridge.",
    specifications: {
      Brand: "Samsung",
      Capacity: "253 Litres",
      "Star Rating": "3 Star",
      "Cooling Technology": "Digital Inverter",
      Compressor: "Digital Inverter Compressor",
      "Annual Energy Consumption": "264 kWh",
      Refrigerant: "R600a",
    },
    variants: [
      {
        id: "v12-1",
        size: "253L",
        color: "Elegant Inox",
        colorHex: "#C0C0C0",
        price: 28000,
        stock: 5,
      },
      {
        id: "v12-2",
        size: "345L",
        color: "Elegant Inox",
        colorHex: "#C0C0C0",
        price: 34000,
        stock: 3,
      },
      {
        id: "v12-3",
        size: "465L",
        color: "Elegant Inox",
        colorHex: "#C0C0C0",
        price: 42000,
        stock: 2,
      },
      {
        id: "v12-4",
        size: "253L",
        color: "Midnight Black",
        colorHex: "#1C1C1E",
        price: 29000,
        stock: 4,
      },
      {
        id: "v12-5",
        size: "345L",
        color: "Midnight Black",
        colorHex: "#1C1C1E",
        price: 35000,
        stock: 2,
      },
    ],
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
