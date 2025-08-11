import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  products: {
    name: string;
    quantity: number;
     type: 'medicinal' | 'industrial';
  }[];
  direccion_envio: {
    calle: string;
    ciudad: string;
    alias?: string;
  };
  estado: 'Pendiente' | 'Enviado' | 'Entregado';
  creado_en: Date;
  actualizado_en: Date;
}

const ProductInOrderSchema = new Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    type: {
      type: String,
      enum: ['medicinal', 'industrial'],
      required: true,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    email: { type: String, required: true },
    products: { type: [ProductInOrderSchema], required: true },
    direccion_envio: {
      calle: { type: String, required: true },
      ciudad: { type: String, required: true },
      alias: { type: String },
    },
    estado: {
      type: String,
      enum: ['Pendiente', 'Enviado', 'Entregado'],
      default: 'Pendiente',
    },
  },
  {
    timestamps: { createdAt: 'creado_en', updatedAt: 'actualizado_en' },
  }
);

const Order = models.Order || model<IOrder>('Order', OrderSchema);
export default Order;
