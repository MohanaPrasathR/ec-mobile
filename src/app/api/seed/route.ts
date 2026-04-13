import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';

const sampleProducts = [
  {
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    price: 1199,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop',
    description: 'Forged in titanium with the groundbreaking A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever.',
    category: 'Smartphones',
    specs: {
      ram: '8GB',
      storage: '256GB',
      battery: '4422 mAh',
      camera: '48 MP Main + 12 MP Periscope',
      display: '6.7" Super Retina XDR 120Hz'
    },
    rating: 4.9,
    stock: 15
  },
  {
    name: 'iPhone 15',
    brand: 'Apple',
    price: 799,
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600&auto=format&fit=crop',
    description: 'Dynamic Island bubbles up alerts and Live Activities. 48MP main camera with 2x Telephoto. Color-infused glass and aluminum design.',
    category: 'Smartphones',
    specs: {
      ram: '6GB',
      storage: '128GB',
      battery: '3349 mAh',
      camera: '48 MP Main + 12 MP Ultra Wide',
      display: '6.1" Super Retina XDR'
    },
    rating: 4.7,
    stock: 20
  },
  {
    name: 'iPhone 14 Pro',
    brand: 'Apple',
    price: 999,
    image: 'https://images.unsplash.com/photo-1605236453806-6ff3685e226e?q=80&w=600&auto=format&fit=crop',
    description: 'Powered by A16 Bionic chip. Always-On display, Dynamic Island, and Pro-grade camera system with 48MP main sensor.',
    category: 'Smartphones',
    specs: {
      ram: '6GB',
      storage: '128GB',
      battery: '3200 mAh',
      camera: '48 MP + 12 MP + 12 MP',
      display: '6.1" OLED ProMotion 120Hz'
    },
    rating: 4.8,
    stock: 8
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1707050361993-e4ff3f3feab6?q=80&w=600&auto=format&fit=crop',
    description: 'Welcome to the era of mobile AI with Galaxy S24 Ultra. Circle to Search, Live Translate, and legendary 200MP zoom camera.',
    category: 'Smartphones',
    specs: {
      ram: '12GB',
      storage: '256GB',
      battery: '5000 mAh',
      camera: '200 MP Quad Camera System',
      display: '6.8" Dynamic AMOLED 2X 120Hz'
    },
    rating: 4.9,
    stock: 12
  },
  {
    name: 'Samsung Galaxy Z Fold 5',
    brand: 'Samsung',
    price: 1799,
    image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=600&auto=format&fit=crop',
    description: 'Massive screen experience in a pocketable foldable phone. Flex Hinge design and powerful multitasking capability.',
    category: 'Smartphones',
    specs: {
      ram: '12GB',
      storage: '512GB',
      battery: '4400 mAh',
      camera: '50 MP Triple Camera',
      display: '7.6" Main + 6.2" Cover AMOLED'
    },
    rating: 4.6,
    stock: 5
  },
  {
    name: 'Samsung Galaxy S23',
    brand: 'Samsung',
    price: 699,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=600&auto=format&fit=crop',
    description: 'Sleek design with Nightography camera capabilities and Snapdragon 8 Gen 2 for Galaxy.',
    category: 'Smartphones',
    specs: {
      ram: '8GB',
      storage: '128GB',
      battery: '3900 mAh',
      camera: '50 MP Triple Camera',
      display: '6.1" Dynamic AMOLED 2X 120Hz'
    },
    rating: 4.7,
    stock: 18
  },
  {
    name: 'Google Pixel 8 Pro',
    brand: 'Google',
    price: 999,
    image: 'https://images.unsplash.com/photo-1698242491565-d017da1ed543?q=80&w=600&auto=format&fit=crop',
    description: 'Google Tensor G3 chip powers Google AI features. Best-in-class camera system with Best Take and Magic Editor.',
    category: 'Smartphones',
    specs: {
      ram: '12GB',
      storage: '128GB',
      battery: '5050 mAh',
      camera: '50 MP Main + 48 MP Ultrawide + 48 MP Telephoto',
      display: '6.7" Super Actua OLED 120Hz'
    },
    rating: 4.8,
    stock: 14
  },
  {
    name: 'Google Pixel 7a',
    brand: 'Google',
    price: 499,
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=600&auto=format&fit=crop',
    description: 'Exceptional performance and camera quality powered by Google Tensor G2 at an incredible value.',
    category: 'Smartphones',
    specs: {
      ram: '8GB',
      storage: '128GB',
      battery: '4385 mAh',
      camera: '64 MP Quad PD + 13 MP Ultrawide',
      display: '6.1" OLED 90Hz'
    },
    rating: 4.6,
    stock: 25
  },
  {
    name: 'OnePlus 12',
    brand: 'OnePlus',
    price: 799,
    image: 'https://images.unsplash.com/photo-1705608226487-73602fcb0200?q=80&w=600&auto=format&fit=crop',
    description: 'Smooth Beyond Belief. 4th Gen Hasselblad Camera for Mobile, 100W SUPERVOOC charging, Snapdragon 8 Gen 3.',
    category: 'Smartphones',
    specs: {
      ram: '16GB',
      storage: '512GB',
      battery: '5400 mAh',
      camera: '50 MP Sony LYT-808 + 64 MP Periscope',
      display: '6.82" 2K ProXDR 120Hz'
    },
    rating: 4.8,
    stock: 10
  },
  {
    name: 'OnePlus 12R',
    brand: 'OnePlus',
    price: 499,
    image: 'https://images.unsplash.com/photo-1678911820864-e2c567c655d7?q=80&w=600&auto=format&fit=crop',
    description: 'Performance flagship featuring 4th Gen LTPO 120Hz display and 5500 mAh battery with 80W charging.',
    category: 'Smartphones',
    specs: {
      ram: '16GB',
      storage: '256GB',
      battery: '5500 mAh',
      camera: '50 MP Sony IMX890',
      display: '6.78" 1.5K AMOLED 120Hz'
    },
    rating: 4.7,
    stock: 16
  },
  {
    name: 'Xiaomi 14 Pro',
    brand: 'Xiaomi',
    price: 899,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop',
    description: 'Leica Summilux optics with stepless variable aperture, Snapdragon 8 Gen 3 and HyperOS.',
    category: 'Smartphones',
    specs: {
      ram: '12GB',
      storage: '256GB',
      battery: '4880 mAh',
      camera: '50 MP Leica Triple Optics',
      display: '6.73" WQHD+ AMOLED 120Hz'
    },
    rating: 4.7,
    stock: 9
  },
  {
    name: 'Nothing Phone (2)',
    brand: 'Nothing',
    price: 599,
    image: 'https://images.unsplash.com/photo-1689006007234-79354714da91?q=80&w=600&auto=format&fit=crop',
    description: 'Iconic transparent design with Glyph Interface lighting, Nothing OS 2.5, and dual 50MP cameras.',
    category: 'Smartphones',
    specs: {
      ram: '12GB',
      storage: '256GB',
      battery: '4700 mAh',
      camera: '50 MP Sony IMX890 Dual Camera',
      display: '6.7" Flexible LTPO OLED 120Hz'
    },
    rating: 4.6,
    stock: 14
  },
  {
    name: 'Nothing Phone (2a)',
    brand: 'Nothing',
    price: 349,
    image: 'https://images.unsplash.com/photo-1709425514605-654f59e66db5?q=80&w=600&auto=format&fit=crop',
    description: 'Unique design powered by Dimensity 7200 Pro chipset, high performance and low battery consumption.',
    category: 'Smartphones',
    specs: {
      ram: '8GB',
      storage: '128GB',
      battery: '5000 mAh',
      camera: '50 MP Dual Camera',
      display: '6.7" Flexible AMOLED 120Hz'
    },
    rating: 4.5,
    stock: 22
  },
  {
    name: 'Sony Xperia 1 V',
    brand: 'Sony',
    price: 1399,
    image: 'https://images.unsplash.com/photo-1544244015-0cd4b3ff3f8d?q=80&w=600&auto=format&fit=crop',
    description: 'Next-generation Exmor T for mobile sensor. 4K HDR OLED 120Hz display, 3.5mm headphone jack, and dedicated shutter button.',
    category: 'Smartphones',
    specs: {
      ram: '12GB',
      storage: '256GB',
      battery: '5000 mAh',
      camera: '52 MP Exmor T + 12 MP + 12 MP',
      display: '6.5" 21:9 4K HDR OLED 120Hz'
    },
    rating: 4.8,
    stock: 6
  }
];

export async function POST() {
  try {
    await connectToDatabase();
    
    // Clear existing products and re-seed
    await Product.deleteMany({});
    const inserted = await Product.insertMany(sampleProducts);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded MongoDB with ${inserted.length} mobile products!`,
      data: inserted
    });
  } catch (error: unknown) {
    console.error('Error seeding MongoDB:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Seeding failed' },
      { status: 500 }
    );
  }
}
