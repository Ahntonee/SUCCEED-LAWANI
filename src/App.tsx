import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import About from './pages/About'
import Events from './pages/Events'
import Blog from './pages/Blog'
import Music from './pages/Music'
import Contact from './pages/Contact'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMusic from './pages/admin/AdminMusic'
import AdminEvents from './pages/admin/AdminEvents'
import AdminBlog from './pages/admin/AdminBlog'
import AdminContacts from './pages/admin/AdminContacts'
import AdminContent from './pages/admin/AdminContent'
import AdminFashion from './pages/admin/AdminFashion'
import AdminSubscribers from './pages/admin/AdminSubscribers'
import AdminSettings from './pages/admin/AdminSettings'
import AdminShop from './pages/admin/AdminShop'
import { CartProvider } from './context/CartContext'

export default function App() {
  return (
    <CartProvider>
      <Routes>
        {/* Public site */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/events" element={<Events />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/music" element={<Music />} />
        <Route path="/contact" element={<Contact />} />

        {/* Shop */}
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:id" element={<ProductDetail />} />
        <Route path="/shop/checkout" element={<Checkout />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="music" element={<AdminMusic />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="fashion" element={<AdminFashion />} />
          <Route path="subscribers" element={<AdminSubscribers />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="shop" element={<AdminShop />} />
        </Route>
      </Routes>
    </CartProvider>
  )
}
