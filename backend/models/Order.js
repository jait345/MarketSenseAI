const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',
    required: true 
  },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }, // Precio al momento de la compra
  discount: { type: Number, default: 0 }, // Descuento aplicado
  finalPrice: { type: Number, required: true } // Precio final después de descuento
});

const OrderSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    orderItems: [OrderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true }
    },
    paymentMethod: { type: String, required: true, default: 'Tarjeta de Crédito' },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    totalDiscount: { type: Number, default: 0.0 }, // Total de descuentos aplicados
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

// Método para actualizar el contador de compras de productos
OrderSchema.post('save', async function(doc) {
  if (doc.isPaid && doc.orderItems && doc.orderItems.length > 0) {
    const Product = mongoose.model('Product');
    
    for (const item of doc.orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { purchaseCount: item.quantity } }
      );
    }
  }
});

module.exports = mongoose.model('Order', OrderSchema);