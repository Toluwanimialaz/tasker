import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import '../node_modules/bootstrap/dist/css/bootstrap.css'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
)

//remember to re-add " <React.StrictMode>" as a parent to "<BrowserRouter/>" because <React.StrictMode> causes a rerender(which u don't want for this particular task page) in testing but not in production
