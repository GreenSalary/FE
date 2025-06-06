// src/pages/Admin/AdminList.jsx
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const dummyAds = [
  { id: 1, title: '촉촉한 아기 물티슈 리뷰', deadline: '2025-06-05 00:00:00', applicant: 'gwanggoju@naver.com', role: '광고주' },
  { id: 2, title: '친환경 설거지 비누 체험단', deadline: '2025-06-05 00:00:00', applicant: 'greenbiz@naver.com', role: '인플루언서' },
  { id: 1, title: '촉촉한 아기 물티슈 리뷰', deadline: '2025-06-05 00:00:00', applicant: 'gwanggoju@naver.com', role: '광고주' },
  { id: 1, title: '촉촉한 아기 물티슈 리뷰', deadline: '2025-06-05 00:00:00', applicant: 'gwanggoju@naver.com', role: '인플루언서' },
  { id: 2, title: '친환경 설거지 비누 체험단', deadline: '2025-06-05 00:00:00', applicant: 'greenbiz@naver.com', role: '광고주' },
  { id: 1, title: '촉촉한 아기 물티슈 리뷰', deadline: '2025-06-05 00:00:00', applicant: 'gwanggoju@naver.com', role: '인플루언서' },
  { id: 1, title: '촉촉한 아기 물티슈 리뷰', deadline: '2025-06-05 00:00:00', applicant: 'gwanggoju@naver.com', role: '광고주' },
  { id: 2, title: '친환경 설거지 비누 체험단', deadline: '2025-06-05 00:00:00', applicant: 'greenbiz@naver.com', role: '인플루언서' },
  { id: 1, title: '촉촉한 아기 물티슈 리뷰', deadline: '2025-06-05 00:00:00', applicant: 'gwanggoju@naver.com', role: '광고주' },
  { id: 1, title: '촉촉한 아기 물티슈 리뷰', deadline: '2025-06-05 00:00:00', applicant: 'gwanggoju@naver.com', role: '인플루언서' },
  { id: 2, title: '친환경 설거지 비누 체험단', deadline: '2025-06-05 00:00:00', applicant: 'greenbiz@naver.com', role: '광고주' },
  { id: 1, title: '촉촉한 아기 물티슈 리뷰', deadline: '2025-06-05 00:00:00', applicant: 'gwanggoju@naver.com', role: '인플루언서' },
  { id: 1, title: '촉촉한 아기 물티슈 리뷰', deadline: '2025-06-05 00:00:00', applicant: 'gwanggoju@naver.com', role: '광고주' },
  { id: 2, title: '친환경 설거지 비누 체험단', deadline: '2025-06-05 00:00:00', applicant: 'greenbiz@naver.com', role: '광고주' },
  { id: 1, title: '촉촉한 아기 물티슈 리뷰', deadline: '2025-06-05 00:00:00', applicant: 'gwanggoju@naver.com', role: '광고주' },
  { id: 1, title: '촉촉한 아기 물티슈 리뷰', deadline: '2025-06-05 00:00:00', applicant: 'gwanggoju@naver.com', role: '광고주' },
  { id: 2, title: '친환경 설거지 비누 체험단', deadline: '2025-06-05 00:00:00', applicant: 'greenbiz@naver.com', role: '광고주' },
  { id: 1, title: '촉촉한 아기 물티슈 리뷰', deadline: '2025-06-05 00:00:00', applicant: 'gwanggoju@naver.com', role: '광고주' },
  { id: 1, title: '촉촉한 아기 물티슈 리뷰', deadline: '2025-06-05 00:00:00', applicant: 'gwanggoju@naver.com', role: '광고주' },
  { id: 2, title: '친환경 설거지 비누 체험단', deadline: '2025-06-05 00:00:00', applicant: 'greenbiz@naver.com', role: '광고주' },
  { id: 1, title: '촉촉한 아기 물티슈 리뷰', deadline: '2025-06-05 00:00:00', applicant: 'gwanggoju@naver.com', role: '광고주' },
];

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 960px;
  margin: 0 auto;
`;

const TableContainer = styled.div`
  border-radius: 10px;
  background-color: white;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const TableHead = styled.div`
  background-color: white;
  display: grid;
  grid-template-columns: 40% 20% 20% 20%;
  padding: 14px 24px;
  font-weight: 600;
  font-size: 13px;
  color: #555;
  border-bottom: 1px solid #f0f0f0;
`;

const ScrollBody = styled.div`
  max-height: calc(100vh - 150px);
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 3px;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 40% 20% 20% 20%;
  padding: 12px 24px;
  font-size: 13px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f9f9f9;
    cursor: pointer;
  }
`;

const AdminList = () => {
  const navigate = useNavigate();

  const handleRowClick = (adId) => {
    navigate(`/admin/${adId}`);
  };

  return (
    <Wrapper>
      <TableContainer>
        <TableHead>
          <div>광고명</div>
          <div style={{ textAlign: 'center' }}>검토 마감일</div>
          <div style={{ textAlign: 'center' }}>신청자 역할</div>
          <div style={{ textAlign: 'center' }}>신청자 이메일</div>
        </TableHead>
        <ScrollBody>
          {dummyAds.map(ad => (
            <TableRow key={ad.id} onClick={() => handleRowClick(ad.id)}>
              <div>{ad.title}</div>
              <div style={{ textAlign: 'center' }}>{ad.deadline}</div>
              <div style={{ textAlign: 'center' }}>{ad.role}</div>
              <div style={{ textAlign: 'center' }}>{ad.applicant}</div>
            </TableRow>
          ))}
        </ScrollBody>
      </TableContainer>
    </Wrapper>
  );
};

export default AdminList;
