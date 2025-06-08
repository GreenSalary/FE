import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import styled from 'styled-components';
import { useUser } from '../../contexts/UserContext';
import Web3 from 'web3';
import AdContract from '../../contracts/AdContract.json';


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdvertiserMembers = () => {
  const { adId } = useParams();
  const [openDescriptionId, setOpenDescriptionId] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, isRightSide: false });
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [selectedInfluencers, setSelectedInfluencers] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const [isPaying, setIsPaying] = useState(false);

  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  
  const { authenticatedFetch, isLoggedIn, getToken } = useUser();

  // 인플루언서 목록 가져오기 - 백엔드에서 필터링
  const fetchInfluencers = async (statusFilter = 'ALL') => {
    try {
      setIsLoading(true);
      setError(null);
      
      // API 파라미터 구성
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }
      // 기본 정렬은 latest
      params.append('sort', 'latest');
      
      const apiUrl = `${API_BASE_URL}/advertiser/contract/${adId}/influencers${params.toString() ? `?${params.toString()}` : ''}`;
      
      console.log('📋 인플루언서 목록 요청:', adId);
      console.log('📋 API URL:', apiUrl);
      console.log('📋 필터:', statusFilter);
      console.log('📋 인증 토큰 존재:', !!getToken());
      
      const response = await authenticatedFetch(apiUrl);
      
      console.log('📋 응답 상태:', response.status);
      console.log('📋 응답 헤더:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('📋 응답 에러 데이터:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData.message || '인플루언서 정보를 불러오는데 실패했습니다.'}`);
      }
      
      const responseData = await response.json();
      console.log('📋 인플루언서 데이터:', responseData);
      
      setData(responseData);
      
    } catch (err) {
      console.error('🚨 인플루언서 목록 불러오기 실패:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      console.log('📋 로딩 완료');
    }
  };

  // 💡 변경됨: useEffect로 Web3 초기화
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const providerUrl = process.env.REACT_APP_WEB3_PROVIDER_URL || 'http://127.0.0.1:8545';
        const networkId = process.env.REACT_APP_NETWORK_ID || '1337';
        const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || AdContract.networks[networkId]?.address;

        const web3Instance = new Web3(providerUrl);
        const contractInstance = new web3Instance.eth.Contract(AdContract.abi, contractAddress);

        setWeb3(web3Instance);
        setContract(contractInstance);

        console.log('✅ Web3 연결 완료');
      } catch (error) {
        console.error('🚨 Web3 초기화 실패:', error);
      }
    };

    initWeb3();
  }, []);


  // 초기 로드
  useEffect(() => {
    console.log('🔍 useEffect 실행:', { adId, isLoggedIn, hasToken: !!getToken() });
    
    if (adId && isLoggedIn && getToken()) {
      fetchInfluencers(filter);
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

  // 필터 변경 시 새로운 데이터 요청
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setSelectedInfluencers(new Set());
    setSelectAll(false);
    if (adId && isLoggedIn && getToken()) {
      fetchInfluencers(newFilter);
    }
  };

  const toggleDescription = (id, event) => {
    if (openDescriptionId === id) {
      setOpenDescriptionId(null);
    } else {
      setOpenDescriptionId(id);
      // 클릭한 버튼의 위치 저장
      const rect = event.currentTarget.getBoundingClientRect();
      const isRightSide = rect.left > window.innerWidth / 2;
      setTooltipPosition({
        top: rect.bottom + window.scrollY + 8,
        left: isRightSide ? rect.left + window.scrollX - 200 : rect.left + window.scrollX - 20,
        isRightSide: isRightSide
      });
    }
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedInfluencers(new Set());
    } else {
      const availableInfluencers = filteredInfluencers
        .filter(inf => inf.submit_reward_available)
        .map(inf => inf.joinId);
      setSelectedInfluencers(new Set(availableInfluencers));
    }
    setSelectAll(!selectAll);
  };

  // 개별 선택/해제
  const handleSelectInfluencer = (joinId) => {
    const newSelected = new Set(selectedInfluencers);
    if (newSelected.has(joinId)) {
      newSelected.delete(joinId);
    } else {
      newSelected.add(joinId);
    }
    setSelectedInfluencers(newSelected);
    
    // 전체 선택 상태 업데이트
    const availableInfluencers = filteredInfluencers
      .filter(inf => inf.submit_reward_available)
      .map(inf => inf.joinId);
    setSelectAll(availableInfluencers.length > 0 && availableInfluencers.every(id => newSelected.has(id)));
  };

  // 문의 버튼 처리
  const handleInquiry = async (influencer) => {
    const confirmed = window.confirm(`${influencer.influencer_name}님에 대한 문의를 보내시겠습니까?`);
    
    if (!confirmed) {
      return;
    }

    try {
      console.log('📧 문의 요청 시작:', influencer);
      
      const requestUrl = `${API_BASE_URL}/advertiser/ask/${influencer.joinId}`;

      const response = await authenticatedFetch(`${API_BASE_URL}/advertiser/ask/${influencer.joinId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
      // 🔥 response.clone()으로 스트림 복제
      let backendMessage = '알 수 없는 오류가 발생했습니다.';
      
      try {
        const errorData = await response.clone().json();
        backendMessage = errorData.message || backendMessage;
        
        console.error('🚨 백엔드 에러 응답:', errorData);
        console.error('📝 백엔드 에러 메시지:', backendMessage);
        
      } catch (parseError) {
        // JSON 파싱 실패시 텍스트로 응답 확인
        try {
          const responseText = await response.text();
          console.error('🚨 JSON 파싱 실패, 원본 응답:', responseText);
        } catch (textError) {
          console.error('🚨 응답 읽기 완전 실패:', textError);
        }
      }
      
      // 상태 코드별 처리
      if (response.status === 404) {
        console.error('🚨 404 에러 - 백엔드 메시지:', backendMessage);
        throw new Error(`404 Not Found: ${backendMessage}`);
      } else if (response.status === 401) {
        console.error('🚨 401 에러 - 인증 실패:', backendMessage);
        throw new Error(`인증 실패: ${backendMessage}`);
      } else if (response.status === 400) {
        console.error('🚨 400 에러 - 잘못된 요청:', backendMessage);
        throw new Error(`잘못된 요청: ${backendMessage}`);
      } else if (response.status === 500) {
        console.error('🚨 500 에러 - 서버 오류:', backendMessage);
        throw new Error(`서버 오류: ${backendMessage}`);
      }
      
      throw new Error(`HTTP ${response.status}: ${backendMessage}`);
    }

      const responseData = await response.json();
      console.log('📧 문의 응답:', responseData);
      
      alert(`✅ ${influencer.influencer_name}님에게 문의가 성공적으로 전송되었습니다.`);
      
      // 상태 업데이트를 위해 데이터 새로고침
      fetchInfluencers(filter);
      
    } catch (error) {
      console.error('🚨 문의 전송 실패:', error);
      alert(`❌ 문의 전송 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  // handlePayment 함수 - ID 기반 지급으로 완전 수정
  const handlePayment = async () => {
    if (!web3 || !contract) {
      alert('Web3 또는 스마트컨트랙트가 초기화되지 않았습니다.');
      return;
    }

    // 🔍 디버깅: smartContractId 값 확인
    console.log('🔍 data:', data);
    console.log('🔍 smartContractId:', data?.smartContractId);
    console.log('🔍 smartContractId 타입:', typeof data?.smartContractId);
    console.log('🔍 Number(smartContractId):', Number(data?.smartContractId));

    if (data?.smartContractId === undefined || data?.smartContractId === null || isNaN(Number(data.smartContractId))) {
      alert(`유효하지 않은 스마트컨트랙트 ID입니다: ${data?.smartContractId}`);
      return;
    }

    setIsPaying(true);

    try {
      const selected = filteredInfluencers.filter(inf =>
        selectedInfluencers.has(inf.joinId) && inf.submit_reward_available && !inf.reward_paid
      );

      if (selected.length === 0) {
        alert('입금할 대상이 없습니다.');
        return;
      }

      let account;
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        account = accounts[0];
      } else {
        const accounts = await web3.eth.getAccounts();
        account = accounts[0];
      }

      const successfulPayments = [];
      const failedResults = [];

      // 🔥 새로운 ID 기반 지급 방식
      for (const inf of selected) {
        try {
          console.log(`💳 ${inf.influencer_name} 지급 시도:`, {
            smartContractId: data.smartContractId,
            influencer_id: inf.influencer_id,    
            influencer_walletAddress: inf.influencer_walletAddress,
            from: account
          });

          // 🔥 필수 데이터 확인도 수정
          if (!inf.influencer_id && inf.influencer_id !== 0) {
            throw new Error(`${inf.influencer_name}: 인플루언서 ID가 없습니다.`);
          }
          if (!inf.influencer_walletAddress) {
            throw new Error(`${inf.influencer_name}: 지갑 주소가 없습니다.`);
          }

          // 🔥 새로운 payInfluencer 함수 호출 (adId, influencerId, walletAddress)
          await contract.methods.payInfluencer(
            Number(data.smartContractId),           
            Number(inf.influencer_id),              
            inf.influencer_walletAddress            
          ).send({
            from: account,
            gas: 300000
          });

          const paidAt = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString();
          successfulPayments.push({ 
            joinId: inf.joinId, 
            paidAt: paidAt 
          });
          console.log(`✅ 지급 성공: ${inf.influencer_name}`);
        } catch (error) {
          console.error(`❌ 지급 실패: ${inf.influencer_name}`, error);
          failedResults.push(inf.influencer_name);
        }
      }

      // 백엔드에 성공한 보상 결과 전송
      if (successfulPayments.length > 0) {
        const paymentData = {
          joinIds: successfulPayments
        };

        console.log('💳 전송할 결제 데이터:', paymentData);

        const response = await authenticatedFetch(`${API_BASE_URL}/advertiser/contract/${adId}/pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify(paymentData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('💳 백엔드 업데이트 실패:', errorData);
          throw new Error(`백엔드 업데이트 실패: ${errorData.message || '알 수 없는 오류'}`);
        }

        console.log('✅ 백엔드에 결제 결과 업데이트 완료');
      }

      // 사용자 알림
      if (failedResults.length > 0) {
        alert(`⚠️ 일부 인플루언서에게 지급 실패:\n${failedResults.join(', ')}`);
      } else {
        alert('✅ 모든 인플루언서에게 성공적으로 지급되었습니다.');
      }

      fetchInfluencers(filter); // 상태 새로고침

    } catch (err) {
      console.error('🚨 전체 지급 오류:', err);
      alert(`입금 처리 중 오류 발생: ${err.message}`);
    } finally {
      setIsPaying(false);
    }
  };

  const filteredInfluencers = data?.influencers || [];

  return (
    <Container>
      <Header>
        <Title>
          광고 참여자 <span>{data?.influencers?.length || 0}명</span>
        </Title>
        <HeaderRight>
        <PaymentButton 
          onClick={handlePayment}
          disabled={isPaying || selectedInfluencers.size === 0}
        >
          {isPaying ? (
            <>
              입금 중...
            </>
          ) : (
            <>입금하기 ({selectedInfluencers.size})</>
          )}
        </PaymentButton>
          <FilterSelect value={filter} onChange={(e) => handleFilterChange(e.target.value)}>
            <option value="ALL">전체</option>
            <option value="PENDING">미제출</option>
            <option value="APPROVED">승인됨</option>
            <option value="REJECTED">거절됨</option>
          </FilterSelect>
        </HeaderRight>
      </Header>

      <TableContainer>
        {/* 고정 헤더 */}
        <HeaderTable>
          <TableHeader>
            <HeaderRow>
              <HeaderCell width="50px">
                <Checkbox
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  disabled={isLoading}
                />
              </HeaderCell>
              <HeaderCell width="180px">참여자명</HeaderCell>
              <HeaderCell width="80px" textAlign="center">url</HeaderCell>
              <HeaderCell width="80px" textAlign="center">피드백</HeaderCell>
              <HeaderCell width="80px" textAlign="center">입금여부</HeaderCell>
              <HeaderCell width="80px" textAlign="center">문의하기</HeaderCell>
            </HeaderRow>
          </TableHeader>
        </HeaderTable>

        {/* 스크롤 가능한 바디 */}
        <ScrollBody>
          <BodyTable>
            <TableBody>
              {isLoading ? (
                <tr>
                  <td colSpan="6">
                    <LoadingMessage>
                      <LoadingSpinner />
                      인플루언서 정보를 불러오는 중...
                    </LoadingMessage>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6">
                    <ErrorMessage>
                      {error}
                      <br />
                      <button 
                        onClick={() => fetchInfluencers(filter)}
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
              ) : !data ? (
                <tr>
                  <td colSpan="6">
                    <ErrorMessage>인플루언서 정보를 찾을 수 없습니다.</ErrorMessage>
                  </td>
                </tr>
              ) : data.influencers.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <EmptyMessage>참여자가 없습니다.</EmptyMessage>
                  </td>
                </tr>
              ) : filteredInfluencers.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <EmptyMessage>해당 조건에 맞는 참여자가 없습니다.</EmptyMessage>
                  </td>
                </tr>
              ) : (
                filteredInfluencers.map((influencer) => (
                  <React.Fragment key={influencer.joinId}>
                    <TableRow>
                      <TableCell width="50px">
                        <Checkbox
                          type="checkbox"
                          checked={selectedInfluencers.has(influencer.joinId)}
                          onChange={() => handleSelectInfluencer(influencer.joinId)}
                          disabled={!influencer.submit_reward_available}
                        />
                      </TableCell>
                      <TableCell width="180px">
                        <NameContainer>
                          <StatusDot status={influencer.review_status} />
                          <InfluencerName>{influencer.influencer_name}</InfluencerName>
                          <DescriptionToggle
                            onClick={(e) => toggleDescription(influencer.joinId, e)}
                            active={openDescriptionId === influencer.joinId}
                          >
                            <FaChevronDown 
                              size={12} 
                              color="#888"
                              style={{
                                transform: openDescriptionId === influencer.joinId ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease'
                              }}
                            />
                          </DescriptionToggle>
                        </NameContainer>
                      </TableCell>
                      <TableCell width="80px" textAlign="center">
                        {influencer.url ? (
                          <UrlLink
                            href={influencer.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            url
                          </UrlLink>
                        ) : (
                          <DisabledText>-</DisabledText>
                        )}
                      </TableCell>
                      <TableCell width="80px" textAlign="center">
                        {influencer.pdf_url ? (
                          <FeedbackLink
                            href={influencer.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            피드백
                          </FeedbackLink>
                        ) : (
                          <DisabledText>-</DisabledText>
                        )}
                      </TableCell>
                      <TableCell width="80px" textAlign="center">
                        {influencer.reward_paid ? (
                          <CompletedText>완료</CompletedText>
                        ) : (
                          <DisabledText>-</DisabledText>
                        )}
                      </TableCell>
                      <TableCell width="80px" textAlign="center">
                      {influencer.review_status === "REVIEW_FROM_ADV" ? (
                        <InquiryButton disabled>
                          문의중
                        </InquiryButton>
                      ) : influencer.submit_review_available ? (
                        <InquiryButton onClick={() => handleInquiry(influencer)}>
                          문의
                        </InquiryButton>
                      ) : (
                        <DisabledText>-</DisabledText>
                      )}
                    </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </BodyTable>
        </ScrollBody>
      </TableContainer>

      {/* Description 툴팁 */}
      {openDescriptionId && (
        <>
          <TooltipOverlay onClick={() => setOpenDescriptionId(null)} />
          <TooltipContent 
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`
            }}
          >
            {filteredInfluencers.find(inf => inf.joinId === openDescriptionId)?.influencer_description || '설명이 없습니다.'}
          </TooltipContent>
        </>
      )}
    </Container>
  );
};

export default AdvertiserMembers;

// 툴팁 스타일
const TooltipOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
`;

const TooltipContent = styled.div`
  position: absolute;
  background-color: rgb(162, 171, 180);
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.4;
  z-index: 1000;
  min-width: 210px;
  max-width: 300px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

// 컴포넌트 스타일
const Container = styled.div`
  min-height: 100%;
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

  span {
    font-size: 16px;
    font-weight: normal;
    margin-left: 8px;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PaymentButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: #0056b3;
  }
  
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const FilterSelect = styled.select`
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

const TableHeader = styled.thead`
  position: sticky;
  top: 0;
  z-index: 1;
`;

const TableBody = styled.tbody``;

const HeaderRow = styled.tr``;

const TableRow = styled.tr`
  border-bottom: 1px solid #f0f0f0;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const HeaderCell = styled.th`
  padding: 16px;
  text-align: ${props => props.textAlign || 'left'};
  font-weight: 600;
  font-size: 14px;
  color: #333;
  width: ${props => props.width || 'auto'};
  border-bottom: 1px solid #eee;
`;

const TableCell = styled.td`
  padding: 16px;
  vertical-align: middle;
  font-size: 14px;
  width: ${props => props.width || 'auto'};
  border-bottom: 1px solid #f0f0f0;
  text-align: ${props => props.textAlign || 'left'};
`;

const NameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  width: 100%;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ status }) => {
    if (status === 'APPROVED') return '#28a745'; // 승인 - 초록색
    if (status === 'REJECTED') return '#dc3545';
    if (status == 'REVIEW_FROM_ADV') return '#3F8CFE'    
    return '#6c757d'; // 대기 - 회색                              
  }};
  flex-shrink: 0;
`;

const InfluencerName = styled.span`
  font-weight: 500;
  color: #333;
`;

const DescriptionToggle = styled.div`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  
  &:hover {
    background-color: #e9ecef;
    border-radius: 4px;
  }
`;

const UrlLink = styled.a`
  color: #0077cc;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const FeedbackLink = styled.a`
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const DisabledText = styled.span`
  color: #999;
`;

const CompletedText = styled.span`
  color: #28a745;
  font-weight: 500;
`;

const InquiryButton = styled.button`
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  color: #495057;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: #e9ecef;
    border-color: #c6c8ca;
  }
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 14px;
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