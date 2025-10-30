// types/Product.ts

export type Product = {
  _id: string;
  name: string;
  m3: number;
  type: string;
  businessLine: 'Medicinal' | 'Otros Gases' | 'Redes y Mantenimientos' | 'Industrial' | 'Equipos Biomedicos';
};
