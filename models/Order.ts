// Order.ts (Modelo totalmente corregido)

import mongoose, { Schema, Document } from 'mongoose';

// ---------------------------------------------------------
//  INTERFACES (TypeScript)
// ---------------------------------------------------------

interface ProductItem {
  _id: mongoose.Types.ObjectId;

  cantidadVacios?: number;
  cantidadLlenos?: number;
  cantidadAjenos: number;
  cantidadAsignacion?: number;

  quantity: number;
  volume: number;

  etiqueta: 'Recoleccion Ajenos' | 'Entrega Ajenos' | 'Entrega';
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
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

// ---------------------------------------------------------
//  MONGOOSE SCHEMA
// ---------------------------------------------------------

const OrderSchema = new Schema<IOrder>(
  {
    // ✔ Usuario autor de la orden
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    // ✔ Dirección
    address: {
      calle: { type: String, required: true },
      ciudad: { type: String, required: true },
      alias: { type: String, default: '' },
    },

    // ✔ Datos del solicitante
    solicitante: {
      type: String,
      required: true,
    },

    numeroSolicitante: {
      type: String,
      required: true,
    },

    observaciones: {
      type: String,
      default: '',
    },

    // ✔ Productos de la orden
    products: [
      {
        _id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },

        cantidadVacios: { type: Number, min: 0, default: 0 },
        cantidadLlenos: { type: Number, min: 0, default: 0 },
        cantidadAjenos: { type: Number, min: 0, default: 0 },
        cantidadAsignacion: { type: Number, min: 0, default: 0 },

        quantity: { type: Number, required: true, min: 0 },
         volume: { type: Number, required: true, min: 0, default: 0 },

        etiqueta: {
          type: String,
          enum: ['Recoleccion Ajenos', 'Entrega Ajenos', 'Entrega'],
          default: 'Entrega',
        },
      },
    ],

    // ✔ Estado de la orden
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

    // ✔ Clasificación
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

  // ✔ timestamps: añade createdAt / updatedAt automáticamente
  { timestamps: true }
);

// ---------------------------------------------------------
//  EXPORTAR MODELO
// ---------------------------------------------------------

const Order =
  mongoose.models.Order ||
  mongoose.model<IOrder>('Order', OrderSchema);

export default Order;