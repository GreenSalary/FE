import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaChevronDown, FaEllipsisV } from 'react-icons/fa';
import styled from 'styled-components';
import { useUser } from '../../contexts/UserContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdvertiserMembers = () => {
  const { adId } = useParams();
  const [openDescriptionId, setOpenDescriptionId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  
  const { authenticatedFetch, isLoggedIn, getToken } = useUser();

  // 인플루언서 목록 가져오기
  const fetchInfluencers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📋 인플루언서 목록 요청:', adId);
      console.log('📋 API URL:', `${API_BASE_URL}/advertiser/contract/${adId}/influencers`);
      console.log('📋 인증 토큰 존재:', !!getToken());
      
      const response = await authenticatedFetch(`${API_BASE_URL}/advertiser/contract/${adId}/influencers`);
      
      console.log('📋 응답 상태:', response.status);
      console.log('📋 응답 헤더:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('📋 응답 에러 데이터:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData.message || '인플루언서 정보를 불러오는데 실패했습니다.'}`);
      }
      
      const responseData = await response.json();
      console.log('📋 인플루언서 데이터:', responseData);
      
      // // 실제 API 데이터 대신 더미 데이터 사용
      // const dummyInfluencers = [
      //   // 승인됨, URL 제출됨, 리뷰 가능, 문의 가능, 입금 가능
      //   {
      //     joinId: 'dummy1',
      //     influencer_name: '인플루언서 A',
      //     review_status: 'approved',
      //     influencer_description: 'AI 통과, 승인된 상태',
      //     url: 'http://example.com',
      //     review_available: false,
      //     submit_review_available: false,
      //     submit_reward_available: true,
      //     keywordTest: true,
      //     conditionTest: true,
      //     reward_paid: false,
      //   },
        
      //   // 승인됨, URL 제출됨, 리뷰 가능, 문의 가능, 입금 가능(보상지급 이미 완료)
      //   {
      //     joinId: 'dummy2',
      //     influencer_name: '인플루언서 B',
      //     review_status: 'approved',
      //     influencer_description: 'AI 통과, 승인된 상태, 이미 입금 완료',
      //     url: 'http://example.com',
      //     review_available: true,
      //     submit_review_available: true,
      //     submit_reward_available: true,
      //     keywordTest: true,
      //     conditionTest: true,
      //     reward_paid: true,
      //   },

      //   // 거절됨, URL 제출됨, 리뷰 가능, 문의 불가능, 입금 가능
      //   {
      //     joinId: 'dummy3',
      //     influencer_name: '인플루언서 C',
      //     review_status: 'rejected',
      //     influencer_description: 'AI 불통과, 거절 상태',
      //     url: 'http://example.com',
      //     review_available: true,
      //     submit_review_available: false,
      //     submit_reward_available: true,
      //     keywordTest: false,
      //     conditionTest: false,
      //     reward_paid: false,
      //   },

      //   // 검토중, URL 제출됨, 리뷰 가능, 문의 불가능, 입금 불가능
      //   {
      //     joinId: 'dummy4',
      //     influencer_name: '인플루언서 D',
      //     review_status: 'pending',
      //     influencer_description: 'AI 검사 진행 중',
      //     url: 'http://example.com',
      //     review_available: true,
      //     submit_review_available: false,
      //     submit_reward_available: false,
      //     keywordTest: null,
      //     conditionTest: null,
      //     reward_paid: false,
      //   },

      //   // 검토중, URL 미제출, 리뷰 가능, 문의 불가능, 입금 불가능
      //   {
      //     joinId: 'dummy5',
      //     influencer_name: '인플루언서 E',
      //     review_status: 'pending',
      //     influencer_description: 'URL 미제출 상태',
      //     url: '',
      //     review_available: true,
      //     submit_review_available: false,
      //     submit_reward_available: false,
      //     keywordTest: null,
      //     conditionTest: null,
      //     reward_paid: false,
      //   },

      //   // 승인됨, URL 제출됨, 리뷰 불가능(기간 만료), 문의 불가능, 입금 불가능(기간 만료)
      //   {
      //     joinId: 'dummy6',
      //     influencer_name: '인플루언서 F',
      //     review_status: 'approved',
      //     influencer_description: '기간 만료로 문의 및 보상 불가능',
      //     url: 'http://example.com',
      //     review_available: false,
      //     submit_review_available: false,
      //     submit_reward_available: false,
      //     keywordTest: true,
      //     conditionTest: true,
      //     reward_paid: false,
      //   },
      // ];
      
      // setData({ influencers: dummyInfluencers });
      setData(responseData);
      
    } catch (err) {
      console.error('🚨 인플루언서 목록 불러오기 실패:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      console.log('📋 로딩 완료');
    }
  };

  useEffect(() => {
    console.log('🔍 useEffect 실행:', { adId, isLoggedIn, hasToken: !!getToken() });
    
    if (adId && isLoggedIn && getToken()) {
      fetchInfluencers();
    } else if (!isLoggedIn) {
      setError('로그인이 필요합니다.');
      setIsLoading(false);
    } else if (!adId) {
      setError('계약 ID가 필요합니다.');
      setIsLoading(false);
    } else if (!getToken()) {
      setError('인증 토큰이 없습니다.');
      setIsLoading(false);
    }
  }, [adId, isLoggedIn, getToken]);

  const toggleDescription = (id) => {
    setOpenDescriptionId(prev => (prev === id ? null : id));
  };

  const toggleMenu = (id) => {
    setOpenMenuId(prev => (prev === id ? null : id));
  };

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };
    
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  //문의버튼
  const handleInquiry = (influencer) => {
    console.log('문의하기:', influencer);
    alert(`${influencer.influencer_name}님에게 문의를 보냅니다.`);
  };

  //입금버튼
  const handlePayment = (influencer) => {
    console.log('입금하기:', influencer);
    alert(`${influencer.influencer_name}님에게 보상을 지급합니다.`);
  };

  const isRightEdgeCard = (index) => {
    const screenWidth = window.innerWidth;
    const columnsCount = screenWidth <= 1200 ? 3 : 6;
    return (index + 1) % columnsCount === 0;
  };

  const getFilteredInfluencers = () => {
    if (!data?.influencers) return [];
    
    switch (filter) {
      case 'submitted':
        return data.influencers.filter(inf => inf.url);
      case 'not_submitted':
        return data.influencers.filter(inf => !inf.url);
      case 'approved':
        return data.influencers.filter(inf => inf.review_status === 'approved');
      case 'rejected':
        return data.influencers.filter(inf => inf.review_status === 'rejected');
      case 'pending':
        return data.influencers.filter(inf => inf.review_status === 'pending');
      default:
        return data.influencers;
    }
  };

  const filteredInfluencers = getFilteredInfluencers();

  if (isLoading) {
    return (
      <Container>
        <LoadingMessage>
          <LoadingSpinner />
          인플루언서 정보를 불러오는 중...
          </LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>
          {error}
          <br />
          <button 
            onClick={fetchInfluencers}
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
      </Container>
    );
  }

  if (!data) {
    return (
      <Container>
        <ErrorMessage>인플루언서 정보를 찾을 수 없습니다.</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          광고 참여자 <span>{data.influencers?.length || 0}명</span>
        </Title>
        <FilterSelect value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">전체</option>
          <option value="submitted">링크 제출 완료</option>
          <option value="not_submitted">미제출</option>
          <option value="approved">승인됨</option>
          <option value="rejected">거절됨</option>
          <option value="pending">검토중</option>
        </FilterSelect>
      </Header>

      <Grid>
        {filteredInfluencers.map((influencer, index) => (
          <CardWrapper key={influencer.joinId}>
            <Card>
              <TopArea>
                <NameRow>
                  <NameContainer>
                    <StatusDot status={influencer.review_status} />
                    <InfluencerName title={influencer.influencer_name}>
                      {influencer.influencer_name}
                    </InfluencerName>
                  </NameContainer>
                  
                  <ButtonContainer>
                    {/* 입금 버튼 */}
                    {influencer.submit_reward_available && (
                      <PaymentButton onClick={() => handlePayment(influencer)}>
                        입금
                      </PaymentButton>
                    )}
                    
                    {/* 문의버튼튼 */}
                    {influencer.submit_review_available && (
                      <div style={{ position: 'relative' }}>
                        <MenuButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(influencer.joinId);
                          }}
                        >
                          <FaEllipsisV size={12} color="#666" />
                        </MenuButton>
                        
                        {openMenuId === influencer.joinId && (
                          <DropdownMenu>
                            <MenuItem onClick={() => {
                              handleInquiry(influencer);
                              setOpenMenuId(null);
                            }}>
                              문의
                            </MenuItem>
                          </DropdownMenu>
                        )}
                      </div>
                    )}
                  </ButtonContainer>
                </NameRow>
                
                <DescriptionToggle
                  active={openDescriptionId === influencer.joinId}
                  onClick={() => toggleDescription(influencer.joinId)}
                >
                  설명
                  <ChevronIcon active={openDescriptionId === influencer.joinId}>
                    <FaChevronDown size={12} color={openDescriptionId === influencer.joinId ? '#000' : '#888'} />
                  </ChevronIcon>
                </DescriptionToggle>
              </TopArea>

              <BottomArea disabled={!influencer.url}>
                <UrlButton
                  href={influencer.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  disabled={!influencer.url}
                >
                  {influencer.url ? 'url 바로가기' : '-'}
                </UrlButton>
              </BottomArea>
            </Card>
            
            {openDescriptionId === influencer.joinId && (
              <DescriptionBox isRightEdge={isRightEdgeCard(index)}>
                {influencer.influencer_description}
              </DescriptionBox>
            )}
          </CardWrapper>
        ))}
      </Grid>
      
      {data.influencers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          참여자가 없습니다.
        </div>
      ) : filteredInfluencers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          해당 조건에 맞는 참여자가 없습니다.
        </div>
      ) : null}
    </Container>
  );
};

export default AdvertiserMembers;

const Container = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: bold;

  span {
    font-size: 16px;
    font-weight: normal;
    margin-left: 8px;
  }
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  font-size: 14px;
  border: none;
  border-radius: 8px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Card = styled.div`
  background-color: #fff;
  border-radius: 20px;
  overflow: hidden; 
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 120px;
  padding: 0; 
`;

const TopArea = styled.div`
  padding: 16px;
`;

const CardWrapper = styled.div`
  position: relative;
`;

const BottomArea = styled.div`
  border-radius: 0 0 10px 10px;
  overflow: hidden;
  background-color: ${({ disabled }) => (disabled ? '#ddd' : '#e0f0ff')};
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const NameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0; 
`;

const InfluencerName = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px; 
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 80px;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background-color: #f0f0f0;
  }
  
  &:first-child {
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }
  
  &:last-child {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ status }) => {
    if (status === 'approved') return '#28a745'; // 승인 - 초록색
    if (status === 'rejected') return '#dc3545'; // 거절 - 빨간색    
    return '#6c757d'; // 대기 - 회색                              
  }};
`;

const DescriptionToggle = styled.div`
  font-size: 14px;
  color: ${({ active }) => (active ? '#000' : '#888')};
  cursor: pointer;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  user-select: none;
`;

const ChevronIcon = styled.div`
  display: flex;
  align-items: center;
`;

const DescriptionBox = styled.div`
  position: absolute;
  top: 40%;
  left: ${({ isRightEdge }) => (isRightEdge ? '-100px' : '-20px')};
  margin-top: 6px;
  background-color: rgb(162, 171, 180);
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.4;
  z-index: 10;
  min-width: 210px;
`;

const UrlButton = styled.a`
  display: block;
  text-align: center;
  padding: 10px;
  border-radius: 0;
  background-color: transparent;
  color: ${({ disabled }) => (disabled ? '#777' : '#0077cc')};
  font-weight: bold;
  font-size: 14px;
  text-decoration: none;
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
`;

const InquiryButton = styled.button`
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  color: #495057;
  cursor: pointer;
  
  &:hover {
    background-color: #e9ecef;
  }
`;

const PaymentButton = styled.button`
  font-weight: bold;
  background-color:rgb(158, 183, 164);
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  color: white;
  cursor: pointer;
  
  &:hover {
    background-color:rgb(121, 156, 128);
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

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;