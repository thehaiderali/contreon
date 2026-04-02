// App.jsx
import { Routes, Route } from 'react-router';
import HomePage from './components/HomePage';
import SignupPage from './pages/Signup';
import LoginPage from './pages/Login';
import Home from './pages/private/subscriber/Home';

// Subscriber Pages
import Explore from './pages/private/subscriber/Explore';
import Chats from './pages/private/subscriber/Chats';
import Settings from './pages/private/subscriber/Settings';
import Notifications from './pages/private/subscriber/Notifications';
import Feed from './components/Feed';

// Creator Pages
import { Dashboard } from './pages/private/creator/Dashboard';
import Library from './pages/private/creator/Library';
import Members from './pages/private/creator/Members';
import Insights from './pages/private/creator/Insights';
import Payouts from './pages/private/creator/Payouts';

// Protected Routes
import { ProtectedRoutes } from './components/ProtectedRoutes';
import { CreatorRoutes } from './components/CreatorRoutes';
import EditCreatorProfile from './pages/private/creator/ProfileEdit';
import StripeOnboarding from './pages/private/creator/StripeOnboarding';
import StripeSuccess from './pages/private/creator/StripeSucess';

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoutes />}>
        {/* Subscriber Routes - Using shared Home layout */}
        <Route path="/home" element={<Home />}>
          <Route index element={<Feed />} />
          <Route path="explore" element={<Explore />} />
          <Route path="chat" element={<Chats />} />
          <Route path="messages" element={<Chats />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Creator Routes - Using shared Home layout with CreatorRoutes guard */}
        <Route element={<CreatorRoutes />}>
          <Route path="/creator" element={<Home />}>
            <Route index element={<Dashboard />} />
            <Route path="library" element={<Library />} />
            <Route path="members" element={<Members />} />
            <Route path="insights" element={<Insights />} />
            <Route path="payouts" element={<Payouts />} />
            <Route path="messages" element={<Chats />} />
            <Route path="settings" element={<Settings />} />
            <Route path='profile/edit' element={<EditCreatorProfile/>}/>
            <Route path='onboarding' element={<StripeOnboarding/>}/>
            <Route path='onboarding/success' element={<StripeSuccess/>}/>
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default App;