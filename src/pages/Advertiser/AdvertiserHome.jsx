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

const FilterToggle = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  justify-content: center;
`;

const Dropdown = styled.div`
  position: fixed; /* absolute 대신 fixed 사용 */
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  z-index: 1000; /* 높은 z-index */
  min-width: 120px;
  white-space: nowrap;
`;

const SortSelect = styled.select`
  padding: 8px 12px;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
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
    width: 50%;
    text-align: left;

    @media (max-width: 768px) {
      width: 32%;
    }
  }
  th:nth-child(2),
  th:nth-child(4) {
    width: 10%;
    text-align: center;

    @media (max-width: 768px) {
        display: none;
    }
  }

  th:nth-child(3) {
  text-align: center;

  @media (max-width: 768px) {
    width: 34%;
  }

  @media (min-width: 769px) {
    width: 10%;
  }
}

  th:nth-child(5) {
    width: 20%;
    text-align: center;
    position: relative;

    @media (max-width: 768px) {
      width: 34%;
    }
  }
`; 

const BodyTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  td {
    padding: 16px;
    font-size: 14px;
    border-bottom: 1px solid #f0f0f0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  td:nth-child(1) {
    width: 50%;
    font-weight: bold;
    text-align: left;
    white-space: nowrap;
    word-break: break-word;
    white-space: normal;
  }

  td:nth-child(2),
  td:nth-child(3),
  td:nth-child(4) {
    width: 10%;
    text-align: center;
    white-space: nowrap;
  }

  td:nth-child(5) {
    width: 20%;
    text-align: center;
    white-space: nowrap;
  }

  tr:hover {
    background-color: #f9f9f9;
    cursor: pointer;
  }
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

const MobileHidden = styled.td`
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileHiddenHeader = styled.th`
  @media (max-width: 768px) {
    display: none;
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

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\./g, '.').replace(/\s/g, '');
};

const AdvertiserHome = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredStatus, setFilteredStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('latest');
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 }); // 드롭다운 위치 상태 추가
  
  const dropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const filterToggleRef = useRef(null); // 필터 토글 ref 추가
  const navigate = useNavigate();

  const handleSortSelect = (e) => {
    const value = e.target.value;
    setSortOrder(value);
    fetchContracts(filteredStatus, value);
  };
  
  // UserContext에서 필요한 상태들 가져오기
  const { 
    authenticatedFetch, 
    isLoggedIn, 
    isLoading: userLoading,
    getToken 
  } = useUser();

  // 광고 목록 불러오기 (백엔드 필터링 사용)
  const fetchContracts = async (statusFilter = 'all', sortOrder = 'latest') => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📋 광고 목록 요청 시작...', `필터: ${statusFilter}, 정렬: ${sortOrder}`);
      console.log('🔑 현재 토큰 상태:', getToken() ? '토큰 존재' : '토큰 없음');
      
      // URL 파라미터로 필터와 정렬 전달
      let url = `${API_BASE_URL}/advertiser/contract?sort=${sortOrder}`;
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      
      console.log('📋 요청 URL:', url);
      console.log('📋 상태 필터:', statusFilter, '정렬:', sortOrder); // 파라미터 확인용
      
      const response = await authenticatedFetch(url);  //UserContext에서 정의
      
      console.log('📋 응답 상태:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || '광고 목록을 불러오는데 실패했습니다.'}`);
      }
      
      const data = await response.json();
      console.log('📋 광고 목록 원본 데이터:', data);
      
      const contractsArray = data.contracts || [];
      
      const mappedContracts = contractsArray.map(contract => ({
        id: contract.id,
        name: contract.title,
        start: formatDate(contract.uploadStartDate),
        end: formatDate(contract.uploadEndDate),
        members: `${contract.participants}/${contract.recruits}`, 
        status: contract.status, // 백엔드 상태를 그대로 사용
        rawData: contract 
      }));
      
      console.log('📋 매핑된 데이터:', mappedContracts);
      setContracts(mappedContracts);
      console.log('✅ 광고 목록 로드 완료:', mappedContracts.length, '개');
      
      setHasLoadedOnce(true); 
      
    } catch (err) {
      console.error('🚨 광고 목록 불러오기 실패:', err);
      
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
      console.log('✅ 로그인 확인됨, 광고 목록 요청 시작');
      fetchContracts('all', sortOrder);
       
    } else if (!userLoading && !isLoggedIn) {
      console.log('❌ 로그인되지 않음');
      setError('로그인이 필요합니다.');
      setIsLoading(false);
    } else {
      console.log('⏳ 사용자 상태 확인 중...');
    }
  }, [userLoading, isLoggedIn ]); 

  // 외부 클릭시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayedContracts = contracts; // 백엔드에서 이미 필터링된 데이터

  // 필터 선택 핸들러 (백엔드 요청)
  const handleFilterSelect = (status) => {
    console.log('🔍 필터 선택:', status);
    setFilteredStatus(status);
    setShowDropdown(false);
    
    fetchContracts(status, sortOrder);
  };

  // 필터 토글 클릭 핸들러 (위치 계산)
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

  // 정렬 라벨 반환 함수
  const getSortLabel = (sort) => {
    switch (sort) {
      case 'latest': return '최신순';
      case 'oldest': return '오래된순';
      default: return '최신순';
    }
  };

  // 광고 상세 페이지로 이동
  const handleRowClick = (contractId) => {
    navigate(`/advertiser/detail/${contractId}`);
  };

  // 사용자 로딩 중일 때
  if (userLoading) {
    return (
      <Container>
        <Title>계약 내역</Title>
        <TableWrapper>
          <LoadingSpinner/>
          {/* <LoadingMessage>사용자 정보를 확인하는 중...</LoadingMessage> */}
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
          <option value="oldest">오래된순</option>
        </SortSelect>
      </Header>

      <TableWrapper>
        <FixedHeader>
          <thead>
            <tr>
              <th>광고명</th>
              <MobileHiddenHeader>광고시작일</MobileHiddenHeader>
              <th>광고종료일</th>
              <MobileHiddenHeader>참여인원</MobileHiddenHeader>
              <th>
                <FilterToggle 
                  ref={filterToggleRef}
                  onClick={handleFilterToggleClick}
                >
                  상태 <FaChevronDown size={12} color="#888" />
                </FilterToggle>
              </th>
            </tr>
          </thead>
        </FixedHeader>
        
        <ScrollBody>
          <BodyTable>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5">
                    <LoadingMessage>광고 목록을 불러오는 중...</LoadingMessage>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5">
                    <ErrorMessage>
                      {error}
                      <br />
                      <button 
                        onClick={() => fetchContracts('all', sortOrder)}
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
              ) : displayedContracts.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <EmptyMessage>
                      {filteredStatus === 'all' ? '등록된 광고가 없습니다.' : '해당 상태의 광고가 없습니다.'}
                    </EmptyMessage>
                  </td>
                </tr>
              ) : (
                displayedContracts.map((contract, index) => (
                  <tr key={`${contract.id}-${index}`} onClick={() => handleRowClick(contract.id)}>
                    <td>{contract.name}</td>
                    <MobileHidden>{contract.start}</MobileHidden>
                    <td>{contract.end}</td>
                    <MobileHidden>{contract.members}</MobileHidden>
                    <td><StatusBadge status={contract.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </BodyTable>
        </ScrollBody>
      </TableWrapper>

      {/* 포탈을 사용하여 드롭다운을 body에 렌더링 */}
      {showDropdown && (
        <Dropdown 
          ref={dropdownRef}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          <DropdownItem onClick={() => handleFilterSelect('all')}>전체</DropdownItem>
          <DropdownItem onClick={() => handleFilterSelect('pending')}>대기중</DropdownItem>
          <DropdownItem onClick={() => handleFilterSelect('active')}>진행중</DropdownItem>
          <DropdownItem onClick={() => handleFilterSelect('ended')}>마감</DropdownItem>
        </Dropdown>
      )}
    </Container>
  );
};

export default AdvertiserHome;