export type Direccion = {
  calle: string;
  ciudad: string;
  alias?: string;
};

export type ClientType = {
  _id: string;
  nombre: string;
  correo: string;
  telefono?: string;
  direccion_envio: Direccion[];
};
