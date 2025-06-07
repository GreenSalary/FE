// src/contexts/UserContext.js - 실시간 동기화 포함 최종 완성 버전
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
  // 🆕 역할별 키 생성
  getTokenKey: (role) => `accessToken_${role}`,
  getUserEmailKey: (role) => `userEmail_${role}`,
  getUserIdKey: (role) => `userId_${role}`,

  // 🔧 역할별로 토큰 저장
  setToken: (token, role) => {
    const key = tokenUtils.getTokenKey(role);
    localStorage.setItem(key, token);
    console.log(`✅ ${role} 토큰 저장됨`);
  },
  
  // 🔧 역할별로 토큰 가져오기
  getToken: (role) => {
    const key = tokenUtils.getTokenKey(role);
    return localStorage.getItem(key);
  },
  
  // 🔧 역할별로 토큰 삭제
  removeToken: (role) => {
    const key = tokenUtils.getTokenKey(role);
    localStorage.removeItem(key);
    console.log(`🗑️ ${role} 토큰 삭제됨`);
  },

  // 🆕 사용자 정보 저장/조회/삭제
  setUserInfo: (userInfo, role) => {
    localStorage.setItem(tokenUtils.getUserEmailKey(role), userInfo.email || '');
    localStorage.setItem(tokenUtils.getUserIdKey(role), userInfo.id || '');
    console.log(`✅ ${role} 사용자 정보 저장됨`);
  },

  getUserInfo: (role) => {
    return {
      email: localStorage.getItem(tokenUtils.getUserEmailKey(role)) || '',
      id: localStorage.getItem(tokenUtils.getUserIdKey(role)) || ''
    };
  },

  removeUserInfo: (role) => {
    localStorage.removeItem(tokenUtils.getUserEmailKey(role));
    localStorage.removeItem(tokenUtils.getUserIdKey(role));
    console.log(`🗑️ ${role} 사용자 정보 삭제됨`);
  },

  // 🆕 모든 토큰 삭제 (완전 로그아웃용)
  removeAllTokens: () => {
    Object.values(USER_TYPES).forEach(role => {
      tokenUtils.removeToken(role);
      tokenUtils.removeUserInfo(role);
    });
    console.log('🗑️ 모든 토큰 및 사용자 정보 삭제됨');
  },
  
  // JWT 토큰 디코딩 - 한글 지원 (기존 코드 그대로)
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
  
  // 토큰 만료 확인 (기존 코드 그대로)
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

  // 🆕 실시간 토큰 상태 체크 함수
  const checkCurrentTokenStatus = () => {
    if (!userType) return true; // 로그인 안된 상태면 괜찮음
    
    const token = tokenUtils.getToken(userType);
    
    // 현재 역할의 토큰이 없거나 만료됨
    if (!token || tokenUtils.isTokenExpired(token)) {
      console.log(`⚠️ ${userType} 토큰이 없거나 만료됨 - 자동 로그아웃`);
      
      // 상태 초기화 (다른 창에서 로그아웃했음을 감지)
      setUserType(null);
      setIsLoggedIn(false);
      setUserInfo({ id: null, name: '', email: '', role: '' });
      
      return false;
    }
    
    return true;
  };

  // 🔧 수정: 현재 역할의 토큰만 삭제하는 로그아웃
  const logout = () => {
    if (userType) {
      tokenUtils.removeToken(userType);
      tokenUtils.removeUserInfo(userType);
    }
    
    setUserType(null);
    setIsLoggedIn(false);
    setUserInfo({ id: null, name: '', email: '', role: '' });
    console.log(`✅ ${userType} 로그아웃 완료`);
  };

  // 🆕 모든 역할 로그아웃
  const logoutAll = () => {
    tokenUtils.removeAllTokens();
    setUserType(null);
    setIsLoggedIn(false);
    setUserInfo({ id: null, name: '', email: '', role: '' });
    console.log('✅ 전체 로그아웃 완료');
  };

  // 🆕 사용자 정보 업데이트 함수
  const updateUserInfo = (newUserInfo) => {
    setUserInfo(prev => ({
      ...prev,
      ...newUserInfo
    }));
    
    console.log('✅ 사용자 정보 업데이트:', newUserInfo);
  };

  // 🔧 수정: 토큰에서 사용자 정보 추출 및 설정
  const restoreUserFromToken = (token, role) => {
    try {
      console.log(`🔍 ${role} 토큰에서 사용자 정보 추출 시도...`);
      
      const decoded = tokenUtils.decodeToken(token);
      if (!decoded) {
        console.error(`❌ ${role} 토큰 디코딩 실패`);
        return false;
      }

      // localStorage에서 저장된 사용자 정보 가져오기
      const savedUserInfo = tokenUtils.getUserInfo(role);

      const userInfo = {
        id: decoded.userId || decoded.user_id || savedUserInfo.id || 1,
        name: decoded.userName || decoded.user_name || '사용자',
        email: decoded.email || savedUserInfo.email || '',
        role: decoded.role || role
      };

      setUserType(role);
      setIsLoggedIn(true);
      setUserInfo({
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        role: role
      });

      console.log(`✅ ${role} 사용자 정보 설정 완료:`, userInfo);
      return true;

    } catch (error) {
      console.error(`❌ ${role} 토큰에서 사용자 정보 추출 실패:`, error);
      return false;
    }
  };

  // 🆕 현재 URL에서 역할 추출하는 함수
  const getCurrentRoleFromURL = () => {
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/influencer')) {
      return 'influencer';
    } else if (currentPath.includes('/admin')) {
      return 'admin';
    } else if (currentPath.includes('/advertiser')) {
      return 'advertiser';
    }
    
    // 기본값
    return 'advertiser';
  };

  // 🆕 Storage 이벤트 리스너 (다른 탭/창에서의 변경 감지)
  useEffect(() => {
    const handleStorageChange = (e) => {
      // 현재 역할의 토큰이 삭제되었는지 확인
      if (userType && e.key === tokenUtils.getTokenKey(userType)) {
        if (e.newValue === null) {
          // 다른 창에서 토큰이 삭제됨
          console.log(`🔄 다른 창에서 ${userType} 로그아웃 감지 - 자동 동기화`);
          
          setUserType(null);
          setIsLoggedIn(false);
          setUserInfo({ id: null, name: '', email: '', role: '' });
        }
      }
    };

    // Storage 이벤트 리스너 등록
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [userType]);

  // 🆕 주기적 토큰 상태 체크 (보조 수단)
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      checkCurrentTokenStatus();
    }, 5000); // 5초마다 체크

    return () => clearInterval(interval);
  }, [isLoggedIn, userType]);

  // 🔧 수정: 앱 시작시 토큰 확인 - URL 기반으로 역할 판단
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 앱 초기화 시작...');
      
      const currentRole = getCurrentRoleFromURL();
      console.log(`🔍 현재 경로 기반 역할: ${currentRole}`);
      
      const token = tokenUtils.getToken(currentRole);
      
      if (!token) {
        console.log(`❌ ${currentRole} 토큰이 없음 - 로그아웃 상태`);
        setIsLoading(false);
        return;
      }

      // 토큰이 만료되었는지 확인
      if (tokenUtils.isTokenExpired(token)) {
        console.log(`⏰ ${currentRole} 토큰이 만료되었습니다. 로그아웃합니다.`);
        tokenUtils.removeToken(currentRole);
        tokenUtils.removeUserInfo(currentRole);
        setIsLoading(false);
        return;
      }

      console.log(`✅ 유효한 ${currentRole} 토큰 발견 - 사용자 정보 복원 시도`);
      
      // 관리자 계정 체크
      if (currentRole === 'admin') {
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
      }

      // 일반 사용자 정보 복원
      const success = restoreUserFromToken(token, currentRole);
      
      if (!success) {
        console.log(`❌ ${currentRole} 사용자 정보 복원 실패 - 토큰 삭제`);
        tokenUtils.removeToken(currentRole);
        tokenUtils.removeUserInfo(currentRole);
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []); // 의존성 배열을 빈 배열로 유지

  // 🆕 URL 변경 감지를 위한 별도 useEffect
  useEffect(() => {
    const handleLocationChange = () => {
      const newRole = getCurrentRoleFromURL();
      
      // 현재 로그인된 역할과 URL 역할이 다르면 해당 역할로 전환 시도
      if (userType && userType !== newRole) {
        console.log(`🔄 역할 변경 감지: ${userType} → ${newRole}`);
        
        const token = tokenUtils.getToken(newRole);
        if (token && !tokenUtils.isTokenExpired(token)) {
          console.log(`✅ ${newRole} 토큰 발견 - 역할 전환`);
          restoreUserFromToken(token, newRole);
        } else {
          console.log(`❌ ${newRole} 유효한 토큰 없음 - 로그아웃`);
          setUserType(null);
          setIsLoggedIn(false);
          setUserInfo({ id: null, name: '', email: '', role: '' });
        }
      }
    };

    // popstate 이벤트 리스너 (뒤로가기/앞으로가기)
    window.addEventListener('popstate', handleLocationChange);
    
    // cleanup
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [userType]);

  // 🔧 수정: login 함수 - 같은 역할 나중 로그인 우선
  const login = async (email, password, selectedUserType = 'advertiser') => {
    try {
      setIsLoading(true);
      
      // 🚨 중요: 같은 역할의 기존 토큰이 있다면 먼저 확인
      const existingToken = tokenUtils.getToken(selectedUserType);
      if (existingToken) {
        console.log(`⚠️ 기존 ${selectedUserType} 토큰 발견 - 덮어쓰기 예정`);
      }
      
      // 관리자 계정 하드코딩 처리
      if (email === 'admin@example.com' && password === 'admin') {
        const fakeToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' +
                        btoa(JSON.stringify({ 
                          userId: 999, 
                          userName: '관리자', 
                          email: 'admin@example.com', 
                          role: 'admin',
                          exp: Math.floor(Date.now() / 1000) + (60 * 60)
                        })) + '.signature';
        
        tokenUtils.setToken(fakeToken, 'admin');
        tokenUtils.setUserInfo({ id: 999, email: 'admin@example.com' }, 'admin');
        
        setUserType('admin');
        setIsLoggedIn(true);
        setUserInfo({
          id: 999,
          name: '관리자',
          email: 'admin@example.com',
          role: 'admin'
        });
        
        console.log('👑 관리자 로그인 성공');
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

      const accessToken = data.accessToken;
      if (!accessToken) {
        throw new Error('서버에서 토큰을 받지 못했습니다.');
      }

      // 🔥 핵심: 새 토큰으로 기존 토큰 덮어쓰기 (나중 로그인 우선)
      tokenUtils.setToken(accessToken, selectedUserType);

      const decoded = tokenUtils.decodeToken(accessToken);
      const userInfo = {
        id: decoded?.userId || 1,
        name: data.user_name || decoded?.userName || '사용자',
        email: email,
        role: data.role || selectedUserType
      };

      // 사용자 정보도 저장
      tokenUtils.setUserInfo(userInfo, selectedUserType);

      let normalizedUserType = data.role || selectedUserType;

      setUserType(normalizedUserType);
      setIsLoggedIn(true);
      setUserInfo({
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        role: normalizedUserType
      });

      console.log(`✅ ${normalizedUserType} 로그인 상태 업데이트 완료:`, userInfo);
      
      // 기존 토큰이 있었다면 알림
      if (existingToken) {
        console.log(`🔄 ${selectedUserType} 기존 세션이 새 로그인으로 교체되었습니다.`);
      }

      return { success: true };
      
    } catch (error) {
      console.error('로그인 오류:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // 🔧 수정: authenticatedFetch - 실시간 토큰 체크 추가
  const authenticatedFetch = async (url, options = {}) => {
    // 🆕 API 호출 전에 실시간 토큰 상태 체크
    if (!checkCurrentTokenStatus()) {
      throw new Error('다른 창에서 로그아웃되었습니다. 페이지를 새로고침해주세요.');
    }
    
    const token = tokenUtils.getToken(userType);
    
    if (!token) {
      console.log(`❌ ${userType} 토큰이 없음`);
      logout();
      throw new Error('로그인이 필요합니다.');
    }
    
    if (tokenUtils.isTokenExpired(token)) {
      console.log(`⏰ ${userType} 토큰이 만료되어 로그아웃합니다.`);
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

    try {
      const response = await fetch(url, { ...options, ...defaultOptions });
      
      // 🆕 401 응답 시 토큰 상태 재확인
      if (response.status === 401) {
        console.log('🔍 401 응답 - 토큰 상태 재확인');
        checkCurrentTokenStatus();
      }
      
      return response;
    } catch (error) {
      throw error;
    }
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
    logoutAll, // 🆕 전체 로그아웃
    updateUserInfo,
    getHomePath,
    authenticatedFetch,
    
    getToken: () => tokenUtils.getToken(userType),
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