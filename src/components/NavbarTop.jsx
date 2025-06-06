import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaChevronDown, FaUser, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext'; 

const NavbarTop = ({ onHamburgerClick }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  // ✅ Context에서 사용자 정보 가져오기
  const { userInfo, logout, getHomePath, userType } = useUser();

  const toggleDropdown = () => setShowDropdown(prev => !prev);

  const handleLogout = () => {
    // ✅ Context의 logout 함수 사용
    logout();
    navigate('/');
  };

  const handleLogoClick = () => {
    // ✅ Context의 getHomePath 함수 사용
    navigate(getHomePath());
  };

  const getMypagePath = () => {
    switch(userType) {
      case 'advertiser':
        return '/advertiser/mypage';
      case 'publisher':
        return '/publisher/mypage';
      default:
        return '/';
    }
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  return (
    <Topbar>
      <Logo src="/logo2.svg" alt="Green Salary Logo" onClick={handleLogoClick} />
      <Hamburger onClick={onHamburgerClick} />

      <UserInfo onClick={toggleDropdown} ref={dropdownRef}>
        <UserText>
          {/* ✅ Context의 userInfo 사용 */}
          <span>{userInfo.name}</span>
          <span>{userInfo.email}</span>
        </UserText>
        <Chevron />
        {showDropdown && (
          <Dropdown>
            {userType !== 'admin' && (
              <DropdownItem onClick={() => navigate(getMypagePath())}>
                <FaUser /> 마이페이지
              </DropdownItem>
            )}
            <DropdownItem onClick={handleLogout}>
              <FaSignOutAlt /> 로그아웃
            </DropdownItem>
          </Dropdown>
        )}
      </UserInfo>
    </Topbar>
  );
};

export default NavbarTop;

const Topbar = styled.div`
  height: 60px;
  background-color: white;
  border-bottom: 1px solid #eee;
  padding: 0 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

const Logo = styled.img`
  height: 26px;

  @media (max-width: 768px) {
    height: 22px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
`;

const UserText = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 15px;
  text-align: left;
  position: relative;
  padding-left: 30px;

  &::before {
    content: '|';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    color: #CCC;
    font-size: 20px;
  }

  span:first-child {
    font-weight: bold;
    font-size: 14px;
    color: #333;
  }

  span:last-child {
    font-size: 12px;
    color: #888;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 48px;
  right: 0;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  width: 140px;
  padding: 10px 0;
  z-index: 999;
`;

const DropdownItem = styled.div`
  margin: 2px 2px;
  padding: 10px 13px;
  font-size: 14px;
  display: flex;
  align-items: center;
  color: ${({ active }) => (active ? '#1A1A1A' : '#CCC')};
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
  background-color: ${({ active }) => (active ? '#F5F8FB' : 'transparent')};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ active }) => (active ? '#F5F8FB' : '#f2f2f2')};
    color: #1A1A1A;
  }

  svg {
    margin-right: 8px;
    font-size: 16px;
  }
`;

const Chevron = styled(FaChevronDown)`
  color: #888;
  font-size: 14px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Hamburger = styled(FaBars)`
  display: none;
  font-size: 20px;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;