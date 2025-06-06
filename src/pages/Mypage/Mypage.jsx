import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import styled from 'styled-components';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const Section = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  min-width: 0;
  box-sizing: border-box;
`;

const Label = styled.div`
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 6px;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  max-width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 16px;
  box-sizing: border-box;
  min-width: 0;

  &:disabled {
    background-color: white;
    color: #333;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  max-width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  height: 120px;
  resize: none;
  box-sizing: border-box;
  min-width: 0;

  &:disabled {
    background-color: white;
    color: #333;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 18px;
  font-size: 14px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  background-color: ${({ primary }) => (primary ? '#00cba4' : '#eee')};
  color: ${({ primary }) => (primary ? 'white' : '#333')};

  &:hover {
    background-color: ${({ primary }) => (primary ? '#00b092' : '#ddd')};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 20px auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 14px;
  text-align: center;
  margin: 20px 0;
`;

const Mypage = () => {
  const navigate = useNavigate();
  const { authenticatedFetch, userInfo: contextUserInfo, userType } = useUser(); // 이름 변경

  // 상태 관리
  const [userInfo, setUserInfo] = useState({
    email: '',
    name: '',
    description: '',
    walletAddress: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 사용자 정보 조회
  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      setError('');

      // 디버깅: 현재 상태 확인
      console.log('🔍 디버깅 정보:');
      console.log('- userType:', userType);
      console.log('- userInfo.role:', contextUserInfo.role);
      console.log('- accessToken 존재:', !!localStorage.getItem('accessToken'));
      console.log('- accessToken:', localStorage.getItem('accessToken')?.substring(0, 20) + '...');

      // 역할별 API 엔드포인트 결정 - userType 사용

      const endpoint = userType === 'advertiser' 
        ? `${API_BASE_URL}/advertiser/mypage`
        : `${API_BASE_URL}/influencer/mypage`;

      console.log('🔍 사용자 정보 조회:', endpoint);

      const response = await authenticatedFetch(endpoint);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '사용자 정보를 불러오는데 실패했습니다.');
      }

      const userData = await response.json();
      console.log('✅ 사용자 정보 조회 성공:', userData);

      setUserInfo({
        email: userData.email || '',
        name: userData.name || '',
        description: userData.description || '',
        walletAddress: userData.walletAddress || ''
      });

    } catch (err) {
      console.error('🚨 사용자 정보 조회 실패:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 사용자 정보 조회
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // 지갑 주소 포맷팅 (긴 주소를 줄여서 표시)
  const formatWalletAddress = (address) => {
    if (!address) return '';
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-10)}`;
  };

  // 로딩 중일 때
  if (loading) {
    return (
      <Container>
        <Title>마이페이지</Title>
        <LoadingSpinner />
      </Container>
    );
  }

  // 에러가 있을 때
  if (error) {
    return (
      <Container>
        <Title>마이페이지</Title>
        <ErrorMessage>
          {error}
          <br />
          <Button 
            onClick={fetchUserInfo} 
            style={{ marginTop: '10px', fontSize: '12px', padding: '6px 12px' }}
          >
            다시 시도
          </Button>
        </ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Title>마이페이지</Title>

      <Section>
        <Label>이메일</Label>
        <Input value={userInfo.email} disabled />
      </Section>

      <Section>
        <Label>이름</Label>
        <Input value={userInfo.name} disabled />

        <Label>블록체인 지갑 주소</Label>
        <Input 
          value={formatWalletAddress(userInfo.walletAddress)} 
          disabled 
          title={userInfo.walletAddress} // 전체 주소를 툴팁으로 표시
        />

        <Label>설명</Label>
        <Textarea value={userInfo.description} disabled />
      </Section>

      <ButtonRow>
        <Button primary onClick={() => navigate(`/${userType}/mypage/edit`)}>
          정보 수정
        </Button>
        <Button onClick={() => navigate(`/${userType}/mypage/changepwd`)}>
          비밀번호 수정
        </Button>
      </ButtonRow>
    </Container>
  );
};

export default Mypage;