import mongoose, { Schema, Document } from 'mongoose';

interface ProductItem {
  _id: mongoose.Types.ObjectId;
  cantidadVacios: number;
  cantidadLlenos: number;
  cantidadAsignacion?: number;
  quantity: number;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId; // 👈 referencia al cliente
  email: string;
  address: {
    calle: string;
    ciudad: string;
    alias?: string;
  };
  solicitante: string;
  numeroSolicitante: string;
  observaciones?: string;
  products: ProductItem[];
  status:
    | 'pendiente'
    | 'procesando'
    | 'produccion'
    | 'en_distribucion'
    | 'cancelado'
    | 'completado';
  classification:
    | 'Medicinal'
    | 'Otros Gases'
    | 'Redes y Mantenimientos'
    | 'Industrial'
    | 'Equipos Biomedicos';
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Client', // 👈 referencia al modelo Client
      required: true,
    },
    email: { type: String, required: true },
    address: {
      calle: { type: String, required: true },
      ciudad: { type: String, required: true },
      alias: { type: String },
    },
    solicitante: { type: String, required: true },
    numeroSolicitante: { type: String, required: true },
    observaciones: { type: String },
    products: [
      {
        _id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        cantidadVacios: { type: Number, min: 0, default: 0 },
        cantidadLlenos: { type: Number, min: 0, default: 0 },
        cantidadAsignacion: { type: Number, min: 0, default: 0 },
        quantity: { type: Number, required: true, min: 0 },
      },
    ],
    status: {
      type: String,
      enum: [
        'pendiente',
        'procesando',
        'produccion',
        'en_distribucion',
        'cancelado',
        'completado',
      ],
      default: 'pendiente',
    },
    classification: {
      type: String,
      enum: [
        'Medicinal',
        'Otros Gases',
        'Redes y Mantenimientos',
        'Industrial',
        'Equipos Biomedicos',
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order ||
  mongoose.model<IOrder>('Order', OrderSchema);
