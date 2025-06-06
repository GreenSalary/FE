import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Web3 from 'web3';
import AdContract from '../../contracts/AdContract.json';
import { useUser } from '../../contexts/UserContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const Modal = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 16px;
  padding: 40px 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  width: 400px;
  text-align: center;
`;

const Button = styled.button`
  margin-top: 20px;
  padding: 12px 60px;
  font-size: 16px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: bold;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 10px 20px;
  margin-bottom: 8px;
  overflow-y: auto;
  max-height: calc(100vh - 170px);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ddd;
    border-radius: 3px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MainTitle = styled.h2`
  font-size: 22px;
  font-weight: bold;
`;

const SubmitButton = styled.button`
  padding: 8px 20px;
  font-size: 14px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  max-width: 100%;
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const SubTitle = styled.h3`
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid #000;
  margin: 15px 0 0 0;
  width: 100%;
`;

const FormCard = styled.div`
  width: 100%;
`;

const Row = styled.div`
  display: flex;
  border-bottom: 1px solid #ddd;
`;

const Label = styled.div`
  width: 180px;
  font-weight: 500;
  font-size: 14px;
  background-color: #f9f9f9;
  padding: 16px;
  display: flex;
  align-items: center;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: white;
`;

const TagBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.div`
  background-color: #f0f4f8;
  border-radius: 12px;
  padding: 6px 12px;
  font-size: 13px;
  color: #333;
`;

const ConditionRow = styled.div`
  display: flex;
  border-bottom: none;
  width: 100%;
`;

const ConditionNumber = styled.div`
  width: 40px;
  display: flex;
  align-items: center;
  padding-left: 16px;
  font-size: 14px;
`;

const ConditionInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
`;

const ConditionTextarea = styled.textarea`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-height: 40px;
  resize: none;
  font-family: inherit;
  line-height: 1.4;
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
  appearance: none;
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 10px;
`;

const Checkbox = styled.input`
  cursor: pointer;
  width: 16px;
  height: 16px;
`;

const FixedWidthInput = styled(Input)`
  width: 70px;
  flex: none;
`;

const Textarea = styled.textarea`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  height: 120px;
  resize: none;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  font-size: 14px;
  margin-top: 8px;
`;

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
};

// 사이트명 변환 함수
const getSiteDisplayName = (siteCode) => {
  switch (siteCode) {
    case 'Naver Blog':
      return '네이버 블로그';
    case 'Instagram':
      return '인스타그램';
    case 'YouTube':
      return '유튜브';
    default:
      return siteCode || '네이버 블로그';
  }
};

const PublisherJoin = () => {
  const [code, setCode] = useState('');
  const [contractDetail, setContractDetail] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [isJoinLoading, setIsJoinLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [contractId, setContractId] = useState(null);
  
  const navigate = useNavigate();
  const { authenticatedFetch, isLoggedIn, getToken } = useUser();

  // 코드 검증 및 계약 정보 조회
  const handleSubmit = async () => {
    if (!code.trim()) {
      setCodeError('초대 코드를 입력해주세요.');
      return;
    }

    try {
      setIsCodeLoading(true);
      setCodeError('');
      
      console.log('🔍 초대 코드 검증 시작:', code);
      
      // 1. 초대 코드로 계약 정보 조회
      const response = await authenticatedFetch(`${API_BASE_URL}/influencer/contract/code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessCode: code }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '올바르지 않은 코드입니다.');
      }
      
      const codeResponse = await response.json();
      console.log('✅ 코드 검증 성공:', codeResponse);
      
      // 계약 ID 추출
      const contractId = codeResponse.contractId;
      if (!contractId) {
        throw new Error('계약 ID를 찾을 수 없습니다.');
      }
      
      console.log('📋 계약 상세 정보 요청:', contractId);
      
      // 2. 계약 ID로 상세 정보 조회
      const detailResponse = await authenticatedFetch(`${API_BASE_URL}/influencer/contract/${contractId}`);
      
      if (!detailResponse.ok) {
        const errorData = await detailResponse.json().catch(() => ({}));
        throw new Error(errorData.message || '계약 정보를 불러오는데 실패했습니다.');
      }
      
      const contractDetail = await detailResponse.json();
      console.log('✅ 계약 상세 정보 조회 성공:', contractDetail);
      
      setContractId(contractId);
      setContractDetail(contractDetail);
      setIsVerified(true);
      
    } catch (err) {
      console.error('🚨 코드 검증 실패:', err);
      setCodeError(err.message);
    } finally {
      setIsCodeLoading(false);
    }
  };

  // 계약 수락
  const handleAccept = async () => {
    if (!contractId) {
      alert('계약 ID가 없습니다.');
      return;
    }

    // 확인 창 표시
    const isConfirmed = window.confirm('계약을 수락하시겠습니까?');
    if (!isConfirmed) {
      return;
    }

    try {
      setIsJoinLoading(true);
      
      console.log('📝 계약 수락 요청:', contractId);
      
      // TODO: 나중에 스마트 컨트랙트 joinAd 함수 호출 기능 추가
      // let joinTransactionHash = null;
      // 
      // try {
      //   console.log('🔗 스마트 컨트랙트 join 호출 시작...');
      //   
      //   // Web3 초기화
      //   if (!web3 || !contract) {
      //     await initWeb3();
      //   }
      //   
      //   // MetaMask 연결 또는 Ganache 계정 사용
      //   let account;
      //   if (typeof window.ethereum !== 'undefined') {
      //     const accounts = await window.ethereum.request({ 
      //       method: 'eth_requestAccounts' 
      //     });
      //     account = accounts[0];
      //   } else {
      //     // Ganache 계정 사용
      //     const accountList = await web3.eth.getAccounts();
      //     account = accountList[0];
      //   }
      //   
      //   if (!account) {
      //     throw new Error('지갑 계정을 찾을 수 없습니다.');
      //   }
      //   
      //   // 스마트 컨트랙트 joinAd 함수 호출
      //   const tx = await contract.methods.joinAd(contractDetail.smartContractAdId).send({
      //     from: account,
      //     gas: 500000,
      //     gasPrice: '20000000000'
      //   });
      //   
      //   console.log('✅ 스마트 컨트랙트 join 성공:', tx.transactionHash);
      //   joinTransactionHash = tx.transactionHash;
      //   
      // } catch (contractError) {
      //   console.error('🚨 스마트 컨트랙트 join 실패:', contractError);
      //   throw new Error(`스마트 컨트랙트 처리 실패: ${contractError.message}`);
      // }
      
      // 스마트 컨트랙트 성공 후 백엔드 API로 계약 수락 처리
      const response = await authenticatedFetch(`${API_BASE_URL}/influencer/contract/${contractId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ 
        //   joinTransactionHash // 스마트 컨트랙트 트랜잭션 해시 포함
        // }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '계약 수락에 실패했습니다.');
      }
      
      const result = await response.json();
      console.log('✅ 백엔드 계약 수락 성공:', result);
      
      alert('계약이 수락되었습니다!');
      navigate('/publisher');
      
    } catch (err) {
      console.error('🚨 계약 수락 실패:', err);
      alert(err.message);
    } finally {
      setIsJoinLoading(false);
    }
  };

// TODO: 나중에 스마트 컨트랙트 연동 시 Web3 초기화 함수
// const initWeb3 = async () => {
//   try {
//     const providerUrl = process.env.REACT_APP_WEB3_PROVIDER_URL || 'http://127.0.0.1:8545';
//     const networkId = process.env.REACT_APP_NETWORK_ID || '1337';
//     const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || AdContract.networks[networkId]?.address;

//     const web3Instance = new Web3(providerUrl);
//     setWeb3(web3Instance);

//     const contractInstance = new web3Instance.eth.Contract(
//       AdContract.abi,
//       contractAddress
//     );
//     setContract(contractInstance);

//     console.log('Web3 초기화 완료 (Publisher)');
    
//   } catch (error) {
//     console.error('Web3 초기화 실패:', error);
//   }
// };

  const handleOverlayClick = () => {
    navigate(-1); 
  };

  // 미디어 요구사항 추출
  const hasTextRequirement = contractDetail?.media?.minTextLength > 0;
  const hasPhotoRequirement = contractDetail?.media?.minImageCount > 0;

  return (
    <>
      {!isVerified && (
        <Overlay onClick={handleOverlayClick}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <h2>초대 코드 입력</h2>
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="초대 코드를 입력하세요"
              disabled={isCodeLoading}
            />
            {codeError && <ErrorMessage>{codeError}</ErrorMessage>}
            <Button onClick={handleSubmit} disabled={isCodeLoading}>
              제출
            </Button>
          </Modal>
        </Overlay>
      )}

      {isVerified && contractDetail && (
        <Container>
          <Header>
            <MainTitle>계약 등록</MainTitle>
            <SubmitButton onClick={handleAccept} disabled={isJoinLoading}>
              수락
            </SubmitButton>
          </Header>

          <ContentContainer>
            <SubTitle>광고</SubTitle>
            <Divider />

            <FormCard>
              <Row>
                <Label>광고명</Label>
                <ContentArea>
                  <Input value={contractDetail.title || ''} readOnly />
                </ContentArea>
              </Row>

              <Row>
                <Label>보수</Label>
                <ContentArea>
                  <Input value={contractDetail.reward || ''} readOnly />
                  <div>원</div>
                </ContentArea>
                <ContentArea>
                </ContentArea>
              </Row>

              <Row>
                <Label>업로드 기간</Label>
                <ContentArea>
                  <Input 
                    type="date" 
                    value={formatDate(contractDetail.uploadPeriod?.startDate)} 
                    readOnly 
                  />
                  <div style={{ margin: '0 8px' }}>~</div>
                  <Input 
                    type="date" 
                    value={formatDate(contractDetail.uploadPeriod?.endDate)} 
                    readOnly 
                  />
                </ContentArea>
              </Row>

              {contractDetail.maintainPeriod && (
                <Row>
                  <Label>유지 기간</Label>
                  <ContentArea>
                    <Input 
                      type="date" 
                      value={formatDate(contractDetail.maintainPeriod?.startDate)} 
                      readOnly 
                    />
                    <div style={{ margin: '0 8px' }}>~</div>
                    <Input 
                      type="date" 
                      value={formatDate(contractDetail.maintainPeriod?.endDate)} 
                      readOnly 
                    />
                  </ContentArea>
                </Row>
              )}

              <Row>
                <Label>필수 키워드</Label>
                <ContentArea style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <TagBox>
                    {(contractDetail.keywords || []).map((keyword, index) => (
                      <Tag key={index}># {keyword}</Tag>
                    ))}
                  </TagBox>
                </ContentArea>
              </Row>

              <Row>
                <Label>세부 조건</Label>
                <ContentArea style={{ flexDirection: 'column' }}>
                  {(contractDetail.conditions || []).map((condition, index) => (
                    <ConditionRow key={index}>
                      <ConditionNumber>{index + 1}.</ConditionNumber>
                      <ConditionTextarea value={condition} readOnly />
                    </ConditionRow>
                  ))}
                </ContentArea>
              </Row>

              <Row>
                <Label>업로드 사이트</Label>
                <ContentArea>
                  <Select value={getSiteDisplayName(contractDetail.site)} disabled>
                    <option>네이버 블로그</option>
                    <option>인스타그램</option>
                    <option>유튜브</option>
                  </Select>
                </ContentArea>
                <Label>필수 매체<br/>(중복 가능)</Label>
                <ContentArea style={{ flex: 4 }}>
                  <CheckboxWrapper>
                    <Checkbox 
                      type="checkbox" 
                      checked={hasTextRequirement} 
                      disabled 
                    />
                    <div>글</div>
                    <FixedWidthInput 
                      value={hasTextRequirement ? contractDetail.media.minTextLength : ''} 
                      readOnly 
                    />
                    <div>자 이상</div>
                  </CheckboxWrapper>
                  <CheckboxWrapper>
                    <Checkbox 
                      type="checkbox" 
                      checked={hasPhotoRequirement} 
                      disabled 
                    />
                    <div>사진</div>
                    <FixedWidthInput 
                      value={hasPhotoRequirement ? contractDetail.media.minImageCount : ''} 
                      readOnly 
                    />
                    <div>장 이상</div>
                  </CheckboxWrapper>
                </ContentArea>
              </Row>

              <Row>
                <Label>상세 설명</Label>
                <ContentArea style={{ paddingBottom: '8px' }}>
                  <Textarea value={contractDetail.description || ''} readOnly />
                </ContentArea>
              </Row>
            </FormCard>
          </ContentContainer>
        </Container>
      )}
    </>
  );
};

export default PublisherJoin;