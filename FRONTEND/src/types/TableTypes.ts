export interface Mesa {
    id: number;
    numeroMesa: string;
    capacidad: number;
}

export interface SesionMesa {
    id: number;
    mesa: Mesa;
    tokenQr: string;
    fechaApertura: string;
    fechaCierre: string | null;
}

export type MesaStatus = 'Libre' | 'Ocupada';
