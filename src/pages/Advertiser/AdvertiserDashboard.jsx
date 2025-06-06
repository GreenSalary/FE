import React, { useState } from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import NavbarTop from '../../components/NavbarTop';
import NavbarLeft from '../../components/NavbarLeft';
import { Outlet } from 'react-router-dom';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #F5F8FB;
`;

const MainArea = styled.div`
  display: flex;
  flex: 1;
  height: calc(100vh - 100px);
  gap: 20px;
`;

const SidebarWrapper = styled.div`
  width: 180px;
  background-color: white;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    display: none; 
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 5px 20px;
  overflow-y: auto;
`;

const MobileSidebar = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  height: 100vh;
  background-color: white;
  z-index: 1000;
  padding: 10px 0;

  @keyframes slideIn {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 999;
  @media (min-width: 769px) {
    display: none;
  }
`;


const AdvertiserDashboard = ({ userType }) => {
  const { pathname } = useLocation();

  const isDetail = pathname.includes('/advertiser/detail/')
  || pathname.includes('/advertiser/members/')
  || pathname.includes('/advertiser/payment/');
  const isMypage = pathname.includes('/advertiser/mypage');

  return (
    <PageContainer>
      <NavbarTop/>
      <MainArea>
        <SidebarWrapper>
          <NavbarLeft detailMode={isDetail} />
        </SidebarWrapper>
        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainArea>
    </PageContainer>
  );
};

export default AdvertiserDashboard;