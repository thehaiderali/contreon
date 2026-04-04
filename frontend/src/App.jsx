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
import Profile from './pages/private/creator/Profile';

// Protected Routes
import { ProtectedRoutes } from './components/ProtectedRoutes';
import { CreatorRoutes } from './components/CreatorRoutes';
import EditCreatorProfile from './pages/private/creator/ProfileEdit';
import CreateMemberShip from './pages/private/creator/CreateMemberShip';
import MembershipEditForm from './components/creator/membership/MemberShipEditForm';

import Collections from './components/creator/dashboard/Collections';
import CollectionCreationForm from './components/creator/collection/CollectionCreationForm';
import CollectionEditForm from './components/creator/collection/CollectionEditForm';
import CreateVideoPost from './pages/private/creator/posts/CreateVideoPost';
import CreateTextPost from './pages/private/creator/posts/CreateTextPost';
import CreateAudioPost from './pages/private/creator/posts/CreateAudioPost';

const App = () => {
  return (
    <Routes>
      
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />

      
      <Route element={<ProtectedRoutes />}>
        
        <Route path="/home" element={<Home />}>
          <Route index element={<Feed />} />
          <Route path="explore" element={<Explore />} />
          <Route path="chat" element={<Chats />} />
          <Route path="messages" element={<Chats />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        
        <Route element={<CreatorRoutes />}>
          
          <Route path="/creator" element={<Home />}>
            <Route index element={<Dashboard />} />
            <Route path='profile' element={<Profile />} />
            <Route path='profile/edit' element={<EditCreatorProfile />} />
            <Route path="library" element={<Library />} />
            <Route path="members" element={<Members />} />
            <Route path="insights" element={<Insights />} />
            <Route path="payouts" element={<Payouts />} />
            <Route path="messages" element={<Chats />} />
            <Route path="settings" element={<Settings />} />
            <Route path='memberships/create' element={<CreateMemberShip />} />
            <Route path="memberships/:id/edit" element={<MembershipEditForm />} /> 
          <Route path="/creator/collections" element={<Collections />} />
          <Route path="/creator/collections/create" element={<CollectionCreationForm />} />
          <Route path="/creator/collections/:id/edit" element={<CollectionEditForm />} />
          <Route path='/creator/create-post/video' element={<CreateVideoPost/>}/>
          <Route path='/creator/create-post/text' element={<CreateTextPost/>}/>
          ▬<Route path='/creator/create-post/audio' element={<CreateAudioPost/>}/>
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default App;