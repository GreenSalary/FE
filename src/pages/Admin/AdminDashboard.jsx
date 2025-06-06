// src/pages/Admin/AdminDashboard.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarTop from '../../components/NavbarTop';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #F5F8FB;
  height: 100vh;
`;

const Main = styled.div`
  display: flex;
  flex: 1;
  height: calc(100vh - 100px);
  gap: 20px;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const AdminDashboard = () => {
  return (
    <Container>
      <NavbarTop userType="admin" />
      <Main>
        <Content>
          <Outlet />
        </Content>
      </Main>
    </Container>
  );
};

export default AdminDashboard;
