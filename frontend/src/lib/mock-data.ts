export type Role = "admin" | "revisor" | "postulante";
export type SemaphoreStatus = "green" | "yellow" | "red";
export type DocumentStatus = "pendiente" | "en_revision" | "aprobado" | "rechazado";
export type ConvocatoriaStatus = "abierta" | "cerrada";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  mandatory: boolean;
}

export interface Convocatoria {
  id: string;
  title: string;
  description: string;
  status: ConvocatoriaStatus;
  archivado?: boolean;
  startDate: string;
  endDate: string;
  requiredDocuments: RequiredDocument[];
  applicantsCount: number;
}

export interface UploadedDocument {
  id: string;
  name: string;
  fileName: string;
  uploadedAt: string;
  status: DocumentStatus;
  semaphore: SemaphoreStatus;
  ocrConfidence: number;
  expiryDate?: string;
  observation?: string;
  validationType: "automatica" | "manual";
  applicantName: string;
  convocatoriaId: string;
}

export interface Expediente {
  id: string;
  applicantName: string;
  convocatoriaTitle: string;
  totalDocs: number;
  approvedDocs: number;
  status: "completo" | "incompleto" | "en_proceso";
}

export const currentUser: User = {
  id: "1",
  name: "Carlos Rodríguez",
  email: "carlos@udec.edu.co",
  role: "admin",
};

export const convocatorias: Convocatoria[] = [
  {
    id: "1",
    title: "Docentes Cátedra 2025-I",
    description: "Convocatoria para vinculación de docentes de cátedra primer semestre 2025",
    status: "abierta",
    archivado: false,
    startDate: "2025-01-15",
    endDate: "2025-03-15",
    applicantsCount: 34,
    requiredDocuments: [
      { id: "r1", name: "Hoja de Vida", description: "Formato institucional", mandatory: true },
      { id: "r2", name: "Cédula de Ciudadanía", description: "Copia ampliada al 150%", mandatory: true },
      { id: "r3", name: "Diploma de Pregrado", description: "Copia autenticada", mandatory: true },
      { id: "r4", name: "Diploma de Posgrado", description: "Copia autenticada", mandatory: true },
      { id: "r5", name: "Certificado de Antecedentes", description: "Vigente (< 3 meses)", mandatory: true },
      { id: "r6", name: "Certificaciones Laborales", description: "Últimos 5 años", mandatory: false },
    ],
  },
  {
    id: "2",
    title: "Docentes Tiempo Completo 2025",
    description: "Concurso docente para planta tiempo completo",
    status: "abierta",
    archivado: false,
    startDate: "2025-02-01",
    endDate: "2025-04-30",
    applicantsCount: 12,
    requiredDocuments: [
      { id: "r1", name: "Hoja de Vida", description: "Formato institucional", mandatory: true },
      { id: "r2", name: "Cédula de Ciudadanía", description: "Copia ampliada al 150%", mandatory: true },
      { id: "r3", name: "Diploma de Doctorado", description: "Copia autenticada", mandatory: true },
    ],
  },
  {
    id: "3",
    title: "Personal Administrativo 2024-II",
    description: "Vinculación administrativa segundo semestre",
    status: "cerrada",
    archivado: false,
    startDate: "2024-07-01",
    endDate: "2024-09-30",
    applicantsCount: 45,
    requiredDocuments: [],
  },
];

export const documents: UploadedDocument[] = [
  {
    id: "d1", name: "Hoja de Vida", fileName: "hoja_vida_garcia.pdf",
    uploadedAt: "2025-02-10", status: "aprobado", semaphore: "green",
    ocrConfidence: 95, validationType: "automatica",
    applicantName: "María García", convocatoriaId: "1",
  },
  {
    id: "d2", name: "Cédula de Ciudadanía", fileName: "cedula_garcia.pdf",
    uploadedAt: "2025-02-10", status: "aprobado", semaphore: "green",
    ocrConfidence: 98, validationType: "automatica",
    applicantName: "María García", convocatoriaId: "1",
  },
  {
    id: "d3", name: "Certificado de Antecedentes", fileName: "antecedentes_garcia.pdf",
    uploadedAt: "2025-02-11", status: "en_revision", semaphore: "yellow",
    ocrConfidence: 72, expiryDate: "2025-04-11",
    validationType: "automatica",
    applicantName: "María García", convocatoriaId: "1",
  },
  {
    id: "d4", name: "Diploma de Pregrado", fileName: "diploma_lopez.pdf",
    uploadedAt: "2025-02-12", status: "rechazado", semaphore: "red",
    ocrConfidence: 35, observation: "Documento ilegible, resolución muy baja",
    validationType: "manual",
    applicantName: "Juan López", convocatoriaId: "1",
  },
  {
    id: "d5", name: "Diploma de Posgrado", fileName: "posgrado_lopez.pdf",
    uploadedAt: "2025-02-12", status: "pendiente", semaphore: "yellow",
    ocrConfidence: 68, expiryDate: "2025-05-01",
    validationType: "automatica",
    applicantName: "Juan López", convocatoriaId: "1",
  },
  {
    id: "d6", name: "Hoja de Vida", fileName: "hv_martinez.pdf",
    uploadedAt: "2025-02-13", status: "aprobado", semaphore: "green",
    ocrConfidence: 91, validationType: "automatica",
    applicantName: "Ana Martínez", convocatoriaId: "2",
  },
  {
    id: "d7", name: "Certificado de Antecedentes", fileName: "antecedentes_martinez.pdf",
    uploadedAt: "2025-01-05", status: "rechazado", semaphore: "red",
    ocrConfidence: 88, expiryDate: "2025-01-20",
    observation: "Documento vencido. Fecha de expedición superior a 3 meses",
    validationType: "automatica",
    applicantName: "Ana Martínez", convocatoriaId: "2",
  },
];

export const expedientes: Expediente[] = [
  { id: "e1", applicantName: "María García", convocatoriaTitle: "Docentes Cátedra 2025-I", totalDocs: 6, approvedDocs: 2, status: "en_proceso" },
  { id: "e2", applicantName: "Juan López", convocatoriaTitle: "Docentes Cátedra 2025-I", totalDocs: 6, approvedDocs: 0, status: "incompleto" },
  { id: "e3", applicantName: "Ana Martínez", convocatoriaTitle: "Docentes Tiempo Completo 2025", totalDocs: 3, approvedDocs: 1, status: "en_proceso" },
];

export const dashboardStats = {
  totalConvocatorias: 3,
  activeConvocatorias: 2,
  totalDocuments: documents.length,
  pendingReview: documents.filter(d => d.status === "pendiente" || d.status === "en_revision").length,
  approved: documents.filter(d => d.status === "aprobado").length,
  rejected: documents.filter(d => d.status === "rechazado").length,
  totalApplicants: 91,
  semaphoreGreen: documents.filter(d => d.semaphore === "green").length,
  semaphoreYellow: documents.filter(d => d.semaphore === "yellow").length,
  semaphoreRed: documents.filter(d => d.semaphore === "red").length,
};
