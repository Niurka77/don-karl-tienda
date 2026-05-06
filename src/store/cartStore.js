import { create } from 'zustand'

const useCartStore = create((set, get) => ({
  // Estado
  items: [],
  isOpen: false,

  // Abrir / cerrar drawer
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  // Agregar producto al carrito
  addItem: (product, talla, cantidad = 1) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (item) => item.id === product.id && item.talla === talla
      )

      let newItems

      if (existingIndex >= 0) {
        // Ya existe → sumar cantidad
        newItems = [...state.items]
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          cantidad: newItems[existingIndex].cantidad + cantidad,
        }
      } else {
        // Nuevo item
        newItems = [
          ...state.items,
          {
            id: product.id,
            name: product.name,
            price: product.discount_percent > 0 ? product.price_final : product.price_original,
            price_original: product.price_original,
            discount_percent: product.discount_percent || 0,
            image_url: product.image_url,
            talla: talla,
            cantidad: cantidad,
            stock: product.stock,
            sku: product.sku,
          },
        ]
      }

      return { items: newItems, isOpen: true }
    })
  },

  // Remover producto
  removeItem: (id, talla) => {
    set((state) => ({
      items: state.items.filter(
        (item) => !(item.id === id && item.talla === talla)
      ),
    }))
  },

  // Actualizar cantidad
  updateQuantity: (id, talla, cantidad) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id && item.talla === talla
          ? { ...item, cantidad: Math.min(cantidad, item.stock) }
          : item
      ),
    }))
  },

  // Calcular totales
  getTotal: () => {
    return get().items.reduce((acc, item) => acc + item.price * item.cantidad, 0)
  },

  getItemCount: () => {
    return get().items.reduce((acc, item) => acc + item.cantidad, 0)
  },

  // Limpiar carrito
  clearCart: () => set({ items: [], isOpen: false }),
}))

export default useCartStore