import React from 'react';
import styled from 'styled-components';
import {
  FaHome, FaClipboardList, FaCreditCard,
  FaUser, FaSignOutAlt, FaPlus
} from 'react-icons/fa';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext'; 

const iconMap = {
  home: { icon: <FaHome />, label: '홈', path: 'home' },
  detail: { icon: <FaHome />, label: '홈', path: 'detail' },
  members: { icon: <FaClipboardList />, label: '광고 현황', path: 'members' },
  payment: { icon: <FaCreditCard />, label: '지불 내역', path: 'payment' },
  join: { icon: <FaPlus />, label: '계약 추가', path: 'join' },
  create: { icon: <FaPlus />, label: '계약 추가', path: 'create' },
  mypage: { icon: <FaUser />, label: '마이페이지', path: 'mypage' },
  logout: { icon: <FaSignOutAlt />, label: '로그아웃' },
};

// ✅ userType prop 제거, detailMode는 유지
const NavbarLeft = ({ detailMode = false }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { adId } = useParams();
  
  // ✅ Context에서 사용자 정보 가져오기
  const { userType, logout } = useUser();

  const getActiveId = () => {
    const [, role, route, param] = pathname.split('/');
    if (route === 'mypage') return 'mypage';
    if (route === 'create') return 'create';
    if (route === 'join') return 'join';
    if (route === 'detail') return 'detail';
    if (route === 'members') return 'members';
    if (route === 'payment') return 'payment';
    return 'home';
  };

  const activeId = getActiveId();

  let visibleTopIcons = [];
  if (detailMode) {
    if (userType === 'advertiser') {
      visibleTopIcons = ['detail', 'members', 'payment'];
    } else if (userType === 'publisher') {
      visibleTopIcons = ['detail'];
    }
  } else {
    if (userType === 'advertiser') {
      visibleTopIcons = ['home', 'create'];
    } else if (userType === 'publisher') {
      visibleTopIcons = ['home', 'join'];
    }
  }

  const visibleBottomIcons = ['mypage', 'logout'];

  const handleNavigation = (id) => {
    if (id === 'logout') {
      // ✅ Context의 logout 함수 사용
      logout();
      navigate('/');
    } else {
      // 광고 관련 detailMode 경로는 모두 adId가 필요함
      const needsAdId = ['detail', 'members', 'payment'].includes(id);
      if (needsAdId && detailMode) {
        if (!adId) {
          alert('광고 ID가 없습니다.');
          return;
        }
        navigate(`/${userType}/${iconMap[id].path}/${adId}`);
      } else {
        navigate(`/${userType}/${iconMap[id].path}`);
      }
    }
  };
  
  return (
    <Sidebar>
      <TopIcons>
        {visibleTopIcons.map(id => (
          <IconButton
            key={id}
            active={activeId === id}
            onClick={() => handleNavigation(id)}
          >
            {iconMap[id].icon} {iconMap[id].label}
          </IconButton>
        ))}
      </TopIcons>
      <BottomIcons>
        {visibleBottomIcons.map(id => (
          <IconButton
            key={id}
            active={activeId === id}
            onClick={() => handleNavigation(id)}
          >
            {iconMap[id].icon} {iconMap[id].label}
          </IconButton>
        ))}
      </BottomIcons>
    </Sidebar>
  );
};

export default NavbarLeft;

const Sidebar = styled.div`
  width: 180px;
  height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 0;
  border-radius: 20px;
`;

const TopIcons = styled.div`
  display: flex;
  flex-direction: column;
`;

const BottomIcons = styled.div`
  display: flex;
  flex-direction: column;
`;

const IconButton = styled.button`
  width: 170px;  
  height: 40px;
  background: ${({ active }) => (active ? '#F5F8FB' : 'transparent')};
  border: none;
  display: flex;
  align-items: center;
  padding-left: 16px;
  border-radius: 12px;
  gap: 10px;
  font-size: 14px;
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
  color: ${({ active }) => (active ? 'var(--color-primary)' : '#ccc')};
  cursor: pointer;
  margin-bottom: 8px;

  &:hover {
    background-color: rgba(0, 203, 164, 0.05);
    color: var(--color-primary);
  }
`;