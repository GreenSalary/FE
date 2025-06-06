import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styled from 'styled-components';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 40px 10px 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
  
  &.error {
    border-color: #dc3545;
    background-color: #fff5f5;
  }

  &:focus {
    outline: none;
    border-color: #00cba4;
  }
`;

const EyeIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #aaa;
  font-size: 16px;
  transition: color 0.2s ease;
  
  &:hover {
    color: #666;
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const ChangeButton = styled.button`
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

const ChangePwd = () => {
  const navigate = useNavigate();
  const { authenticatedFetch, userType } = useUser();

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 비밀번호 표시/숨김 상태
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // UI 상태 관리
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 입력값 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 에러 상태 초기화
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // 비밀번호 표시/숨김 토글
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = '기존 비밀번호를 입력해주세요.';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '새 비밀번호 확인을 입력해주세요.';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '새 비밀번호가 일치하지 않습니다.';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = '기존 비밀번호와 새 비밀번호는 달라야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 비밀번호 변경 핸들러
  const handleChangePassword = async () => {
    // 유효성 검사
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // 역할별 API 엔드포인트 결정
      const endpoint = userType === 'advertiser' 
        ? `${API_BASE_URL}/advertiser/mypage/password`
        : `${API_BASE_URL}/influencer/mypage/password`;

      console.log('🔒 비밀번호 변경 요청:', endpoint);

      const response = await authenticatedFetch(endpoint, {
        method: 'POST', // 또는 POST - 백엔드에서 어떤 메서드를 사용하는지 확인 필요
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // 기존 비밀번호 오류인 경우 특별 처리
        if (response.status === 400 && errorData.message?.includes('비밀번호')) {
          setErrors({ currentPassword: '기존 비밀번호가 올바르지 않습니다.' });
          return;
        }
        
        throw new Error(errorData.message || '비밀번호 변경에 실패했습니다.');
      }

      const result = await response.json();
      console.log('✅ 비밀번호 변경 성공:', result);

      alert('비밀번호가 성공적으로 변경되었습니다!');
      navigate(`/${userType}/mypage`);

    } catch (err) {
      console.error('🚨 비밀번호 변경 실패:', err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/${userType}/mypage`);
  };

  return (
    <Container>
      <Title>비밀번호 수정</Title>

      <Section>
        <Label>기존 비밀번호 *</Label>
        <InputGroup>
          <Input
            type={showPasswords.current ? 'text' : 'password'}
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleInputChange}
            className={errors.currentPassword ? 'error' : ''}
            placeholder="기존 비밀번호를 입력하세요"
          />
          <EyeIcon onClick={() => togglePasswordVisibility('current')}>
            {showPasswords.current ? <FaEye /> : <FaEyeSlash />}
          </EyeIcon>
        </InputGroup>
        {errors.currentPassword && <ErrorMessage>{errors.currentPassword}</ErrorMessage>}

        <Label>새 비밀번호 *</Label>
        <InputGroup>
          <Input
            type={showPasswords.new ? 'text' : 'password'}
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            className={errors.newPassword ? 'error' : ''}
            placeholder="새 비밀번호를 입력하세요"
          />
          <EyeIcon onClick={() => togglePasswordVisibility('new')}>
            {showPasswords.new ? <FaEye /> : <FaEyeSlash />}
          </EyeIcon>
        </InputGroup>
        {errors.newPassword && <ErrorMessage>{errors.newPassword}</ErrorMessage>}

        <Label>새 비밀번호 확인 *</Label>
        <InputGroup>
          <Input
            type={showPasswords.confirm ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={errors.confirmPassword ? 'error' : ''}
            placeholder="새 비밀번호를 다시 입력하세요"
          />
          <EyeIcon onClick={() => togglePasswordVisibility('confirm')}>
            {showPasswords.confirm ? <FaEye /> : <FaEyeSlash />}
          </EyeIcon>
        </InputGroup>
        {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
      </Section>

      <ButtonRow>
        <CancelButton onClick={handleCancel}>
          취소
        </CancelButton>
        <ChangeButton onClick={handleChangePassword} disabled={loading}>
          변경
        </ChangeButton>
      </ButtonRow>
    </Container>
  );
};

export default ChangePwd;