import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // UserContext 사용
  const { isLoggedIn, userType, loginAdmin } = useUser();
  
  const [loginData, setLoginData] = useState({
    id: '',
    password: ''
  });

  // 이미 admin으로 로그인된 경우 admin home으로 리다이렉트
  useEffect(() => {
    if (isLoggedIn && userType === 'admin') {
      navigate('/admin/home');
    }
  }, [isLoggedIn, userType, navigate]);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    const { id, password } = loginData;

    if (!id || !password) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      
      // UserContext의 loginAdmin 함수 사용
      const result = await loginAdmin(id, password);
      
      if (result.success) {
        console.log('✅ 관리자 로그인 성공');
        navigate('/admin/home');
      } else {
        throw new Error(result.error);
      }
      
    } catch (err) {
      console.error('🚨 관리자 로그인 오류:', err);
      
      let errorMessage = '로그인에 실패했습니다.';
      
      if (err.message) {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Container>
      <LoginCard>
        <Form onSubmit={handleLoginSubmit}>
          <Title>Admin Sign In</Title>
          
          <RadioGroup>
            <RadioLabel>
              <RadioInput 
                type="radio" 
                name="userType" 
                value="admin"
                checked={true} 
                readOnly
              />
              관리자
            </RadioLabel>
          </RadioGroup>
          
          <InputContainer>
            <InputGroup>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.55134 3.50407 9.31167C2.52216 10.2794 2.02502 11.72 2.02502 13.5999C2.02502 13.8623 2.23769 14.0749 2.50002 14.0749C2.76236 14.0749 2.97502 13.8623 2.97502 13.5999C2.97502 8.55134 4.89069 6.97502 7.5 6.97502C10.1093 6.97502 12.025 8.55134 12.025 13.5999C12.025 13.8623 12.2376 14.0749 12.5 14.0749C12.7623 14.0749 12.975 13.8623 12.975 13.5999C12.975 11.72 12.4778 10.2794 11.4959 9.31167C10.7244 8.55134 9.70026 8.12901 8.50627 7.98351C10.0188 7.54738 11.125 6.15288 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875ZM4.825 4.5C4.825 3.02264 6.02264 1.825 7.5 1.825C8.97736 1.825 10.175 3.02264 10.175 4.5C10.175 5.97736 8.97736 7.175 7.5 7.175C6.02264 7.175 4.825 5.97736 4.825 4.5Z" fill="currentColor"/>
              </svg>
              <Input 
                name="id" 
                placeholder="관리자 아이디" 
                type="text"
                value={loginData.id}
                onChange={handleLoginChange}
                required
              />
            </InputGroup>
            
            <InputGroup>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.5 6.5V4.5C4.5 2.84315 5.84315 1.5 7.5 1.5C9.15685 1.5 10.5 2.84315 10.5 4.5V6.5M4.5 6.5H10.5M4.5 6.5H2.5V13.5H12.5V6.5H10.5" stroke="currentColor"/>
              </svg>
              <Input 
                name="password" 
                placeholder="관리자 비밀번호" 
                type={showPassword ? 'text' : 'password'}
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
              <EyeIcon onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </EyeIcon>
            </InputGroup>
          </InputContainer>
          
          <ButtonContainer>
            <Button type="submit" disabled={isLoading}>
              로그인
            </Button>
          </ButtonContainer>
          

        </Form>
      </LoginCard>
    </Container>
  );
};

export default AdminLogin;

// 스타일드 컴포넌트들
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LoginCard = styled.div`
  width: 400px;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 350px;
  }
`;

const Form = styled.form`
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const Title = styled.h2`
  font-size: 32px;
  margin-bottom: 20px;
  font-weight: 500;
  color: var(--color-primary, #00cbA4);
  text-align: center;
`;

const Button = styled.button`
  border-radius: 30px;
  border: none;
  background-color: ${props => 
    props.disabled 
      ? '#cccccc'
      : 'var(--color-primary, #00cbA4)'
  };
  color: ${props => 
    props.disabled 
      ? '#666666'
      : 'white'
  };
  font-size: 14px;
  font-weight: bold;
  padding: 15px 50px;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  margin-top: 10px;
  
  &:hover {
    opacity: ${props => props.disabled ? '1' : '0.9'};
    background-color: ${props => 
      props.disabled 
        ? '#cccccc'
        : '#00b195'
    };
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
  }
  
  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
  }

  &:disabled {
    opacity: 0.7;
    box-shadow: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  width: 100%;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 300px;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  background-color: #f6f6f6;
  border-radius: 5px;
  margin: 8px 0;
  padding: 0 15px;
  transition: all 0.3s ease;
  
  &:focus-within {
    background-color: #f0f0f0;
    box-shadow: 0 0 0 2px rgba(0, 203, 164, 0.2);
  }
  
  svg:first-child {
    color: #aaa;
    margin-right: 10px;
    transition: color 0.3s ease;
  }
  
  &:focus-within svg:first-child {
    color: var(--color-primary, #00cbA4);
  }
`;

const Input = styled.input`
  background-color: transparent;
  border: none;
  padding: 15px 0;
  width: 100%;
  font-size: 14px;
  
  &::placeholder {
    color: #aaa;
    font-weight: bold;
  }
  
  &:focus {
    outline: none;
  }

  /* 브라우저 기본 비밀번호 아이콘 숨기기 */
  &::-ms-reveal,
  &::-ms-clear {
    display: none;
  }
  
  &::-webkit-credentials-auto-fill-button {
    display: none !important;
    visibility: hidden;
    pointer-events: none;
    position: absolute;
    right: 0;
  }
  
  &[type="password"]::-webkit-textfield-decoration-container {
    display: none !important;
  }

  &[type="password"] {
    -moz-appearance: textfield;
  }
  
  &[type="password"]::-webkit-outer-spin-button,
  &[type="password"]::-webkit-inner-spin-button {
    display: none !important;
    -webkit-appearance: none;
    margin: 0;
  }
`;

const EyeIcon = styled.div`
  cursor: pointer;
  color: #aaa;
  padding: 8px;
  display: flex;
  align-items: center;
  font-size: 16px;
  transition: all 0.2s ease;
  border-radius: 4px;
  
  &:hover {
    color: var(--color-primary, #00cbA4);
    background-color: rgba(0, 203, 164, 0.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const RadioGroup = styled.div`
  display: flex;
  justify-content: center;
  margin: 15px 0 25px 0;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 16px;
  color: #555;
  font-weight: 500;
`;

const RadioInput = styled.input`
  margin-right: 8px;
  accent-color: var(--color-submit-btn);
  transform: scale(1.2);
`;