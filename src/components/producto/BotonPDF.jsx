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

      // ── Precargar todas las imágenes ──
      const imgPromises = productos.map((p) => {
        const url = p.image_url || p.images_urls?.[0] || ''
        return url ? loadImage(url, p.id) : Promise.resolve({ id: p.id, dataUrl: null })
      })
      const resultados = await Promise.all(imgPromises)
      const imgMap = {}
      for (const r of resultados) {
        imgMap[r.id] = r.dataUrl
      }

      // ── Config jsPDF ──
      const { default: jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pw = 210, ph = 297, m = 8

      // ── PAGE 1: PORTADA ──
      doc.setFillColor(255, 255, 255)
      doc.rect(0, 0, pw, ph, 'F')
      // degradado
      for (let y = 0; y < ph; y += 3) {
        const t = y / ph
        const r = Math.round(248 + (230 - 248) * t * 0.3)
        const g = Math.round(235 + (180 - 235) * t * 0.3)
        const b = Math.round(240 + (195 - 240) * t * 0.3)
        doc.setFillColor(r, g, b)
        doc.rect(0, y, pw, 3, 'F')
      }
      doc.setDrawColor(230, 180, 195)
      doc.setLineWidth(0.3)
      doc.line(m, 22, pw - m, 22)
      doc.setTextColor(45, 31, 38)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(36)
      doc.text('DON KARL', pw / 2, 40, { align: 'center' })
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(130, 110, 120)
      doc.text('COLECCIÓN IMPORTADA', pw / 2, 47, { align: 'center', charSpace: 3 })
      doc.setDrawColor(230, 180, 195)
      doc.line(m, 52, pw - m, 52)

      // Imagen cover (primer producto con imagen)
      let coverDataUrl = null
      for (const p of productos) {
        coverDataUrl = imgMap[p.id]
        if (coverDataUrl) break
      }
      if (coverDataUrl) {
        try { doc.addImage(coverDataUrl, 'JPEG', 25, 62, 160, 160, 'cover', 'FAST') } catch (e) {}
      }
      const sloganY = coverDataUrl ? 235 : 160
      doc.setTextColor(45, 31, 38)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(13)
      doc.text('Encuentra tu estilo con nosotros', pw / 2, sloganY, { align: 'center', charSpace: 0.5 })
      doc.setFontSize(7)
      doc.setTextColor(130, 110, 120)
      doc.text(`Edición ${new Date().getFullYear()}`, pw / 2, sloganY + 7, { align: 'center', charSpace: 2 })
      const redesY = sloganY + 24
      doc.setFontSize(5.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(200, 140, 155)
      const redes = ['INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'WHATSAPP']
      const totalRedW = redes.length * 36 - 8
      let rx = (pw - totalRedW) / 2
      for (const r of redes) {
        doc.text(r, rx + 18, redesY, { align: 'center', charSpace: 2 })
        rx += 36
      }
      doc.setDrawColor(230, 180, 195)
      doc.line(m, redesY + 8, pw - m, redesY + 8)
      doc.setFontSize(6)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(130, 110, 120)
      doc.text(new Date().toLocaleDateString('es-PE'), pw / 2, redesY + 16, { align: 'center' })

      // ── PÁGINAS DE PRODUCTOS ──
      const cols = 2, gap = 5
      const cardW = ((pw - m * 2) - gap) / cols
      const cardImgH = cardW * 1.05
      const infoH = 22
      const rowH = cardImgH + infoH
      const porPagina = 4
      let numPagina = 1

      for (let i = 0; i < productos.length; i++) {
        const idx = i % porPagina
        if (idx === 0) {
          if (numPagina > 1) doc.addPage()
          numPagina++
          doc.setFillColor(255, 255, 255)
          doc.rect(0, 0, pw, ph, 'F')
        }
        const col = idx % cols
        const row = Math.floor(idx / cols)
        const x = m + col * (cardW + gap)
        const cy = 8 + row * rowH
        const prod = productos[i]
        const precio = prod.discount_percent > 0 ? prod.price_final : prod.price_original

        doc.setFillColor(255, 255, 255)
        doc.setDrawColor(235, 225, 220)
        doc.roundedRect(x, cy, cardW, rowH - 2, 1, 1, 'FD')

        const dUrl = imgMap[prod.id]
        if (dUrl) {
          try { doc.addImage(dUrl, 'JPEG', x + 0.5, cy + 0.5, cardW - 1, cardImgH - 1, `img_${prod.id}`, 'FAST') } catch (e) {}
        }
        if (prod.is_new) {
          doc.setFillColor(45, 31, 38)
          doc.rect(x + 1.5, cy + 1.5, 12, 3.5, 'F')
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(5)
          doc.setFont('helvetica', 'bold')
          doc.text('NUEVO', x + 7.5, cy + 4, { align: 'center' })
        }
        if (prod.sku) {
          doc.setFillColor(255, 255, 255)
          doc.roundedRect(x + cardW - 19, cy + cardImgH - 5.5, 18, 4.5, 0.5, 0.5, 'F')
          doc.setTextColor(130, 110, 120)
          doc.setFontSize(4.5)
          doc.setFont('helvetica', 'normal')
          doc.text(prod.sku, x + cardW - 10, cy + cardImgH - 2, { align: 'center' })
        }
        const iy = cy + cardImgH + 1.5
        if (prod.brand) {
          doc.setTextColor(100, 70, 80)
          doc.setFontSize(5.5)
          doc.setFont('helvetica', 'bold')
          doc.text(prod.brand.toUpperCase(), x + 2, iy + 2.5)
        }
        doc.setTextColor(45, 31, 38)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        const nl = doc.splitTextToSize(prod.name, cardW - 4)
        doc.text(nl.slice(0, 2), x + 2, iy + 7)
        if (prod.color) {
          doc.setTextColor(130, 110, 120)
          doc.setFontSize(5)
          doc.setFont('helvetica', 'normal')
          doc.text(prod.color.charAt(0).toUpperCase() + prod.color.slice(1), x + 2, iy + 13)
        }
        doc.setTextColor(230, 0, 0)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(`${CURRENCY} ${Number(precio).toFixed(2)}`, x + 2, iy + 19.5)
        if (prod.discount_percent > 0) {
          doc.setTextColor(130, 110, 120)
          doc.setFontSize(5)
          doc.setFont('helvetica', 'normal')
          const dt = `${CURRENCY} ${Number(prod.price_original).toFixed(2)}`
          doc.text(dt, x + 28, iy + 19)
          doc.line(x + 28, iy + 19.4, x + 28 + doc.getTextWidth(dt), iy + 19.4)
        }
      }

      // ── CONTRAPORTADA ──
      doc.addPage()
      doc.setFillColor(255, 255, 255)
      doc.rect(0, 0, pw, ph, 'F')
      for (let y = 0; y < ph; y += 3) {
        const t = y / ph
        const r = Math.round(248 + (230 - 248) * (1 - t) * 0.3)
        const g = Math.round(235 + (180 - 235) * (1 - t) * 0.3)
        const b = Math.round(240 + (195 - 240) * (1 - t) * 0.3)
        doc.setFillColor(r, g, b)
        doc.rect(0, y, pw, 3, 'F')
      }
      doc.setDrawColor(230, 180, 195)
      doc.setLineWidth(0.3)
      doc.line(m, 30, pw - m, 30)
      doc.setTextColor(45, 31, 38)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(28)
      doc.text('¡Gracias!', pw / 2, 65, { align: 'center' })
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Por tu preferencia', pw / 2, 75, { align: 'center', charSpace: 2 })
      doc.setDrawColor(230, 180, 195)
      doc.line(m, 83, pw - m, 83)
      const cy2 = 100
      doc.setTextColor(230, 0, 0)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.text('CONTÁCTANOS', pw / 2, cy2, { align: 'center', charSpace: 3 })
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(45, 31, 38)
      doc.text(`+51 ${WHATSAPP_PHONE.slice(1,4)} ${WHATSAPP_PHONE.slice(4,7)} ${WHATSAPP_PHONE.slice(7)}`, pw / 2, cy2 + 9, { align: 'center' })
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(130, 110, 120)
      const plat = ['INSTAGRAM', 'TIKTOK', 'FACEBOOK']
      const users = ['@donkarl_oficial', '@donkarl_oficial', '@donkarl_tienda']
      const tw = plat.length * 36 - 8
      let rxx = (pw - tw) / 2
      for (let j = 0; j < plat.length; j++) {
        doc.text(plat[j], rxx + 18, cy2 + 22, { align: 'center', charSpace: 2 })
        doc.setFont('helvetica', 'normal')
        doc.text(users[j], rxx + 18, cy2 + 27, { align: 'center' })
        doc.setFont('helvetica', 'bold')
        rxx += 36
      }
      const py = cy2 + 44
      doc.setDrawColor(230, 180, 195)
      doc.line(m, py, pw - m, py)
      doc.setTextColor(130, 110, 120)
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.text('MÉTODOS DE PAGO', pw / 2, py + 8, { align: 'center', charSpace: 2 })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(5.5)
      doc.setTextColor(45, 31, 38)
      doc.text('Visa | Mastercard | Yape | Plin | Transferencia Bancaria | Efectivo', pw / 2, py + 15, { align: 'center' })
      doc.setDrawColor(230, 180, 195)
      doc.line(m, py + 22, pw - m, py + 22)
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(130, 110, 120)
      doc.text('ENVÍOS', pw / 2, py + 30, { align: 'center', charSpace: 2 })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(5.5)
      doc.setTextColor(45, 31, 38)
      doc.text('A todo el Perú', pw / 2, py + 37, { align: 'center' })
      doc.setDrawColor(230, 180, 195)
      doc.line(m, ph - 22, pw - m, ph - 22)
      doc.setTextColor(45, 31, 38)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text('DON KARL', pw / 2, ph - 13, { align: 'center', charSpace: 2 })

      // ── FOOTER SOLO EN PÁGINAS DE PRODUCTOS ──
      const total = doc.getNumberOfPages()
      for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total) continue
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
