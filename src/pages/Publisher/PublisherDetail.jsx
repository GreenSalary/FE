import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import StatusBadge from '../../components/StatusBadge';
import { useUser } from '../../contexts/UserContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
`;

const MainTitle = styled.h2`
  font-size: 22px;
  font-weight: bold;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
  align-items: stretch;
`;

const TopLeft = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  flex: 2;
  height: auto;
`;

const TopRight = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  flex: 1;
  height: auto;
`;

const Bottom = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 10px 20px;
`;

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 16px;
`;

const UrlInputRow = styled.div`
  display: flex;
  gap: 8px;
`;

const UrlInput = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  flex: 1;
`;

const ChangeButton = styled.button`
  padding: 10px 16px;
  font-size: 14px;
  border-radius: 6px;
  background-color: #e0f0ff;
  border: none;
  cursor: pointer;
`;

const StatusInput = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatusGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Amount = styled.div`
  font-size: 18px;
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

const SubLabel = styled.div`
  width: 120px;
  font-weight: 500;
  font-size: 14px;
  background-color: #f9f9f9;
  padding: 16px;
  display: flex;
  align-items: center;
  margin-left: 20px;
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

const ImagePreviewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const ImagePreviewItem = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ddd;
`;

const ImageSection = styled.div`
  margin-top: 16px;
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

const PublisherDetail = () => {
  const { adId } = useParams();
  const [contractDetail, setContractDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { authenticatedFetch, isLoggedIn, getToken } = useUser();

  // 기존 더미 데이터 (URL 입력란과 보수 상태용)
  const staticData = {
    url: '',
    amount: '30000',
    status: 'not_executed'
  };

  // 문의 버튼 클릭 핸들러
  const handleInquiry = () => {
    console.log('문의하기 클릭됨');
    // 나중에 구현될 문의 기능
    alert('광고주에게 문의를 보냅니다.');
  };

  // 계약 상세 정보 가져오기
  const fetchContractDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📋 계약 상세 정보 요청:', adId);
      
      const response = await authenticatedFetch(`${API_BASE_URL}/influencer/contract/${adId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || '계약 정보를 불러오는데 실패했습니다.'}`);
      }
      
      const data = await response.json();
      console.log('📋 계약 상세 데이터:', data);
      
      setContractDetail(data);
      
    } catch (err) {
      console.error('🚨 계약 상세 정보 불러오기 실패:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adId && isLoggedIn && getToken()) {
      fetchContractDetail();
    } else if (!isLoggedIn) {
      setError('로그인이 필요합니다.');
      setIsLoading(false);
    }
  }, [adId, isLoggedIn]);

  if (isLoading) {
    return (
      <Container style={{ alignItems: 'center', marginTop: '200px'}}>
        <LoadingSpinner/>
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
            onClick={fetchContractDetail}
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

  if (!contractDetail) {
    return (
      <Container>
        <ErrorMessage>계약 정보를 찾을 수 없습니다.</ErrorMessage>
      </Container>
    );
  }

  const isEditable = staticData.status !== 'deposited';
  const buttonLabel = staticData.status === 'not_executed' ? '제출' : '변경';

  // 미디어 요구사항 추출
  const hasTextRequirement = contractDetail.media?.minTextLength > 0;
  const hasPhotoRequirement = contractDetail.media?.minImageCount > 0;

  return (
    <Container>
      <MainTitle>{contractDetail.title || '계약 정보'}</MainTitle>
      <ContentContainer>
        <Top>
          <TopLeft>
            <SectionTitle>광고 url 제출란</SectionTitle>
            <UrlInputRow>
              <UrlInput placeholder="링크를 입력하세요" disabled={!isEditable} />
              {isEditable && <ChangeButton>{buttonLabel}</ChangeButton>}
            </UrlInputRow>
          </TopLeft>
          <TopRight>
            <SectionTitle>광고 보수 현황</SectionTitle>
            <StatusInput>
              <Amount>{staticData.amount}ETH</Amount>
              <StatusGroup>
                <StatusBadge status={staticData.status} />
                <InquiryButton onClick={handleInquiry}>
                  문의
                </InquiryButton>
              </StatusGroup>
            </StatusInput>
          </TopRight>
        </Top>
        <Bottom>
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
                <div>ETH</div>
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

            {/* 제품 사진 표시 (사진이 있는 경우만) */}
              {contractDetail.photo_url && (
                <Row>
                  <Label>제품 사진</Label>
                  <ContentArea style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <ImageSection>
                      <ImagePreviewContainer>
                        <ImagePreviewItem>
                          <PreviewImage 
                            src={contractDetail.photo_url} 
                            alt="제품 사진"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </ImagePreviewItem>
                      </ImagePreviewContainer>
                    </ImageSection>
                  </ContentArea>
                </Row>
              )}

            <Row>
              <Label>상세 설명</Label>
              <ContentArea style={{ paddingBottom: '8px' }}>
                <Textarea value={contractDetail.description || ''} readOnly />
              </ContentArea>
            </Row>
          </FormCard>
        </Bottom>
      </ContentContainer>
    </Container>
  );
};

export default PublisherDetail;