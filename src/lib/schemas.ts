import { z } from 'zod';

export const InvoiceSearchSchema = z.object({
  invoiceOrCustomerId: z.string().min(1, "El folio o ID de cliente es requerido"),
  invoiceTotal: z.string().optional(),
});

export const FiscalDataSchema = z.object({
  razonSocial: z.string().min(1, "La Razón Social es requerida"),
  rfc: z.string()
    .min(12, "El RFC debe tener al menos 12 caracteres")
    .max(13, "El RFC no puede tener más de 13 caracteres")
    .regex(/^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/, "El formato del RFC no es válido"),
  emailCfdi: z.string().email("El correo electrónico no es válido"),
  telefono: z.string().optional(),
  domicilioFiscal: z.string().min(1, "El domicilio fiscal es requerido"),
  codigoPostalFiscal: z.string().regex(/^\d{5}$/, "El código postal debe tener 5 dígitos"),
  regimenFiscal: z.string().min(1, "El régimen fiscal es requerido"),
  usoCfdi: z.string().min(1, "El uso de CFDI es requerido"),
  confirmedFromPortal: z.boolean().optional(),
});

export const ClientSchema = z.object({
  clientId: z.string().min(1, "Client ID es requerido"),
  clientName: z.string().min(1, "Nombre de cliente es requerido"),
  isActive: z.boolean().default(true),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),

  // Contact & Support
  supportEmail: z.string().email("Email inválido").optional().or(z.literal('')),
  whatsappNumber: z.string().optional(),

  // NetSuite Config
  netsuiteCompId: z.string().optional(),
  suiteletUrl: z.string().url("URL inválida").min(1, "Suitelet URL es requerida"),
  reportSuiteletUrl: z.string().url("URL inválida").optional().or(z.literal('')),
  searchId: z.string().optional(),
  senderId: z.string().optional(),

  // Appearance - Logo & Layout
  logoUrl: z.string().url("URL inválida").optional().or(z.literal('')),
  logoHeight: z.string().optional(), // e.g. "h-44"

  // Appearance - Colors
  backgroundColor: z.string().optional(),
  cardBackgroundColor: z.string().optional(),
  primaryTextColor: z.string().optional(),
  secondaryTextColor: z.string().optional(),
  buttonColor: z.string().optional(),
  buttonTextColor: z.string().optional(),

  // Search Config
  searchFieldsConfig: z.object({
    primaryFieldLabel: z.string().default("Ticket a facturar"),
    showTotalAmount: z.boolean().default(false)
  }).optional(),
});

export type InvoiceSearchInputs = z.infer<typeof InvoiceSearchSchema>;
export type FiscalDataInputs = z.infer<typeof FiscalDataSchema>;
export type ClientInputs = z.infer<typeof ClientSchema>;
