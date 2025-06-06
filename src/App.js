// App.js - UserContext와 연결된 버전
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import AuthForm from './components/auth/AuthForm';

// Advertiser
import AdvertiserDashboard from './pages/Advertiser/AdvertiserDashboard';
import AdvertiserHome from './pages/Advertiser/AdvertiserHome';
import AdvertiserCreate from './pages/Advertiser/AdvertiserCreate';
import AdvertiserDetail from './pages/Advertiser/AdvertiserDetail';
import AdvertiserMembers from './pages/Advertiser/AdvertiserMembers';
import AdvertiserPayment from './pages/Advertiser/AdvertiserPayment';

// Publisher
import PublisherDashboard from './pages/Publisher/PublisherDashboard';
import PublisherHome from './pages/Publisher/PublisherHome';
import PublisherJoin from './pages/Publisher/PublisherJoin';
import PublisherDetail from './pages/Publisher/PublisherDetail';

// 마이페이지
import Mypage from './pages/Mypage/Mypage';
import EditInfo from './pages/Mypage/EditInfo';
import ChangePwd from './pages/Mypage/ChangePwd';

import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminList from './pages/Admin/AdminList';
import AdminDetail from './pages/Admin/AdminDetail';

const App = () => {
  return (
    <UserProvider> 
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
};

// UserContext를 사용하는 실제 앱 내용
const AppContent = () => {
  const { isLoggedIn, isLoading, getHomePath } = useUser();

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isLoggedIn ? (
            <Navigate to={getHomePath()} replace />
          ) : (
            <AuthForm /> 
          )
        } 
      />

      {/* Advertiser Routes */}
      <Route path="/advertiser" element={<AdvertiserDashboard />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<AdvertiserHome />} />
        <Route path="create" element={<AdvertiserCreate />} />
        <Route path="detail/:adId" element={<AdvertiserDetail />} />
        <Route path="members/:adId" element={<AdvertiserMembers />} />
        <Route path="payment/:adId" element={<AdvertiserPayment />} />
        <Route path="mypage" element={<Mypage />} />
        <Route path="mypage/edit" element={<EditInfo />} />
        <Route path="mypage/changepwd" element={<ChangePwd />} />
      </Route>

      {/* Publisher Routes */}
      <Route path="/publisher" element={<PublisherDashboard />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<PublisherHome />} />
        <Route path="join" element={<PublisherJoin />} />
        <Route path="detail/:adId" element={<PublisherDetail />} />
        <Route path="mypage" element={<Mypage />} />
        <Route path="mypage/edit" element={<EditInfo />} />
        <Route path="mypage/changepwd" element={<ChangePwd />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />}>
        <Route index element={<AdminList />} />                       
        <Route path=":adId" element={<AdminDetail />} />             
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;