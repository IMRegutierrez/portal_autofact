// Genera archivos CFDI de DEMOSTRACIÓN (XML y PDF de ejemplo) en el navegador,
// para mostrar el flujo del portal sin timbrar realmente ante el PAC.
// IMPORTANTE: estos archivos NO son comprobantes fiscales válidos.
import { FiscalDataInputs } from './schemas';

function uuidDemo(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16).toUpperCase();
    });
}

// Elimina acentos/caracteres no ASCII (para que el PDF simple con Helvetica sea válido).
function ascii(v: any): string {
    return String(v ?? '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^\x20-\x7e]/g, '');
}

function xmlEsc(v: any): string {
    return String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function buildDemoXml(fd: Partial<FiscalDataInputs>, inv: any): string {
    const uuid = uuidDemo();
    const total = String(inv?.totalAmount ?? '').replace(/[^0-9.]/g, '') || '0.00';
    const fecha = new Date().toISOString().slice(0, 19);
    return `<?xml version="1.0" encoding="UTF-8"?>
<!-- DEMOSTRACION: comprobante de ejemplo, SIN validez fiscal -->
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" Version="4.0" Serie="DEMO" Folio="${xmlEsc(inv?.invoiceNumber)}" Fecha="${fecha}" TipoDeComprobante="I" Moneda="MXN" Total="${total}" LugarExpedicion="${xmlEsc(fd.codigoPostalFiscal)}">
  <cfdi:Emisor Rfc="EKU9003173C9" Nombre="EMPRESA DEMO SA DE CV" RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="${xmlEsc(fd.rfc)}" Nombre="${xmlEsc(fd.razonSocial)}" DomicilioFiscalReceptor="${xmlEsc(fd.codigoPostalFiscal)}" RegimenFiscalReceptor="${xmlEsc(fd.regimenFiscal)}" UsoCFDI="${xmlEsc(fd.usoCfdi)}"/>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="1.1" UUID="${uuid}" FechaTimbrado="${fecha}"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`;
}

// Construye un PDF mínimo pero válido (con tabla de offsets xref correcta).
function buildDemoPdf(fd: Partial<FiscalDataInputs>, inv: any): string {
    const lines = [
        'CFDI - Representacion impresa (DEMOSTRACION)',
        '',
        'Este documento NO tiene validez fiscal.',
        '',
        'Folio: ' + ascii(inv?.invoiceNumber),
        'Razon Social: ' + ascii(fd.razonSocial),
        'RFC: ' + ascii(fd.rfc),
        'Regimen Fiscal: ' + ascii(fd.regimenFiscal),
        'Uso CFDI: ' + ascii(fd.usoCfdi),
        'Codigo Postal: ' + ascii(fd.codigoPostalFiscal),
        'Total: ' + ascii(inv?.totalAmount),
        'UUID (demo): ' + uuidDemo(),
        '',
        'Generado por el Portal de Autofacturacion (modo demo).',
    ];

    let content = 'BT\n/F1 13 Tf\n72 740 Td\n18 TL\n';
    lines.forEach((ln, i) => {
        const safe = ln.replace(/([()\\])/g, '\\$1');
        content += (i === 0 ? '' : 'T*\n') + '(' + safe + ') Tj\n';
    });
    content += 'ET';

    const objs = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        '<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream',
    ];

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [];
    objs.forEach((body, i) => {
        offsets.push(pdf.length);
        pdf += (i + 1) + ' 0 obj\n' + body + '\nendobj\n';
    });
    const xrefStart = pdf.length;
    pdf += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n';
    offsets.forEach((off) => {
        pdf += String(off).padStart(10, '0') + ' 00000 n \n';
    });
    pdf += 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefStart + '\n%%EOF';
    return pdf;
}

/**
 * Genera XML y PDF de demostración y devuelve URLs de objeto (blob) para descargar.
 */
export function buildDemoCfdi(fd: Partial<FiscalDataInputs>, inv: any): { xmlUrl: string; pdfUrl: string } {
    const xml = buildDemoXml(fd, inv);
    const pdf = buildDemoPdf(fd, inv);
    const xmlUrl = URL.createObjectURL(new Blob([xml], { type: 'application/xml' }));
    const pdfUrl = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
    return { xmlUrl, pdfUrl };
}
