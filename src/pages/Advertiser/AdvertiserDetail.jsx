import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '../../contexts/UserContext';
import { FaCopy } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 10px 20px;
  margin-bottom: 20px;
`;

const MainTitle = styled.h2`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const AccessCodeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
`;

const AccessCodeLabel = styled.span`
  color: #6c757d;
  font-weight: 500;
`;

const AccessCodeValue = styled.span`
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #495057;
  background-color: white;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ced4da;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #e9ecef;
    color: #495057;
  }
  
  &:active {
    background-color: #dee2e6;
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
  appearance: none;
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

const ImageSection = styled.div`
  margin-top: 16px;
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

const AdvertiserDetail = () => {
  const { adId } = useParams();
  const [adDetail, setAdDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { authenticatedFetch, isLoggedIn, getToken } = useUser();

  // 광고 상세 정보 가져오기
  const fetchAdDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📋 광고 상세 정보 요청:', adId);
      
      const response = await authenticatedFetch(`${API_BASE_URL}/advertiser/contract/${adId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || '광고 정보를 불러오는데 실패했습니다.'}`);
      }
      
      const data = await response.json();
      console.log('📋 광고 상세 데이터:', data);
      
      setAdDetail(data);
      
    } catch (err) {
      console.error('🚨 광고 상세 정보 불러오기 실패:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adId && isLoggedIn && getToken()) {
      fetchAdDetail();
    } else if (!isLoggedIn) {
      setError('로그인이 필요합니다.');
      setIsLoading(false);
    }
  }, [adId, isLoggedIn]);

  if (isLoading) {
    return (
      <Container style={{ alignItems: 'center', marginTop: '200px'}}>
        <LoadingSpinner/>
        {/* <LoadingMessage>광고 정보를 불러오는 중...</LoadingMessage> */}
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
            onClick={fetchAdDetail}
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

  if (!adDetail) {
    return (
      <Container>
        <ErrorMessage>광고 정보를 찾을 수 없습니다.</ErrorMessage>
      </Container>
    );
  }

  // 미디어 요구사항 추출
  const hasTextRequirement = adDetail.media?.minTextLength > 0;
  const hasPhotoRequirement = adDetail.media?.minImageCount > 0;

  // 초대 코드 복사 함수
  const handleCopyAccessCode = async () => {
    try {
      await navigator.clipboard.writeText(adDetail.accessCode);
      alert('초대 코드가 복사되었습니다!');
    } catch (err) {
      // 복사 실패 시 fallback
      const textArea = document.createElement('textarea');
      textArea.value = adDetail.access_code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('초대 코드가 복사되었습니다!');
    }
  };

  return (
    <Container>
      <TitleContainer>
        <MainTitle>{adDetail.title || '광고 정보'}</MainTitle>
        <AccessCodeContainer>
          <AccessCodeLabel>초대코드:</AccessCodeLabel>
          {adDetail.accessCode ? (
            <>
              <AccessCodeValue>{adDetail.accessCode}</AccessCodeValue>
              <CopyButton onClick={handleCopyAccessCode} title="복사">
                <FaCopy />
              </CopyButton>
            </>
          ) : (
            <span style={{ color: '#6c757d', fontStyle: 'italic' }}>초대코드없음</span>
          )}
        </AccessCodeContainer>
      </TitleContainer>

      <ContentContainer>
        <SubTitle>광고</SubTitle>
        <Divider />

        <FormCard>
          <Row>
            <Label>광고명</Label>
            <ContentArea>
              <Input value={adDetail.title || ''} readOnly />
            </ContentArea>
          </Row>

          <Row>
              <Label>보수</Label>
              <ContentArea>
                <Input value={adDetail.reward || 0} readOnly />
                <div>ETH</div>
              </ContentArea>
            </Row>

            <Row>
            <Label>참여 인원</Label>
            <ContentArea>
              <Input value={adDetail.participants || 0} readOnly />
              <div>명</div>
            </ContentArea>
            <Label>모집 인원</Label>
            <ContentArea>
              <Input value={adDetail.recruits || 0} readOnly />
              <div>명</div>
            </ContentArea>
          </Row>

          <Row>
            <Label>업로드 기간</Label>
            <ContentArea>
              <Input 
                type="date" 
                value={formatDate(adDetail.uploadPeriod?.startDate)} 
                readOnly 
              />
              <div style={{ margin: '0 8px' }}>~</div>
              <Input 
                type="date" 
                value={formatDate(adDetail.uploadPeriod?.endDate)} 
                readOnly 
              />
            </ContentArea>
          </Row>

          {adDetail.maintainPeriod && (
            <Row>
              <Label>유지 기간</Label>
              <ContentArea>
                <Input 
                  type="date" 
                  value={formatDate(adDetail.maintainPeriod?.startDate)} 
                  readOnly 
                />
                <div style={{ margin: '0 8px' }}>~</div>
                <Input 
                  type="date" 
                  value={formatDate(adDetail.maintainPeriod?.endDate)} 
                  readOnly 
                />
              </ContentArea>
            </Row>
          )}

          <Row>
            <Label>필수 키워드</Label>
            <ContentArea style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <TagBox>
                {(adDetail.keywords || []).map((keyword, index) => (
                  <Tag key={index}># {keyword}</Tag>
                ))}
              </TagBox>
            </ContentArea>
          </Row>

          <Row>
            <Label>세부 조건</Label>
            <ContentArea style={{ flexDirection: 'column' }}>
              {(adDetail.conditions || []).map((condition, index) => (
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
              <Select value={getSiteDisplayName(adDetail.site)} disabled>
                <option value="네이버 블로그">네이버 블로그</option>
                <option value="인스타그램">인스타그램</option>
                <option value="유튜브">유튜브</option>
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
                  value={hasTextRequirement ? adDetail.media.minTextLength : ''} 
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
                  value={hasPhotoRequirement ? adDetail.media.minImageCount : ''} 
                  readOnly 
                />
                <div>장 이상</div>
              </CheckboxWrapper>
            </ContentArea>
          </Row>

          {/* 제품 사진 표시 (사진이 있는 경우만) */}
          {adDetail.photo_url && (
            <Row>
              <Label>제품 사진</Label>
              <ContentArea style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <ImageSection>
                  <ImagePreviewContainer>
                    <ImagePreviewItem>
                      <PreviewImage 
                        src={adDetail.photo_url} 
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
              <Textarea value={adDetail.description || ''} readOnly />
            </ContentArea>
          </Row>
        </FormCard>
      </ContentContainer>
    </Container>
  );
};

export default AdvertiserDetail;