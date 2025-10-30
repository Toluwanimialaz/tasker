import React from 'react'
import { useState,useEffect } from 'react'
import{Routes,Route,useLocation} from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Home from './pages/home'
import Task from './pages/task'
import Welcom from './pages/welcom'
import NotFound from './pages/notFound'
import Login from './pages/login'
import Signup from './pages/signup'
import Header from './components/header/header'
import OnboardingModal from './components/modals/OnboardModal'
import Globalmodals from './components/modals/GlobalModals'
import { VerificationModal } from './components/modals/VerificationModal'
import LoginModal from './components/modals/LoginModal'
import Footer from './components/footer/footer'
import  Dashboard  from './pages/dashboard'
import { DeleteTaskModal } from './components/modals/deleteModal'

function App() {
  const location = useLocation();
  const state = location.state ;
  const [scrolled, setScrolled] = useState(false);
  const isModal = !!state?.backgroundLocation
  const targetPath="/"

  useEffect(() => {
    if (location.pathname !== targetPath) {
      setScrolled(false);
      return;
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  return (
    <>
      <Header scrolled={scrolled}/>
      <div className='wrapper'>
        <Routes location={isModal?state?.backgroundLocation:location}>
            <Route path='/' element={<Welcom/>}/>
            <Route path='/login'element={<Welcom/>}/>
            <Route path="/signup" element={<Welcom />} />{/* fallback background */}
            <Route path="/verify" element={<Welcom />} />
            <Route path='/home'>
              <Route index element={<Home/>}/>
              <Route path="task" element={<Task/>}/>
            </Route>
            <Route path='/dashboard' element={<Dashboard/>}/>
            <Route path='*' element={<NotFound/>}/>
        </Routes>
        {location.pathname==="/signup"&& <OnboardingModal/>}
        {location.pathname==="/verify"&& <VerificationModal/>}
        {location.pathname==="/login"&& <LoginModal/>}
        <Globalmodals/>
      </div>
      <Footer/>
    </>
  )
}

export default App
