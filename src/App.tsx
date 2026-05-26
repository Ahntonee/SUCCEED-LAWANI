import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import About from './pages/About'
import Events from './pages/Events'
import Blog from './pages/Blog'
import Music from './pages/Music'
import Contact from './pages/Contact'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/events" element={<Events />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/music" element={<Music />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  )
}
