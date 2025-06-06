import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaChevronDown } from 'react-icons/fa';
import StatusBadge from '../../components/StatusBadge';
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

const SortSelect = styled.select`
  padding: 8px 12px;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const Dropdown = styled.div`
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  min-width: 120px;
  white-space: nowrap;
`;

const DropdownItem = styled.div`
  padding: 8px 12px;
  font-size: 13px;
  color: #333;
  cursor: pointer;

  &:hover {
    background-color: #f6f6f6;
  }
`;

const TableWrapper = styled.div`
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
`;

const ScrollBody = styled.div`
  max-height: calc(100vh - 220px);
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ddd;
    border-radius: 3px;
  }
`;

const FixedHeader = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: white;

  th {
    padding: 16px;
    font-size: 14px;
    color: #555;
    border-bottom: 1px solid #f0f0f0;
  }

  th:nth-child(1) {
    width: 80%;
    text-align: left;
  }
  th:nth-child(2) {
    width: 20%;
    text-align: center;
  }
`;

const BodyTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  td {
    padding: 16px;
    font-size: 14px;
    border-bottom: 1px solid #f0f0f0;
  }

  td:nth-child(1) {
    width: 80%;
    text-align: left;
    font-weight: bold;
    word-break: break-word;
  }

  td:nth-child(2) {
    width: 20%;
    text-align: center;
  }

  tr:hover {
    background-color: #f9f9f9;
    cursor: pointer;
  }
`;

const LoadingMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: #666;
  font-size: 14px;
`;

const ErrorMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: #ff4444;
  font-size: 14px;
`;

const EmptyMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: #666;
  font-size: 14px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 20px auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 상태 매핑 함수 (API 상태 -> 화면 표시용 상태)
const mapStatusForDisplay = (contract) => {
  const { status, rewardPaid } = contract;
  
  if (status === 'APPROVED' || rewardPaid === true) {
    return 'completed';
  } else if (status === 'PENDING' || status === 'REJECTED') {
    return 'incomplete';
  }
  
  return 'incomplete'; // 기본값
};

// 정렬 라벨 반환 함수
const getSortLabel = (sort) => {
  switch (sort) {
    case 'latest': return '최신순';
    case 'deadline': return '마감순';
    default: return '최신순';
  }
};

const InfluencerHome = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredStatus, setFilteredStatus] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('latest');
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  const dropdownRef = useRef(null);
  const filterToggleRef = useRef(null);
  const navigate = useNavigate();
  
  // UserContext에서 필요한 상태들 가져오기
  const { 
    authenticatedFetch, 
    isLoggedIn, 
    isLoading: userLoading,
    getToken 
  } = useUser();

  // 계약 목록 불러오기
  const fetchContracts = async (statusFilter = 'ALL', sortOrder = 'latest') => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📋 계약 목록 요청 시작...', `필터: ${statusFilter}, 정렬: ${sortOrder}`);
      console.log('🔑 현재 토큰 상태:', getToken() ? '토큰 존재' : '토큰 없음');
      
      // URL 파라미터로 필터와 정렬 전달
      let url = `${API_BASE_URL}/influencer/contract?sort=${sortOrder}`;
      if (statusFilter !== 'ALL') {
        url += `&status=${statusFilter}`;
      }
      
      console.log('📋 요청 URL:', url);
      
      const response = await authenticatedFetch(url);
      
      console.log('📋 응답 상태:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || '계약 목록을 불러오는데 실패했습니다.'}`);
      }
      
      const data = await response.json();
      console.log('📋 계약 목록 원본 데이터:', data);
      
      const contractsArray = data.contracts || [];
      
      const mappedContracts = contractsArray.map(contract => ({
        id: contract.contractId || contract.id,
        name: contract.title,
        status: mapStatusForDisplay(contract), // 상태 매핑
        rawData: contract 
      }));
      
      console.log('📋 매핑된 데이터:', mappedContracts);
      setContracts(mappedContracts);
      console.log('✅ 계약 목록 로드 완료:', mappedContracts.length, '개');
      
      setHasLoadedOnce(true); 
      
    } catch (err) {
      console.error('🚨 계약 목록 불러오기 실패:', err);
      
      if (err.message.includes('로그인이 만료') || err.message.includes('401')) {
        setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔍 UserContext 상태 확인:', {
      userLoading,
      isLoggedIn,
      hasToken: !!getToken(),
      hasLoadedOnce
    });
    
    if (hasLoadedOnce) {
      console.log('⚠️ 이미 로드 완료, 중복 요청 방지');
      return;
    }
    
    if (!userLoading && isLoggedIn && getToken()) {
      console.log('✅ 로그인 확인됨, 계약 목록 요청 시작');
      fetchContracts('ALL', sortOrder);
       
    } else if (!userLoading && !isLoggedIn) {
      console.log('❌ 로그인되지 않음');
      setError('로그인이 필요합니다.');
      setIsLoading(false);
    } else {
      console.log('⏳ 사용자 상태 확인 중...');
    }
  }, [userLoading, isLoggedIn]); 

  // 외부 클릭시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 필터 선택 핸들러
  const handleFilterSelect = (status) => {
    console.log('🔍 필터 선택:', status);
    setFilteredStatus(status);
    setShowDropdown(false);
    
    fetchContracts(status, sortOrder);
  };

  const handleSortSelect = (e) => {
    const value = e.target.value;
    setSortOrder(value);
    fetchContracts(filteredStatus, value);
  };

  // 필터 토글 클릭 핸들러
  const handleFilterToggleClick = () => {
    if (filterToggleRef.current) {
      const rect = filterToggleRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX
      });
    }
    setShowDropdown(prev => !prev);
  };

  // 계약 상세 페이지로 이동
  const handleRowClick = (contractId) => {
    navigate(`/publisher/detail/${contractId}`);
  };

  // 사용자 로딩 중일 때
  if (userLoading) {
    return (
      <Container>
        <Title>계약 내역</Title>
        <TableWrapper>
          <LoadingSpinner/>
        </TableWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>계약 내역</Title>
        <SortSelect value={sortOrder} onChange={handleSortSelect}>
          <option value="latest">최신순</option>
          <option value="deadline">마감순</option>
        </SortSelect>
      </Header>

      <TableWrapper>
        <FixedHeader>
          <thead>
            <tr>
              <th>광고명</th>
              <th>상태</th>
            </tr>
          </thead>
        </FixedHeader>
        
        <ScrollBody>
          <BodyTable>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="2">
                    <LoadingMessage>계약 목록을 불러오는 중...</LoadingMessage>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="2">
                    <ErrorMessage>
                      {error}
                      <br />
                      <button 
                        onClick={() => fetchContracts('ALL', sortOrder)}
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
                  </td>
                </tr>
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan="2">
                    <EmptyMessage>등록된 계약이 없습니다.</EmptyMessage>
                  </td>
                </tr>
              ) : (
                contracts.map((contract, index) => (
                  <tr key={`${contract.id}-${index}`} onClick={() => handleRowClick(contract.id)}>
                    <td>{contract.name}</td>
                    <td><StatusBadge status={contract.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </BodyTable>
        </ScrollBody>
      </TableWrapper>

      {/* 상태 필터 드롭다운 */}
      {showDropdown && (
        <Dropdown 
          ref={dropdownRef}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          <DropdownItem onClick={() => handleFilterSelect('ALL')}>전체</DropdownItem>
          <DropdownItem onClick={() => handleFilterSelect('PENDING')}>대기중</DropdownItem>
          <DropdownItem onClick={() => handleFilterSelect('APPROVED')}>완료</DropdownItem>
          <DropdownItem onClick={() => handleFilterSelect('REJECTED')}>거절</DropdownItem>
        </Dropdown>
      )}
    </Container>
  );
};

export default InfluencerHome;