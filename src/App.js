// App.js - ProtectedRoute가 적용된 완전한 버전
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

import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminList from './pages/Admin/AdminList';
import AdminDetail from './pages/Admin/AdminDetail';

// ProtectedRoute 컴포넌트
const ProtectedRoute = ({ children, allowedUserTypes }) => {
  const { userType, isLoggedIn, isLoading } = useUser();

  // 로딩 중이면 로딩 표시
  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  // 로그인하지 않았으면 홈으로 리다이렉트
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // 허용된 사용자 타입이 아니면 해당 사용자의 홈으로 리다이렉트
  if (!allowedUserTypes.includes(userType)) {
    if (userType === 'advertiser') return <Navigate to="/advertiser/home" replace />;
    if (userType === 'influencer') return <Navigate to="/influencer/home" replace />;
    if (userType === 'admin') return <Navigate to="/admin/home" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

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

      {/* Advertiser Routes - advertiser만 접근 가능 */}
      <Route path="/advertiser" element={
        <ProtectedRoute allowedUserTypes={['advertiser']}>
          <AdvertiserDashboard />
        </ProtectedRoute>
      }>
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

      {/* Influencer Routes - influencer만 접근 가능 */}
      <Route path="/influencer" element={
        <ProtectedRoute allowedUserTypes={['influencer']}>
          <PublisherDashboard />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<PublisherHome />} />
        <Route path="join" element={<PublisherJoin />} />
        <Route path="detail/:adId" element={<PublisherDetail />} />
        <Route path="mypage" element={<Mypage />} />
        <Route path="mypage/edit" element={<EditInfo />} />
        <Route path="mypage/changepwd" element={<ChangePwd />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLogin />} />
      
      {/* Admin Dashboard Routes - admin만 접근 가능 */}
      <Route path="/admin/home" element={
        <ProtectedRoute allowedUserTypes={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      }>
        <Route index element={<AdminList />} />
        <Route path="detail/:askId" element={<AdminDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;