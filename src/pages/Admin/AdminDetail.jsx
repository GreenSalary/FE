// src/pages/Admin/AdminDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '../../contexts/UserContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
};


const AdminDetail = () => {
  const { askId } = useParams();
  const navigate = useNavigate();
  const { authenticatedFetch } = useUser();
  
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 데이터 불러오기
  useEffect(() => {
    const fetchAskDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('📋 문의 상세 정보 요청:', askId);
        
        const response = await authenticatedFetch(`${API_BASE_URL}/admin/ask/${askId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ 문의 상세 정보 조회 성공:', data);
        
        setFormData(data);
        
      } catch (err) {
        console.error('❌ 문의 상세 정보 조회 실패:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (askId) {
      fetchAskDetail();
    }
  }, [askId, authenticatedFetch]);

  // 수락 처리
  const handleApprove = async () => {
    if (!formData) return;
    
    const confirmed = window.confirm(`'${formData.title}' 광고 문의를 수락하시겠습니까?`);
    if (!confirmed) return;

    try {
      setIsProcessing(true);
      
      console.log('✅ 문의 수락 요청:', askId);
      
      const response = await authenticatedFetch(`${API_BASE_URL}/admin/ask/${askId}/approve`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '수락 처리에 실패했습니다.');
      }
      
      console.log('✅ 문의 수락 처리 완료');
      alert('수락 처리가 완료되었습니다.');
      navigate('/admin/home');
      
    } catch (err) {
      console.error('❌ 문의 수락 처리 실패:', err);
      alert(`수락 처리 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 거절 처리
  const handleReject = async () => {
    if (!formData) return;
    
    const confirmed = window.confirm(`'${formData.title}' 광고 문의를 거절하시겠습니까?`);
    if (!confirmed) return;

    try {
      setIsProcessing(true);
      
      console.log('❌ 문의 거절 요청:', askId);
      
      const response = await authenticatedFetch(`${API_BASE_URL}/admin/ask/${askId}/reject`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '거절 처리에 실패했습니다.');
      }
      
      console.log('✅ 문의 거절 처리 완료');
      alert('거절 처리가 완료되었습니다.');
      navigate('/admin/home');
      
    } catch (err) {
      console.error('❌ 문의 거절 처리 실패:', err);
      alert(`거절 처리 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <div>문의 정보를 불러오는 중...</div>
        </LoadingContainer>
      </Container>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <div>오류가 발생했습니다: {error}</div>
          <button 
            onClick={() => navigate('/admin/home')}
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
            목록으로 돌아가기
          </button>
        </ErrorContainer>
      </Container>
    );
  }

  // 데이터가 없는 경우
  if (!formData) {
    return (
      <Container>
        <ErrorContainer>
          <div>문의 정보를 찾을 수 없습니다.</div>
          <button 
            onClick={() => navigate('/admin/home')}
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
            목록으로 돌아가기
          </button>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <TitleRow>
        <MainTitle>{formData.title}</MainTitle>
        <ButtonRow>
          <ActionButton 
            $reject 
            onClick={handleReject}
            disabled={isProcessing}
          >
            거절
          </ActionButton>
          <ActionButton 
            onClick={handleApprove}
            disabled={isProcessing}
          >
            수락
          </ActionButton>
        </ButtonRow>
      </TitleRow>
      
      <ContentContainer>
        <Top>
          <SectionTitle>광고 URL</SectionTitle>
          <UrlDisplay href={formData.url} target="_blank" rel="noopener noreferrer">
            {formData.url}
          </UrlDisplay>
        </Top>

        <Bottom>
          <SubTitle>광고 세부 정보</SubTitle>
          <Divider />
          <FormCard>
            <Row>
              <Label>광고명</Label>
              <ContentArea><Input value={formData.title || ''} readOnly /></ContentArea>
            </Row>

            <Row>
              <Label>보수</Label>
              <ContentArea>
                <Input value={formData.reward?.toLocaleString() || '0'} readOnly />
                <div>ETH</div>
              </ContentArea>
            </Row>

            <Row>
            <Label>참여 인원</Label>
            <ContentArea>
              <Input value={formData.participants || 0} readOnly />
              <div>명명</div>
            </ContentArea>
            <Label>모집 인원</Label>
            <ContentArea>
              <Input value={formData.recruits || 0} readOnly />
              <div>명</div>
            </ContentArea>
          </Row>

          <Row>
            <Label>업로드 기간</Label>
            <ContentArea>
              <Input 
                type="date" 
                value={formatDate(formData.uploadPeriod?.startDate)} 
                readOnly 
              />
              <div style={{ margin: '0 8px' }}>~</div>
              <Input 
                type="date" 
                value={formatDate(formData.uploadPeriod?.endDate)} 
                readOnly 
              />
            </ContentArea>
          </Row>

            <Row>
              <Label>유지 기간</Label>
              <ContentArea>
                <Input 
                  type="date" 
                  value={formatDate(formData.maintainPeriod?.startDate)} 
                  readOnly 
                />
                <div style={{ margin: '0 8px' }}>~</div>
                <Input 
                  type="date" 
                  value={formatDate(formData.maintainPeriod?.endDate)} 
                  readOnly 
                />
              </ContentArea>
            </Row>
            <Row>
              <Label>필수 키워드</Label>
              <ContentArea style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <TagBox>
                  {(formData.keywords || []).map((tag, i) => (
                    <Tag key={i}># {tag}</Tag>
                  ))}
                </TagBox>
              </ContentArea>
            </Row>
            <Row>
              <Label>세부 조건</Label>
              <ContentArea style={{ flexDirection: 'column' }}>
                {(formData.conditions || []).map((condition, i) => (
                  <ConditionRow key={i}>
                    <ConditionNumber>{i + 1}.</ConditionNumber>
                    <ConditionTextarea value={condition} readOnly />
                  </ConditionRow>
                ))}
              </ContentArea>
            </Row>
            <Row>
              <Label>업로드 사이트</Label>
              <ContentArea>
                <Select value={formData.site || ''} disabled>
                  <option value="네이버 블로그">네이버 블로그</option>
                  <option value="인스타그램">인스타그램</option>
                  <option value="유튜브">유튜브</option>
                </Select>
              </ContentArea>
              <Label>매체 조건</Label>
              <ContentArea style={{ flex: 4 }}>
                <CheckboxWrapper>
                  <Checkbox 
                    type="checkbox" 
                    checked={!!(formData.media?.minTextLength)} 
                    disabled 
                  />
                  <div>글</div>
                  <FixedWidthInput 
                    value={formData.media?.minTextLength || ''} 
                    readOnly 
                  />
                  <div>자 이상</div>
                </CheckboxWrapper>
                <CheckboxWrapper>
                  <Checkbox 
                    type="checkbox" 
                    checked={!!(formData.media?.minImageCount)} 
                    disabled 
                  />
                  <div>사진</div>
                  <FixedWidthInput 
                    value={formData.media?.minImageCount || ''} 
                    readOnly 
                  />
                  <div>장 이상</div>
                </CheckboxWrapper>
              </ContentArea>
            </Row>

            {/* 제품 사진 표시 (사진이 있는 경우만) */}
            {formData.photo_url && (
              <Row>
                <Label>제품 사진</Label>
                <ContentArea style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <ImageSection>
                    <ImagePreviewContainer>
                      <ImagePreviewItem>
                        <PreviewImage 
                          src={formData.photo_url} 
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
              <ContentArea>
                <Textarea value={formData.description || ''} readOnly />
              </ContentArea>
            </Row>
          </FormCard>
        </Bottom>
      </ContentContainer>
    </Container>
  );
};

export default AdminDetail;

// 스타일드 컴포넌트들
const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 100px;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const MainTitle = styled.h2`
  font-size: 22px;
  font-weight: bold;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #666;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #e74c3c;
  background-color: #ffeaea;
  border-radius: 10px;
  margin: 20px;
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
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
  align-items: stretch;
  background-color: white;
  border-radius: 12px;
  padding: 20px;
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

const UrlDisplay = styled.a`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #1e88e5;
  text-decoration: underline;
  word-break: break-all;
  display: block;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 12px;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  background-color: ${({ $reject, disabled }) => 
    disabled ? '#cccccc' : ($reject ? '#f44336' : '#2196f3')
  };
  color: ${({ disabled }) => disabled ? '#666666' : 'white'};
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  font-size: 14px;

  &:hover {
    opacity: ${({ disabled }) => disabled ? '1' : '0.9'};
  }

  &:active {
    transform: ${({ disabled }) => disabled ? 'none' : 'scale(0.98)'};
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