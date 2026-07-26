import Navbar from './Navbar'
import Footer from './Footer'
import WhatsAppButton from '../ui/WhatsAppButton'
import CartDrawer from '../carrito/CartDrawer'
import { Outlet } from 'react-router-dom'
import { WHATSAPP_PHONE } from '../../lib/constants'
import { p } from '../../lib/theme'

const Layout = () => {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: `linear-gradient(180deg, ${p.ivory} 0%, ${p.cream} 100%)`,
      }}
    >
      <Navbar />

      <main className="flex-1" id="main-content">
        <Outlet />
      </main>

      <WhatsAppButton phoneNumber={WHATSAPP_PHONE} />
      <CartDrawer />
      <Footer />
    </div>
  )
}

export default Layout
