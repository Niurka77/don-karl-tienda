import { useState } from 'react'
import { jsPDF } from 'jspdf'
import { supabase } from '../../lib/supabase'

const BotonPDF = () => {
  const [generando, setGenerando] = useState(false)

  const generarPDF = async () => {
    // ✅ Prevenir múltiples clicks
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

      // ✅ Validar que haya productos disponibles
      const disponibles = productos || []
      
      if (disponibles.length === 0) {
        alert('No hay productos disponibles para generar el catálogo.')
        return
      }

      // Crear PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 10

      // Título
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.text('DON KARL', pageWidth / 2, margin + 10, { align: 'center' })

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Catálogo de productos importados', pageWidth / 2, margin + 16, {
        align: 'center',
      })
      doc.text(
        `Fecha: ${new Date().toLocaleDateString('es-PE')}`,
        pageWidth / 2,
        margin + 21,
        { align: 'center' }
      )

      // Línea separadora
      doc.setDrawColor(0)
      doc.setLineWidth(0.3)
      doc.line(margin, margin + 25, pageWidth - margin, margin + 25)

      let yPos = margin + 30
      const maxY = pageHeight - margin - 10

      // Agrupar por categoría
      const categorias = [...new Set(disponibles.map((p) => p.category).filter(Boolean))]

      if (categorias.length === 0) {
        doc.setFontSize(12)
        doc.text('No hay productos disponibles en este momento.', margin, yPos)
      } else {
        for (const categoria of categorias) {
          const productosCat = disponibles.filter(
            (p) => p.category === categoria
          )

          // Saltar a nueva página si queda poco espacio
          if (yPos > maxY - 40) {
            doc.addPage()
            yPos = margin + 5
          }

          // Título de categoría
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(14)
          doc.text(
            categoria.charAt(0).toUpperCase() + categoria.slice(1),
            margin,
            yPos
          )
          yPos += 7

          // Productos
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(9)

          for (const producto of productosCat) {
            if (yPos > maxY) {
              doc.addPage()
              yPos = margin + 5
            }

            // ✅ Validar que el producto tenga datos requeridos
            if (!producto.name || !producto.price_original) continue

            // Nombre + precio
            const precio =
              producto.discount_percent > 0
                ? producto.price_final
                : producto.price_original
                
            const texto = `${producto.name} - $${precio?.toFixed(2)}`

            if (producto.discount_percent > 0) {
              doc.setTextColor(200, 0, 0)
            } else {
              doc.setTextColor(0, 0, 0)
            }

            doc.text(texto, margin, yPos)

            // Tallas - ✅ Manejar caso donde sizes_available no es array
            let tallasTexto = 'Único'
            if (producto.sizes_available) {
              try {
                const tallas = Array.isArray(producto.sizes_available) 
                  ? producto.sizes_available 
                  : JSON.parse(producto.sizes_available)
                if (Array.isArray(tallas) && tallas.length > 0) {
                  tallasTexto = tallas.join(', ')
                }
              } catch (e) {
                tallasTexto = 'Único'
              }
            }
            
            doc.setTextColor(100, 100, 100)
            doc.setFontSize(7)
            doc.text(
              `Tallas: ${tallasTexto}`,
              margin,
              yPos + 3.5
            )

            // SKU a la derecha
            if (producto.sku) {
              doc.text(`SKU: ${producto.sku}`, pageWidth - margin - 30, yPos)
            }

            // Línea gris suave
            doc.setDrawColor(230, 230, 230)
            doc.setLineWidth(0.1)
            doc.line(margin, yPos + 5, pageWidth - margin, yPos + 5)

            yPos += 8
            doc.setFontSize(9)
          }

          yPos += 5
        }
      }

      // Footer en todas las páginas
      const totalPaginas = doc.getNumberOfPages()
      for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i)
        doc.setFontSize(7)
        doc.setTextColor(150, 150, 150)
        doc.text(
          `Página ${i} de ${totalPaginas} | Contáctanos por WhatsApp | Envíos a todo el Perú`,
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        )
      }

      // Descargar
      const fecha = new Date().toISOString().split('T')[0]
      doc.save(`Catalogo_Don_Karl_${fecha}.pdf`)
      
      // ✅ Feedback de éxito
      alert('✅ Catálogo generado exitosamente')
      
    } catch (err) {
      console.error('Error al generar PDF:', err)
      alert('❌ Error al generar el catálogo. Intenta de nuevo.')
    } finally {
      setGenerando(false)
    }
  }

  return (
    <button
      onClick={generarPDF}
      disabled={generando}
      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
      aria-label="Descargar catálogo de productos en PDF"
    >
      {generando ? (
        <>
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          Generando...
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Descargar Catálogo PDF
        </>
      )}
    </button>
  )
}

export default BotonPDF