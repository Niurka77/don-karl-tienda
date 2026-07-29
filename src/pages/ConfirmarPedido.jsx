import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { p } from '../lib/theme'

const ConfirmarPedido = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const accion = searchParams.get('accion')
  const [estado, setEstado] = useState('cargando')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    if (!accion || !id) {
      setEstado('error')
      setMensaje('Enlace inválido')
      return
    }

    const actualizar = async () => {
      const updates = { updated_at: new Date().toISOString() }
      if (accion === 'pagado') updates.status = 'pagado'
      else if (accion === 'enviado') {
        updates.status = 'enviado'
        const { data: pedido, error: fetchError } = await supabase
          .from('orders')
          .select('items')
          .eq('id', id)
          .single()
        if (fetchError) {
          setEstado('error')
          setMensaje('Error al leer el pedido')
          return
        }
        const productos = pedido.items || []
        for (const p of productos) {
          await supabase.rpc('decrementar_stock', { product_id: p.id, cantidad: p.quantity || 1 })
        }
      } else {
        setEstado('error')
        setMensaje('Acción no reconocida')
        return
      }

      const { error } = await supabase.from('orders').update(updates).eq('id', id)

      if (error) {
        setEstado('error')
        setMensaje('Error al actualizar el pedido')
      } else {
        setEstado('exito')
        setMensaje(`Pedido #${id} marcado como ${accion === 'pagado' ? 'pagado' : 'enviado'}`)
      }
    }

    actualizar()
  }, [id, accion])

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: `linear-gradient(180deg, ${p.ivory} 0%, ${p.cream} 100%)` }}
    >
      <div className="text-center max-w-md">
        {estado === 'cargando' && (
          <div className="w-8 h-8 border-4 border-[#E8D5B7] border-t-[#C9607F] rounded-full animate-spin mx-auto" />
        )}
        {estado === 'exito' && (
          <>
            <div
              style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgba(76,175,80,0.15)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 300, fontStyle: 'italic', color: p.rose, marginBottom: '0.5rem' }}>
              ¡Listo!
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: p.mauve, lineHeight: 1.6 }}>
              {mensaje}
            </p>
          </>
        )}
        {estado === 'error' && (
          <>
            <div
              style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgba(244,67,54,0.15)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F44336" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 300, fontStyle: 'italic', color: p.rose, marginBottom: '0.5rem' }}>
              Error
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: p.mauve, lineHeight: 1.6 }}>
              {mensaje}
            </p>
          </>
        )}
        <a
          href="/"
          className="btn-kb-ghost"
          style={{
            display: 'inline-block', marginTop: '2rem',
            fontFamily: 'var(--font-sans)', fontSize: '0.85rem',
            color: p.rose, textDecoration: 'none',
            borderBottom: `1px solid ${p.rose}40`, paddingBottom: '2px',
          }}
        >
          ← Volver a la tienda
        </a>
      </div>
    </div>
  )
}

export default ConfirmarPedido
