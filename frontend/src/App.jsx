import { Routes, Route } from 'react-router'
import HomePage from './components/HomePage'
import SignupPage from './pages/Signup'
import Login from './pages/Login'
import LoginPage from './pages/Login'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path='/signup' element={<SignupPage/>}/>
      <Route path='/login' element={<LoginPage/>}/>
    </Routes>
  )
}

export default App