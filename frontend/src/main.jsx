import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import '../node_modules/bootstrap/dist/css/bootstrap.css'
import './assets/css/main.scss'
import { BrowserRouter } from 'react-router-dom'
import Providers from './store/Provider.jsx'
import { AppWrapper } from './components/blocks/AppWrapper.jsx'

import 'primereact/resources/themes/lara-light-blue/theme.css'; // Theme
import 'primereact/resources/primereact.min.css';                // Core styles
import 'primeicons/primeicons.css';                            // Icons (optional but recommended)
import { ThemeProvider } from './components/theme-provider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  // <Providers>
  //   <BrowserRouter>
  //     <App />
  //   </BrowserRouter> 
  // </Providers>
  <AppWrapper>
    <ThemeProvider>
      <App/>
    </ThemeProvider>
  </AppWrapper>

)

//haha loolz remember to re-add " <React.StrictMode>" as a parent to "<BrowserRouter/>" because <React.StrictMode> causes a rerender(which u don't want for this particular task page) in testing but not in production
