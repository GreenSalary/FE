// src/pages/Admin/AdminList.jsx
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 100px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: bold;
  color: #333;
`;

const SortSelect = styled.select`
  padding: 8px 20px;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #667eea;
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
    font-weight: 600;
  }

  th:nth-child(1) {
    width: 40%;
    text-align: left;
  }
  
  th:nth-child(2) {
    width: 20%;
    text-align: center;
  }
  
  th:nth-child(3) {
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
    overflow: hidden;
    text-overflow: ellipsis;
  }

  td:nth-child(1) {
    width: 40%;
    font-weight: bold;
    text-align: left;
    white-space: normal;
    word-break: break-word;
  }

  td:nth-child(2),
  td:nth-child(3){
    width: 20%;
    text-align: center;
    white-space: nowrap;
  }

  tr:hover {
    background-color: #f9f9f9;
    cursor: pointer;
  }
`;

const FilterToggle = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  justify-content: center;
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
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 20px auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AdminList = () => {
  const navigate = useNavigate();
  const { authenticatedFetch } = useUser();
  
  const [askList, setAskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('latest');
  const [askerFilter, setAskerFilter] = useState('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  const dropdownRef = useRef(null);
  const filterToggleRef = useRef(null);

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\./g, '.').replace(/\s/g, '');
  };

  // 상태에서 신청자 역할 추출 함수
  const getRoleFromStatus = (status) => {
    switch (status) {
      case 'REVIEW_FROM_ADV':
        return '광고주';
      case 'REVIEW_FROM_INF':
        return '인플루언서';
      default:
        return '-';
    }
  };

  // 상태 텍스트 변환 함수
  const getStatusText = (status) => {
    switch (status) {
      case 'REVIEW_FROM_ADV':
        return '광고주 검토중';
      case 'REVIEW_FROM_INF':
        return '인플루언서 검토중';
      default:
        return status;
    }
  };

  // API 호출 함수
  const fetchAskList = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 관리자 목록 요청 시작...', `필터: ${askerFilter}, 정렬: ${sortOrder}`);
      
      const queryParams = new URLSearchParams();
      if (sortOrder !== 'latest') queryParams.append('sort', sortOrder);
      if (askerFilter !== 'all') queryParams.append('asker', askerFilter);
      
      const url = `${API_BASE_URL}/admin/ask${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('📋 요청 URL:', url);
      
      const response = await authenticatedFetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ 관리자 목록 조회 성공:', data);
      
      setAskList(data.data || []);
      
    } catch (err) {
      console.error('❌ 관리자 목록 조회 실패:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchAskList();
  }, []);

  // 필터나 정렬 변경 시 데이터 다시 로드
  useEffect(() => {
    fetchAskList();
  }, [sortOrder, askerFilter]);

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

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const handleRowClick = (askId, reviewStatus) => {
    navigate(`/admin/home/detail/${askId}`, {
      state: { reviewStatus } 
    });
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

  // 필터 선택 핸들러
  const handleFilterSelect = (filter) => {
    console.log('🔍 필터 선택:', filter);
    setAskerFilter(filter);
    setShowDropdown(false);
  };

  return (
    <Container>
      <Header>
        <Title>검토 대기 목록</Title>
        <SortSelect value={sortOrder} onChange={handleSortChange}>
          <option value="latest">최신순</option>
          <option value="oldest">오래된순</option>
        </SortSelect>
      </Header>

      <TableWrapper>
        <FixedHeader>
          <thead>
            <tr>
              <th>광고명</th>
              <th>검토 마감일</th>
              <th>
                <FilterToggle 
                  ref={filterToggleRef}
                  onClick={handleFilterToggleClick}
                >
                  신청자 역할 <FaChevronDown size={12} color="#888" />
                </FilterToggle>
              </th>
            </tr>
          </thead>
        </FixedHeader>
        
        <ScrollBody>
          <BodyTable>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4">
                    <LoadingSpinner />
                    <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4">
                    <ErrorMessage>
                      오류가 발생했습니다: {error}
                      <br />
                      <button 
                        onClick={fetchAskList}
                        style={{
                          marginTop: '10px',
                          padding: '8px 16px',
                          backgroundColor: '#667eea',
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
              ) : askList.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    <EmptyMessage>
                      {askerFilter === 'all' 
                        ? '검토 대기 중인 문의가 없습니다.' 
                        : `${askerFilter === 'advertiser' ? '광고주' : '인플루언서'}의 문의가 없습니다.`
                      }
                    </EmptyMessage>
                  </td>
                </tr>
              ) : (
                askList.map((ask) => (
                  <tr key={ask.askId} onClick={() => handleRowClick(ask.askId, ask.review_status)}>
                    <td>{ask.title}</td>
                    <td>{formatDate(ask.due_date)}</td>
                    <td>{getRoleFromStatus(ask.review_status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </BodyTable>
        </ScrollBody>
      </TableWrapper>

      {/* 신청자 역할 필터 드롭다운 */}
      {showDropdown && (
        <Dropdown 
          ref={dropdownRef}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          <DropdownItem onClick={() => handleFilterSelect('all')}>전체</DropdownItem>
          <DropdownItem onClick={() => handleFilterSelect('advertiser')}>광고주</DropdownItem>
          <DropdownItem onClick={() => handleFilterSelect('influencer')}>인플루언서</DropdownItem>
        </Dropdown>
      )}
    </Container>
  );
};

export default AdminList;