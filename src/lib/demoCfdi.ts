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

// ---------- helpers de números/moneda ----------
function numClean(s: any): number {
    const n = parseFloat(String(s ?? '').replace(/[^0-9.\-]/g, ''));
    return isFinite(n) ? n : 0;
}
function money(n: number): string {
    if (!isFinite(n)) n = 0;
    return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
// lee un campo de un line item probando varios nombres posibles del Suitelet
function itemField(it: any, keys: string[], def: any = ''): any {
    for (const k of keys) {
        if (it && it[k] !== undefined && it[k] !== null && it[k] !== '') return it[k];
    }
    return def;
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

/**
 * Construye un PDF (vectorial, sin dependencias) con un layout tipo "Factura"
 * de NetSuite: logo IMR, encabezado, caja TOTAL, datos del receptor, tabla de
 * conceptos, subtotal/IVA/total y código de barras. Sin validez fiscal.
 */
function buildDemoPdf(fd: Partial<FiscalDataInputs>, inv: any): string {
    const P: string[] = [];
    const T = (y: number) => 792 - y; // convierte coordenada "desde arriba" a la del PDF
    const esc = (s: any) => ascii(s).replace(/([()\\])/g, '\\$1');

    // --- primitivas de dibujo ---
    const rectPath = (x: number, yTop: number, w: number, h: number) =>
        P.push(`${x} ${T(yTop + h)} ${w} ${h} re`);
    const box = (x: number, yTop: number, w: number, h: number, r: number, g: number, b: number) => {
        P.push(`${r} ${g} ${b} rg`);
        rectPath(x, yTop, w, h);
        P.push('f');
    };
    const line = (x1: number, y1: number, x2: number, y2: number, r: number, g: number, b: number, width = 0.6) => {
        P.push(`${width} w ${r} ${g} ${b} RG ${x1} ${T(y1)} m ${x2} ${T(y2)} l S`);
    };
    const circlePath = (cx: number, cyTop: number, rad: number) => {
        const cy = T(cyTop);
        const k = 0.5523 * rad;
        P.push(
            `${cx + rad} ${cy} m ` +
            `${cx + rad} ${cy + k} ${cx + k} ${cy + rad} ${cx} ${cy + rad} c ` +
            `${cx - k} ${cy + rad} ${cx - rad} ${cy + k} ${cx - rad} ${cy} c ` +
            `${cx - rad} ${cy - k} ${cx - k} ${cy - rad} ${cx} ${cy - rad} c ` +
            `${cx + k} ${cy - rad} ${cx + rad} ${cy - k} ${cx + rad} ${cy} c`
        );
    };

    // --- texto y medición (aprox. anchos Helvetica, para alinear a la derecha) ---
    const charW = (ch: string): number => {
        if (ch >= '0' && ch <= '9') return 556;
        const m: Record<string, number> = { ' ': 278, '$': 556, ',': 278, '.': 278, '%': 889, '(': 333, ')': 333, '#': 556, '-': 333, '/': 278, ':': 278 };
        if (m[ch] !== undefined) return m[ch];
        if (ch >= 'A' && ch <= 'Z') return 667;
        return 520;
    };
    const strW = (str: string, size: number): number => {
        let w = 0;
        for (const ch of ascii(str)) w += charW(ch);
        return (w / 1000) * size;
    };
    const text = (x: number, yTop: number, str: any, size: number, bold = false, r = 0.18, g = 0.18, b = 0.18) => {
        P.push(`BT ${r} ${g} ${b} rg /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${T(yTop)} Td (${esc(str)}) Tj ET`);
    };
    const textR = (xRight: number, yTop: number, str: any, size: number, bold = false, r = 0.18, g = 0.18, b = 0.18) => {
        text(xRight - strW(String(str), size), yTop, str, size, bold, r, g, b);
    };
    const wrap = (str: string, max: number): string[] => {
        const words = ascii(str).split(/\s+/).filter(Boolean);
        const out: string[] = [];
        let cur = '';
        for (const w of words) {
            if ((cur + ' ' + w).trim().length > max) {
                if (cur) out.push(cur);
                cur = w;
            } else {
                cur = (cur + ' ' + w).trim();
            }
        }
        if (cur) out.push(cur);
        return out.length ? out : [''];
    };

    const DARK = [0.18, 0.18, 0.18] as const;
    const GRAY = [0.45, 0.45, 0.45] as const;
    const BAND = [0.93, 0.93, 0.93] as const;

    // ===== marca de agua =====
    P.push('q 0.93 0.93 0.93 rg BT 0.7071 0.7071 -0.7071 0.7071 150 300 Tm /F2 70 Tf (DEMOSTRACION) Tj ET Q');

    // ===== logo IMR (nube + "imr") =====
    P.push('0.33 0.78 0.95 rg');
    circlePath(92, 86, 17);
    circlePath(72, 92, 12);
    circlePath(110, 92, 12);
    rectPath(64, 90, 50, 12);
    P.push('f');
    text(128, 100, 'imr', 40, true, 0.10, 0.42, 0.70);

    // ===== emisor (empresa demo) =====
    const emisor = [
        ['EMPRESA DEMO SA DE CV', true],
        ['RFC: EKU9003173C9', false],
        ['Regimen 601 - General de Ley', false],
        ['Av. Vallarta 6503, Cd. Granja', false],
        ['Zapopan, JAL, Mexico - C.P. 45010', false],
    ] as const;
    emisor.forEach((ln, i) => text(300, 54 + i * 10.5, ln[0], 8, ln[1] as boolean, ...GRAY));

    // ===== título =====
    textR(558, 80, 'Factura', 32, true, ...DARK);
    textR(558, 104, '#' + ascii(inv?.invoiceNumber || 'DEMO'), 15, true, ...GRAY);

    // ===== caja TOTAL =====
    box(400, 120, 158, 72, 0.95, 0.95, 0.95);
    box(400, 120, 158, 20, 0.87, 0.87, 0.87);
    text(408, 134, 'TOTAL', 11, true, 0.3, 0.3, 0.3);
    textR(548, 172, money(numClean(inv?.totalAmount)), 25, true, ...DARK);
    textR(548, 186, 'Vence: ' + ascii(inv?.dueDate || inv?.issueDate || ''), 8, false, ...GRAY);

    // ===== aviso demostración =====
    text(54, 150, '* DOCUMENTO DE DEMOSTRACION - SIN VALIDEZ FISCAL *', 8.5, true, 0.75, 0.2, 0.2);

    // ===== facturar a (receptor = datos capturados) =====
    text(54, 178, 'Facturar a', 9, true, ...GRAY);
    let ry = 192;
    text(54, ry, fd.razonSocial || '', 9, true, ...DARK); ry += 12;
    wrap(String(fd.domicilioFiscal || ''), 48).forEach((l) => { text(54, ry, l, 8.5, false, ...DARK); ry += 10.5; });
    text(54, ry, 'C.P. ' + ascii(fd.codigoPostalFiscal || ''), 8.5, false, ...DARK); ry += 10.5;
    text(54, ry, 'RFC: ' + ascii(fd.rfc || ''), 8.5, false, ...DARK); ry += 10.5;
    text(54, ry, 'Uso CFDI: ' + ascii(fd.usoCfdi || ''), 8.5, false, ...DARK);

    // ===== banda meta =====
    const metaTop = 250;
    box(54, metaTop, 504, 20, ...BAND);
    const metaCols = [
        { x: 60, label: 'Fecha', value: ascii(inv?.issueDate || new Date().toLocaleDateString('es-MX')) },
        { x: 150, label: 'Folio', value: ascii(inv?.invoiceNumber || 'DEMO') },
        { x: 250, label: 'Regimen', value: ascii(fd.regimenFiscal || '') },
        { x: 360, label: 'Forma Pago', value: 'PUE' },
        { x: 470, label: 'Moneda', value: 'MXN' },
    ];
    metaCols.forEach((c) => {
        text(c.x, metaTop + 13.5, c.label, 8, true, 0.3, 0.3, 0.3);
        text(c.x, metaTop + 32, c.value, 8.5, false, ...DARK);
    });

    // ===== tabla de conceptos =====
    const headTop = 300;
    box(54, headTop, 504, 22, ...BAND);
    text(60, headTop + 14.5, 'Cantidad', 8.5, true, 0.3, 0.3, 0.3);
    text(120, headTop + 14.5, 'Concepto', 8.5, true, 0.3, 0.3, 0.3);
    textR(470, headTop + 14.5, 'Precio', 8.5, true, 0.3, 0.3, 0.3);
    textR(550, headTop + 14.5, 'Importe', 8.5, true, 0.3, 0.3, 0.3);

    // filas
    const totalNum = numClean(inv?.totalAmount);
    const subtotalNum = totalNum / 1.16;
    const ivaNum = totalNum - subtotalNum;

    let items: any[] = Array.isArray(inv?.lineItems) ? inv.lineItems : [];
    if (!items.length) {
        items = [{ quantity: 1, item: 'Servicios (demostracion) - Folio ' + ascii(inv?.invoiceNumber || 'DEMO'), rate: subtotalNum, amount: subtotalNum }];
    }
    const maxRows = 8;
    const shown = items.slice(0, maxRows);

    let rowTop = headTop + 22 + 16;
    shown.forEach((it) => {
        const qty = ascii(itemField(it, ['quantity', 'qty', 'cantidad'], '1'));
        const concepto = ascii(itemField(it, ['item', 'itemName', 'description', 'descripcion', 'name', 'concepto'], 'Concepto'));
        const rate = numClean(itemField(it, ['rate', 'price', 'precio', 'unitPrice'], 0));
        const amount = numClean(itemField(it, ['amount', 'total', 'importe', 'lineTotal'], rate));
        textR(108, rowTop, qty, 9, false, ...DARK);
        text(120, rowTop, concepto.length > 46 ? concepto.slice(0, 45) + '...' : concepto, 9, false, ...DARK);
        if (rate) textR(470, rowTop, money(rate), 9, false, ...DARK);
        textR(550, rowTop, money(amount), 9, false, ...DARK);
        line(54, rowTop + 7, 558, rowTop + 7, 0.88, 0.88, 0.88, 0.5);
        rowTop += 22;
    });
    if (items.length > maxRows) {
        text(120, rowTop, '... y ' + (items.length - maxRows) + ' concepto(s) mas', 8.5, false, ...GRAY);
        rowTop += 18;
    }

    // ===== totales =====
    let ty = rowTop + 14;
    textR(470, ty, 'Subtotal', 9, true, 0.3, 0.3, 0.3);
    textR(550, ty, money(subtotalNum), 9, false, ...DARK);
    ty += 16;
    textR(470, ty, 'IVA (16%)', 9, true, 0.3, 0.3, 0.3);
    textR(550, ty, money(ivaNum), 9, false, ...DARK);
    ty += 8;
    box(360, ty, 198, 22, ...BAND);
    textR(470, ty + 14.5, 'Total', 10, true, ...DARK);
    textR(550, ty + 14.5, money(totalNum), 10, true, ...DARK);

    // ===== folio fiscal (UUID demo) =====
    text(54, ty + 10, 'Folio Fiscal (UUID):', 7.5, true, ...GRAY);
    text(54, ty + 20, uuidDemo(), 7.5, false, ...GRAY);

    // ===== código de barras (decorativo) =====
    const barTop = 735;
    P.push('0 0 0 rg');
    let bx = 54;
    const code = ascii(inv?.invoiceNumber || 'DEMO0001');
    for (let i = 0; i < 52 && bx < 210; i++) {
        const c = code.charCodeAt(i % code.length) + i * 7;
        const w = 1 + (c % 3);
        if (i % 2 === 0) rectPath(bx, barTop, w, 30);
        bx += w + 1;
    }
    P.push('f');
    text(54, barTop + 42, ascii(inv?.invoiceNumber || 'DEMO'), 8, false, ...GRAY);
    textR(558, barTop + 42, '1 de 1', 8, false, ...GRAY);
    text(54, barTop + 54, 'Representacion impresa de demostracion generada por el Portal de Autofacturacion.', 7, false, 0.55, 0.55, 0.55);

    // ===== ensamblado del PDF =====
    const content = P.join('\n');
    const objs = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 6 0 R >> >> /Contents 5 0 R >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        '<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
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
