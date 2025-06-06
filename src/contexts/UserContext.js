// src/contexts/UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const USER_TYPES = {
  ADVERTISER: 'advertiser',
  INFLUENCER: 'influencer',
  ADMIN: 'admin'
};

// JWT 토큰 관련 유틸리티 함수들
const tokenUtils = {
  setToken: (token) => {
    localStorage.setItem('accessToken', token);
  },
  
  getToken: () => {
    return localStorage.getItem('accessToken');
  },
  
  removeToken: () => {
    localStorage.removeItem('accessToken');
  },
  
  // JWT 토큰 디코딩 - 한글 지원
  decodeToken: (token) => {
    try {
      if (!token) return null;
      
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('⚠️ JWT 형식이 아닙니다');
        return null;
      }
      
      const payload = parts[1];
      
      // Base64 URL → Base64 변환
      let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      
      // 패딩 추가
      while (base64.length % 4) {
        base64 += '=';
      }
      
      // ⭐ 한글 지원을 위한 UTF-8 디코딩
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // UTF-8 디코딩
      const utf8String = new TextDecoder('utf-8').decode(bytes);
      const decoded = JSON.parse(utf8String);
      
      console.log('✅ JWT 토큰 디코딩 성공:', {
        userId: decoded.userId,
        userName: decoded.userName,
        role: decoded.role,
        발급시간: decoded.iat ? new Date(decoded.iat * 1000).toLocaleString() : '없음',
        만료시간: decoded.exp ? new Date(decoded.exp * 1000).toLocaleString() : '없음'
      });
      
      return decoded;
      
    } catch (error) {
      console.warn('⚠️ 토큰 디코딩 실패:', error.message);
      return null;
    }
  },
  
  // 토큰 만료 확인
  isTokenExpired: (token) => {
    if (!token) return true;
    
    try {
      const decoded = tokenUtils.decodeToken(token);
      if (!decoded || !decoded.exp) {
        console.log('🔍 토큰 만료시간 없음 - 유효한 것으로 처리');
        return false;
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = decoded.exp < currentTime;
      
      return isExpired;
    } catch (error) {
      console.warn('⚠️ 토큰 만료 확인 실패, 유효한 것으로 처리:', error.message);
      return false;
    }
  }
};

export const UserProvider = ({ children }) => {
  const [userType, setUserType] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({
    id: null,
    name: '',
    email: '',
    role: ''
  });

  // 로그아웃 함수
  const logout = () => {
    setUserType(null);
    setIsLoggedIn(false);
    setUserInfo({ id: null, name: '', email: '', role: '' });
    tokenUtils.removeToken();
    localStorage.removeItem('userEmail'); // 저장된 이메일도 삭제
  };

  // 🆕 사용자 정보 업데이트 함수 (토큰은 그대로, 화면 표시만 변경)
  const updateUserInfo = (newUserInfo) => {
    setUserInfo(prev => ({
      ...prev,
      ...newUserInfo
    }));
    
    console.log('✅ 사용자 정보 업데이트:', newUserInfo);
  };

  // 토큰에서 사용자 정보 추출 및 설정
  const restoreUserFromToken = (token, savedEmail = '') => {
    try {
      console.log('🔍 토큰에서 사용자 정보 추출 시도...');
      
      const decoded = tokenUtils.decodeToken(token);
      if (!decoded) {
        console.error('❌ 토큰 디코딩 실패');
        return false;
      }

      console.log('📋 토큰에서 추출된 정보:', decoded);

      // JWT payload에서 사용자 정보 추출
      const userInfo = {
        id: decoded.userId || decoded.user_id || 1,
        name: decoded.userName || decoded.user_name || '사용자',
        email: decoded.email || savedEmail || '', // 토큰의 이메일 또는 저장된 이메일 사용
        role: decoded.role || 'advertiser'
      };

      let normalizedUserType = decoded.role || 'advertiser';

      setUserType(normalizedUserType);
      setIsLoggedIn(true);
      setUserInfo({
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        role: normalizedUserType
      });

      console.log('✅ 토큰에서 사용자 정보 설정 완료:', userInfo);
      return true;

    } catch (error) {
      console.error('❌ 토큰에서 사용자 정보 추출 실패:', error);
      return false;
    }
  };

  // 앱 시작시 토큰 확인 및 사용자 정보 복원
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 앱 초기화 시작...');
      
      const token = tokenUtils.getToken();
      
      if (!token) {
        console.log('❌ 토큰이 없음 - 로그아웃 상태');
        setIsLoading(false);
        return;
      }

      // 토큰이 만료되었는지 확인
      if (tokenUtils.isTokenExpired(token)) {
        console.log('⏰ 토큰이 만료되었습니다. 로그아웃합니다.');
        logout();
        setIsLoading(false);
        return;
      }

      console.log('✅ 유효한 토큰 발견 - 사용자 정보 복원 시도');
      
      // 관리자 계정 체크 (하드코딩)
      const decoded = tokenUtils.decodeToken(token);
      if (decoded && decoded.email === 'admin@example.com') {
        console.log('👑 관리자 계정 로그인 복원');
        setUserType('admin');
        setIsLoggedIn(true);
        setUserInfo({
          id: 999,
          name: '관리자',
          email: 'admin@example.com',
          role: 'admin'
        });
        setIsLoading(false);
        return;
      }

      // 일반 사용자 정보 복원 (토큰에서 직접 추출)
      // localStorage에 저장된 이메일이 있다면 함께 전달
      const savedEmail = localStorage.getItem('userEmail') || '';
      const success = restoreUserFromToken(token, savedEmail);
      
      if (!success) {
        console.log('❌ 사용자 정보 복원 실패 - 로그아웃');
        logout();
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // login 함수
  const login = async (email, password, selectedUserType = 'advertiser') => {
    try {
      setIsLoading(true);
      
      // 관리자 계정 하드코딩 처리 (임시)
      if (email === 'admin@example.com' && password === 'admin') {
        const fakeToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' +
                        btoa(JSON.stringify({ 
                          userId: 999, 
                          name: '관리자', 
                          email: 'admin@example.com', 
                          userType: 'admin',
                          exp: Math.floor(Date.now() / 1000) + (60 * 60)
                        })) + '.signature';
        
        tokenUtils.setToken(fakeToken);
        setUserType('admin');
        setIsLoggedIn(true);
        setUserInfo({
          id: 999,
          name: '관리자',
          email: 'admin@example.com',
          role: 'admin'
        });
        
        return { success: true };
      }

      // 실제 백엔드 API 호출
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          role: selectedUserType === 'advertiser' ? 'advertiser' : 'influencer',
          email, 
          password 
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('API 에러:', data);
        
        let errorMessage;
        
        if (response.status === 401) {
          errorMessage = '이메일 또는 비밀번호를 확인해주세요.';
        } else if (response.status === 400) {
          errorMessage = '입력 정보를 확인해주세요.';
        } else if (response.status === 404) {
          errorMessage = '존재하지 않는 계정입니다. 회원가입을 먼저 진행해주세요.';
        } else if (response.status === 500) {
          errorMessage = '이메일 또는 비밀번호를 확인해주세요.';
        } else {
          errorMessage = data.message || '로그인에 실패했습니다.';
        }
        
        throw new Error(errorMessage);
      }

      console.log('✅ 로그인 성공! API 응답:', data);

      // 토큰 저장
      const accessToken = data.accessToken;
      
      if (!accessToken) {
        throw new Error('서버에서 토큰을 받지 못했습니다.');
      }

      tokenUtils.setToken(accessToken);

      // 로그인 시 이메일을 localStorage에 저장 (토큰에 이메일이 없을 경우를 대비)
      localStorage.setItem('userEmail', email);

      // API 응답 데이터를 우선 사용하고, 토큰에도 저장된 이메일 정보 활용
      console.log('📋 API 응답에서 사용자 정보 추출:', data);

      const userInfo = {
        id: data.userId || 1,
        name: data.user_name || data.name || '사용자',
        email: email, // 로그인 시 입력한 이메일 사용
        role: data.role || selectedUserType
      };

      let normalizedUserType = data.role || selectedUserType;

      // 상태 업데이트
      setUserType(normalizedUserType);
      setIsLoggedIn(true);
      setUserInfo({
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        role: normalizedUserType
      });

      console.log('✅ 로그인 상태 업데이트 완료');

      return { success: true };
      
    } catch (error) {
      console.error('로그인 오류:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // authenticatedFetch
  const authenticatedFetch = async (url, options = {}) => {
    const token = tokenUtils.getToken();
    
    if (!token) {
      console.log('❌ 토큰이 없음');
      logout();
      throw new Error('로그인이 필요합니다.');
    }
    
    // 토큰 만료 검사
    if (tokenUtils.isTokenExpired(token)) {
      console.log('⏰ 토큰이 만료되어 로그아웃합니다.');
      logout();
      throw new Error('로그인이 만료되었습니다. 다시 로그인해주세요.');
    }

    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    return fetch(url, { ...options, ...defaultOptions });
  };

  const getHomePath = () => {
  if (userType === USER_TYPES.ADVERTISER) return '/advertiser/home';
  if (userType === USER_TYPES.INFLUENCER) return '/influencer/home';
  if (userType === USER_TYPES.ADMIN) return '/admin/home'; 
  return '/';
};

  const value = {
    userType,
    isLoggedIn,
    isLoading,
    userInfo,
    
    login,
    logout,
    updateUserInfo, // 🆕 추가
    getHomePath,
    authenticatedFetch,
    
    getToken: tokenUtils.getToken,
    isTokenExpired: tokenUtils.isTokenExpired
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser는 UserProvider 안에서만 사용할 수 있습니다!');
  }
  return context;
};