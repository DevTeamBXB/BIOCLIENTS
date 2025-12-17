import mongoose, { Schema, Document, models, model } from 'mongoose';

// ---------------- Direccion subdocumento ----------------
const DireccionSchema = new Schema({
  id: { type: String, required: true }, // puede ser UUID o generado manualmente
  alias: { type: String },
  calle: { type: String, required: true },
  ciudad: { type: String, required: true },
});

// ---------------- Interfaces TypeScript ----------------
export interface Direccion {
  id: string;
  alias?: string;
  calle: string;
  ciudad: string;
}

export interface Cliente extends Document {
  nombre: string;
  usuario: string;
  nit: string;
  contraseña: string;
  correo: string;

  direccion_envio: Direccion[];

  direccion_facturacion?: {
    calle?: string;
    ciudad?: string;
    pais?: string;
  };

  cartera?: {
    estado: 'Al día' | 'Vencida';
    descripcion?: string;
    saldo: number;
  };

  contrato?: {
    estado: 'Activo' | 'Vencido' | 'No tiene';
    fecha_inicio?: Date;
    fecha_vencimiento?: Date;
    entidad: 'Bioxigen' | 'Bioximad' | 'No tiene';
  };

  poliza?: {
    estado: 'Activo' | 'Vencido' | 'No tiene';
    fecha_inicio?: Date;
    fecha_vencimiento?: Date;
  };

  tipo: 'Medicinal' | 'Industrial';

  order_min?: number;

  cuenta: 'Habilitada' | 'Inhabilitada' | 'Congelada';

  creado_en: Date;
  actualizado_en: Date;
}

// ---------------- Schema principal Cliente ----------------
const ClienteSchema = new Schema<Cliente>(
  {
    usuario: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    nit: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true },
    correo: { type: String, required: true, unique: true },

    direccion_envio: [DireccionSchema],

    direccion_facturacion: {
      calle: String,
      ciudad: String,
      pais: String,
    },

    cartera: {
      estado: {
        type: String,
        enum: ['Al día', 'Vencida'],
        required: true,
      },
      descripcion: String,
      saldo: { type: Number, default: 0 },
    },

    contrato: {
      estado: {
        type: String,
        enum: ['Activo', 'Vencido', 'No tiene'],
        default: 'No tiene',
      },
      entidad: {
        type: String,
        enum: ['Bioxigen', 'Bioximad', 'No tiene'],
        default: 'No tiene',
      },
      fecha_inicio: Date,
      fecha_vencimiento: Date,
    },

    poliza: {
      estado: {
        type: String,
        enum: ['Activo', 'Vencido', 'No tiene'],
        default: 'No tiene',
      },
      fecha_inicio: Date,
      fecha_vencimiento: Date,
    },

    tipo: {
      type: String,
      enum: ['Medicinal', 'Industrial'],
      required: true,
    },

    order_min: { type: String },

    cuenta: {
      type: String,
      enum: ['Habilitada', 'Inhabilitada', 'Congelada'],
      default: 'Habilitada',
      required: true,
    },

    creado_en: { type: Date, default: Date.now },
    actualizado_en: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: 'creado_en', updatedAt: 'actualizado_en' },
  }
);

// ---------------- Export para Next.js ----------------
const Client = models.Client || model<Cliente>('Client', ClienteSchema);
export default Client;
