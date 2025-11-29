const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/marketsenseai';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB límite
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// Conexión a MongoDB
mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('Conectado a MongoDB:', MONGO_URI))
  .catch((err) => console.error('Error conectando a MongoDB:', err.message));

// Semillas de ejemplo con nuevos campos
const sampleProducts = [
  {
    name: 'Zapatos Deportivos Nike Air',
    brand: 'Nike',
    image: 'https://via.placeholder.com/300/FFFFFF?text=Zapatos+Nike+Air',
    price: 129.99,
    discountPrice: 99.99,
    discountPercentage: 23,
    category: 'Deportes',
    subcategory: 'Calzado',
    rating: 4.5,
    numReviews: 120,
    countInStock: 15,
    isPrime: true,
    description: 'Zapatos deportivos cómodos y ligeros, ideales para correr.',
    purchaseCount: 45,
    discountStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Hace 7 días
    discountEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // En 7 días
    seller: null // Se asignará después de crear un usuario vendedor
  },
  {
    name: 'Auriculares Bluetooth Sony',
    brand: 'Sony',
    image: 'https://via.placeholder.com/300/FFFFFF?text=Auriculares+Sony',
    price: 89.99,
    discountPrice: 0,
    discountPercentage: 0,
    category: 'Electrónica',
    subcategory: 'Audio',
    rating: 4.2,
    numReviews: 98,
    countInStock: 8,
    isPrime: false,
    description: 'Auriculares inalámbricos con cancelación de ruido y alta fidelidad.',
    purchaseCount: 32,
    seller: null
  },
  {
    name: 'Camiseta Deportiva Adidas',
    brand: 'Adidas',
    image: 'https://via.placeholder.com/300/FFFFFF?text=Camiseta+Adidas',
    price: 34.99,
    discountPrice: 27.99,
    discountPercentage: 20,
    category: 'Ropa',
    subcategory: 'Deportiva',
    rating: 4.0,
    numReviews: 75,
    countInStock: 20,
    isPrime: true,
    description: 'Camiseta transpirable perfecta para entrenamientos intensos.',
    purchaseCount: 28,
    discountStartDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Hace 3 días
    discountEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // En 14 días
    seller: null
  },
  {
    name: 'Smart TV Samsung 55"',
    brand: 'Samsung',
    image: 'https://via.placeholder.com/300/FFFFFF?text=Smart+TV',
    price: 899.99,
    discountPrice: 0,
    discountPercentage: 0,
    category: 'Electrónica',
    subcategory: 'Televisores',
    rating: 4.7,
    numReviews: 156,
    countInStock: 5,
    isPrime: true,
    description: 'Smart TV 4K UHD con tecnología QLED y sistema operativo Tizen.',
    purchaseCount: 67,
    seller: null
  },
  {
    name: 'Sofá de 3 Plazas Moderno',
    brand: 'Ikea',
    image: 'https://via.placeholder.com/300/FFFFFF?text=Sofá+Moderno',
    price: 599.99,
    discountPrice: 479.99,
    discountPercentage: 20,
    category: 'Hogar',
    subcategory: 'Muebles',
    rating: 4.3,
    numReviews: 89,
    countInStock: 3,
    isPrime: false,
    description: 'Sofá moderno y cómodo con tela de alta calidad.',
    purchaseCount: 19,
    discountStartDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Ayer
    discountEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // En 30 días
    seller: null
  }
];

// Sembrar datos si la colección está vacía
async function ensureSeedData() {
  try {
    // Crear usuario vendedor de ejemplo si no existe
    let seller = await User.findOne({ email: 'seller@example.com' });
    if (!seller) {
      seller = new User({
        name: 'Vendedor Ejemplo',
        email: 'seller@example.com',
        password: 'password123',
        role: 'seller'
      });
      await seller.save();
      console.log('Usuario vendedor creado');
    }
    
    // Crear usuario comprador de ejemplo si no existe
    let buyer = await User.findOne({ email: 'buyer@example.com' });
    if (!buyer) {
      buyer = new User({
        name: 'Comprador Ejemplo',
        email: 'buyer@example.com',
        password: 'password123',
        role: 'buyer'
      });
      await buyer.save();
      console.log('Usuario comprador creado');
    }
    
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      // Asignar vendedor a los productos de ejemplo
      const productsWithSeller = sampleProducts.map(product => ({
        ...product,
        seller: seller._id
      }));
      
      await Product.insertMany(productsWithSeller);
      console.log('Productos de ejemplo insertados');
    }
  } catch (err) {
    console.error('Error sembrando datos:', err.message);
  }
}

// Middleware de autenticación
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader);
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No autorizado - No Authorization header' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('Extracted token:', token);
    
    if (!token || token === authHeader) {
      return res.status(401).json({ message: 'No autorizado - Invalid token format' });
    }
    
    console.log('JWT_SECRET:', JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Token inválido', error: error.message });
  }
};

// Middleware para vendedores
const sellerMiddleware = (req, res, next) => {
  if (req.user.role !== 'seller' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Se requiere rol de vendedor' });
  }
  next();
};

// Rutas de autenticación
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }
    
    const user = new User({ name, email, password, role: role || 'buyer' });
    await user.save();
    
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
});

// Cambiar rol de usuario (comprador/vendedor)
app.put('/api/auth/change-role', authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['buyer', 'seller'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido. Use "buyer" o "seller"' });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Si el usuario ya es admin, no puede cambiar su rol
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Los administradores no pueden cambiar su rol' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({
      message: `Rol actualizado exitosamente a ${role === 'seller' ? 'vendedor' : 'comprador'}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar rol', error: error.message });
  }
});

// Obtener perfil de usuario
app.get('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        sellerRating: user.sellerRating,
        totalSales: user.totalSales,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
  }
});

// Actualizar perfil de usuario
app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    console.log('Profile update - User:', req.user);
    console.log('Profile update - Body:', req.body);
    
    const { name, phone, address } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    
    await user.save();
    
    console.log('Profile updated successfully for user:', user._id);
    
    res.json({
      message: 'Perfil actualizado exitosamente',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
});

// Rutas de productos mejoradas con IA
app.get('/api/products', async (req, res) => {
  try {
    const { search, category, subcategory, minPrice, maxPrice, discount, sortBy, aiSearch } = req.query;
    let filter = { isActive: true };
    
    // Filtro por búsqueda (normal o IA)
    if (search && search.trim()) {
      if (aiSearch === 'true') {
        // Búsqueda inteligente con IA - busca en nombre, descripción y categoría
        const searchTerms = search.trim().toLowerCase().split(' ');
        filter.$or = [
          { name: { $regex: search.trim(), $options: 'i' } },
          { description: { $regex: search.trim(), $options: 'i' } },
          { category: { $regex: search.trim(), $options: 'i' } },
          { subcategory: { $regex: search.trim(), $options: 'i' } },
          { brand: { $regex: search.trim(), $options: 'i' } }
        ];
        
        // Si hay términos de búsqueda múltiples, busca coincidencias parciales
        if (searchTerms.length > 1) {
          filter.$or.push(...searchTerms.map(term => ({
            $or: [
              { name: { $regex: term, $options: 'i' } },
              { description: { $regex: term, $options: 'i' } }
            ]
          })));
        }
      } else {
        filter.name = { $regex: search.trim(), $options: 'i' };
      }
    }
    
    // Filtros por categoría
    if (category) {
      filter.category = category;
    }
    if (subcategory) {
      filter.subcategory = subcategory;
    }
    
    // Filtros por precio
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    // Filtro por descuento
    if (discount === 'true') {
      filter.$or = [
        { discountPercentage: { $gt: 0 } },
        { discountPrice: { $gt: 0 } }
      ];
    }
    
    // Ordenamiento
    let sortOptions = {};
    switch (sortBy) {
      case 'price_asc':
        sortOptions.price = 1;
        break;
      case 'price_desc':
        sortOptions.price = -1;
        break;
      case 'popularity':
        sortOptions.purchaseCount = -1;
        break;
      case 'rating':
        sortOptions.rating = -1;
        break;
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      case 'discount':
        sortOptions.discountPercentage = -1;
        break;
      default:
        sortOptions.createdAt = -1;
    }
    
    const products = await Product.find(filter)
      .populate('seller', 'name sellerRating')
      .sort(sortOptions);
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo productos', error: err.message });
  }
});

// Obtener productos con descuento
app.get('/api/products/discounted', async (req, res) => {
  try {
    const now = new Date();
    const products = await Product.find({
      isActive: true,
      $or: [
        { 
          discountPercentage: { $gt: 0 },
          discountStartDate: { $lte: now },
          discountEndDate: { $gte: now }
        },
        { discountPrice: { $gt: 0 } }
      ]
    }).populate('seller', 'name sellerRating')
      .sort({ discountPercentage: -1 })
      .limit(20);
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo productos con descuento', error: err.message });
  }
});

// Obtener productos más comprados por categoría
app.get('/api/products/popular/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;
    
    const products = await Product.find({ 
      category: category, 
      isActive: true 
    }).populate('seller', 'name sellerRating')
      .sort({ purchaseCount: -1 })
      .limit(parseInt(limit));
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo productos populares', error: err.message });
  }
});

// Obtener productos del vendedor actual
app.get('/api/products/seller/my-products', authMiddleware, sellerMiddleware, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo productos del vendedor', error: err.message });
  }
});

// Subir nuevo producto (solo vendedores)
app.post('/api/products', authMiddleware, sellerMiddleware, upload.single('image'), async (req, res) => {
  try {
    const productData = {
      ...req.body,
      seller: req.user._id,
      price: parseFloat(req.body.price),
      discountPrice: req.body.discountPrice ? parseFloat(req.body.discountPrice) : 0,
      discountPercentage: req.body.discountPercentage ? parseFloat(req.body.discountPercentage) : 0,
      countInStock: parseInt(req.body.countInStock) || 0,
      image: req.file ? `/uploads/${req.file.filename}` : req.body.image || ''
    };
    
    // Validar fechas de descuento si se proporcionan
    if (req.body.discountStartDate && req.body.discountEndDate) {
      productData.discountStartDate = new Date(req.body.discountStartDate);
      productData.discountEndDate = new Date(req.body.discountEndDate);
    }
    
    const product = new Product(productData);
    await product.save();
    
    await product.populate('seller', 'name sellerRating');
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear producto', error: error.message });
  }
});

// Actualizar producto (solo el vendedor dueño)
app.put('/api/products/:id', authMiddleware, sellerMiddleware, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user._id });
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado o no autorizado' });
    }
    
    const updateData = {
      ...req.body,
      price: parseFloat(req.body.price),
      discountPrice: req.body.discountPrice ? parseFloat(req.body.discountPrice) : 0,
      discountPercentage: req.body.discountPercentage ? parseFloat(req.body.discountPercentage) : 0,
      countInStock: parseInt(req.body.countInStock) || 0
    };
    
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    
    // Validar fechas de descuento si se proporcionan
    if (req.body.discountStartDate && req.body.discountEndDate) {
      updateData.discountStartDate = new Date(req.body.discountStartDate);
      updateData.discountEndDate = new Date(req.body.discountEndDate);
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('seller', 'name sellerRating');
    
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name sellerRating');
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo producto', error: err.message });
  }
});

// Rutas de órdenes/compras
app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;
    
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No hay productos en la orden' });
    }
    
    // Verificar stock y calcular descuentos
    let totalDiscount = 0;
    const processedItems = [];
    
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Producto ${item.product} no encontrado` });
      }
      
      if (product.countInStock < item.quantity) {
        return res.status(400).json({ message: `Stock insuficiente para ${product.name}` });
      }
      
      // Calcular precio con descuento
      const finalPrice = product.getFinalPrice();
      const discount = (product.price - finalPrice) * item.quantity;
      totalDiscount += discount;
      
      processedItems.push({
        product: item.product,
        quantity: item.quantity,
        price: product.price,
        discount: discount,
        finalPrice: finalPrice
      });
      
      // Actualizar stock
      product.countInStock -= item.quantity;
      await product.save();
    }
    
    const order = new Order({
      user: req.user._id,
      orderItems: processedItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice: totalPrice - totalDiscount,
      totalDiscount
    });
    
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear orden', error: error.message });
  }
});

// Obtener órdenes del usuario
app.get('/api/orders/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name image')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo órdenes', error: error.message });
  }
});

// Obtener detalles de una orden
app.get('/api/orders/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate('orderItems.product', 'name image brand')
      .populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo orden', error: error.message });
  }
});

// Actualizar estado de pago de una orden
app.put('/api/orders/:id/pay', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address
    };
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando orden', error: error.message });
  }
});

// Obtener estadísticas del vendedor
app.get('/api/seller/stats', authMiddleware, sellerMiddleware, async (req, res) => {
  try {
    const stats = await Product.aggregate([
      { $match: { seller: req.user._id } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalSales: { $sum: '$purchaseCount' },
          activeProducts: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
        }
      }
    ]);
    
    const orders = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      { $match: { 'product.seller': req.user._id } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$orderItems.finalPrice' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      products: stats[0] || { totalProducts: 0, totalSales: 0, activeProducts: 0 },
      sales: orders[0] || { totalRevenue: 0, totalOrders: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo estadísticas', error: error.message });
  }
});

// Endpoint opcional para forzar resiembra
app.post('/api/seed', async (req, res) => {
  try {
    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);
    res.json({ message: 'Semillas insertadas' });
  } catch (err) {
    res.status(500).json({ message: 'Error sembrando datos', error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, async () => {
  await ensureSeedData();
  console.log(`API escuchando en http://localhost:${PORT}`);
});