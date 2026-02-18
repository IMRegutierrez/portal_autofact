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

export type InvoiceSearchInputs = z.infer<typeof InvoiceSearchSchema>;
export type FiscalDataInputs = z.infer<typeof FiscalDataSchema>;
