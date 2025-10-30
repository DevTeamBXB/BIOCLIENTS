import mongoose, { Schema, model, models } from 'mongoose';

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    m3: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    businessLine: {
      type: String,
      enum: ['Medicinal', 'Otros Gases', 'Redes y Mantenimientos', 'Industrial', 'Equipos Biomedicos'],
      default: '',
      trim: true,
    },
        status: {
      type: String,
      enum: ['Activo', 'Inactivo'],
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = models.Product || model('Product', productSchema);

export default Product;
