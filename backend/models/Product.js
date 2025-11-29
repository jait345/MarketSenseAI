const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: '' },
    image: { type: String, default: '' },
    price: { type: Number, required: true, default: 0 },
    discountPrice: { type: Number, default: 0 }, // Precio con descuento
    discountPercentage: { type: Number, default: 0 }, // Porcentaje de descuento (0-100)
    category: { 
      type: String, 
      required: true,
      enum: ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Otro'],
      default: 'Otro'
    },
    subcategory: { type: String, default: '' },
    seller: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    }, // Usuario que subió el producto
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    countInStock: { type: Number, default: 0 },
    isPrime: { type: Boolean, default: false },
    description: { type: String, default: '' },
    purchaseCount: { type: Number, default: 0 }, // Contador de compras
    isActive: { type: Boolean, default: true }, // Para desactivar productos
    discountStartDate: { type: Date }, // Fecha inicio descuento
    discountEndDate: { type: Date }, // Fecha fin descuento
  },
  { timestamps: true }
);

// Índices para búsquedas eficientes
ProductSchema.index({ category: 1, purchaseCount: -1 });
ProductSchema.index({ discountPercentage: -1, createdAt: -1 });
ProductSchema.index({ seller: 1, createdAt: -1 });

// Método para calcular precio final
ProductSchema.methods.getFinalPrice = function() {
  const now = new Date();
  if (this.discountPercentage > 0 && 
      this.discountStartDate && 
      this.discountEndDate &&
      now >= this.discountStartDate && 
      now <= this.discountEndDate) {
    return this.price * (1 - this.discountPercentage / 100);
  }
  return this.discountPrice > 0 ? this.discountPrice : this.price;
};

// Método para verificar si está en descuento
ProductSchema.methods.isOnDiscount = function() {
  const now = new Date();
  return this.discountPercentage > 0 && 
         this.discountStartDate && 
         this.discountEndDate &&
         now >= this.discountStartDate && 
         now <= this.discountEndDate;
};

module.exports = mongoose.model('Product', ProductSchema);