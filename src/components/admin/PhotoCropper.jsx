import { useState, useEffect, useRef, useCallback } from 'react'

const FRAME = 320
const MIN_ZOOM = 1
const MAX_ZOOM = 4

export default function PhotoCropper({ file, shape = 'circle', onCancel, onApply }) {
  const [img, setImg] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 })
  const containerRef = useRef(null)
  const imgUrl = useRef(null)

  useEffect(() => {
    imgUrl.current = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => setImg(image)
    image.src = imgUrl.current
    return () => URL.revokeObjectURL(imgUrl.current)
  }, [file])

  // Marco visible (px del contenedor)
  const frame = containerRef.current ? containerRef.current.offsetWidth : 300

  // Base = imagen escalada para cubrir el marco con zoom 1
  const baseDims = useCallback(() => {
    if (!img) return { w: frame, h: frame }
    const scale = Math.max(frame / img.naturalWidth, frame / img.naturalHeight)
    return { w: img.naturalWidth * scale, h: img.naturalHeight * scale }
  }, [img, frame])

  const dims = useCallback(() => {
    const base = baseDims()
    return { w: base.w * zoom, h: base.h * zoom }
  }, [baseDims, zoom])

  const maxOffset = useCallback(() => {
    const { w, h } = dims()
    return { x: Math.max(0, (w - frame) / 2), y: Math.max(0, (h - frame) / 2) }
  }, [dims, frame])

  const clamp = useCallback((val, min, max) => Math.min(Math.max(val, -max), max), [])

  // Ajustar offset cuando cambia el zoom para no quedar fuera de los límites
  useEffect(() => {
    const max = maxOffset()
    setOffset((prev) => ({
      x: clamp(prev.x, -max.x, max.x),
      y: clamp(prev.y, -max.y, max.y),
    }))
  }, [zoom, maxOffset, clamp])

  const onPointerDown = (e) => {
    e.preventDefault()
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
  }

  const onPointerMove = (e) => {
    if (!dragging) return
    const max = maxOffset()
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setOffset({
      x: clamp(dragStart.current.ox + dx, -max.x, max.x),
      y: clamp(dragStart.current.oy + dy, -max.y, max.y),
    })
  }

  const stopDrag = () => setDragging(false)

  const cambiarZoom = (delta) => {
    setZoom((prev) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(prev + delta).toFixed(2))))
  }

  const onWheel = (e) => {
    if (!img) return
    e.preventDefault()
    cambiarZoom(e.deltaY < 0 ? 0.15 : -0.15)
  }

  const aplicar = () => {
    if (!img) return
    const { w, h } = dims()
    const canvas = document.createElement('canvas')
    canvas.width = FRAME
    canvas.height = FRAME
    const ctx = canvas.getContext('2d')
    if (shape === 'circle') {
      ctx.beginPath()
      ctx.arc(FRAME / 2, FRAME / 2, FRAME / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
    }
    const ratio = FRAME / frame
    ctx.drawImage(img, FRAME / 2 - (w * ratio) / 2 + offset.x * ratio, FRAME / 2 - (h * ratio) / 2 + offset.y * ratio, w * ratio, h * ratio)
    canvas.toBlob((blob) => {
      if (blob) onApply(blob)
    }, 'image/png')
  }

  if (!img) {
    return (
      <div className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-6" onClick={onCancel}>
        <div className="bg-white rounded-lg p-8 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#D4788A] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-sans text-[#1A1118]">Preparando imagen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-6" onClick={onCancel}>
      <div
        className="bg-white rounded-lg w-full max-w-md p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-light text-[#1A1118]">Encuadra la foto</h3>
          <button onClick={onCancel} className="text-[#9A7480] hover:text-[#B85268] text-2xl leading-none" aria-label="Cerrar">
            ×
          </button>
        </div>

        <p className="text-xs font-sans text-[#9A7480] mb-4">
          Arrastra para mover · usa la rueda del mouse o los botones para hacer zoom
        </p>

        {/* Marco con cuadrícula de encuadre */}
        <div
          ref={containerRef}
          className="relative mx-auto w-[300px] h-[300px] overflow-hidden bg-[#1A1118] border border-[rgba(212,120,138,0.35)] select-none touch-none"
          style={{ borderRadius: shape === 'circle' ? '9999px' : '14px', cursor: dragging ? 'grabbing' : 'grab' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={stopDrag}
          onPointerLeave={stopDrag}
          onWheel={onWheel}
        >
          <img
            src={imgUrl.current}
            alt=""
            draggable={false}
            className="absolute select-none pointer-events-none"
            style={{
              width: dims().w,
              height: dims().h,
              maxWidth: 'none',
              left: (frame - dims().w) / 2 + offset.x,
              top: (frame - dims().h) / 2 + offset.y,
              transform: 'translateZ(0)',
            }}
          />

          {/* Cuadrícula tipo cámara (regla de tercios) */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/40" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/40" />
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/40" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/40" />
            {/* Esquinas de foco */}
            <div className="absolute left-3 top-3 w-5 h-5 border-l-2 border-t-2 border-white/70" />
            <div className="absolute right-3 top-3 w-5 h-5 border-r-2 border-t-2 border-white/70" />
            <div className="absolute left-3 bottom-3 w-5 h-5 border-l-2 border-b-2 border-white/70" />
            <div className="absolute right-3 bottom-3 w-5 h-5 border-r-2 border-b-2 border-white/70" />
          </div>
        </div>

        {/* Zoom */}
        <div className="flex items-center justify-center gap-4 mt-5">
          <button
            onClick={() => cambiarZoom(-0.15)}
            disabled={zoom <= MIN_ZOOM}
            className="w-9 h-9 rounded-full border border-[rgba(212,120,138,0.35)] text-[#B85268] hover:bg-[#FDF0F3] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Alejar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M5 12h14" /></svg>
          </button>
          <div className="text-xs font-sans text-[#9A7480] w-14 text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </div>
          <button
            onClick={() => cambiarZoom(0.15)}
            disabled={zoom >= MAX_ZOOM}
            className="w-9 h-9 rounded-full border border-[rgba(212,120,138,0.35)] text-[#B85268] hover:bg-[#FDF0F3] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Acercar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>
          </button>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-28 ml-1 accent-[#B85268]"
            aria-label="Zoom"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 border border-[rgba(212,120,138,0.35)] text-[#1A1118] rounded-sm text-sm font-sans hover:bg-[#FDF0F3] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={aplicar}
            className="px-6 py-2.5 bg-[#B85268] text-white rounded-sm text-sm font-sans font-medium hover:bg-[#D4788A] transition-colors"
          >
            Aplicar y subir
          </button>
        </div>
      </div>
    </div>
  )
}
