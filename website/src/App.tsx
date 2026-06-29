import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Tools from './components/Tools'
import Approach from './components/Approach'
import UseCases from './components/UseCases'
import Resources from './components/Resources'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'
import DigitalAssessmentPage from './pages/DigitalAssessmentPage'

function HomePage() {
  return (
    <>
      <Nav />
      <Hero />
      <Tools />
      <Approach />
      <UseCases />
      <Resources />
      <About />
      <Contact />
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/digital-assessment" element={<DigitalAssessmentPage />} />
      </Routes>
    </BrowserRouter>
  )
}
