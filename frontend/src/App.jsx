import { Routes, Route } from 'react-router';
import HomePage from './components/HomePage';
import SignupPage from './pages/Signup';
import LoginPage from './pages/Login';
import Home from './pages/private/subscriber/Home';
import Explore from './pages/private/subscriber/Explore';
import Settings from './pages/private/subscriber/Settings';
import Notifications from './pages/private/subscriber/Notifications';
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
import RecommendationSearch from './pages/private/creator/recommendations/RecommendationsSearch';
import EditTextPost from './pages/private/creator/posts/EditTextPost';
import EditAudioPost from './pages/private/creator/posts/EditAudioPost ';
import EditVideoPost from './pages/private/creator/posts/EditVideoPost';
import CreatorPage from './components/creator/creatore-page/CreatorPage';
import PaymentSuccess from './pages/private/stripe/SuccessPage';
import PaymentCancel from './pages/private/stripe/CancelPage';
import Memberships from './pages/private/subscriber/Memberships';
import SubscriberHome from './pages/private/subscriber/SubscriberHome';
import SubscriberChat from './pages/private/subscriber/SubscriberChat';
import CreatorChats from './pages/private/creator/CreatorChats';

const App = () => {

  return (
    <Routes>
      
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/c/:creatorUrl/*" element={<CreatorPage/>}/>
       <Route path="/payment/success" element={<PaymentSuccess />} />
       <Route path="/payment/cancel" element={<PaymentCancel />} />
      <Route element={<ProtectedRoutes />}>
        
        <Route path="/home" element={<Home />}>
          <Route index element={<SubscriberHome />} />
          <Route path="explore" element={<Explore />} />
          <Route path="chat" element={<SubscriberChat />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path='memberships' element={<Memberships/>}/>
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
            <Route path="messages" element={<CreatorChats />} />
            <Route path="settings" element={<Settings />} />
            <Route path='memberships/create' element={<CreateMemberShip />} />
            <Route path="memberships/:id/edit" element={<MembershipEditForm />} /> 
            <Route path='recommendations/create' element={<RecommendationSearch/>}/>
          <Route path="collections" element={<Collections />} />
          <Route path="collections/create" element={<CollectionCreationForm />} />
          <Route path="collections/:id/edit" element={<CollectionEditForm />} />
          <Route path='create-post/video' element={<CreateVideoPost/>}/>
          <Route path='posts/text/:postId/edit' element={<EditTextPost/>}/>
          <Route path='posts/audio/:id/edit' element={<EditAudioPost/>}/>
          <Route path='posts/video/:id/edit' element={<EditVideoPost/>}/>
          <Route path='create-post/text' element={<CreateTextPost/>}/>
          <Route path='create-post/audio' element={<CreateAudioPost/>}/>
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default App;