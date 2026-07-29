import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { WHATSAPP_PHONE, CURRENCY } from '../../lib/constants'

const loadImage = (url, id) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      resolve({ id, dataUrl: canvas.toDataURL('image/jpeg', 0.85) })
    }
    img.onerror = () => resolve({ id, dataUrl: null })
    img.src = url
  })
}

const BotonPDF = () => {
  const [generando, setGenerando] = useState(false)

  const generarPDF = async () => {
    if (generando) return
    setGenerando(true)

    try {
      const { data: productos, error } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .order('category')
        .order('name')

      if (error) throw error
      if (!productos || productos.length === 0) {
        alert('No hay productos disponibles.')
        setGenerando(false)
        return
      }

      // ── Precargar imágenes ──
      const imgPromises = productos.map((p) => {
        const url = p.image_url || p.images_urls?.[0] || ''
        return url ? loadImage(url, p.id) : Promise.resolve({ id: p.id, dataUrl: null })
      })
      const resultados = await Promise.all(imgPromises)
      const imgMap = {}
      for (const r of resultados) {
        imgMap[r.id] = r.dataUrl
      }

      const { default: jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pw = 210, ph = 297, m = 10

      const degrade = (doc, ph, invertido) => {
        for (let y = 0; y < ph; y += 3) {
          const t = y / ph
          const f = invertido ? (1 - t) : t
          const r = Math.round(248 + (230 - 248) * f * 0.3)
          const g = Math.round(235 + (180 - 235) * f * 0.3)
          const b = Math.round(240 + (195 - 240) * f * 0.3)
          doc.setFillColor(r, g, b)
          doc.rect(0, y, pw, 3, 'F')
        }
      }

      // ═══════════════════════════════════════════════════
      // PÁGINA 1 — PORTADA
      // ═══════════════════════════════════════════════════
      doc.setFillColor(255, 255, 255)
      doc.rect(0, 0, pw, ph, 'F')
      degrade(doc, ph, false)

      const cy = 110
      doc.setDrawColor(200, 150, 165)
      doc.setLineWidth(0.4)
      doc.line(m, cy - 8, pw - m, cy - 8)
      doc.setTextColor(45, 31, 38)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(42)
      doc.text('DON KARL', pw / 2, cy + 8, { align: 'center' })
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(130, 110, 120)
      doc.text(`COLECCIÓN ${new Date().getFullYear()}`, pw / 2, cy + 22, { align: 'center', charSpace: 4 })
      doc.setDrawColor(200, 150, 165)
      doc.line(m, cy + 30, pw - m, cy + 30)
      doc.setTextColor(45, 31, 38)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(14)
      doc.text('Encuentra tu estilo con nosotros', pw / 2, cy + 48, { align: 'center' })
      const rY = cy + 66
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(200, 140, 155)
      const rs = ['INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'WHATSAPP']
      const rw = rs.length * 38 - 8
      let rx = (pw - rw) / 2
      for (const r of rs) {
        doc.text(r, rx + 19, rY, { align: 'center', charSpace: 3 })
        rx += 38
      }
      doc.setDrawColor(200, 150, 165)
      doc.line(m, rY + 7, pw - m, rY + 7)
      doc.setFontSize(6)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(130, 110, 120)
      doc.text(new Date().toLocaleDateString('es-PE'), pw / 2, rY + 16, { align: 'center' })

      // ═══════════════════════════════════════════════════
      // PÁGINAS DE PRODUCTOS
      // ═══════════════════════════════════════════════════
      const cols = 2, gap = 6
      const cardW = ((pw - m * 2) - gap) / cols
      const imgH = cardW * 1.05
      const infoH = 24
      const rowH = imgH + infoH
      const porPag = 4

      for (let i = 0; i < productos.length; i++) {
        const idx = i % porPag
        if (idx === 0) {
          doc.addPage()
          doc.setFillColor(255, 255, 255)
          doc.rect(0, 0, pw, ph, 'F')
        }
        const col = idx % cols
        const row = Math.floor(idx / cols)
        const x = m + col * (cardW + gap)
        const cy2 = 8 + row * rowH
        const prod = productos[i]
        const precio = prod.discount_percent > 0 ? prod.price_final : prod.price_original

        doc.setFillColor(255, 255, 255)
        doc.setDrawColor(230, 220, 215)
        doc.roundedRect(x, cy2, cardW, rowH - 2, 1, 1, 'FD')

        const dUrl = imgMap[prod.id]
        if (dUrl) {
          try { doc.addImage(dUrl, 'JPEG', x + 0.5, cy2 + 0.5, cardW - 1, imgH - 1, undefined, 'FAST') } catch (e) {}
        }

        if (prod.is_new) {
          doc.setFillColor(45, 31, 38)
          doc.rect(x + 1.5, cy2 + 1.5, 13, 4, 'F')
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(5)
          doc.setFont('helvetica', 'bold')
          doc.text('NUEVO', x + 8, cy2 + 4.5, { align: 'center' })
        }
        if (prod.sku) {
          doc.setFillColor(255, 255, 255)
          doc.roundedRect(x + cardW - 20, cy2 + imgH - 6, 19, 5, 0.5, 0.5, 'F')
          doc.setTextColor(130, 110, 120)
          doc.setFontSize(4.5)
          doc.setFont('helvetica', 'normal')
          doc.text(prod.sku, x + cardW - 10.5, cy2 + imgH - 2, { align: 'center' })
        }

        const iy = cy2 + imgH + 2
        if (prod.brand) {
          doc.setTextColor(100, 70, 80)
          doc.setFontSize(6)
          doc.setFont('helvetica', 'bold')
          doc.text(prod.brand.toUpperCase(), x + 2, iy + 2.5)
        }
        doc.setTextColor(45, 31, 38)
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'normal')
        const nl = doc.splitTextToSize(prod.name, cardW - 4)
        doc.text(nl.slice(0, 2), x + 2, iy + 8)
        if (prod.color) {
          doc.setTextColor(130, 110, 120)
          doc.setFontSize(5)
          doc.setFont('helvetica', 'normal')
          doc.text(prod.color.charAt(0).toUpperCase() + prod.color.slice(1), x + 2, iy + 14.5)
        }
        doc.setTextColor(230, 0, 0)
        doc.setFontSize(10.5)
        doc.setFont('helvetica', 'bold')
        doc.text(`${CURRENCY} ${Number(precio).toFixed(2)}`, x + 2, iy + 21.5)
        if (prod.discount_percent > 0) {
          doc.setTextColor(130, 110, 120)
          doc.setFontSize(5.5)
          doc.setFont('helvetica', 'normal')
          const dt = `${CURRENCY} ${Number(prod.price_original).toFixed(2)}`
          doc.text(dt, x + 30, iy + 21)
          doc.line(x + 30, iy + 21.4, x + 30 + doc.getTextWidth(dt), iy + 21.4)
        }
      }

      // ═══════════════════════════════════════════════════
      // CONTRAPORTADA — centrada verticalmente
      // ═══════════════════════════════════════════════════
      doc.addPage()
      doc.setFillColor(255, 255, 255)
      doc.rect(0, 0, pw, ph, 'F')
      degrade(doc, ph, true)

      // bloque centrado: desde y=65 hasta y=240 (175mm de contenido centrado en 297mm)
      const bs = 50
      doc.setDrawColor(200, 150, 165)
      doc.setLineWidth(0.4)
      doc.line(m, bs, pw - m, bs)

      doc.setTextColor(45, 31, 38)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(32)
      doc.text('¡Gracias!', pw / 2, bs + 22, { align: 'center' })
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text('Por tu preferencia', pw / 2, bs + 36, { align: 'center', charSpace: 2 })

      doc.setDrawColor(200, 150, 165)
      doc.line(m, bs + 46, pw - m, bs + 46)

      doc.setTextColor(230, 0, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('CONTÁCTANOS', pw / 2, bs + 62, { align: 'center', charSpace: 3 })
      doc.setFontSize(14)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(45, 31, 38)
      doc.text(`+51 ${WHATSAPP_PHONE.slice(1,4)} ${WHATSAPP_PHONE.slice(4,7)} ${WHATSAPP_PHONE.slice(7)}`, pw / 2, bs + 76, { align: 'center' })

      const rY2 = bs + 96
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(130, 110, 120)
      const plat = ['INSTAGRAM', 'TIKTOK', 'FACEBOOK']
      const usrs = ['@donkarl_oficial', '@donkarl_oficial', '@donkarl_tienda']
      const tw2 = plat.length * 38 - 8
      let rxx = (pw - tw2) / 2
      for (let j = 0; j < plat.length; j++) {
        doc.text(plat[j], rxx + 19, rY2, { align: 'center', charSpace: 2 })
        doc.setFont('helvetica', 'normal')
        doc.text(usrs[j], rxx + 19, rY2 + 5.5, { align: 'center' })
        doc.setFont('helvetica', 'bold')
        rxx += 38
      }

      const py2 = rY2 + 22
      doc.setDrawColor(200, 150, 165)
      doc.line(m, py2, pw - m, py2)
      doc.setTextColor(130, 110, 120)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text('MÉTODOS DE PAGO', pw / 2, py2 + 10, { align: 'center', charSpace: 2 })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(45, 31, 38)
      doc.text('Visa | Mastercard | Yape | Plin | Transferencia Bancaria | Efectivo', pw / 2, py2 + 20, { align: 'center' })

      doc.setDrawColor(200, 150, 165)
      doc.line(m, py2 + 28, pw - m, py2 + 28)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(130, 110, 120)
      doc.text('ENVÍOS', pw / 2, py2 + 40, { align: 'center', charSpace: 2 })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(45, 31, 38)
      doc.text('A todo el Perú', pw / 2, py2 + 50, { align: 'center' })

      doc.setDrawColor(200, 150, 165)
      doc.line(m, ph - 24, pw - m, ph - 24)
      doc.setTextColor(45, 31, 38)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('DON KARL', pw / 2, ph - 14, { align: 'center', charSpace: 3 })

      // ═══════════════════════════════════════════════════
      // FOOTER solo en páginas de productos
      // ═══════════════════════════════════════════════════
      const total = doc.getNumberOfPages()
      for (let i = 2; i < total; i++) {
        doc.setPage(i)
        doc.setTextColor(150, 140, 145)
        doc.setFontSize(5)
        doc.setFont('helvetica', 'normal')
        doc.text(
          `Página ${i} de ${total} | Contáctanos al +51 ${WHATSAPP_PHONE.slice(1)} | Envíos a todo el Perú`,
          pw / 2, ph - 3, { align: 'center' }
        )
      }

      const fecha = new Date().toISOString().split('T')[0]
      doc.save(`Catalogo_Don_Karl_${fecha}.pdf`)
    } catch (err) {
      console.error('Error:', err)
      alert('Error al generar el catálogo.')
    } finally {
      setGenerando(false)
    }
  }

  return (
    <button
      onClick={generarPDF}
      disabled={generando}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        background: generando ? '#E8D5B7' : '#2D1F26',
        color: generando ? '#8B6F7A' : '#FFFFFF',
        border: 'none',
        borderRadius: '2px',
        fontSize: '0.7rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        fontWeight: 600,
        cursor: generando ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        fontFamily: 'var(--font-sans)',
      }}
      onMouseEnter={(e) => { if (!generando) { e.currentTarget.style.background = '#C9607F'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
      onMouseLeave={(e) => { if (!generando) { e.currentTarget.style.background = '#2D1F26'; e.currentTarget.style.transform = 'translateY(0)' } }}
    >
      {generando ? (
        <>
          <span className="w-4 h-4 border-2 border-[#8B6F7A] border-t-transparent rounded-full animate-spin" />
          Generando...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Descargar Catálogo PDF
        </>
      )}
    </button>
  )
}

export default BotonPDF
