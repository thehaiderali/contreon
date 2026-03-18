import { Routes, Route } from 'react-router'
import HomePage from './components/HomePage'
import SignupPage from './pages/Signup'
import LoginPage from './pages/Login'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Chats from './pages/Chats'
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'
import Feed from './components/Feed'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path='/signup' element={<SignupPage/>}/>
      <Route path='/login' element={<LoginPage/>}/>
      <Route path='/home' element={<Home/>}>
          <Route index element={<Feed/>}/>
          <Route path="explore" element={<Explore />} />
          <Route path="chat" element={<Chats />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
      </Route>
    </Routes>
  )
}

export default App