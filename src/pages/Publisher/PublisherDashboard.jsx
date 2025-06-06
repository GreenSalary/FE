import React from 'react';
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
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 5px 20px;
  overflow-y: auto;
`;


const PublisherDashboard = ({ userType }) => {
  const { pathname } = useLocation();
  const isDetail = pathname.includes('/publisher/detail/');
  const isMypage = pathname.includes('/publisher/mypage');

  return (
    <PageContainer>
      <NavbarTop />
      <MainArea>
        <SidebarWrapper>
          <NavbarLeft detailMode={isDetail} mypageMode={isMypage} />
        </SidebarWrapper>
        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainArea>
    </PageContainer>
  );
};

export default PublisherDashboard;