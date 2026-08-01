import { CURRENCY } from './constants'

const PHONE = '+51 906 877 812'

const fmt = (n) =>
  `${CURRENCY} ${Number(n || 0).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

export const descargarOrdenPDF = async ({ orderId, nombre, telefono, items = [], total }) => {
  const jsPDFModule = await import('jspdf')
  const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const PW = 210
  const PH = 297
  const M = 15
  const CW = PW - M * 2

  const INK = [45, 31, 38]
  const SOFT = [139, 111, 122]
  const ROSE = [201, 96, 127]
  const RED = [230, 0, 0]
  const CHAMP = [232, 213, 183]

  let y = 0

  const ensure = (h) => {
    if (y + h > PH - M) {
      doc.addPage()
      y = M
    }
  }

  const hr = (width = CW, color = ROSE) => {
    doc.setDrawColor(...color)
    doc.setLineWidth(0.4)
    doc.line(M, y, M + width, y)
    y += 2
  }

  const numOrden = String(orderId || '').slice(0, 8).toUpperCase()
  const fecha = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  // ── Cabecera ──
  y = 16
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(19)
  doc.setTextColor(...INK)
  doc.text('KB', M, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...SOFT)
  doc.text('DRESSES AND MORE', M + 10, y - 1.5)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...ROSE)
  doc.text('COTIZACIÓN / PEDIDO', PW - M, y, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...INK)
  doc.text(`N. ${numOrden}  ·  ${fecha}`, PW - M, y + 4.5, { align: 'right' })

  y += 11
  hr()

  // ── Datos del cliente ──
  y += 6
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...ROSE)
  doc.text('DATOS DEL CLIENTE', M, y)
  y += 5.5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...INK)
  doc.text(`Cliente: ${nombre || ''}`, M, y)
  doc.text(`Teléfono: ${telefono || ''}`, M + 95, y)
  y += 5
  hr(CW, CHAMP)
  y += 7

  // ── Tabla de productos ──
  const cols = [
    { label: 'CÓDIGO', x: M, w: 30, align: 'left' },
    { label: 'PRODUCTO', x: M + 30, w: 70, align: 'left' },
    { label: 'TALLA', x: M + 100, w: 18, align: 'left' },
    { label: 'CANT.', x: M + 118, w: 16, align: 'right' },
    { label: 'P. UNIT.', x: M + 134, w: 30, align: 'right' },
    { label: 'TOTAL', x: PW - M - 26, w: 26, align: 'right' },
  ]

  doc.setFillColor(...CHAMP)
  doc.rect(M, y - 4.5, CW, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(...INK)
  cols.forEach((c) => {
    doc.text(c.label, c.align === 'right' ? c.x + c.w : c.x + 1, y, {
      align: c.align,
    })
  })
  y += 8

  for (const item of items) {
    const nameLines = doc.splitTextToSize(item.name || '', cols[1].w)
    const rowH = Math.max(8, nameLines.length * 4.4 + 3.5)
    ensure(rowH + 4)

    const cy = y + rowH / 2 + 1

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...INK)
    doc.text(String(item.sku || '—'), cols[0].x + 1, cy)
    doc.text(nameLines, cols[1].x + 1, y + 4.5)
    doc.text(String(item.size || '—'), cols[2].x + cols[2].w, cy, { align: cols[2].align })
    doc.text(String(item.quantity), cols[3].x + cols[3].w, cy, { align: cols[3].align })
    doc.text(fmt(item.price), cols[4].x + cols[4].w, cy, { align: cols[4].align })
    doc.text(fmt((item.price || 0) * (item.quantity || 0)), cols[5].x + cols[5].w, cy, {
      align: cols[5].align,
    })

    doc.setDrawColor(...CHAMP)
    doc.setLineWidth(0.3)
    doc.line(M, y + rowH - 0.5, PW - M, y + rowH - 0.5)
    y += rowH
  }

  // ── Total ──
  ensure(20)
  y += 3
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...SOFT)
  doc.text('TOTAL A PAGAR', 140, y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...RED)
  doc.text(fmt(total), PW - M, y, { align: 'right' })

  y += 12
  hr(CW, ROSE)

  // ── Métodos de pago ──
  y += 6
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...ROSE)
  doc.text('MÉTODOS DE PAGO', M, y)
  y += 5.5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...INK)
  doc.text('Yape · Plin · Tarjeta · Transferencia · Efectivo', M, y)
  y += 5
  doc.setFontSize(8)
  doc.setTextColor(...SOFT)
  doc.text('Paga al número Yape/Plin que te confirmemos y comparte tu comprobante.', M, y)
  y += 8

  // ── Contacto y envíos ──
  hr(CW, CHAMP)
  y += 6
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...ROSE)
  doc.text('CONTACTO Y ENVÍOS', M, y)
  y += 5.5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...INK)
  doc.text(`WhatsApp: ${PHONE}`, M, y)
  doc.setFontSize(8)
  doc.setTextColor(...SOFT)
  doc.text('Recojo en tienda en Chiclayo o envíos a todo el Perú.', M, y + 4.5)

  // ── Pie de página ──
  const footerY = PH - 18
  if (y > footerY - 12) {
    doc.addPage()
  }
  doc.setDrawColor(...ROSE)
  doc.setLineWidth(0.4)
  doc.line(M, footerY, PW - M, footerY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...SOFT)
  doc.text('Confirma tu pedido enviando este documento por WhatsApp.', M, footerY + 5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...ROSE)
  doc.text('KB DRESSES AND MORE — Gracias por tu preferencia', PW - M, footerY + 5, {
    align: 'right',
  })

  doc.save(`Cotizacion_KB_${numOrden || 'PEDIDO'}.pdf`)
  return { numOrden, fecha }
}
