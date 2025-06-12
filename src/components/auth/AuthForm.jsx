import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useUser } from '../../contexts/UserContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const COMMON_DOMAINS = ['gmail.com', 'naver.com', 'daum.net', 'sookmyung.ac.kr','example.com', '직접 입력']; 

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AuthForm = () => {
  const { login, isLoading } = useUser();
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [userType, setUserType] = useState('advertiser');
  const [emailId, setEmailId] = useState('');
  const [emailDomain, setEmailDomain] = useState('gmail.com');
  const [customDomain, setCustomDomain] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordCheck, setShowPasswordCheck] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  
  const [emailError, setEmailError] = useState('');
  const [walletError, setWalletError] = useState('');

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [signupData, setSignupData] = useState({
    name: '',
    password: '',
    passwordCheck: '',
    blockchainwallet: '',
    description: ''
  });

  const validateEmailId = (input) => {
    const emailIdRegex = /^[a-zA-Z0-9._-]*$/;
    return emailIdRegex.test(input);
  };
 
  const validateDomain = (input) => {
    const domainRegex = /^[a-zA-Z0-9.-]*$/;
    return domainRegex.test(input);
  };
  
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmailError(''); // 모드 전환시 에러 초기화
  };
  
  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  // 이메일 ID 입력 핸들러
  const handleEmailIdChange = (e) => {
    const value = e.target.value;
    
    if (validateEmailId(value)) {
      setEmailId(value);
      setEmailError('');
    } else {
      setEmailError('유효한 이메일을 작성해주세요.');
    }
  };

  const validateWalletAddress = (address) => {
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    return walletRegex.test(address);
  };

  // 커스텀 도메인 입력 핸들러
  const handleCustomDomainChange = (e) => {
    const value = e.target.value;
    
    setCustomDomain(value);
    setEmailError(''); 
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    // 직접 입력이면 확인하기
    const finalEmail = emailDomain === '직접 입력' 
      ? customDomain  
      : `${emailId}@${emailDomain}`;  

    // 유효성 검사 수정
    if (emailDomain === '직접 입력') {
      if (!customDomain.trim()) return alert('이메일을 입력해주세요.');
      if (!/^\S+@\S+\.\S+$/.test(customDomain)) return alert('유효한 이메일 형식이 아닙니다 (예: user@example.com).');
    } else {
      if (!emailId.trim()) return alert('이메일 ID를 입력해주세요.');
    }
    
    if (!signupData.name.trim()) return alert('이름을 입력해주세요.');
    if (!signupData.password) return alert('비밀번호를 입력해주세요.');
    if (signupData.password !== signupData.passwordCheck) return alert('비밀번호가 일치하지 않습니다.');

    if (!signupData.blockchainwallet.trim()) return alert('블록체인 지갑 주소를 입력해주세요.');
    if (!validateWalletAddress(signupData.blockchainwallet)) {
      return alert('올바른 이더리움 지갑 주소를 입력해주세요.\n형식: 0x로 시작하는 40자리 16진수\n예시: 0x1234567890abcdef1234567890abcdef12345678');
    }

    console.log('🚀 회원가입 시도:', {
      email: finalEmail,
      name: signupData.name,
      userType: userType,
      role: userType === 'advertiser' ? 'advertiser' : 'influencer'
    });

    try {
      setIsSignupLoading(true);
      
      const requestData = {
        role: userType === 'advertiser' ? 'advertiser' : 'influencer',
        email: finalEmail,
        password: signupData.password,
        passwordConfirm: signupData.passwordCheck,
        walletAddress: signupData.blockchainwallet || '0x0000000000000000', 
        name: signupData.name.trim(),
        description: signupData.description || '' 
      };

      console.log('📤 회원가입 요청 데이터:', requestData);

      const response = await axios.post(`${API_BASE_URL}/auth/signup`, requestData);

      console.log('✅ 회원가입 성공 응답:', response.data);
      alert('회원가입이 완료되었습니다!');
      
      // 폼 초기화
      setSignupData({
        name: '',
        password: '',
        passwordCheck: '',
        blockchainwallet: '',
        description: ''
      });
      setEmailId('');
      setEmailDomain('gmail.com');
      setCustomDomain('');
      setEmailError('');
      
      // 자동 로그인 시도
      console.log('🔄 자동 로그인 시도...');
      const loginResult = await login(finalEmail, signupData.password, userType);
      
      if (loginResult.success) {
        console.log('✅ 자동 로그인 성공! 홈 화면으로 이동합니다.');
      } else {
        console.log('❌ 자동 로그인 실패:', loginResult.error);
        alert('회원가입은 성공했습니다. 로그인 화면에서 다시 로그인해주세요.');
        setIsSignUp(false);
      }
      
    } catch (err) {
      console.error('🚨 회원가입 오류:', err);
      
      let errorMessage = '회원가입에 실패했습니다.';
      
      if (err.response) {
        console.error('서버 에러 응답:', err.response.data);
        console.error('에러 상태:', err.response.status);
        
        if (err.response.status === 400) {
          errorMessage = err.response.data.message || '입력 정보를 확인해주세요.';
        } else if (err.response.status === 409) {
          errorMessage = '이미 존재하는 이메일입니다.';
        } else if (err.response.status === 500) {
          errorMessage = '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else {
          errorMessage = err.response.data.message || errorMessage;
        }
      } else if (err.request) {
        errorMessage = '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.';
      }
      
      alert(errorMessage);
    } finally {
      setIsSignupLoading(false); 
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    const { email, password } = loginData;

    if (!email || !password) {
      alert('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    const result = await login(email, password, userType);
    
    if (!result.success) {
      alert(result.error || '로그인에 실패했습니다.');
    }
  };
  
  return (
    <Container>
      <OverlayContainer isSignUp={isSignUp}>
        <OverlayPanel>
          <SVGImage src="/shape1.svg" width="700px" top="-120px" left="-300px" style={{ transform: "rotate(0)" }} />
          <SVGImage src="/shape2.svg" width="700px" top="-100px" left="-450px" style={{ transform: "rotate(0)" }} />
          <SVGImage src="/circle.svg" width="200px" bottom="-90px" left="-100px" />
          <Logo>
            <img src="/logo.svg" alt="Green Salary Logo" />
          </Logo>
          
          {isSignUp ? (
            <>
              <Title light>Welcome Back!</Title>
              <Subtitle light>
                로그인하고 Green Salary 서비스를<br />
                바로 시작하세요.
              </Subtitle>
              <Button outline onClick={toggleMode}>
                로그인 하기
              </Button>
            </>
          ) : (
            <>
              <Title light>Welcome</Title>
              <Subtitle light>
                블록체인(BlockChain)과 AI를 활용해<br />
                단발성 바이럴 계약을 신뢰 있게<br />
                자동화하는 계약 관리 특화 웹 서비스
              </Subtitle>
              <Button outline onClick={toggleMode}>
                회원가입하기
              </Button>
            </>
          )}
        </OverlayPanel>
      </OverlayContainer>

      {/* 로그인 폼 */}
      <SignInContainer isSignUp={isSignUp}>
        <Form onSubmit={handleLoginSubmit}>
          <Title>Sign In</Title>
          
          <RadioGroup>
            <RadioLabel>
              <RadioInput 
                type="radio" 
                name="userType" 
                value="advertiser"
                checked={userType === 'advertiser'} 
                onChange={handleUserTypeChange}
              />
              광고주
            </RadioLabel>
            <RadioLabel>
              <RadioInput 
                type="radio" 
                name="userType" 
                value="influencer"
                checked={userType === 'influencer'} 
                onChange={handleUserTypeChange}
              />
              콘텐츠 제작자
            </RadioLabel>
          </RadioGroup>
          
          <InputContainer>
            <InputGroup>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.5 4.5C0.5 3.39543 1.39543 2.5 2.5 2.5H12.5C13.6046 2.5 14.5 3.39543 14.5 4.5V10.5C14.5 11.6046 13.6046 12.5 12.5 12.5H2.5C1.39543 12.5 0.5 11.6046 0.5 10.5V4.5Z" stroke="currentColor"/>
                <path d="M0.5 4.5L7.5 8.5L14.5 4.5" stroke="currentColor"/>
              </svg>
              <Input 
                name="email" 
                placeholder="이메일" 
                type="email"
                value={loginData.email}
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
                placeholder="비밀번호" 
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
          
          <MobileToggle type="button" onClick={toggleMode}>
            계정이 없으신가요? 회원가입
          </MobileToggle>
        </Form>
      </SignInContainer>

      {/* 회원가입 폼 */}
      <SignUpContainer isSignUp={isSignUp}>
        <Form onSubmit={handleSignupSubmit}>
          <Title>Create Account</Title>
          
          <RadioGroup>
            <RadioLabel>
              <RadioInput 
                type="radio" 
                name="userType" 
                value="advertiser"
                checked={userType === 'advertiser'} 
                onChange={handleUserTypeChange}
              />
              광고주
            </RadioLabel>
            <RadioLabel>
              <RadioInput 
                type="radio" 
                name="userType" 
                value="influencer"
                checked={userType === 'influencer'} 
                onChange={handleUserTypeChange}
              />
              콘텐츠 제작자
            </RadioLabel>
          </RadioGroup>
          
          <InputContainer>
            <InputGroup>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.55134 3.50407 9.20284C2.52216 10.0266 2.02502 11.1315 2.02502 12.375V14.125H12.975V12.375C12.975 11.1315 12.4779 10.0266 11.496 9.20284C10.7245 8.55134 9.7003 8.12901 8.50626 7.98351C10.0188 7.54738 11.125 6.15288 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875Z" stroke="currentColor"/>
              </svg>
              <Input 
                name="name" 
                placeholder="이름 혹은 ID"
                value={signupData.name}
                onChange={handleSignupChange}
                required
              />
            </InputGroup>
            
            {/* 이메일 입력 - 원래 방식 (별도 줄) */}
            <InputGroup>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.5 4.5C0.5 3.39543 1.39543 2.5 2.5 2.5H12.5C13.6046 2.5 14.5 3.39543 14.5 4.5V10.5C14.5 11.6046 13.6046 12.5 12.5 12.5H2.5C1.39543 12.5 0.5 11.6046 0.5 10.5V4.5Z" stroke="currentColor"/>
                <path d="M0.5 4.5L7.5 8.5L14.5 4.5" stroke="currentColor"/>
              </svg>
              <Input
                type="text"
                placeholder={emailDomain === '직접 입력' ? ' ' : '이메일 ID'}
                value={emailId}
                onChange={handleEmailIdChange}
                style={{ 
                  flex: 1,
                  opacity: emailDomain === '직접 입력' ? 0.5 : 1,  
                  cursor: emailDomain === '직접 입력' ? 'not-allowed' : 'text'
                }}
                disabled={emailDomain === '직접 입력'}  
                required={emailDomain !== '직접 입력'}
              />
              {emailDomain !== '직접 입력' && (
                <span style={{ margin: '0 8px', color: '#666', fontSize: '16px' }}>@</span>
              )}
              <select 
                value={emailDomain} 
                onChange={(e) => {
                  setEmailDomain(e.target.value);
                  if (e.target.value === '직접 입력') {
                    setEmailId('');  
                  } else {
                    setCustomDomain('');  
                  }
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#666',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '3px'
                }}
                onFocus={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'}
                onBlur={(e) => e.target.style.backgroundColor = 'transparent'}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                {COMMON_DOMAINS.map((domain, idx) => (
                  <option key={idx} value={domain}>{domain}</option>
                ))}
              </select>
            </InputGroup>

            {/* 직접 입력시 별도 줄 도메인 입력 */}
            {emailDomain === '직접 입력' && (
              <InputGroup>
                <Input
                  type="text"
                  placeholder="이메일 직접입력 (예: user@example.com)"
                  value={customDomain}
                  onChange={handleCustomDomainChange}
                  required
                />
              </InputGroup>
            )}

            {/* 이메일 에러 메시지 */}
            {emailError && (
              <ErrorMessage>{emailError}</ErrorMessage>
            )}
            
            <InputGroup>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.5 6.5V4.5C4.5 2.84315 5.84315 1.5 7.5 1.5C9.15685 1.5 10.5 2.84315 10.5 4.5V6.5M4.5 6.5H10.5M4.5 6.5H2.5V13.5H12.5V6.5H10.5" stroke="currentColor"/>
              </svg>
              <Input 
                name="password" 
                placeholder="비밀번호" 
                type={showSignupPassword ? 'text' : 'password'}
                value={signupData.password}
                onChange={handleSignupChange}
                required
              />
              <EyeIcon onClick={() => setShowSignupPassword(!showSignupPassword)}>
                {showSignupPassword ? <FaEye /> : <FaEyeSlash />}
              </EyeIcon>
            </InputGroup>
            
            <InputGroup>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.5 6.5V4.5C4.5 2.84315 5.84315 1.5 7.5 1.5C9.15685 1.5 10.5 2.84315 10.5 4.5V6.5M4.5 6.5H10.5M4.5 6.5H2.5V13.5H12.5V6.5H10.5" stroke="currentColor"/>
              </svg>
              <Input 
                name="passwordCheck" 
                placeholder="비밀번호 재확인" 
                type={showPasswordCheck ? 'text' : 'password'}
                value={signupData.passwordCheck}
                onChange={handleSignupChange}
                required
              />
              <EyeIcon onClick={() => setShowPasswordCheck(!showPasswordCheck)}>
                {showPasswordCheck ? <FaEye /> : <FaEyeSlash />}
              </EyeIcon>
            </InputGroup>

            <InputGroup>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 7C2 5.89543 2.89543 5 4 5H20C21.1046 5 22 5.89543 22 7V17C22 18.1046 21.1046 19 20 19H4C2.89543 19 2 18.1046 2 17V7Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <Input
                name="blockchainwallet"
                placeholder="블록체인 지갑 주소"
                type="text"
                value={signupData.blockchainwallet}
                onChange={handleSignupChange}
                required
              />
            </InputGroup>
          </InputContainer>
          
          <ButtonContainer>
            <Button type="submit" disabled={isSignupLoading}>
              회원가입하기
            </Button>
          </ButtonContainer>
          
          <MobileToggle type="button" onClick={toggleMode}>
            이미 계정이 있으신가요? 로그인
          </MobileToggle>
        </Form>
      </SignUpContainer>
    </Container>
  );
};

export default AuthForm;

// 스타일드 컴포넌트들
const Container = styled.div`
  width: 800px;
  height: 500px;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  margin: 50px auto;
  background-color: white;
  
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);

  @media (max-width: 768px) {
    width: 100%;
    max-width: 400px;
    height: auto;
    box-shadow: none;
    min-height: 500px;
  }
`;

const FormContainer = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  width: 50%;
  overflow: hidden;
  z-index: 1;
  
  @media (max-width: 768px) {
    width: 100%;
    left: 0;
    right: 0;
  }
`;

const SignInContainer = styled(FormContainer)`
  right: 0;
  opacity: ${props => props.isSignUp ? 0 : 1};
  visibility: ${props => props.isSignUp ? 'hidden' : 'visible'};
  transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
  transition-delay: ${props => props.isSignUp ? '0s' : '0.5s'};
`;

const SignUpContainer = styled(FormContainer)`
  left: 0;
  opacity: ${props => props.isSignUp ? 1 : 0};
  visibility: ${props => props.isSignUp ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
  transition-delay: ${props => props.isSignUp ? '0.5s' : '0s'};
`;

const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: ${props => props.isSignUp ? '50%' : '0'};
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: all 0.6s ease-in-out;
  z-index: 100;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const OverlayPanel = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  text-align: center;
  background-color: var(--color-primary);
  overflow: visible;
`;

const SVGImage = styled.img`
  position: absolute;
  width: ${props => props.width || '100%'};
  height: ${props => props.height || 'auto'};
  top: ${props => props.top || 'auto'};
  left: ${props => props.left || 'auto'};
  right: ${props => props.right || 'auto'};
  bottom: ${props => props.bottom || 'auto'};
  transform: ${props => props.transform || 'none'};
  opacity: ${props => props.opacity || 1};
  z-index: 0;
`;

const Form = styled.form`
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 50px;
  height: 100%;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const Title = styled.h2`
  font-size: 28px;
  margin-bottom: 10px;
  font-weight: 500;
  color: ${props => props.light ? 'white' : 'var(--color-primary)'};
  text-align: center;
  position: relative;
  z-index: 2;
`;

const Subtitle = styled.p`
  text-align: center;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.5;
  color: ${props => props.light ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.6)'};
  position: relative;
  z-index: 2;
`;

const Button = styled.button`
  border-radius: 30px;
  border: ${props => props.outline ? '1px solid white' : 'none'};
  background-color: ${props => 
    props.disabled 
      ? '#cccccc'
      : props.outline 
        ? 'transparent' 
        : 'var(--color-primary)'
  };
  color: ${props => 
    props.disabled 
      ? '#666666'
      : props.outline 
        ? 'white' 
        : 'white'
  };
  font-size: 14px;
  font-weight: bold;
  padding: 12px 45px;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  margin-top: 10px;
  position: relative;
  z-index: 2;
  
  &:hover {
    opacity: ${props => props.disabled ? '1' : '0.9'};
    background-color: ${props => 
      props.disabled 
        ? '#cccccc'
        : props.outline 
          ? 'rgba(255, 255, 255, 0.2)' 
          : '#00b195'
    };
  }
  
  &:active {
    transform: ${props => props.disabled ? 'none' : 'scale(0.95)'};
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
  margin-top: 15px;
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
  padding: 12px 0;
  width: 100%;
  
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
  padding: 5px;
  display: flex;
  align-items: center;
  font-size: 16px;
  transition: color 0.2s ease;
  
  &:hover {
    color: #666;
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  font-size: 12px;
  margin-top: 4px;
  text-align: left;
  width: 100%;
  padding-left: 15px;
`;

const RadioGroup = styled.div`
  display: flex;
  justify-content: center;
  margin: 10px 0;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  margin: 0 10px;
  cursor: pointer;
  font-size: 14px;
  color: #555;
`;

const RadioInput = styled.input`
  margin-right: 6px;
  accent-color: var(--color-submit-btn);
`;

const Logo = styled.div`
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1; 
  position: relative; 
  
  img {
    width: 120px;
    height: auto;
  }
`;

const MobileToggle = styled.button`
  display: none;
  margin-top: 20px;
  background: none;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  
  @media (max-width: 768px) {
    display: block;
  }
  
  &:hover {
    background-color: rgba(0, 203, 164, 0.1);
  }
`;

const DomainText = styled.span`
  color: #666;
  font-size: 14px;
  padding: 0 8px;
  flex: 1.2;
  display: flex;
  align-items: center;
`;

const DomainSelector = styled.select`
  background-color: transparent;
  border: none;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  padding: 5px;
  border-radius: 3px;
  
  &:focus {
    outline: none;
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;