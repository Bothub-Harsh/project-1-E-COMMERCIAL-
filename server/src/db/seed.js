import bcrypt from 'bcryptjs';
import { pool } from './pool.js';

export async function runSeeds() {
  console.log('--- Starting Database Seeding ---');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Seed Users (1 Admin, 1 Demo Customer)
    const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
    const customerPasswordHash = await bcrypt.hash('Customer@12345', 10);

    const userRes = await client.query(`
      INSERT INTO users (name, email, password_hash, role, phone)
      VALUES 
        ('Harsh Vardhan (Admin)', 'admin@harshelectronics.com', $1, 'admin', '+91 98765 43210'),
        ('Rajesh Kumar (Customer)', 'rajesh@example.com', $2, 'customer', '+91 91234 56789')
      ON CONFLICT (email) DO UPDATE 
        SET role = EXCLUDED.role, password_hash = EXCLUDED.password_hash
      RETURNING id, email, role;
    `, [adminPasswordHash, customerPasswordHash]);
    console.log(`✓ Seeded ${userRes.rowCount} users (Admin & Customer).`);

    // 2. Seed 10 Categories as requested
    const categoriesData = [
      ['Smartphones', 'smartphones', 'Flagship 5G smartphones, foldables, and budget devices.', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
      ['Laptops', 'laptops', 'High-performance ultrabooks, creator laptops, and gaming machines.', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80'],
      ['Headphones', 'headphones', 'Active noise cancelling headphones, studio monitors, and wireless earbuds.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'],
      ['Smartwatches', 'smartwatches', 'Health trackers, GPS sports watches, and luxury smart timepieces.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'],
      ['Cameras', 'cameras', 'Mirrorless 4K cameras, DSLR bodies, and professional cinematic lenses.', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80'],
      ['Gaming Accessories', 'gaming-accessories', 'Mechanical RGB keyboards, gaming mice, and VR headsets.', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80'],
      ['Computer Accessories', 'computer-accessories', '4K monitors, ergonomic stands, docks, and external NVMe SSDs.', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80'],
      ['Speakers', 'speakers', 'Bluetooth portable boomboxes, party soundbars, and Hi-Fi home audio.', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80'],
      ['Tablets', 'tablets', 'Productivity tablets, stylus pens, and OLED entertainment displays.', 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80'],
      ['Electronic Accessories', 'electronic-accessories', 'GaN high-speed chargers, braided nylon cables, and power banks.', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80']
    ];

    const categoryMap = {};
    for (const [name, slug, desc, img] of categoriesData) {
      const res = await client.query(`
        INSERT INTO categories (name, slug, description, image_url)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url
        RETURNING id, slug;
      `, [name, slug, desc, img]);
      categoryMap[slug] = res.rows[0].id;
    }
    console.log(`✓ Seeded ${categoriesData.length} categories.`);

    // 3. Seed Leading Electronics Brands
    const brandsData = [
      ['Apple', 'apple'],
      ['Samsung', 'samsung'],
      ['Sony', 'sony'],
      ['Dell', 'dell'],
      ['Asus', 'asus'],
      ['Logitech', 'logitech'],
      ['Bose', 'bose'],
      ['OnePlus', 'oneplus'],
      ['Anker', 'anker'],
      ['Canon', 'canon'],
      ['Razer', 'razer']
    ];

    const brandMap = {};
    for (const [name, slug] of brandsData) {
      const res = await client.query(`
        INSERT INTO brands (name, slug)
        VALUES ($1, $2)
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id, slug;
      `, [name, slug]);
      brandMap[slug] = res.rows[0].id;
    }
    console.log(`✓ Seeded ${brandsData.length} brands.`);

    // 4. Seed At Least 30 Realistic Electronics Products
    const products = [
      // 1. Smartphones
      {
        name: 'Apple iPhone 15 Pro Max (256 GB, Natural Titanium)',
        slug: 'apple-iphone-15-pro-max-256gb',
        brand: 'apple',
        category: 'smartphones',
        price: 148900.00,
        original_price: 159900.00,
        discount: 7,
        stock: 35,
        rating: 4.8,
        rating_count: 1420,
        is_featured: true,
        is_best_seller: true,
        is_new_arrival: false,
        short_description: 'Forged in titanium with industry-first 3nm A17 Pro chip and 5x optical zoom.',
        description: 'iPhone 15 Pro Max is the first iPhone to feature an aerospace-grade titanium design. Powered by the A17 Pro chip for next-generation mobile gaming performance and battery efficiency. Capture stunning photos with the 48MP main camera and 5x telephoto optical zoom.',
        specs: { "Display": "6.7-inch Super Retina XDR OLED 120Hz", "Processor": "A17 Pro (3nm)", "Storage": "256 GB NVMe", "Camera": "48MP + 12MP + 12MP (5x Zoom)", "Battery": "4422 mAh with MagSafe" },
        images: [
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80'
        ]
      },
      {
        name: 'Samsung Galaxy S24 Ultra 5G (12GB RAM, 512GB Titanium Gray)',
        slug: 'samsung-galaxy-s24-ultra-512gb',
        brand: 'samsung',
        category: 'smartphones',
        price: 139999.00,
        original_price: 149999.00,
        discount: 7,
        stock: 28,
        rating: 4.7,
        rating_count: 980,
        is_featured: true,
        is_best_seller: true,
        is_new_arrival: true,
        short_description: 'Galaxy AI is here. 200MP camera, titanium frame, and built-in S Pen.',
        description: 'Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8-inch flat display. Integrated with Galaxy AI features like Circle to Search, Live Call Translation, and Note Assist.',
        specs: { "Display": "6.8-inch Dynamic LTPO AMOLED 2X 2600 nits", "Processor": "Snapdragon 8 Gen 3 for Galaxy", "RAM": "12 GB", "Storage": "512 GB", "Camera": "200MP + 50MP + 12MP + 10MP", "Battery": "5000 mAh 45W Fast Charge" },
        images: [
          'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'
        ]
      },
      {
        name: 'OnePlus 12 5G (16GB RAM, 512GB Silky Black)',
        slug: 'oneplus-12-5g-512gb',
        brand: 'oneplus',
        category: 'smartphones',
        price: 69999.00,
        original_price: 74999.00,
        discount: 7,
        stock: 50,
        rating: 4.6,
        rating_count: 650,
        is_featured: false,
        is_best_seller: false,
        is_new_arrival: true,
        short_description: 'Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera, and 100W SUPERVOOC charging.',
        description: 'The OnePlus 12 delivers flagship performance that defies limits. Experience peak fluidity with the 2K 120Hz ProXDR display and extraordinary battery longevity with 5400 mAh battery.',
        specs: { "Display": "6.82-inch 2K 120Hz ProXDR AMOLED", "Processor": "Snapdragon 8 Gen 3", "RAM": "16 GB LPDDR5X", "Storage": "512 GB UFS 4.0", "Charging": "100W SUPERVOOC Wired, 50W AIRVOOC Wireless" },
        images: [
          'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80'
        ]
      },

      // 2. Laptops
      {
        name: 'Apple MacBook Pro 16" (M3 Max Chip, 36GB Unified Memory, 1TB SSD)',
        slug: 'apple-macbook-pro-16-m3-max',
        brand: 'apple',
        category: 'laptops',
        price: 349900.00,
        original_price: 369900.00,
        discount: 5,
        stock: 15,
        rating: 4.9,
        rating_count: 420,
        is_featured: true,
        is_best_seller: true,
        is_new_arrival: true,
        short_description: 'Scary fast M3 Max chip with Liquid Retina XDR display and up to 22 hours of battery.',
        description: 'MacBook Pro blasts forward with M3 Max, an unimaginably advanced chip that brings serious speed and capability for demanding workflows like 3D rendering and machine learning.',
        specs: { "Display": "16.2-inch Liquid Retina XDR (3456x2234) 120Hz", "Chip": "Apple M3 Max 14-core CPU, 30-core GPU", "Memory": "36GB Unified", "Storage": "1TB SSD", "Battery": "Up to 22 Hours" },
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80'
        ]
      },
      {
        name: 'Dell XPS 15 9530 Laptop (13th Gen Intel i9-13900H, RTX 4070, 32GB RAM, 1TB SSD)',
        slug: 'dell-xps-15-intel-i9-rtx-4070',
        brand: 'dell',
        category: 'laptops',
        price: 249990.00,
        original_price: 279990.00,
        discount: 11,
        stock: 18,
        rating: 4.6,
        rating_count: 310,
        is_featured: true,
        is_best_seller: false,
        is_new_arrival: false,
        short_description: 'Stunning 3.5K OLED InfinityEdge touch display with powerful creative performance.',
        description: 'Immerse yourself in content with breathtaking 3.5K OLED resolution, vivid colors, and NVIDIA GeForce RTX 4070 graphics built into a precision CNC-machined aluminum chassis.',
        specs: { "Display": "15.6-inch 3.5K OLED Touch 400 nits", "Processor": "Intel Core i9-13900H (14 cores)", "GPU": "NVIDIA GeForce RTX 4070 8GB GDDR6", "RAM": "32GB DDR5", "Storage": "1TB NVMe M.2 SSD" },
        images: [
          'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80'
        ]
      },
      {
        name: 'ASUS ROG Zephyrus G16 Gaming Laptop (Intel Core Ultra 9, RTX 4080, OLED 240Hz)',
        slug: 'asus-rog-zephyrus-g16-rtx4080',
        brand: 'asus',
        category: 'laptops',
        price: 289990.00,
        original_price: 319990.00,
        discount: 9,
        stock: 12,
        rating: 4.8,
        rating_count: 190,
        is_featured: false,
        is_best_seller: true,
        is_new_arrival: true,
        short_description: 'Ultra-thin AI-ready gaming beast with ROG Nebula OLED 2.5K 240Hz display.',
        description: 'Precision gaming in an ultra-sleek all-aluminum chassis. Experience incredible frame rates with the Intel Core Ultra 9 185H processor and NVIDIA GeForce RTX 4080 laptop GPU.',
        specs: { "Display": "16-inch 2.5K OLED 240Hz 0.2ms G-Sync", "Processor": "Intel Core Ultra 9 185H", "GPU": "RTX 4080 12GB GDDR6", "RAM": "32GB LPDDR5X", "Storage": "2TB PCIe 4.0 NVMe SSD" },
        images: [
          'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80'
        ]
      },

      // 3. Headphones
      {
        name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones (Silver)',
        slug: 'sony-wh-1000xm5-silver',
        brand: 'sony',
        category: 'headphones',
        price: 29990.00,
        original_price: 34990.00,
        discount: 14,
        stock: 45,
        rating: 4.7,
        rating_count: 2400,
        is_featured: true,
        is_best_seller: true,
        is_new_arrival: false,
        short_description: 'Industry-leading noise cancellation with two processors and 8 microphones.',
        description: 'Our industry-leading noise canceling headphones with Auto NC Optimizer rewrite the rules for distraction-free listening and exceptional voice clarity during calls.',
        specs: { "Battery": "Up to 30 Hours with Quick Charge", "Drivers": "30mm Precision Driver Units", "Codecs": "LDAC, AAC, SBC", "Weight": "250g", "Voice": "Alexa and Google Assistant Built-in" },
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'
        ]
      },
      {
        name: 'Bose QuietComfort Ultra Wireless Headphones (Black)',
        slug: 'bose-quietcomfort-ultra-black',
        brand: 'bose',
        category: 'headphones',
        price: 35900.00,
        original_price: 39900.00,
        discount: 10,
        stock: 30,
        rating: 4.8,
        rating_count: 850,
        is_featured: false,
        is_best_seller: false,
        is_new_arrival: true,
        short_description: 'World-class active noise cancellation with groundbreaking Spatial Audio immersion.',
        description: 'High-fidelity audio meets breakthrough Bose Immersive Audio spatialized sound. CustomTune technology personalizes the noise cancellation profile directly to your ears.',
        specs: { "Audio": "Bose Immersive Audio Spatial Sound", "Noise Cancellation": "Quiet, Aware, and Immersion Modes", "Battery": "Up to 24 Hours", "Bluetooth": "5.3 Multi-point" },
        images: [
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
        ]
      },
      {
        name: 'Apple AirPods Pro (2nd Gen with USB-C MagSafe Case)',
        slug: 'apple-airpods-pro-2nd-gen-usbc',
        brand: 'apple',
        category: 'headphones',
        price: 24900.00,
        original_price: 26900.00,
        discount: 7,
        stock: 65,
        rating: 4.9,
        rating_count: 4800,
        is_featured: true,
        is_best_seller: true,
        is_new_arrival: false,
        short_description: 'H2 chip power, 2x more Active Noise Cancellation, and Adaptive Audio.',
        description: 'AirPods Pro feature up to 2x more Active Noise Cancellation, Transparency mode, and Adaptive Audio. Personalized Spatial Audio with dynamic head tracking surrounds you with sound.',
        specs: { "Chip": "Apple H2 Headphone chip", "Water Resistance": "IP54 Dust, sweat, and water resistant", "Charging": "USB-C, MagSafe, Apple Watch charger", "Battery": "6 hours single charge, 30 hours with case" },
        images: [
          'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80'
        ]
      },

      // 4. Smartwatches
      {
        name: 'Apple Watch Ultra 2 (GPS + Cellular, 49mm Titanium Case)',
        slug: 'apple-watch-ultra-2-49mm',
        brand: 'apple',
        category: 'smartwatches',
        price: 89900.00,
        original_price: 89900.00,
        discount: 0,
        stock: 20,
        rating: 4.9,
        rating_count: 730,
        is_featured: true,
        is_best_seller: false,
        is_new_arrival: true,
        short_description: 'The most rugged and capable Apple Watch. 3000 nits display and precision dual GPS.',
        description: 'Featuring the S9 SiP, an astonishingly bright 3000-nit display, Double Tap gesture control, precision dual-frequency GPS, and up to 72 hours of battery life in Low Power Mode.',
        specs: { "Case": "49mm Aerospace-grade Titanium", "Display": "3000 nits Sapphire Crystal", "Water Resistance": "100m water resistant / EN13319 dive rated", "Battery": "36 hours normal, 72 hours low power" },
        images: [
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80'
        ]
      },
      {
        name: 'Samsung Galaxy Watch6 Classic (Bluetooth, 47mm Black)',
        slug: 'samsung-galaxy-watch6-classic-47mm',
        brand: 'samsung',
        category: 'smartwatches',
        price: 34999.00,
        original_price: 40999.00,
        discount: 15,
        stock: 35,
        rating: 4.6,
        rating_count: 520,
        is_featured: false,
        is_best_seller: true,
        is_new_arrival: false,
        short_description: 'Iconic rotating bezel, sapphire crystal glass, and advanced sleep coaching.',
        description: 'Bring timeless analog styling into the digital era with the physical rotating bezel, ECG heart monitoring, Body Composition BIA sensor, and deep sleep metrics.',
        specs: { "Display": "1.5-inch Super AMOLED Sapphire Crystal", "Sensors": "BioActive Sensor (HR, ECG, BIA), Temp sensor", "Water Resistance": "5ATM + IP68 / MIL-STD-810H", "OS": "Wear OS Powered by Samsung" },
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
        ]
      },

      // 5. Cameras
      {
        name: 'Sony Alpha 7 IV Full-frame Mirrorless Camera (Body Only)',
        slug: 'sony-alpha-7-iv-mirrorless-body',
        brand: 'sony',
        category: 'cameras',
        price: 209990.00,
        original_price: 242990.00,
        discount: 14,
        stock: 10,
        rating: 4.9,
        rating_count: 360,
        is_featured: true,
        is_best_seller: true,
        is_new_arrival: false,
        short_description: '33MP full-frame Exmor R sensor, 4K 60p 10-bit recording, and Real-time Eye AF.',
        description: 'The benchmark hybrid creator camera. Featuring high-speed BIONZ XR processing, advanced AI tracking autofocus, 15+ stops of dynamic range, and active cooling for extended recordings.',
        specs: { "Sensor": "33MP Full-Frame Exmor R CMOS", "Video": "4K 60p 10-bit 4:2:2 All-Intra", "Autofocus": "759 phase-detection AF points with Real-time Eye AF", "Stabilization": "5-axis in-body image stabilization (5.5 stops)" },
        images: [
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
        ]
      },
      {
        name: 'Canon EOS R6 Mark II Mirrorless Camera (RF 24-105mm Lens Kit)',
        slug: 'canon-eos-r6-mark-ii-lens-kit',
        brand: 'canon',
        category: 'cameras',
        price: 265995.00,
        original_price: 295995.00,
        discount: 10,
        stock: 8,
        rating: 4.8,
        rating_count: 220,
        is_featured: false,
        is_best_seller: false,
        is_new_arrival: true,
        short_description: '24.2 MP full-frame sensor with 40 fps electronic burst and 6K oversampled 4K 60p.',
        description: 'Engineered for high action sports and cinematic video without overheating. Dual Pixel CMOS AF II tracks people, horses, aircraft, and trains with extraordinary precision.',
        specs: { "Sensor": "24.2MP Full-Frame CMOS", "Burst Rate": "Up to 40 fps electronic shutter", "Video": "6K RAW external, 4K 60p internal oversampled", "IS": "Up to 8 stops Coordinated IS" },
        images: [
          'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80'
        ]
      },

      // 6. Gaming Accessories
      {
        name: 'Razer BlackWidow V4 Pro Mechanical Gaming Keyboard (Green Switches)',
        slug: 'razer-blackwidow-v4-pro-green',
        brand: 'razer',
        category: 'gaming-accessories',
        price: 21999.00,
        original_price: 24999.00,
        discount: 12,
        stock: 25,
        rating: 4.7,
        rating_count: 510,
        is_featured: false,
        is_best_seller: true,
        is_new_arrival: false,
        short_description: 'Razer Command Dial, 8 dedicated macro keys, 8000Hz polling rate, and Chroma RGB.',
        description: 'Amp up your battlestation with a full-blown command center. Includes underglow lighting, plush leatherette magnetic wrist rest, and tactile mechanical switches.',
        specs: { "Switch Type": "Razer Green Tactile Clicky", "Polling Rate": "8000 Hz HyperPolling", "Lighting": "Per-key Razer Chroma RGB with 3-side underglow", "Macro Keys": "8 Dedicated Macro Keys" },
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
        ]
      },
      {
        name: 'Logitech G PRO X SUPERLIGHT 2 Wireless Gaming Mouse',
        slug: 'logitech-g-pro-x-superlight-2',
        brand: 'logitech',
        category: 'gaming-accessories',
        price: 15995.00,
        original_price: 17995.00,
        discount: 11,
        stock: 40,
        rating: 4.9,
        rating_count: 1300,
        is_featured: true,
        is_best_seller: true,
        is_new_arrival: true,
        short_description: '60 grams featherlight esports mouse with HERO 2 sensor and LIGHTFORCE hybrid switches.',
        description: 'The preferred mouse of champion esports athletes. Delivers 32,000 DPI tracking accuracy, zero smoothing or acceleration, and 95 hours of continuous tournament battery.',
        specs: { "Weight": "60 grams", "Sensor": "HERO 2 32,000 DPI / 500+ IPS", "Switches": "LIGHTFORCE Hybrid Optical-Mechanical", "Polling": "4000 Hz wireless reporting" },
        images: [
          'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80'
        ]
      },

      // 7. Computer Accessories
      {
        name: 'Dell UltraSharp 32 4K USB-C Hub Monitor (U3223QE)',
        slug: 'dell-ultrasharp-32-4k-hub-monitor',
        brand: 'dell',
        category: 'computer-accessories',
        price: 76990.00,
        original_price: 88990.00,
        discount: 13,
        stock: 14,
        rating: 4.8,
        rating_count: 270,
        is_featured: true,
        is_best_seller: false,
        is_new_arrival: false,
        short_description: 'IPS Black technology with 2000:1 contrast ratio and 90W USB-C power delivery.',
        description: 'Be your most productive on a 31.5-inch 4K monitor with brilliant color and contrast thanks to groundbreaking IPS Black panel technology and extensive RJ45 ethernet docking.',
        specs: { "Resolution": "4K UHD (3840 x 2160) at 60 Hz", "Panel": "IPS Black, 98% DCI-P3, HDR 400", "Connectivity": "USB-C with 90W PD, DisplayPort 1.4, HDMI 2.0, RJ45", "Ergonomics": "Height, tilt, swivel, pivot adjustable" },
        images: [
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80'
        ]
      },
      {
        name: 'Logitech MX Master 3S Wireless Performance Mouse (Graphite)',
        slug: 'logitech-mx-master-3s-graphite',
        brand: 'logitech',
        category: 'computer-accessories',
        price: 9995.00,
        original_price: 11495.00,
        discount: 13,
        stock: 60,
        rating: 4.9,
        rating_count: 5200,
        is_featured: false,
        is_best_seller: true,
        is_new_arrival: false,
        short_description: '8K DPI any-surface glass tracking, quiet click acoustics, and MagSpeed electromagnetic scroll.',
        description: 'An iconic master tool re-engineered for quiet clicks and 8K DPI track-on-glass optical sensor. Pair up to 3 computers effortlessly with Logitech Flow cross-computer copy/paste.',
        specs: { "Sensor": "Darkfield 8000 DPI tracks on glass", "Scroll Wheel": "MagSpeed Electromagnetic 1000 lines/sec", "Clicks": "Quiet Click (90% less click noise)", "Battery": "Up to 70 days rechargeable via USB-C" },
        images: [
          'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80'
        ]
      },
      {
        name: 'Logitech MX Mechanical Wireless Illuminated Keyboard',
        slug: 'logitech-mx-mechanical-keyboard',
        brand: 'logitech',
        category: 'computer-accessories',
        price: 16995.00,
        original_price: 19995.00,
        discount: 15,
        stock: 35,
        rating: 4.7,
        rating_count: 1150,
        is_featured: false,
        is_best_seller: false,
        is_new_arrival: false,
        short_description: 'Low profile tactile quiet mechanical switches with smart auto-sensing backlighting.',
        description: 'Feel every moment of your workflow with ultra-precise low profile mechanical keys, dual-colored keycaps for peripheral orientation, and multi-OS Bluetooth switching.',
        specs: { "Key Switches": "Low Profile Tactile Quiet Mechanical", "Backlighting": "Smart Illumination with hand proximity sensor", "Connectivity": "Bluetooth Low Energy & Logi Bolt USB Receiver", "Battery": "15 days backlit, up to 10 months backlighting off" },
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
        ]
      },

      // 8. Speakers
      {
        name: 'Bose SoundLink Revolve+ II Bluetooth 360 Portable Speaker',
        slug: 'bose-soundlink-revolve-plus-ii',
        brand: 'bose',
        category: 'speakers',
        price: 29400.00,
        original_price: 32900.00,
        discount: 11,
        stock: 32,
        rating: 4.8,
        rating_count: 890,
        is_featured: false,
        is_best_seller: true,
        is_new_arrival: false,
        short_description: 'True 360-degree deep omnidirectional sound with built-in flexible carry handle.',
        description: 'Astonishingly loud. Surprisingly small. This 360-degree wireless speaker is engineered to deliver deep, immersive sound in every direction with up to 17 hours of battery life.',
        specs: { "Sound": "True 360° Omnidirectional acoustic deflector", "Durability": "IP55 Water and Dust resistant", "Battery": "Up to 17 hours playtime", "Mic": "Built-in microphone for speakerphone and Siri" },
        images: [
          'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80'
        ]
      },
      {
        name: 'Sony HT-A7000 7.1.2ch Dolby Atmos Soundbar',
        slug: 'sony-ht-a7000-dolby-atmos-soundbar',
        brand: 'sony',
        category: 'speakers',
        price: 119990.00,
        original_price: 149990.00,
        discount: 20,
        stock: 12,
        rating: 4.8,
        rating_count: 240,
        is_featured: true,
        is_best_seller: false,
        is_new_arrival: false,
        short_description: 'Flagship 500W Dolby Atmos soundbar with 360 Spatial Sound Mapping.',
        description: 'Discover a whole new level of cinematic immersion. Two up-firing speakers for overhead sound, beam tweeters, built-in dual subwoofer, and HDMI 2.1 4K 120Hz gaming passthrough.',
        specs: { "Channels": "7.1.2 Channel Flagship Soundbar (500W Total)", "Audio Formats": "Dolby Atmos, DTS:X, 360 Reality Audio", "Ports": "HDMI 2.1 (8K HDR / 4K 120fps passthrough), eARC", "Wireless": "AirPlay 2, Spotify Connect, Chromecast built-in" },
        images: [
          'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80'
        ]
      },

      // 9. Tablets
      {
        name: 'Apple iPad Pro 13" (M4 Chip, 256GB, Ultra Retina XDR Tandem OLED, Space Black)',
        slug: 'apple-ipad-pro-13-m4-256gb',
        brand: 'apple',
        category: 'tablets',
        price: 129900.00,
        original_price: 129900.00,
        discount: 0,
        stock: 22,
        rating: 4.9,
        rating_count: 610,
        is_featured: true,
        is_best_seller: true,
        is_new_arrival: true,
        short_description: 'Thinnest Apple product ever with breakthrough Tandem OLED display and extreme M4 speed.',
        description: 'The all-new iPad Pro packs outrageous performance into an impossibly thin 5.1mm design. Featuring world-first Tandem OLED technology with 1000 nits full-screen XDR brightness.',
        specs: { "Display": "13-inch Ultra Retina XDR Tandem OLED (2752x2064)", "Processor": "Apple M4 Chip with 10-core GPU and Ray Tracing", "Thickness": "5.1 mm ultra-thin aluminum", "Accessories": "Supports Apple Pencil Pro & Magic Keyboard" },
        images: [
          'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80'
        ]
      },
      {
        name: 'Samsung Galaxy Tab S9 Ultra (14.6" Dynamic AMOLED 2X, 256GB with S Pen)',
        slug: 'samsung-galaxy-tab-s9-ultra-256gb',
        brand: 'samsung',
        category: 'tablets',
        price: 108999.00,
        original_price: 124999.00,
        discount: 13,
        stock: 16,
        rating: 4.7,
        rating_count: 340,
        is_featured: false,
        is_best_seller: false,
        is_new_arrival: false,
        short_description: 'Colossal 14.6" screen with IP68 water resistance and Snapdragon 8 Gen 2 for Galaxy.',
        description: 'The canvas of your dreams. Complete with bundled IP68 water-resistant S Pen, quad AKG speakers, and Samsung DeX multi-window desktop workstation capability.',
        specs: { "Display": "14.6-inch Dynamic AMOLED 2X 120Hz", "Durability": "IP68 water and dust resistant (Tablet and S Pen)", "Audio": "Quad Stereo Speakers tuned by AKG with Dolby Atmos", "Battery": "11,200 mAh fast charging" },
        images: [
          'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80'
        ]
      },

      // 10. Electronic Accessories
      {
        name: 'Anker Prime 20,000mAh Power Bank (200W Output with Smart Digital Display)',
        slug: 'anker-prime-20000mah-200w-power-bank',
        brand: 'anker',
        category: 'electronic-accessories',
        price: 11999.00,
        original_price: 13999.00,
        discount: 14,
        stock: 55,
        rating: 4.8,
        rating_count: 1400,
        is_featured: true,
        is_best_seller: true,
        is_new_arrival: true,
        short_description: 'Dual high-power USB-C ports delivering up to 100W each simultaneously with live stats.',
        description: 'Charge two high-spec laptops at full speed concurrently. The crisp smart digital display provides real-time wattage in/out, remaining battery time, and cell health metrics.',
        specs: { "Capacity": "20,000 mAh (72Wh)", "Total Output": "200W Maximum combined", "Ports": "2x USB-C (100W each max) + 1x USB-A (65W max)", "Safety": "ActiveShield 2.0 temperature protection" },
        images: [
          'https://images.unsplash.com/photo-1609592426861-f402f0857321?w=800&auto=format&fit=crop&q=80'
        ]
      },
      {
        name: 'Anker 737 GaNPrime 120W USB-C Wall Charger',
        slug: 'anker-737-ganprime-120w-charger',
        brand: 'anker',
        category: 'electronic-accessories',
        price: 6999.00,
        original_price: 8499.00,
        discount: 18,
        stock: 70,
        rating: 4.9,
        rating_count: 2100,
        is_featured: false,
        is_best_seller: true,
        is_new_arrival: false,
        short_description: 'Power 3 devices at once. Gallium Nitride (GaN 3) high efficiency technology.',
        description: 'Say goodbye to your old bulky power bricks. Power IQ 4.0 dynamic power distribution detects connected device demands and dynamically balances charge speed.',
        specs: { "Max Output": "120W Max", "Ports": "2x USB-C, 1x USB-A", "Technology": "GaNPrime with PowerIQ 4.0", "Size": "39% smaller than standard 96W MacBook brick" },
        images: [
          'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80'
        ]
      },
      {
        name: 'Anker USB-C to USB-C Braided Nylon Fast Charging Cable 240W (6ft)',
        slug: 'anker-braided-usbc-cable-240w-6ft',
        brand: 'anker',
        category: 'electronic-accessories',
        price: 1499.00,
        original_price: 1999.00,
        discount: 25,
        stock: 120,
        rating: 4.7,
        rating_count: 3800,
        is_featured: false,
        is_best_seller: true,
        is_new_arrival: false,
        short_description: 'Supports Power Delivery 3.1 240W charging with double-braided nylon exterior.',
        description: 'Built to withstand over 30,000 bends. Safely powers high-performance gaming laptops, MacBooks, tablets, and phones at peak protocol speeds.',
        specs: { "Power Rating": "Up to 240W (48V/5A)", "Length": "1.8 meters (6 feet)", "Material": "Double-braided nylon sheath", "Warranty": "Lifetime manufacturer warranty" },
        images: [
          'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80'
        ]
      },

      // Additional Products across categories to hit 30+ items
      {
        name: 'Samsung Galaxy S23 FE 5G (8GB RAM, 128GB Mint)',
        slug: 'samsung-galaxy-s23-fe-mint',
        brand: 'samsung',
        category: 'smartphones',
        price: 49999.00,
        original_price: 59999.00,
        discount: 17,
        stock: 42,
        rating: 4.4,
        rating_count: 890,
        is_featured: false,
        is_best_seller: false,
        is_new_arrival: false,
        short_description: 'Dynamic AMOLED 2X 120Hz display, 50MP camera, and iconic flagship styling.',
        description: 'Epic moments are now accessible to all. The Galaxy S23 FE opens the door for more people to experience the extraordinary.',
        specs: { "Display": "6.4-inch FHD+ 120Hz Dynamic AMOLED 2X", "Processor": "Exynos 2200", "Storage": "128 GB", "Battery": "4500 mAh" },
        images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80']
      },
      {
        name: 'Apple MacBook Air 13" (M3 Chip, 16GB Unified Memory, 512GB SSD Midnight)',
        slug: 'apple-macbook-air-13-m3-midnight',
        brand: 'apple',
        category: 'laptops',
        price: 134900.00,
        original_price: 134900.00,
        discount: 0,
        stock: 35,
        rating: 4.8,
        rating_count: 1250,
        is_featured: true,
        is_best_seller: true,
        is_new_arrival: true,
        short_description: 'Lean. Mean. M3 machine. Strikingly thin with dual external display support.',
        description: 'MacBook Air sails through work and play with next-gen M3 performance and up to 18 hours of battery life in a fanless, whisper-quiet design.',
        specs: { "Display": "13.6-inch Liquid Retina display (500 nits)", "Chip": "Apple M3 8-core CPU, 10-core GPU", "Memory": "16GB Unified", "Storage": "512GB SSD" },
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80']
      },
      {
        name: 'Sony WF-1000XM5 True Wireless Earbuds (Black)',
        slug: 'sony-wf-1000xm5-earbuds-black',
        brand: 'sony',
        category: 'headphones',
        price: 24990.00,
        original_price: 29990.00,
        discount: 17,
        stock: 40,
        rating: 4.6,
        rating_count: 780,
        is_featured: false,
        is_best_seller: false,
        is_new_arrival: false,
        short_description: 'The best noise cancelling earbuds with Dynamic Driver X and bone conduction mics.',
        description: 'Immerse yourself in pure studio sound. Featuring two proprietary processors, dual feedback microphones, and foam noise isolation ear tips.',
        specs: { "Battery": "8 hours (earbuds) + 16 hours (case)", "Water Resistance": "IPX4", "Codecs": "LDAC, LC3, AAC, SBC" },
        images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80']
      },
      {
        name: 'Canon EOS R5 Mirrorless Camera Body',
        slug: 'canon-eos-r5-camera-body',
        brand: 'canon',
        category: 'cameras',
        price: 339995.00,
        original_price: 369995.00,
        discount: 8,
        stock: 5,
        rating: 4.9,
        rating_count: 180,
        is_featured: false,
        is_best_seller: false,
        is_new_arrival: false,
        short_description: 'Professional 45MP full-frame stills and revolutionary 8K RAW cinema recording.',
        description: 'For the professional creator who demands uncompromised resolution, Dual Pixel CMOS AF II, and in-body 5-axis image stabilization.',
        specs: { "Sensor": "45MP Full-Frame CMOS", "Video": "8K 30p RAW internal, 4K 120p", "AF": "1053 automatic AF zones with animal tracking" },
        images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80']
      },
      {
        name: 'Razer DeathAdder V3 Pro Wireless Gaming Mouse',
        slug: 'razer-deathadder-v3-pro',
        brand: 'razer',
        category: 'gaming-accessories',
        price: 13999.00,
        original_price: 15999.00,
        discount: 13,
        stock: 48,
        rating: 4.8,
        rating_count: 920,
        is_featured: false,
        is_best_seller: false,
        is_new_arrival: false,
        short_description: '63g ultra-lightweight ergonomic esports icon with Focus Pro 30K Optical Sensor.',
        description: 'Refined ergonomics crafted in collaboration with top esports pros. Features Gen-3 optical mouse switches rated for 90 million clicks.',
        specs: { "Weight": "63 grams", "Sensor": "Focus Pro 30K Optical", "Battery": "Up to 90 hours continuous play" },
        images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80']
      },
      {
        name: 'Bose Smart Soundbar 900 with Dolby Atmos',
        slug: 'bose-smart-soundbar-900',
        brand: 'bose',
        category: 'speakers',
        price: 89900.00,
        original_price: 104900.00,
        discount: 14,
        stock: 14,
        rating: 4.7,
        rating_count: 310,
        is_featured: false,
        is_best_seller: false,
        is_new_arrival: false,
        short_description: 'Premium glass-top soundbar with custom upward-firing dipole transducers.',
        description: 'Produces a layer of realism no other speaker can duplicate. Bose PhaseGuide technology beams multi-directional sound to distinct areas in your living room.',
        specs: { "Surround": "Dolby Atmos with Bose TrueSpace processing", "Top Plate": "Impact-resistant polished glass", "Connectivity": "eARC, Wi-Fi, Bluetooth, Voice Control" },
        images: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80']
      },
      {
        name: 'Apple iPad mini (6th Gen, Wi-Fi 64GB Space Gray)',
        slug: 'apple-ipad-mini-6th-gen-64gb',
        brand: 'apple',
        category: 'tablets',
        price: 49900.00,
        original_price: 49900.00,
        discount: 0,
        stock: 25,
        rating: 4.8,
        rating_count: 1100,
        is_featured: false,
        is_best_seller: false,
        is_new_arrival: false,
        short_description: '8.3-inch Liquid Retina display, A15 Bionic chip, and Apple Pencil 2 support in your palm.',
        description: 'The mega-power of iPad in a pocketable size. Features an all-screen design, USB-C port, and 12MP Ultra Wide front camera with Center Stage.',
        specs: { "Display": "8.3-inch Liquid Retina with True Tone", "Processor": "A15 Bionic with Neural Engine", "Weight": "293 grams" },
        images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80']
      }
    ];

    for (const p of products) {
      const brandId = brandMap[p.brand] || null;
      const categoryId = categoryMap[p.category];

      const productRes = await client.query(`
        INSERT INTO products (
          name, slug, brand_id, category_id, price, original_price,
          discount_percentage, stock_quantity, rating, rating_count,
          short_description, description, specifications,
          is_featured, is_best_seller, is_new_arrival
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (slug) DO UPDATE SET
          price = EXCLUDED.price,
          original_price = EXCLUDED.original_price,
          stock_quantity = EXCLUDED.stock_quantity,
          rating = EXCLUDED.rating,
          rating_count = EXCLUDED.rating_count
        RETURNING id, name;
      `, [
        p.name, p.slug, brandId, categoryId, p.price, p.original_price,
        p.discount, p.stock, p.rating, p.rating_count,
        p.short_description, p.description, JSON.stringify(p.specs || {}),
        p.is_featured, p.is_best_seller, p.is_new_arrival
      ]);

      const productId = productRes.rows[0].id;

      // Seed product images
      if (p.images && p.images.length > 0) {
        for (let i = 0; i < p.images.length; i++) {
          await client.query(`
            INSERT INTO product_images (product_id, image_url, is_primary, display_order)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT DO NOTHING;
          `, [productId, p.images[i], i === 0, i]);
        }
      }
    }
    console.log(`✓ Seeded ${products.length} comprehensive electronics products with specifications and multi-images.`);

    // 5. Seed Customer Address for Rajesh
    const customerId = userRes.rows.find(u => u.role === 'customer')?.id;
    if (customerId) {
      await client.query(`
        INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, postal_code, is_default)
        VALUES ($1, 'Rajesh Kumar', '+91 91234 56789', 'Flat 402, Skyline Residency', 'Koramangala 4th Block', 'Bengaluru', 'Karnataka', '560034', true)
        ON CONFLICT DO NOTHING;
      `, [customerId]);
      console.log('✓ Seeded customer default address.');

      // 6. Seed Sample Demonstration Orders
      const orderRes = await client.query(`
        INSERT INTO orders (
          order_number, user_id, total_amount, shipping_amount, discount_amount,
          status, payment_method, payment_status,
          shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_postal_code
        )
        VALUES 
          ('ORD-2026-88192', $1, 29990.00, 0.00, 5000.00, 'Delivered', 'Demo Payment', 'Paid', 'Rajesh Kumar', '+91 91234 56789', 'Flat 402, Skyline Residency, Koramangala 4th Block', 'Bengaluru', 'Karnataka', '560034'),
          ('ORD-2026-99341', $1, 9995.00, 0.00, 1500.00, 'Shipped', 'Demo Payment', 'Paid', 'Rajesh Kumar', '+91 91234 56789', 'Flat 402, Skyline Residency, Koramangala 4th Block', 'Bengaluru', 'Karnataka', '560034')
        ON CONFLICT (order_number) DO NOTHING
        RETURNING id, order_number;
      `, [customerId]);

      if (orderRes.rowCount > 0) {
        // Link sample items
        const sonyProduct = await client.query(`SELECT id, price FROM products WHERE slug = 'sony-wh-1000xm5-silver' LIMIT 1;`);
        const logiProduct = await client.query(`SELECT id, price FROM products WHERE slug = 'logitech-mx-master-3s-graphite' LIMIT 1;`);

        if (sonyProduct.rows.length > 0 && orderRes.rows[0]) {
          await client.query(`
            INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
            VALUES ($1, $2, 1, $3, $3)
            ON CONFLICT DO NOTHING;
          `, [orderRes.rows[0].id, sonyProduct.rows[0].id, sonyProduct.rows[0].price]);
        }
        if (logiProduct.rows.length > 0 && orderRes.rows[1]) {
          await client.query(`
            INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
            VALUES ($1, $2, 1, $3, $3)
            ON CONFLICT DO NOTHING;
          `, [orderRes.rows[1].id, logiProduct.rows[0].id, logiProduct.rows[0].price]);
        }
        console.log(`✓ Seeded sample customer orders and order items.`);
      }
    }

    await client.query('COMMIT');
    console.log('✓ Seeding completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('✗ Seeding failed with rollback:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (process.argv[1] === import.meta.filename) {
  runSeeds()
    .then(() => {
      console.log('Seed execution finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
