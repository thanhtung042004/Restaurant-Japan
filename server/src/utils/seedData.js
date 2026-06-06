/**
 * Seed script: populates the database with initial data for development/demo.
 * Run with: npm run seed
 *
 * This will CLEAR all existing Users, Tables, Categories, and MenuItems
 * before inserting fresh data.
 */

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Table = require('../models/Table');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const USERS = [
  {
    name: 'Admin He Thong',
    email: 'admin@sakura-japan.com',
    password: 'admin123',
    phone: '0901234567',
    role: 'admin',
    isActive: true,
  },
  {
    name: 'Nguyen Le Tan',
    email: 'letan@sakura-japan.com',
    password: 'letan123',
    phone: '0902345678',
    role: 'receptionist',
    isActive: true,
  },
  {
    name: 'Tran Phuc Vu',
    email: 'phucvu@sakura-japan.com',
    password: 'phucvu123',
    phone: '0903456789',
    role: 'waiter',
    isActive: true,
  },
  {
    name: 'Le Bep Truong',
    email: 'bep@sakura-japan.com',
    password: 'bep123',
    phone: '0904567890',
    role: 'chef',
    isActive: true,
  },
  {
    name: 'Khach Hang Demo',
    email: 'khach@gmail.com',
    password: 'khach123',
    phone: '0905678901',
    role: 'customer',
    isActive: true,
  },
];

const TABLES = [
  { tableNumber: 'T01', capacity: 2, area: 'Tang 1', status: 'available', description: 'Ban doi, gan cua so nhin ra vuon' },
  { tableNumber: 'T02', capacity: 4, area: 'Tang 1', status: 'available', description: 'Ban 4 nguoi, trung tam' },
  { tableNumber: 'T03', capacity: 4, area: 'Tang 1', status: 'available', description: 'Ban 4 nguoi, goc yem tinh' },
  { tableNumber: 'T04', capacity: 6, area: 'Tang 1', status: 'available', description: 'Ban lon 6 nguoi' },
  { tableNumber: 'T05', capacity: 6, area: 'Tang 1', status: 'available', description: 'Ban lon 6 nguoi, gan bar' },
  { tableNumber: 'T06', capacity: 2, area: 'Tang 2', status: 'available', description: 'Ban doi, view ban cong' },
  { tableNumber: 'T07', capacity: 4, area: 'Tang 2', status: 'available', description: 'Ban 4 nguoi tang 2' },
  { tableNumber: 'T08', capacity: 4, area: 'Tang 2', status: 'available', description: 'Ban 4 nguoi tang 2, gan cua so' },
  { tableNumber: 'T09', capacity: 8, area: 'Tang 2', status: 'available', description: 'Ban dai 8 nguoi, phu hop nhom' },
  { tableNumber: 'VIP01', capacity: 6, area: 'Phong VIP', status: 'available', description: 'Phong VIP nho, rieng tu' },
  { tableNumber: 'VIP02', capacity: 12, area: 'Phong VIP', status: 'available', description: 'Phong VIP lon, tiec rieng, co man hinh chieu' },
];

const CATEGORIES = [
  { name: 'Sushi', description: 'Com cuon va sushi tuoi ngon theo phong cach Nhat truyen thong', sortOrder: 1 },
  { name: 'Sashimi', description: 'Ca song thai lat mong, tuoi ngon nhat', sortOrder: 2 },
  { name: 'Ramen', description: 'Mi trung Nhat Ban ham xuong chuyen biet', sortOrder: 3 },
  { name: 'Tempura', description: 'Mon hai san va rau cu chien bot gion vang', sortOrder: 4 },
  { name: 'Bento', description: 'Com hop truyen thong Nhat Ban da dang', sortOrder: 5 },
  { name: 'Yakitori', description: 'Ga va rau cu nuong que kieu Nhat', sortOrder: 6 },
  { name: 'Teppanyaki', description: 'Nuong tren ban sat nong truoc mat khach', sortOrder: 7 },
  { name: 'Do uong', description: 'Nuoc uong, sake va ruou Nhat Ban', sortOrder: 8 },
];

const buildMenuItems = (categories) => {
  const cat = (name) => categories.find((c) => c.name === name)?._id;

  return [
    // Sushi
    {
      name: 'Sushi Ca Hoi',
      description: 'Ca hoi Na Uy tuoi uop, dat tren vien com deo, kem wasabi va gung',
      price: 85000,
      category: cat('Sushi'),
      ingredients: ['ca hoi', 'com', 'nori', 'wasabi', 'gung'],
      isAvailable: true,
      isBestSeller: true,
      spicyLevel: 0,
      containsSeafood: true,
      isVegetarian: false,
    },
    {
      name: 'Sushi Tom Tuoi',
      description: 'Tom tuoi chuan Nhat cuon com nori, vi ngot tu nhien',
      price: 75000,
      category: cat('Sushi'),
      ingredients: ['tom', 'com', 'nori', 'wasabi'],
      isAvailable: true,
      isBestSeller: false,
      spicyLevel: 0,
      containsSeafood: true,
      isVegetarian: false,
    },
    {
      name: 'Sushi Boc Lua Ca Hoi Cay',
      description: 'Ca hoi cuon voi spicy mayo, nuong phun lua thom ngon',
      price: 95000,
      category: cat('Sushi'),
      ingredients: ['ca hoi', 'com', 'nori', 'spicy mayo', 'hanh phi'],
      isAvailable: true,
      isBestSeller: true,
      spicyLevel: 2,
      containsSeafood: true,
      isVegetarian: false,
    },
    {
      name: 'Sushi Chay Rau Cu',
      description: 'Rau cu tuoi cuon com nori, phu hop cho nguoi chay hoac khong an hai san',
      price: 55000,
      category: cat('Sushi'),
      ingredients: ['dua leo', 'ca rot', 'bap ngo', 'bo', 'com', 'nori'],
      isAvailable: true,
      isBestSeller: false,
      spicyLevel: 0,
      containsSeafood: false,
      isVegetarian: true,
    },
    {
      name: 'Sushi Ca Ngu Do',
      description: 'Ca ngu do tuoi thai dat, dac biet dai ngon',
      price: 90000,
      category: cat('Sushi'),
      ingredients: ['ca ngu do', 'com', 'nori', 'wasabi'],
      isAvailable: true,
      isBestSeller: false,
      spicyLevel: 0,
      containsSeafood: true,
      isVegetarian: false,
    },

    // Sashimi
    {
      name: 'Sashimi Ca Hoi',
      description: 'Ca hoi Na Uy thai lat mong, tuoi ngon, an kem nuoc tuong va wasabi',
      price: 120000,
      category: cat('Sashimi'),
      ingredients: ['ca hoi', 'wasabi', 'gung', 'nuoc tuong'],
      isAvailable: true,
      isBestSeller: true,
      spicyLevel: 0,
      containsSeafood: true,
      isVegetarian: false,
    },
    {
      name: 'Sashimi Ca Ngu',
      description: 'Ca ngu do tuoi thai day, vi dam da dac trung',
      price: 130000,
      category: cat('Sashimi'),
      ingredients: ['ca ngu do', 'wasabi', 'gung', 'nuoc tuong'],
      isAvailable: true,
      isBestSeller: false,
      spicyLevel: 0,
      containsSeafood: true,
      isVegetarian: false,
    },
    {
      name: 'Sashimi Thap Cam 5 Loai',
      description: 'Dam me 5 loai ca tuoi ngon nhat trong ngay, phuc vu theo mua',
      price: 280000,
      category: cat('Sashimi'),
      ingredients: ['ca hoi', 'ca ngu', 'tom', 'muc', 'bach tuoc'],
      isAvailable: true,
      isBestSeller: true,
      spicyLevel: 0,
      containsSeafood: true,
      isVegetarian: false,
    },

    // Ramen
    {
      name: 'Tonkotsu Ramen',
      description: 'Mi nuoc ham xuong lon 12 gio, beo ngay, kem trung luoc tiem, thit ba chi va mo hanh',
      price: 110000,
      category: cat('Ramen'),
      ingredients: ['mi trung', 'xuong lon', 'thit ba chi', 'trung', 'hanh la', 'gia vi'],
      isAvailable: true,
      isBestSeller: true,
      spicyLevel: 0,
      containsSeafood: false,
      isVegetarian: false,
    },
    {
      name: 'Spicy Miso Ramen',
      description: 'Mi tuong miso nuong kieu Hokkaido, cay nong dam da, kem thit bo',
      price: 125000,
      category: cat('Ramen'),
      ingredients: ['mi trung', 'tuong miso', 'thit bo', 'bap cai', 'gung', 'ot'],
      isAvailable: true,
      isBestSeller: true,
      spicyLevel: 3,
      containsSeafood: false,
      isVegetarian: false,
    },
    {
      name: 'Shoyu Ramen',
      description: 'Mi nuoc tuong nhe, trong sang, vi thanh tam tu truyen thong Tokyo',
      price: 100000,
      category: cat('Ramen'),
      ingredients: ['mi trung', 'nuoc tuong', 'ga', 'moc nhi', 'hanh la'],
      isAvailable: true,
      isBestSeller: false,
      spicyLevel: 0,
      containsSeafood: false,
      isVegetarian: false,
    },
    {
      name: 'Seafood Ramen',
      description: 'Mi hai san nhieu thanh phan, nuoc dashi vi umami dac trung',
      price: 135000,
      category: cat('Ramen'),
      ingredients: ['mi trung', 'tom', 'muc', 'ngheu', 'rong bien', 'dashi'],
      isAvailable: true,
      isBestSeller: false,
      spicyLevel: 1,
      containsSeafood: true,
      isVegetarian: false,
    },
    {
      name: 'Ramen Bo Cay Nhat',
      description: 'Mi bo cay theo cong thuc rieng cua nha bep, cay vua, thom beo',
      price: 120000,
      category: cat('Ramen'),
      ingredients: ['mi trung', 'bo my', 'ot Nhat', 'hanh tay', 'toi', 'gung'],
      isAvailable: true,
      isBestSeller: false,
      spicyLevel: 2,
      containsSeafood: false,
      isVegetarian: false,
    },

    // Tempura
    {
      name: 'Tempura Tom',
      description: 'Tom tuoi toi chien bot gion vang, an kem sot dashi nhe',
      price: 95000,
      category: cat('Tempura'),
      ingredients: ['tom', 'bot chien gion', 'sot dashi', 'cu cai trang'],
      isAvailable: true,
      isBestSeller: true,
      spicyLevel: 0,
      containsSeafood: true,
      isVegetarian: false,
    },
    {
      name: 'Tempura Rau Cu Mix',
      description: 'Rau cu theo mua chien bot gion, khong dau an thua',
      price: 70000,
      category: cat('Tempura'),
      ingredients: ['khoai lang', 'ngo', 'ot chuong', 'nam shiitake', 'bot chien'],
      isAvailable: true,
      isBestSeller: false,
      spicyLevel: 0,
      containsSeafood: false,
      isVegetarian: true,
    },
    {
      name: 'Tempura Muc Ong',
      description: 'Muc ong tươi chien gion vang dep, vi bien dac trung',
      price: 90000,
      category: cat('Tempura'),
      ingredients: ['muc ong', 'bot chien gion', 'chanh', 'sot mayonnaise'],
      isAvailable: true,
      isBestSeller: false,
      spicyLevel: 0,
      containsSeafood: true,
      isVegetarian: false,
    },

    // Bento
    {
      name: 'Bento Ga Teriyaki',
      description: 'Com hop ga nuong sot teriyaki ngot beo, kem rau tron va soup miso',
      price: 130000,
      category: cat('Bento'),
      ingredients: ['ga', 'sot teriyaki', 'com', 'rau tron', 'soup miso', 'dua leo'],
      isAvailable: true,
      isBestSeller: true,
      spicyLevel: 0,
      containsSeafood: false,
      isVegetarian: false,
    },
    {
      name: 'Bento Bo Wagyu',
      description: 'Thit bo Wagyu nuong tu nhien, dat tren com nong, kem rau mua',
      price: 220000,
      category: cat('Bento'),
      ingredients: ['thit bo wagyu', 'com', 'rau tron', 'nam', 'sot ponzu'],
      isAvailable: true,
      isBestSeller: true,
      spicyLevel: 0,
      containsSeafood: false,
      isVegetarian: false,
    },
    {
      name: 'Bento Ca Hoi Nuong',
      description: 'Ca hoi phi le nuong vang hong, com deo va rau mua tuoi',
      price: 165000,
      category: cat('Bento'),
      ingredients: ['ca hoi', 'com', 'rau', 'chanh', 'dau hanh'],
      isAvailable: true,
      isBestSeller: false,
      spicyLevel: 0,
      containsSeafood: true,
      isVegetarian: false,
    },
    {
      name: 'Bento Chay Nhat Ban',
      description: 'Com hop chay da dang: dau phu, rau cu, vung, phu hop nguoi an chay',
      price: 100000,
      category: cat('Bento'),
      ingredients: ['com', 'dau phu', 'khoai lang', 'ca rot', 'ot chuong', 'vung'],
      isAvailable: true,
      isBestSeller: false,
      spicyLevel: 0,
      containsSeafood: false,
      isVegetarian: true,
    },
    {
      name: 'Bento Bo Cay Nhat',
      description: 'Com hop bo cay kieu Nhat, ot cay dac trung, rat duoc ua chuong',
      price: 145000,
      category: cat('Bento'),
      ingredients: ['thit bo', 'com', 'ot Nhat', 'hanh tay', 'vung', 'gung'],
      isAvailable: true,
      isBestSeller: false,
      spicyLevel: 2,
      containsSeafood: false,
      isVegetarian: false,
    },

    // Yakitori
    {
      name: 'Yakitori Ga Sot Tare',
      description: 'Ga nuong que kieu Nhat, sot tare ngot thom, kem vung rang',
      price: 55000,
      category: cat('Yakitori'),
      ingredients: ['ga', 'sot tare', 'vung rang'],
      isAvailable: true,
      isBestSeller: true,
      spicyLevel: 0,
      containsSeafood: false,
      isVegetarian: false,
    },
    {
      name: 'Yakitori Gan Ga',
      description: 'Gan ga tuoi nuong que, mon an dac trung Nhat Ban duoc ua chuong',
      price: 45000,
      category: cat('Yakitori'),
      ingredients: ['gan ga', 'sot tare', 'gung'],
      isAvailable: true,
      isBestSeller: false,
      spicyLevel: 0,
      containsSeafood: false,
      isVegetarian: false,
    },
    {
      name: 'Yakitori Nam Rau Mix',
      description: 'Nam shiitake, ot xanh, hanh tay nuong que sot miso, thich hop nguoi chay',
      price: 50000,
      category: cat('Yakitori'),
      ingredients: ['nam shiitake', 'ot xanh', 'hanh tay', 'sot miso'],
      isAvailable: true,
      isBestSeller: false,
      spicyLevel: 0,
      containsSeafood: false,
      isVegetarian: true,
    },

    // Teppanyaki
    {
      name: 'Teppanyaki Bo Wagyu A5',
      description: 'Bo Wagyu hang A5 nuong tren ban sat truoc mat khach, giu vi nuoc ngot tu nhien',
      price: 450000,
      category: cat('Teppanyaki'),
      ingredients: ['bo wagyu A5', 'hanh tay', 'toi', 'bo lanh', 'muoi bien Nhat'],
      isAvailable: true,
      isBestSeller: true,
      spicyLevel: 0,
      containsSeafood: false,
      isVegetarian: false,
    },
    {
      name: 'Teppanyaki Hai San Hon Hop',
      description: 'Tom, muc, so diep nuong ban sat, kem sot ponzu tuoi ngon',
      price: 380000,
      category: cat('Teppanyaki'),
      ingredients: ['tom hum', 'muc', 'so diep', 'bo', 'toi', 'sot ponzu'],
      isAvailable: true,
      isBestSeller: false,
      spicyLevel: 0,
      containsSeafood: true,
      isVegetarian: false,
    },
    {
      name: 'Teppanyaki Ga Cay',
      description: 'Ga nuong ban sat sot cay dac biet, thom beo dung vi',
      price: 170000,
      category: cat('Teppanyaki'),
      ingredients: ['ga', 'sot cay Nhat', 'ot', 'toi', 'gung', 'vung'],
      isAvailable: true,
      isBestSeller: false,
      spicyLevel: 2,
      containsSeafood: false,
      isVegetarian: false,
    },

    // Do uong
    {
      name: 'Tra Xanh Matcha',
      description: 'Tra xanh matcha nguyen chat truyen thong Nhat Ban, uong nong hoac lanh',
      price: 45000,
      category: cat('Do uong'),
      ingredients: ['bot matcha', 'nuoc nong'],
      isAvailable: true,
      isBestSeller: false,
      spicyLevel: 0,
      containsSeafood: false,
      isVegetarian: true,
    },
    {
      name: 'Sake Junmai Daiginjo',
      description: 'Ruou sake thuong hang Nhat Ban, huong thom tinh te, uong am hoac lanh',
      price: 120000,
      category: cat('Do uong'),
      ingredients: ['sake Nhat Ban'],
      isAvailable: true,
      isBestSeller: true,
      spicyLevel: 0,
      containsSeafood: false,
      isVegetarian: true,
    },
    {
      name: 'Nuoc Cam Ep Tuoi',
      description: 'Cam tuoi ep nguyen chat, khong them duong, giau vitamin C',
      price: 40000,
      category: cat('Do uong'),
      ingredients: ['cam tuoi'],
      isAvailable: true,
      isBestSeller: false,
      spicyLevel: 0,
      containsSeafood: false,
      isVegetarian: true,
    },
    {
      name: 'Nuoc Ngot (Coca / Pepsi / 7Up)',
      description: 'Nuoc ngot co ga cac loai, uong lanh giai khat',
      price: 30000,
      category: cat('Do uong'),
      ingredients: ['nuoc ngot co ga'],
      isAvailable: true,
      isBestSeller: false,
      spicyLevel: 0,
      containsSeafood: false,
      isVegetarian: true,
    },
    {
      name: 'Nuoc Suoi Tinh Khiet',
      description: 'Nuoc suoi khong ga tinh khiet',
      price: 20000,
      category: cat('Do uong'),
      ingredients: ['nuoc suoi'],
      isAvailable: true,
      isBestSeller: false,
      spicyLevel: 0,
      containsSeafood: false,
      isVegetarian: true,
    },
    {
      name: 'Bia Sapporo',
      description: 'Bia Nhat Ban thuong hieu Sapporo, vi diu nhe',
      price: 55000,
      category: cat('Do uong'),
      ingredients: ['bia Nhat'],
      isAvailable: true,
      isBestSeller: false,
      spicyLevel: 0,
      containsSeafood: false,
      isVegetarian: true,
    },
  ];
};

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

const seed = async () => {
  try {
    await connectDB();
    console.log('Connected to database. Starting seed...');

    // Clear collections
    await Promise.all([
      User.deleteMany({}),
      Table.deleteMany({}),
      Category.deleteMany({}),
      MenuItem.deleteMany({}),
    ]);
    console.log('Cleared: Users, Tables, Categories, MenuItems');

    // Insert in order (users and tables are independent)
    const [users, tables] = await Promise.all([
      User.create(USERS),
      Table.create(TABLES),
    ]);
    console.log(`Created ${users.length} users`);
    console.log(`Created ${tables.length} tables`);

    const categories = await Category.create(CATEGORIES);
    console.log(`Created ${categories.length} categories`);

    const menuItemData = buildMenuItems(categories);
    const menuItems = await MenuItem.create(menuItemData);
    console.log(`Created ${menuItems.length} menu items`);

    console.log('\n--- Login Credentials ---');
    console.log('Admin      : admin@sakura-japan.com     / admin123');
    console.log('Receptionist: letan@sakura-japan.com   / letan123');
    console.log('Waiter     : phucvu@sakura-japan.com   / phucvu123');
    console.log('Chef       : bep@sakura-japan.com      / bep123');
    console.log('Customer   : khach@gmail.com            / khach123');
    console.log('-------------------------');
    console.log('Seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
