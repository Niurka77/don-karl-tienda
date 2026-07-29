import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { WHATSAPP_PHONE, CURRENCY } from '../../lib/constants'

const loadImageAsDataUrl = (url) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

const ROSA = [230, 180, 195]
const ROSA_CLARO = [248, 235, 240]
const ROJO = [230, 0, 0]
const INK = [45, 31, 38]
const TEXTO_SUAVE = [140, 125, 132]
const BLANCO = [255, 255, 255]

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

      const { default: jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pw = 210
      const ph = 297
      const m = 8
      const usableW = pw - m * 2

      // ──────────────────────────────────────────────
      // PORTADA
      // ──────────────────────────────────────────────
      // Fondo degradado manual con rect
      for (let y = 0; y < ph; y += 2) {
        const t = y / ph
        const r = Math.round(ROSA_CLARO[0] + (ROSA[0] - ROSA_CLARO[0]) * t * 0.3)
        const g = Math.round(ROSA_CLARO[1] + (ROSA[1] - ROSA_CLARO[1]) * t * 0.3)
        const b = Math.round(ROSA_CLARO[2] + (ROSA[2] - ROSA_CLARO[2]) * t * 0.3)
        doc.setFillColor(r, g, b)
        doc.rect(0, y, pw, 2, 'F')
      }

      // Línea decorativa superior
      doc.setDrawColor(ROSA[0], ROSA[1], ROSA[2])
      doc.setLineWidth(0.3)
      doc.line(m, 20, pw - m, 20)

      // DON KARL
      doc.setTextColor(INK[0], INK[1], INK[2])
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(36)
      doc.text('DON KARL', pw / 2, 38, { align: 'center' })

      // Subtítulo
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(TEXTO_SUAVE[0], TEXTO_SUAVE[1], TEXTO_SUAVE[2])
      doc.text('COLECCIÓN IMPORTADA', pw / 2, 44, { align: 'center', charSpace: 3 })

      // Línea decorativa inferior
      doc.setDrawColor(ROSA[0], ROSA[1], ROSA[2])
      doc.line(m, 48, pw - m, 48)

      // Imagen de portada (primer producto con imagen)
      let coverImg = null
      for (const p of productos) {
        const url = p.image_url || p.images_urls?.[0]
        if (url) {
          coverImg = await loadImageAsDataUrl(url)
          if (coverImg) break
        }
      }
      if (coverImg) {
        const imgW = 160
        const imgH = 160
        const imgX = (pw - imgW) / 2
        const imgY = 60
        try {
          doc.addImage(coverImg, 'JPEG', imgX, imgY, imgW, imgH, undefined, 'FAST')
        } catch (e) { /* skip */ }
      }

      // Eslogan
      const sloganY = coverImg ? 230 : 150
      doc.setTextColor(INK[0], INK[1], INK[2])
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(14)
      doc.text('Encuentra tu estilo con nosotros', pw / 2, sloganY, { align: 'center', charSpace: 0.5 })

      doc.setFontSize(7)
      doc.setTextColor(TEXTO_SUAVE[0], TEXTO_SUAVE[1], TEXTO_SUAVE[2])
      doc.text(`Edición ${new Date().getFullYear()}`, pw / 2, sloganY + 7, { align: 'center', charSpace: 2 })

      // Redes sociales
      const redesY = sloganY + 22
      doc.setFontSize(5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(ROSA[0], ROSA[1], ROSA[2])

      const redes = ['INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'WHATSAPP']
      const totalRedesW = redes.length * 34 - 6
      let redX = (pw - totalRedesW) / 2
      for (const red of redes) {
        const w = doc.getTextWidth(red)
        doc.text(red, redX + 17, redesY, { align: 'center', charSpace: 2 })
        redX += 34
      }

      // Línea inferior portada
      doc.setDrawColor(ROSA[0], ROSA[1], ROSA[2])
      doc.setLineWidth(0.3)
      doc.line(m, redesY + 8, pw - m, redesY + 8)

      // Fecha
      doc.setFontSize(6)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(TEXTO_SUAVE[0], TEXTO_SUAVE[1], TEXTO_SUAVE[2])
      doc.text(new Date().toLocaleDateString('es-PE'), pw / 2, redesY + 16, { align: 'center' })

      // ──────────────────────────────────────────────
      // PRODUCTOS
      // ──────────────────────────────────────────────
      const COLUMNAS = 2
      const GAP = 5
      const cardW = (usableW - GAP * (COLUMNAS - 1)) / COLUMNAS
      const imgH = cardW * 1.05
      const infoAlto = 22
      const rowH = imgH + infoAlto
      const porPagina = 4

      doc.addPage()

      for (let i = 0; i < productos.length; i++) {
        const idx = i % porPagina
        if (idx === 0 && i > 0) {
          doc.addPage()
        }
        if (idx === 0) {
          doc.setFillColor(255, 255, 255)
          doc.rect(0, 0, pw, ph, 'F')
        }

        const col = idx % COLUMNAS
        const row = Math.floor(idx / COLUMNAS)
        const x = m + col * (cardW + GAP)
        const cardY = 8 + row * rowH

        const prod = productos[i]
        const imgUrl = prod.image_url || prod.images_urls?.[0] || ''
        const tieneDcto = prod.discount_percent > 0
        const precio = tieneDcto ? prod.price_final : prod.price_original

        // Fondo de card
        doc.setFillColor(255, 255, 255)
        doc.setDrawColor(235, 225, 220)
        doc.roundedRect(x, cardY, cardW, rowH - 2, 1, 1, 'FD')

        // Imagen
        if (imgUrl) {
          const dataUrl = await loadImageAsDataUrl(imgUrl)
          if (dataUrl) {
            try {
              doc.addImage(dataUrl, 'JPEG', x + 0.5, cardY + 0.5, cardW - 1, imgH - 1, undefined, 'FAST')
            } catch (e) { /* skip */ }
          }
        }

        // Badge NUEVO
        if (prod.is_new) {
          doc.setFillColor(INK[0], INK[1], INK[2])
          doc.rect(x + 1.5, cardY + 1.5, 12, 3.5, 'F')
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(5)
          doc.setFont('helvetica', 'bold')
          doc.text('NUEVO', x + 1.5 + 6, cardY + 1.5 + 2.5, { align: 'center' })
        }

        // SKU
        if (prod.sku) {
          doc.setFillColor(255, 255, 255)
          doc.roundedRect(x + cardW - 1.5 - 18, cardY + imgH - 1.5 - 4.5, 18, 4.5, 0.5, 0.5, 'F')
          doc.setTextColor(TEXTO_SUAVE[0], TEXTO_SUAVE[1], TEXTO_SUAVE[2])
          doc.setFontSize(4.5)
          doc.setFont('helvetica', 'normal')
          doc.text(prod.sku, x + cardW - 1.5 - 9, cardY + imgH - 1.5 - 0.5, { align: 'center' })
        }

        // Info
        const infoY = cardY + imgH + 1.5

        if (prod.brand) {
          doc.setTextColor(100, 70, 80)
          doc.setFontSize(5.5)
          doc.setFont('helvetica', 'bold')
          doc.text(prod.brand.toUpperCase(), x + 2, infoY + 2.5)
        }

        doc.setTextColor(INK[0], INK[1], INK[2])
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        const nameLines = doc.splitTextToSize(prod.name, cardW - 4)
        doc.text(nameLines.slice(0, 2), x + 2, infoY + 7)

        if (prod.color) {
          doc.setTextColor(TEXTO_SUAVE[0], TEXTO_SUAVE[1], TEXTO_SUAVE[2])
          doc.setFontSize(5)
          doc.setFont('helvetica', 'normal')
          doc.text(prod.color.charAt(0).toUpperCase() + prod.color.slice(1), x + 2, infoY + 13)
        }

        // Precio grande en rojo
        doc.setTextColor(ROJO[0], ROJO[1], ROJO[2])
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(`${CURRENCY} ${Number(precio).toFixed(2)}`, x + 2, infoY + 19.5)

        if (tieneDcto) {
          doc.setTextColor(TEXTO_SUAVE[0], TEXTO_SUAVE[1], TEXTO_SUAVE[2])
          doc.setFontSize(5)
          doc.setFont('helvetica', 'normal')
          const dctoText = `${CURRENCY} ${Number(prod.price_original).toFixed(2)}`
          doc.text(dctoText, x + 28, infoY + 19)
          doc.line(x + 28, infoY + 19.4, x + 28 + doc.getTextWidth(dctoText), infoY + 19.4)
        }
      }

      // ──────────────────────────────────────────────
      // CONTRAPORTADA
      // ──────────────────────────────────────────────
      doc.addPage()
      for (let y = 0; y < ph; y += 2) {
        const t = y / ph
        const r = Math.round(ROSA_CLARO[0] + (ROSA[0] - ROSA_CLARO[0]) * (1 - t) * 0.3)
        const g = Math.round(ROSA_CLARO[1] + (ROSA[1] - ROSA_CLARO[1]) * (1 - t) * 0.3)
        const b = Math.round(ROSA_CLARO[2] + (ROSA[2] - ROSA_CLARO[2]) * (1 - t) * 0.3)
        doc.setFillColor(r, g, b)
        doc.rect(0, y, pw, 2, 'F')
      }

      // Línea decorativa superior
      doc.setDrawColor(ROSA[0], ROSA[1], ROSA[2])
      doc.setLineWidth(0.3)
      doc.line(m, 30, pw - m, 30)

      // Título de agradecimiento
      doc.setTextColor(INK[0], INK[1], INK[2])
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(28)
      doc.text('¡Gracias!', pw / 2, 65, { align: 'center' })

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Por tu preferencia', pw / 2, 75, { align: 'center', charSpace: 2 })

      // Línea decorativa
      doc.setDrawColor(ROSA[0], ROSA[1], ROSA[2])
      doc.line(m, 83, pw - m, 83)

      // Contacto
      const ctaY = 100
      doc.setTextColor(ROJO[0], ROJO[1], ROJO[2])
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.text('CONTÁCTANOS', pw / 2, ctaY, { align: 'center', charSpace: 3 })

      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(INK[0], INK[1], INK[2])
      doc.text(`+51 ${WHATSAPP_PHONE.slice(1, 4)} ${WHATSAPP_PHONE.slice(4, 7)} ${WHATSAPP_PHONE.slice(7)}`, pw / 2, ctaY + 9, { align: 'center' })

      // Redes
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(TEXTO_SUAVE[0], TEXTO_SUAVE[1], TEXTO_SUAVE[2])
      const redes2 = ['@donkarl_oficial', '@donkarl_oficial', '@donkarl_tienda']
      const plataformas = ['INSTAGRAM', 'TIKTOK', 'FACEBOOK']
      const totalW2 = plataformas.length * 36 - 8
      let rx = (pw - totalW2) / 2
      for (let j = 0; j < plataformas.length; j++) {
        doc.text(plataformas[j], rx + 18, ctaY + 20, { align: 'center', charSpace: 2 })
        doc.setFont('helvetica', 'normal')
        doc.text(redes2[j], rx + 18, ctaY + 25, { align: 'center' })
        doc.setFont('helvetica', 'bold')
        rx += 36
      }

      // Métodos de pago
      const payY = ctaY + 42
      doc.setDrawColor(ROSA[0], ROSA[1], ROSA[2])
      doc.line(m, payY, pw - m, payY)

      doc.setTextColor(TEXTO_SUAVE[0], TEXTO_SUAVE[1], TEXTO_SUAVE[2])
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.text('MÉTODOS DE PAGO', pw / 2, payY + 8, { align: 'center', charSpace: 2 })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(5.5)
      doc.setTextColor(INK[0], INK[1], INK[2])
      const pagos = ['Visa', 'Mastercard', 'Yape', 'Plin', 'Transferencia Bancaria', 'Efectivo']
      const pagosText = pagos.join('  |  ')
      doc.text(pagosText, pw / 2, payY + 15, { align: 'center' })

      // Envíos
      doc.setDrawColor(ROSA[0], ROSA[1], ROSA[2])
      doc.line(m, payY + 22, pw - m, payY + 22)

      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(TEXTO_SUAVE[0], TEXTO_SUAVE[1], TEXTO_SUAVE[2])
      doc.text('ENVÍOS', pw / 2, payY + 30, { align: 'center', charSpace: 2 })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(5.5)
      doc.setTextColor(INK[0], INK[1], INK[2])
      doc.text('A todo el Perú', pw / 2, payY + 37, { align: 'center' })

      // DON KARL al pie
      doc.setDrawColor(ROSA[0], ROSA[1], ROSA[2])
      doc.line(m, ph - 20, pw - m, ph - 20)
      doc.setTextColor(INK[0], INK[1], INK[2])
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text('DON KARL', pw / 2, ph - 12, { align: 'center', charSpace: 2 })

      // ──────────────────────────────────────────────
      // FOOTER EN TODAS LAS PÁGINAS
      // ──────────────────────────────────────────────
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setTextColor(TEXTO_SUAVE[0], TEXTO_SUAVE[1], TEXTO_SUAVE[2])
        doc.setFontSize(5)
        doc.setFont('helvetica', 'normal')
        doc.text(`Página ${i} de ${totalPages} | Contáctanos al +51 ${WHATSAPP_PHONE.slice(1)} | Envíos a todo el Perú`, pw / 2, ph - 3, { align: 'center' })
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
