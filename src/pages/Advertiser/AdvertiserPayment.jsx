import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '../../contexts/UserContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: bold;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SortSelect = styled.select`
  padding: 8px 20px;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  background-color: white;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const HeaderTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  background-color: white;
`;

const ScrollBody = styled.div`
  overflow-y: auto;
  max-height: calc(100vh - 220px);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ddd;
    border-radius: 3px;
  }
`;

const BodyTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

const Colgroup = styled.colgroup`
  col:nth-child(1) {
    width: 50%;
  }
  col:nth-child(2) {
    width: 25%;
  }
  col:nth-child(3) {
    width: 25%;
  }
`;

const TableHeader = styled.thead`
  position: sticky;
  top: 0;
  z-index: 1;
`;

const TableBody = styled.tbody``;

const HeaderRow = styled.tr``;

const Tr = styled.tr`
  &:last-child td {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const Th = styled.th`
  padding: 16px;
  font-size: 14px;
  font-weight: bold;
  border-bottom: 1px solid #eee;
  color: #333;

  &:nth-child(1) {
    text-align: left;
  }
  &:nth-child(2) {
    text-align: center;
  }
  &:nth-child(3) {
    text-align: center;
  }
`;

const Td = styled.td`
  padding: 16px;
  font-size: 14px;
  border-bottom: 1px solid #eee;
  word-break: break-word;
  white-space: normal;

  &:nth-child(1) {
    text-align: left;
  }
  &:nth-child(2) {
    text-align: center;
  }
  &:nth-child(3) {
    text-align: center;
  }
`;

const LoadingMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: #666;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const ErrorMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: #ff4444;
  font-size: 14px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: #999;
  font-size: 14px;
`;

// 날짜 포맷팅 함수
const formatDateTime = (dateString) => {
  if (!dateString) return '';
  
  // Z를 제거해서 로컬 시간으로 처리
  const localDateString = dateString.replace('Z', '');
  const date = new Date(localDateString);
  
  return date.toLocaleString('ko-KR');
};

// 금액 포맷팅 함수 (ETH)
const formatAmount = (amount) => {
  if (!amount) return '0 ETH';
  // 숫자로 변환 (소수점 포함)
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // ETH는 보통 소수점 4자리까지 표시
  return numAmount.toLocaleString('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8
  }) + ' ETH';
};

const AdvertiserPayment = () => {
  const { adId } = useParams(); // URL에서 adId 가져오기
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('latest'); // 정렬 상태 추가
  
  const { authenticatedFetch, isLoggedIn, getToken } = useUser();

  // 거래 내역 가져오기
  const fetchTransactions = async (sortOrder = 'latest') => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('💰 거래 내역 요청:', adId, '정렬:', sortOrder);
      
      // API 파라미터 구성
      const params = new URLSearchParams();
      params.append('sort', sortOrder);
      
      const apiUrl = `${API_BASE_URL}/advertiser/contract/${adId}/transactions?${params.toString()}`;
      
      const response = await authenticatedFetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || '거래 내역을 불러오는데 실패했습니다.'}`);
      }
      
      const data = await response.json();
      console.log('💰 거래 내역 데이터:', data);
      
      setTransactions(data || []);
      
    } catch (err) {
      console.error('🚨 거래 내역 불러오기 실패:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adId && isLoggedIn && getToken()) {
      fetchTransactions(sort);
    } else if (!isLoggedIn) {
      setError('로그인이 필요합니다.');
      setIsLoading(false);
    }
  }, [adId, isLoggedIn]);

  // 정렬 변경 시 새로운 데이터 요청
  const handleSortChange = (newSort) => {
    setSort(newSort);
    if (adId && isLoggedIn && getToken()) {
      fetchTransactions(newSort);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Header>
          <Title>지불 내역</Title>
          <HeaderRight>
            <SortSelect value={sort} onChange={(e) => handleSortChange(e.target.value)}>
              <option value="latest">최신순</option>
              <option value="oldest">오래된순</option>
            </SortSelect>
          </HeaderRight>
        </Header>
        
        <TableContainer>
          {/* 고정 헤더 */}
          <HeaderTable>
            <Colgroup />
            <TableHeader>
              <HeaderRow>
                <Th>이름</Th>
                <Th>입금시간</Th>
                <Th>보수 (ETH)</Th>
              </HeaderRow>
            </TableHeader>
          </HeaderTable>

          {/* 스크롤 가능한 바디 */}
          <ScrollBody>
            <BodyTable>
              <Colgroup />
              <TableBody>
                <tr>
                  <td colSpan="3">
                    <LoadingMessage>
                      <LoadingSpinner />
                      거래 내역을 불러오는 중...
                    </LoadingMessage>
                  </td>
                </tr>
              </TableBody>
            </BodyTable>
          </ScrollBody>
        </TableContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>지불 내역</Title>
          <HeaderRight>
            <SortSelect value={sort} onChange={(e) => handleSortChange(e.target.value)}>
              <option value="latest">최신순</option>
              <option value="oldest">오래된순</option>
            </SortSelect>
          </HeaderRight>
        </Header>
        <TableContainer>
          <ErrorMessage>
            {error}
            <br />
            <button 
              onClick={() => fetchTransactions(sort)}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              다시 시도
            </button>
          </ErrorMessage>
        </TableContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>지불 내역</Title>
        <HeaderRight>
          <SortSelect value={sort} onChange={(e) => handleSortChange(e.target.value)}>
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
          </SortSelect>
        </HeaderRight>
      </Header>
      
      <TableContainer>
        {/* 고정 헤더 */}
        <HeaderTable>
          <Colgroup />
          <TableHeader>
            <HeaderRow>
              <Th>이름</Th>
              <Th>입금시간</Th>
              <Th>보수 (ETH)</Th>
            </HeaderRow>
          </TableHeader>
        </HeaderTable>

        {/* 스크롤 가능한 바디 */}
        <ScrollBody>
          <BodyTable>
            <Colgroup />
            <TableBody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="3">
                    <EmptyMessage>아직 결제된 거래가 없습니다.</EmptyMessage>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction, index) => (
                  <Tr key={`${transaction.influencer_name}-${transaction.paid_at}-${index}`}>
                    <Td>{transaction.influencer_name}</Td>
                    <Td>{formatDateTime(transaction.paid_at)}</Td>
                    <Td>{formatAmount(transaction.amount)}</Td>
                  </Tr>
                ))
              )}
            </TableBody>
          </BodyTable>
        </ScrollBody>
      </TableContainer>
    </Container>
  );
};

export default AdvertiserPayment;