export interface Reserva {
    id: number;
    usuarioId: number;
    usuarioNombre: string;
    fecha: string;
    hora: string;
    numPersonas: number;
    estado: string;
}

export interface ReservaRequest {
    usuarioId?: number;
    fecha: string;
    hora: string;
    numPersonas: number;
    estado?: string;
}
