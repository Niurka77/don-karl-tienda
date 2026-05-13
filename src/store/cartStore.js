import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      
      openCart: () => set({ isCartOpen: true }),
      
      closeCart: () => set({ isCartOpen: false }),

      addItem: (product) => {
        // ✅ CORREGIDO: Validación de stock
        if (product.stock && product.quantity > product.stock) {
          alert(`Lo sentimos, solo quedan ${product.stock} unidades disponibles de "${product.name}"`)
          return false
        }

        // Validar que el producto tenga datos requeridos
        if (!product.id || !product.name || !product.price) {
          console.error('Producto inválido:', product)
          return false
        }

        const items = get().items
        const existingIndex = items.findIndex(
          (item) => item.id === product.id && item.selectedSize === product.selectedSize
        )

        if (existingIndex >= 0) {
          // Actualizar cantidad si ya existe
          const updatedItems = [...items]
          const newQuantity = updatedItems[existingIndex].quantity + (product.quantity || 1)
          
          // Verificar stock nuevamente
          if (product.stock && newQuantity > product.stock) {
            alert(`No puedes agregar más de ${product.stock} unidades`)
            return false
          }
          
          updatedItems[existingIndex].quantity = newQuantity
          set({ items: updatedItems })
        } else {
          // Agregar nuevo producto
          const newItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice || product.price,
            image: product.image,
            sku: product.sku,
            brand: product.brand,
            selectedSize: product.selectedSize || null,
            quantity: product.quantity || 1,
            stock: product.stock
          }
          set({ items: [...items, newItem] })
        }
        
        // Abrir drawer automáticamente
        set({ isCartOpen: true })
        return true
      },

      removeItem: (id, selectedSize) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.id === id && item.selectedSize === selectedSize)
          )
        }))
      },

      updateQuantity: (id, quantity, selectedSize) => {
        if (quantity < 1) return
        
        set((state) => {
          const item = state.items.find(
            (i) => i.id === id && i.selectedSize === selectedSize
          )
          
          // Verificar stock si existe
          if (item && item.stock && quantity > item.stock) {
            alert(`Solo quedan ${item.stock} unidades disponibles`)
            return state
          }
          
          return {
            items: state.items.map((item) =>
              item.id === id && item.selectedSize === selectedSize
                ? { ...item, quantity }
                : item
            )
          }
        })
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => {
        const items = get().items
        return items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        const items = get().items
        return items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      // Método útil para obtener items con subtotal
      getItemsWithSubtotal: () => {
        const items = get().items
        return items.map(item => ({
          ...item,
          subtotal: item.price * item.quantity
        }))
      },

      // Verificar si un producto ya está en el carrito
      isInCart: (id, selectedSize = null) => {
        const items = get().items
        return items.some(item => item.id === id && item.selectedSize === selectedSize)
      },
    }),
    {
      name: 'kb-cart-storage', // clave en localStorage
      partialize: (state) => ({ items: state.items }), // solo persistir items, no el estado del drawer
    }
  )
)

export default useCartStore