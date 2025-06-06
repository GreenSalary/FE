import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const EditInfo = () => {
  const navigate = useNavigate();
  const { authenticatedFetch, userType, updateUserInfo } = useUser(); 

  const [formData, setFormData] = useState({
    name: '',
    walletAddress: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const fetchCurrentUserInfo = async () => {
    try {
      setInitialLoading(true);

      const endpoint = userType === 'advertiser' 
        ? `${API_BASE_URL}/advertiser/mypage`
        : `${API_BASE_URL}/influencer/mypage`;

      console.log('🔍 현재 사용자 정보 조회:', endpoint);

      const response = await authenticatedFetch(endpoint);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '사용자 정보를 불러오는데 실패했습니다.');
      }

      const userData = await response.json();
      console.log('✅ 사용자 정보 조회 성공:', userData);

      setFormData({
        name: userData.name || '',
        walletAddress: userData.walletAddress || '',
        description: userData.description || ''
      });

    } catch (err) {
      console.error('🚨 사용자 정보 조회 실패:', err);
      alert('사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUserInfo();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    if (!formData.walletAddress.trim()) {
      newErrors.walletAddress = '블록체인 지갑 주소를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      const endpoint = userType === 'advertiser' 
        ? `${API_BASE_URL}/advertiser/mypage/profile`
        : `${API_BASE_URL}/influencer/mypage/profile`;

      console.log('💾 사용자 정보 수정 요청:', endpoint);
      console.log('📤 요청 데이터:', formData);

      const response = await authenticatedFetch(endpoint, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          walletAddress: formData.walletAddress.trim(),
          description: formData.description.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '정보 수정에 실패했습니다.');
      }

      const result = await response.json();
      console.log('✅ 사용자 정보 수정 성공:', result);

      // 🆕 UserContext의 사용자 정보 업데이트 (화면 반영용)
      if (updateUserInfo) {
        updateUserInfo({
          name: formData.name.trim(),
          walletAddress: formData.walletAddress.trim(),
          description: formData.description.trim()
        });
      }

      alert('정보가 성공적으로 수정되었습니다!');
      navigate(`/${userType}/mypage`);

    } catch (err) {
      console.error('🚨 사용자 정보 수정 실패:', err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    navigate(`/${userType}/mypage`);
  };

  // 초기 로딩 중
  if (initialLoading) {
    return (
      <Container>
        <Title>내 정보 수정</Title>
        <Section style={{ textAlign: 'center', padding: '40px' }}>
          <LoadingSpinner style={{ margin: '0 auto' }} />
          <div style={{ marginTop: '10px' }}>정보를 불러오는 중...</div>
        </Section>
      </Container>
    );
  }

  return (
    <Container>
      <Title>내 정보 수정</Title>

      <Section>
        <Label>이름 *</Label>
        <Input
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className={errors.name ? 'error' : ''}
          placeholder="이름을 입력하세요"
        />
        {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}

        <Label>블록체인 지갑 주소 *</Label>
        <Input
          name="walletAddress"
          value={formData.walletAddress}
          onChange={handleInputChange}
          className={errors.walletAddress ? 'error' : ''}
          placeholder="지갑 주소를 입력하세요"
        />
        {errors.walletAddress && <ErrorMessage>{errors.walletAddress}</ErrorMessage>}

        <Label>설명</Label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="자기소개나 설명을 입력하세요 (선택사항)"
        />
      </Section>

      <ButtonRow>
        <CancelButton onClick={handleCancel}>
          취소
        </CancelButton>
        <SaveButton onClick={handleSave} disabled={loading}>
          저장
        </SaveButton>
      </ButtonRow>
    </Container>
  );
};

export default EditInfo;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Section = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  min-width: 0;
  box-sizing: border-box;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const Label = styled.div`
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 6px;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 16px;
  box-sizing: border-box;
  background-color: white;
  
  &.error {
    border-color: #dc3545;
    background-color: #fff5f5;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  height: 120px;
  resize: none;
  box-sizing: border-box;
  background-color: white;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const SaveButton = styled.button`
  padding: 10px 24px;
  font-size: 14px;
  border-radius: 20px;
  background-color: #00cba4;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #00b092;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  padding: 10px 24px;
  font-size: 14px;
  border-radius: 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #545b62;
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 12px;
  margin-top: -12px;
  margin-bottom: 16px;
`;