export interface Mesa {
    id: number;
    numeroMesa: string;
    capacidad: number;
}

export interface SesionMesa {
    id: number;
    mesaId: number;
    numeroMesa: string;
    tokenQr: string;
    codigoAcceso: string;
    fechaApertura: string;
    fechaCierre: string | null;
}

export type MesaStatus = 'Libre' | 'Ocupada';

