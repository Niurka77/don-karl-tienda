import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { p } from '../lib/theme'

const ConfirmarPedido = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [mensaje, setMensaje] = useState('Procesando...')
  const [status, setStatus] = useState('cargando')

  useEffect(() => {
    const accion = searchParams.get('accion')
    if (!accion || !['pagado', 'enviado'].includes(accion)) {
      setMensaje('Enlace inválido')
      setStatus('error')
      return
    }

    const nuevosStatus = { pagado: 'pagado', enviado: 'enviado' }
    const updates = { status: nuevosStatus[accion], updated_at: new Date().toISOString() }

    if (accion === 'enviado') {
      updates.status = 'enviado'
    }

    supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          setMensaje('Error al actualizar el pedido')
          setStatus('error')
        } else {
          const label = accion === 'pagado' ? 'marcado como pagado' : 'marcado como enviado'
          setMensaje(`¡Pedido ${label} con éxito!`)
          setStatus('exito')
        }
      })
  }, [id, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(180deg, ${p.ivory} 0%, ${p.cream} 100%)` }}>
      <div className="text-center max-w-md mx-auto p-8">
        <div className={`text-6xl mb-6 ${status === 'exito' ? 'animate-bounce' : status === 'error' ? '' : 'animate-spin'}`}>
          {status === 'cargando' ? '⏳' : status === 'exito' ? '✅' : '❌'}
        </div>
        <h1 className="font-display text-3xl mb-4" style={{ color: p.textMain }}>
          {status === 'exito' ? '¡Confirmado!' : status === 'error' ? 'Error' : 'Procesando'}
        </h1>
        <p className="font-sans text-lg" style={{ color: p.textSoft }}>{mensaje}</p>
      </div>
    </div>
  )
}

export default ConfirmarPedido
