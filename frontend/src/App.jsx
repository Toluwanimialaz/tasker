import { useState } from 'react'
import{Routes,Route} from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Home from './pages/home'
import Task from './pages/task'
import Welcom from './pages/welcom'
import NotFound from './pages/notFound'
import Login from './pages/login'
import Signup from './pages/signup'

function App() {
  const [count, setCount] = useState(0)
  const[modal,setModal]=useState(false)

  function handleOpen(){
    setModal(true)
  }

  function handleClose(){
    setModal(false)
  }

  return (
    <>

      <div className='home'>
      </div>
      <Routes>
          <Route path='/' element={<Welcom/>}/>
          <Route path='/signup' element={<Signup/>}/>
          <Route path='/home'>
            <Route index element={<Home/>}/>
            <Route path="task" element={<Task/>}/>
          </Route>
          <Route path='/login'element={<Login/>}/>
          <Route path='*' element={<NotFound/>}/>
      </Routes>
    </>
  )
}

export default App
