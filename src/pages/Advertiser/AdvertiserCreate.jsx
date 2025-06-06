import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Web3 from 'web3';
import AdContract from '../../contracts/AdContract.json';
import { FaTrash } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdvertiserCreate = () => {
  const navigate = useNavigate();
  
  // 기존 상태들
  const [conditions, setConditions] = useState(['']);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [textRequired, setTextRequired] = useState(false);
  const [textLength, setTextLength] = useState('');
  const [photoRequired, setPhotoRequired] = useState(false);
  const [photoCount, setPhotoCount] = useState('');
  const [uploadSite, setUploadSite] = useState('네이버 블로그');
  const [productImageFile, setProductImageFile] = useState(null); // 선택된 이미지 파일
  const [productImagePreview, setProductImagePreview] = useState(''); // 미리보기 URL
  const [conditionErrors, setConditionErrors] = useState([]); // 세부 조건 에러 상태

  const [formData, setFormData] = useState({
    adName: '',
    reward: '',
    maxInfluencer: '',
    uploadStartDate: '',
    uploadEndDate: '',
    maintainStartDate: '',
    maintainEndDate: '',
    description: ''
  }); 

  // 모달 및 상태 관리
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  
  // Web3 관련
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);

  const inputRef = useRef(null);

  // Web3 초기화
  useEffect(() => {
    initWeb3();
  }, []);

  // 자동 크기 조절 기능 추가
  useEffect(() => {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      const adjustHeight = () => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(40, textarea.scrollHeight) + 'px';
      };
      
      // 이벤트 리스너 중복 등록 방지
      textarea.removeEventListener('input', adjustHeight);
      textarea.addEventListener('input', adjustHeight);
      
      // 초기 높이 설정
      adjustHeight();
    });
  }, [conditions]);

  const initWeb3 = async () => {
    try {
      const providerUrl = process.env.REACT_APP_WEB3_PROVIDER_URL || 'http://127.0.0.1:8545';
      const networkId = process.env.REACT_APP_NETWORK_ID || '1337';
      const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || AdContract.networks[networkId]?.address;

      const web3Instance = new Web3(providerUrl);
      setWeb3(web3Instance);

      //json 조회
      const contractInstance = new web3Instance.eth.Contract(
        AdContract.abi,
        contractAddress
      );
      setContract(contractInstance);

      const accountList = await web3Instance.eth.getAccounts();
      setAccounts(accountList);

      console.log('Web3 초기화 완료');
      console.log('Provider URL:', providerUrl);
      console.log('Network ID:', networkId);
      console.log('컨트랙트 주소:', contractAddress);
      console.log('사용 가능한 계정:', accountList);
      
    } catch (error) {
      console.error('Web3 초기화 실패:', error);
      setStatus('Web3 연결 실패. Ganache가 실행 중인지 확인하세요.');
    }
  };

  // 기존 함수들
  const handleAddCondition = () => {
    if (conditions.length < 6 && conditions[conditions.length - 1].trim() !== '') {
      setConditions([...conditions, '']);
      setConditionErrors([...conditionErrors, false]);
    }
  };

  const handleConditionChange = (index, value) => {
    const newConditions = [...conditions];
    newConditions[index] = value;
    setConditions(newConditions);
    
    // 에러 상태 업데이트
    const newErrors = [...conditionErrors];
    newErrors[index] = false;
    setConditionErrors(newErrors);
  };

  // 세부 조건 삭제 함수
  const handleDeleteCondition = (indexToDelete) => {
    if (conditions.length <= 1) return; // 최소 1개는 유지
    
    const newConditions = conditions.filter((_, index) => index !== indexToDelete);
    const newErrors = conditionErrors.filter((_, index) => index !== indexToDelete);
    
    setConditions(newConditions);
    setConditionErrors(newErrors);
  };

  // 세부 조건 유효성 검사
  const validateConditions = () => {
    const errors = conditions.map((condition, index) => {
      // 마지막 조건이 비어있는 경우는 괜찮음 (추가 버튼용)
      if (index === conditions.length - 1 && condition.trim() === '') {
        return false;
      }
      // 중간에 비어있는 조건이 있으면 에러
      return condition.trim() === '';
    });
    
    setConditionErrors(errors);
    return !errors.some(error => error);
  };
  
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };
  
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (tags.length < 6) {
        setTags([...tags, tagInput.trim()]);
        setTagInput('');
      }
    }
  };
  
  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };
  
  const handleTextCheckChange = (e) => {
    setTextRequired(e.target.checked);
    if (!e.target.checked) {
      setTextLength('');
    }
  };
  
  const handlePhotoCheckChange = (e) => {
    setPhotoRequired(e.target.checked);
    if (!e.target.checked) {
      setPhotoCount('');
      setProductImageFile(null); // 사진 체크 해제시 파일도 초기화
      setProductImagePreview('');
    }
  };

  // 제품 사진 선택 핸들러 (파일만 저장, 업로드는 나중에)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 저장
    setProductImageFile(file);
    
    // 미리보기용 로컬 URL 생성
    const previewUrl = URL.createObjectURL(file);
    setProductImagePreview(previewUrl);
  };

  // 제품 사진 삭제 핸들러
  const handleImageDelete = () => {
    if (productImagePreview) {
      URL.revokeObjectURL(productImagePreview);
    }
    setProductImageFile(null);
    setProductImagePreview('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 업로드 시작일이 변경되면 종료일 초기화 (종료일이 시작일보다 이전인 경우)
    if (name === 'uploadStartDate' && formData.uploadEndDate && value > formData.uploadEndDate) {
      setFormData(prev => ({
        ...prev,
        uploadEndDate: ''
      }));
    }

    // 유지 시작일이 변경되면 유지 종료일 초기화 (종료일이 시작일보다 이전인 경우)
    if (name === 'maintainStartDate' && formData.maintainEndDate && value > formData.maintainEndDate) {
      setFormData(prev => ({
        ...prev,
        maintainEndDate: ''
      }));
    }
  };

  // 오늘 날짜를 YYYY-MM-DD 형식으로 반환
  const getTodayString = () => {
    const today = new Date();
    // 한국 시간대(UTC+9)로 변환
    const koreaTime = new Date(today.getTime() + (9 * 60 * 60 * 1000));
    return koreaTime.toISOString().split('T')[0];
  };

  // 특정 날짜에서 하루를 더한 날짜를 YYYY-MM-DD 형식으로 반환
  const getNextDayString = (dateString) => {
    if (!dateString) return getTodayString();
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  // 등록 버튼 클릭 ->  결제 모달 표시
  const handleSubmit = () => {
    // 기본 필수 항목 검사
    if (!isFormValid()) {
      alert('필수 항목을 모두 입력해주세요: 광고명, 보수, 모집인원, 업로드 마감일');
      return;
    }

    // 키워드 최소 1개 검사
    if (tags.length === 0) {
      alert('키워드를 최소 1개 이상 입력해주세요.');
      return;
    }

    // 세부 조건 최소 1개 검사
    const validConditions = conditions.filter(c => c.trim() !== '');
    if (validConditions.length === 0) {
      alert('세부 조건을 최소 1개 이상 입력해주세요.');
      return;
    }

    // 세부 조건 유효성 검사
    if (!validateConditions()) {
      alert('비어있는 세부 조건이 있습니다. 내용을 입력하거나 삭제해주세요.');
      return;
    }

    // 사진 필수 선택시 제품 사진 업로드 검사
    if (photoRequired && !productImageFile) {
      alert('필수 매체에서 사진을 선택하셨습니다. 제품 사진을 업로드해주세요.');
      return;
    }
    
    if (!web3 || !contract) {
      alert('Web3 연결을 확인하세요.');
      return;
    }

    if (tagInput.trim() && tags.length === 0) {
      alert('키워드 입력 후 엔터를 눌러 추가해주세요.');
      return;
    }

    // 결제 모달
    setShowPaymentModal(true);
  };

  // MetaMask 연결
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setWalletConnected(true);
        setWalletAddress(accounts[0]);
        return accounts[0];
      } catch (error) {
        throw new Error('지갑 연결 실패');
      }
    } else {
      // MetaMask 없을 때 Ganache 계정 사용
      if (accounts.length > 0) {
        const account = accounts[0];
        setWalletConnected(true);
        setWalletAddress(account);
        return account;
      } else {
        throw new Error('MetaMask를 설치해주세요');
      }
    }
  };

  // 이미지를 서버에 업로드하는 함수 (토큰 불필요)
  const uploadImageToServer = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_BASE_URL}/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('이미지 업로드 실패');
      }

      const result = await response.json();
      return result.imageUrl;
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const account = await connectWallet();
      const totalAmount = Math.round((parseFloat(formData.reward) * parseInt(formData.maxInfluencer)) * 1e8) / 1e8;
      
      const balance = await web3.eth.getBalance(account);
      const balanceInEth = parseFloat(web3.utils.fromWei(balance, 'ether'));
      
      // 잔액 확인
      if (balanceInEth < totalAmount) {
        alert(`잔액이 부족합니다!\n\n필요: ${totalAmount} ETH\n보유: ${balanceInEth.toFixed(4)} ETH`);
        setShowPaymentModal(false);
        return;
      }

      // 🔥 제품 이미지가 있으면 먼저 업로드
      let productImageUrl = '';
      if (photoRequired && productImageFile) {
        productImageUrl = await uploadImageToServer(productImageFile);
        console.log('이미지 업로드 성공:', productImageUrl);
      }

      // 메타데이터 생성 -> 이후 해시화
      const metadata = {
        keywords: tags,
        conditions: conditions.filter(c => c.trim() !== ''),
        textRequired,
        textLength: textRequired ? textLength : '',
        photoRequired,
        photoCount: photoRequired ? photoCount : '',
        uploadSite,
        productImageUrl: productImageUrl // 업로드된 URL 사용
      };
      
      const metadataString = JSON.stringify(metadata);
      const metadataHash = web3.utils.keccak256(metadataString);
      
      const deadline = new Date(formData.uploadEndDate + "T23:59:59");
      const deadlineTimestamp = Math.floor(deadline.getTime() / 1000);

      // 스마트 컨트랙트 실행
      const tx = await contract.methods.addContract(
        web3.utils.toWei(formData.reward, 'ether'),
        parseInt(formData.maxInfluencer),
        deadlineTimestamp,
        metadataHash
      ).send({
        from: account,
        value: web3.utils.toWei(totalAmount.toString(), 'ether'),
        gas: 5000000,
        gasPrice: '20000000000'
      });

      console.log('트랜잭션 성공:', tx);

      const currentNextId = await contract.methods.nextAdId().call();
      const smartContractAdId = parseInt(currentNextId) - 1;
      console.log('생성된 스마트 컨트랙트 Ad ID:', smartContractAdId);

      const apiData = {
        title: formData.adName, 
        reward: parseFloat(formData.reward),
        recruits: parseInt(formData.maxInfluencer),
        uploadPeriod: {
          startDate: formData.uploadStartDate,
          endDate: formData.uploadEndDate
        },
        ...(formData.maintainStartDate && formData.maintainEndDate && {
          maintainPeriod: {
            startDate: formData.maintainStartDate,
            endDate: formData.maintainEndDate
          }
        }),
        ...(tags.length > 0 && { keywords: tags }),
        ...(conditions.filter(c => c.trim() !== '').length > 0 && { 
          conditions: conditions.filter(c => c.trim() !== '') 
        }),
        site: uploadSite === '네이버 블로그' ? 'Naver Blog' : 
              uploadSite === '인스타그램' ? 'Instagram' : 
              uploadSite === '유튜브' ? 'YouTube' : uploadSite,
        
        // 미디어 정보
        ...((textRequired && textLength && parseInt(textLength) > 0) || 
            (photoRequired && photoCount && parseInt(photoCount) > 0)) && {
          media: {
            ...(textRequired && textLength && parseInt(textLength) > 0 && { 
              minTextLength: parseInt(textLength) 
            }),
            ...(photoRequired && photoCount && parseInt(photoCount) > 0 && { 
              minImageCount: parseInt(photoCount) 
            })
          }
        },
        
        ...(formData.description.trim() && { description: formData.description }),
        ...(photoRequired && productImageUrl && { photo_url: productImageUrl }),
        smartContractId: smartContractAdId,
        transactionHash: tx.transactionHash,
        advertiserAddress: account
      };

      console.log('백엔드 API 호출 데이터:', apiData);

      // 실제 API 호출
      const response = await fetch(`${API_BASE_URL}/advertiser/contract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`서버 저장 실패: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      console.log('백엔드 저장 성공:', result);

      alert('계약 생성 성공');
      navigate('/advertiser/home');
      
    } catch (error) {
      console.error('결제 오류:', error);
      
      if (error.message.includes('insufficient funds')) {
        alert('❌ 잔액이 부족합니다!\n\nETH를 충전 후 다시 시도해주세요.');
      } else {
        alert(`❌ 결제 실패!\n\n${error.message}`);
      }
    } finally {
      setLoading(false);
      setShowPaymentModal(false);
    }
  };

  const isFormValid = () => {
    return formData.adName.trim() && 
           formData.reward && 
           parseFloat(formData.reward) > 0 &&
           formData.maxInfluencer && 
           parseInt(formData.maxInfluencer) > 0 &&
           formData.uploadEndDate;
  };

  const totalAmount = formData.reward && formData.maxInfluencer ? 
    Math.round((parseFloat(formData.reward) * parseInt(formData.maxInfluencer)) * 1e8) / 1e8 : 0;

  // 임시 지갑 주소 (실제로는 로그인된 사용자 정보에서)
  const userWalletAddress = accounts[0] || 'MetaMask 연결 필요';

  return (
    <Container>
      <Header>
        <Title>계약 등록</Title>
        <SubmitButton 
          onClick={handleSubmit}
          disabled={loading}
        >
          등록
        </SubmitButton>
      </Header>
      
      <ContentContainer>
        {/* 상태 메시지 표시 */}
        {status && (
          <StatusMessage type={status.includes('오류') ? 'error' : 'success'}>
            {status}
          </StatusMessage>
        )}

        {/* Web3 연결 정보 */}
        {web3 && contract && (
          <WalletInfo>
            Web3 연결됨 | 컨트랙트: {process.env.REACT_APP_CONTRACT_ADDRESS || AdContract.networks['1337']?.address || '주소 로딩 중...'}
            <br />
            {walletConnected ? (
              <div>✅ 연결된 지갑: {walletAddress}</div>
            ) : (
              <div>⚠️ 지갑 미연결 (등록 시 MetaMask 연결됩니다)</div>
            )}
          </WalletInfo>
        )}
        
        <SubTitle>광고</SubTitle>
        <Divider />
        
        <FormCard>
          <Row>
            <Label>광고명<RequiredMark>*</RequiredMark></Label>
            <ContentArea>
              <Input 
                name="adName"
                value={formData.adName}
                onChange={handleInputChange}
                placeholder="광고명을 입력하세요"
                required
              />
            </ContentArea>
          </Row>
          
          <Row>
            <Label>보수<RequiredMark>*</RequiredMark></Label>
            <ContentArea>
              <Input 
                type="number" 
                name="reward"
                value={formData.reward}
                onChange={handleInputChange}
                min="0" 
                step="0.0001"
                placeholder="금액을 입력하세요"
                required
              />
              <div>ETH</div>
            </ContentArea>
            
            <Label>모집 인원<RequiredMark>*</RequiredMark></Label>
            <ContentArea>
              <Input 
                type="number" 
                name="maxInfluencer"
                value={formData.maxInfluencer}
                onChange={handleInputChange}
                min="1" 
                placeholder="인원수"
                required
              />
              <div>명</div>
            </ContentArea>
          </Row>
          
          <Row>
            <Label>업로드 기간<RequiredMark>*</RequiredMark></Label>
            <ContentArea>
              <Input 
                type="date"
                name="uploadStartDate"
                value={formData.uploadStartDate}
                onChange={handleInputChange}
                min={getTodayString()}
              />
              <div style={{ margin: '0 8px' }}>~</div>
              <Input 
                type="date"
                name="uploadEndDate" 
                value={formData.uploadEndDate}
                onChange={handleInputChange}
                min={getNextDayString(formData.uploadStartDate)}
                required
              />
            </ContentArea>
          </Row>
          
          <Row>
            <Label>유지 기간</Label>
            <ContentArea>
              <Input 
                type="date"
                name="maintainStartDate"
                value={formData.maintainStartDate}
                onChange={handleInputChange}
                min={getTodayString()}
              />
              <div style={{ margin: '0 8px' }}>~</div>
              <Input 
                type="date"
                name="maintainEndDate"
                value={formData.maintainEndDate}
                onChange={handleInputChange}
                min={getNextDayString(formData.maintainStartDate)}
              />
            </ContentArea>
          </Row>
          
          <Row>
            <Label>필수 키워드<RequiredMark>*</RequiredMark>(최대 6개)</Label>
            <ContentArea style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <FakeInput onClick={() => inputRef.current?.focus()}>
                {tags.map((tag, index) => (
                  <Tag key={index} onClick={() => removeTag(index)}>
                    #{tag}
                  </Tag>
                ))}
                <TagInput
                  ref={inputRef}
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="해시태그 입력"
                />
              </FakeInput>
            </ContentArea>
          </Row>
          
          <Row>
            <Label>세부 조건<RequiredMark>*</RequiredMark>(최대 3개)</Label>
            <ContentArea style={{ flexDirection: 'column' }}>
            {conditions.map((condition, index) => (
                <ConditionRow key={index}>
                <ConditionNumber>{index + 1}.</ConditionNumber>
                <AutoResizeTextArea
                    value={condition}
                    onChange={(e) => handleConditionChange(index, e.target.value)}
                    placeholder="세부 조건을 입력하세요"
                    hasError={conditionErrors[index]}
                />
                {conditions.length > 1 && (
                  <DeleteButton onClick={() => handleDeleteCondition(index)}>
                    <FaTrash />
                  </DeleteButton>
                )}
                </ConditionRow>
            ))}
            {conditions.length < 6 && (
                <AddButtonContainer>
                <AddButton onClick={handleAddCondition}>
                    + 추가하기
                </AddButton>
                </AddButtonContainer>
            )}
            </ContentArea>
          </Row>
          
          
          <Row>
            <Label>업로드 사이트</Label>
            <ContentArea style={{ flex: 1 }}>
              <Select 
                value={uploadSite} 
                onChange={(e) => setUploadSite(e.target.value)}
              >
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
                  checked={textRequired} 
                  onChange={handleTextCheckChange}
                />
                <div>글</div>
                <FixedWidthInput 
                  type="number"
                  min="1"
                  value={textLength}
                  onChange={(e) => setTextLength(e.target.value)}
                  disabled={!textRequired}
                />
                <div>자 이상</div>
              </CheckboxWrapper>

              <CheckboxWrapper style={{ flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Checkbox 
                    type="checkbox" 
                    checked={photoRequired} 
                    onChange={handlePhotoCheckChange}
                  />
                  <div>사진</div>
                  <FixedWidthInput 
                    type="number"
                    min="1"
                    value={photoCount}
                    onChange={(e) => setPhotoCount(e.target.value)}
                    disabled={!photoRequired}
                  />
                  <div>장 이상</div>
                </div>
                
                {photoRequired && (
                  <PhotoRequiredMessage>
                    제품 사진을 추가해주세요
                  </PhotoRequiredMessage>
                )}
              </CheckboxWrapper>
            </ContentArea>
          </Row>

          {/* 제품 사진 업로드 섹션 (단일 이미지) */}
          {photoRequired && (
            <Row>
              <Label>제품 사진<RequiredMark>*</RequiredMark></Label>
              <ContentArea style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <ImageUploadContainer>
                  <ImageUploadInput
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    id="product-image"
                  />
                  <ImageUploadLabel htmlFor="product-image">
                    사진 업로드
                  </ImageUploadLabel>
                </ImageUploadContainer>
                
                {productImagePreview && (
                  <ImagePreviewContainer>
                    <ImagePreviewItem>
                      <PreviewImage src={productImagePreview} alt="제품 사진" />
                      <ImageDeleteButton onClick={handleImageDelete}>
                        ✕
                      </ImageDeleteButton>
                    </ImagePreviewItem>
                  </ImagePreviewContainer>
                )}
              </ContentArea>
            </Row>
          )}
          
          <Row>
            <Label>상세 설명(선택)</Label>
            <ContentArea style={{ paddingBottom: '8px' }}>
              <Textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="상세 설명을 입력하세요"
              />
            </ContentArea>
          </Row>
        </FormCard>
      </ContentContainer>

      {/* 결제 모달 */}
      {showPaymentModal && (
        <ModalOverlay onClick={() => setShowPaymentModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalTitle>결제</ModalTitle>
            
            <PaymentInfo>
              <InfoRow>
                <span>보수</span>
                <span>{formData.reward} ETH</span>
              </InfoRow>
              <InfoRow>
                <span>모집 인원</span>
                <span>{formData.maxInfluencer}명</span>
              </InfoRow>
            </PaymentInfo>

            <TotalAmount>
              <span>최종 결제금액</span>
              <span>{totalAmount} ETH</span>
            </TotalAmount>

            <WalletSection>
              <div style={{ marginBottom: '8px' }}>연결된 지갑</div>
              <div style={{ fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all' }}>
                {userWalletAddress}
              </div>
              <div style={{ marginTop: '8px', color: '#666' }}>
                🦊 MetaMask
              </div>
            </WalletSection>

            <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', margin: '12px 0' }}>
              해당 금액이 블록체인 지갑에서 빠져나가며<br/>
              계약 마감 시, 지급 되지 않은 보수는 반환됩니다.
            </div>

            <ModalButtons>
              <ModalButton 
                primary 
                onClick={handlePayment}
                disabled={loading}
              >
                결제
              </ModalButton>
              <ModalButton onClick={() => setShowPaymentModal(false)}>
                취소
              </ModalButton>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default AdvertiserCreate;

// 스타일드 컴포넌트들
const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 10px 20px;
  margin-bottom: 8px;
  overflow-y: auto;
  max-height: calc(100vh - 170px);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ddd;
    border-radius: 3px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const SubmitButton = styled.button`
  padding: 8px 20px;
  font-size: 14px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

const RequiredMark = styled.span`
  color: #dc3545;
  margin-left: 4px;
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

const Tag = styled.div`
  background-color: #f0f4f8;
  border-radius: 12px;
  padding: 6px 12px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
`;

const ConditionRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  width: 100%;
  position: relative;
`;

const ConditionNumber = styled.div`
  width: 30px;
  display: flex;
  align-items: flex-start;
  padding-top: 10px;
  font-size: 14px;
  flex-shrink: 0;
`;

const AutoResizeTextArea = styled.textarea.withConfig({
  shouldForwardProp: (prop) => prop !== 'hasError'
})`
  flex: 1;
  padding: 10px;
  border: 1px solid ${props => props.hasError ? '#dc3545' : '#ddd'};
  border-radius: 6px;
  font-size: 14px;
  min-height: 40px;
  resize: none;
  font-family: inherit;
  line-height: 1.4;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#dc3545' : '#007bff'};
  }
  
  ${props => props.hasError && `
    background-color: #fff5f5;
    &::placeholder {
      color: #dc3545;
    }
  `}
`;

const DeleteButton = styled.button`
  background: transparent;
  color: #6c757d;
  border: none;
  border-radius: 4px;
  padding: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: auto;
  margin-left: 8px;
  width: 24px;
  height: 24px;
  align-self: flex-end;
  
  &:hover {
    color: #dc3545; 
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  svg {
    font-size: 18px;
  }
`;

const AddButton = styled.button`
  margin-left: auto;
  margin-right: 0;
  margin-bottom: 10px;
  padding: 8px 16px;
  font-size: 13px;
  border: 1px solid #ddd;
  background: #f9f9f9;
  border-radius: 16px;
  cursor: pointer;
`;

const AddButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  padding: 0;
`;

const Select = styled.select`
  padding: 8px; 
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
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

const PhotoRequiredMessage = styled.div`
  color: #007bff;
  font-size: 12px;
  margin-top: 8px;
  font-weight: 500;
`;

const FakeInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 10px;
  font-size: 14px;
  border-radius: 6px;
  cursor: text;
  border: 1px solid #ddd;
  width: calc(100% - 24px);
  flex: 1;
`;

const TagInput = styled.input`
  border: none;
  outline: none;
  font-size: 14px;
  flex: 1;
  min-width: 80px;
`;

const ImageUploadContainer = styled.div`
  margin-bottom: 16px;
`;

const ImageUploadInput = styled.input`
  display: none;
`;

const ImageUploadLabel = styled.label`
  display: inline-block;
  padding: 10px 16px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #e9ecef;
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

const ImageDeleteButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #c82333;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 400px;
  max-width: 90vw;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
`;

const PaymentInfo = styled.div`
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
  margin-bottom: 16px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
`;

const TotalAmount = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  font-weight: bold;
  color: #007bff;
  margin: 16px 0;
`;

const WalletSection = styled.div`
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  margin: 16px 0;
  text-align: center;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const ModalButton = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  
  ${props => props.primary ? `
    background: #007bff;
    color: white;
    &:hover { background: #0056b3; }
  ` : `
    background: #6c757d;
    color: white;
    &:hover { background: #545b62; }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div`
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  background: ${props => props.type === 'error' ? '#f8d7da' : '#d4edda'};
  color: ${props => props.type === 'error' ? '#721c24' : '#155724'};
  border: 1px solid ${props => props.type === 'error' ? '#f5c6cb' : '#c3e6cb'};
`;

const WalletInfo = styled.div`
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
`;