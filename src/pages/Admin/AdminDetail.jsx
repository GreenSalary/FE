// src/pages/Admin/AdminDetail.jsx
import React from 'react';
import styled from 'styled-components';

const formData = {
  title: '프리미엄 물티슈 체험단',
  pay: '50000',
  people: '10',
  uploadStart: '2025-06-01',
  uploadEnd: '2025-06-15',
  keepStart: '2025-06-16',
  keepEnd: '2025-08-16',
  tags: ['신제품', '착한가격'],
  conditions: ['배송 상태도 언급', '타제품과 비교 필수'],
  textRequired: true,
  textLength: 300,
  photoRequired: true,
  photoCount: 2,
  uploadSite: '네이버 블로그',
  description: '저희 물티슈는 프리미엄~',
  url: 'https://blog.naver.com/example/123456',
  amount: '30000',
};

const AdminDetail = () => {
  const handleApprove = () => {
  const confirmed = window.confirm('정말 해당 문의를 수락하시겠습니까?');
  if (confirmed) {
    alert('승인 처리 완료');
    window.location.href = '/admin';
  }
};

  const handleReject = () => {
  const confirmed = window.confirm('정말 해당 문의를 거절하시겠습니까?');
  if (confirmed) {
    alert('거절 처리 완료');
    window.location.href = '/admin';
  }
};

  return (
    <Container>
        <TitleRow>
            <MainTitle>{formData.title}</MainTitle>
            <ButtonRow>
                <ActionButton $reject onClick={handleReject}>거절</ActionButton>
                <ActionButton onClick={handleApprove}>수락</ActionButton>
            </ButtonRow>
        </TitleRow>
      <ContentContainer>
        <Top>
            <SectionTitle>광고 url</SectionTitle>
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
              <ContentArea><Input value={formData.title} readOnly /></ContentArea>
            </Row>
            <Row>
              <Label>보수</Label>
              <ContentArea>
                <Input value={formData.pay} readOnly />
                <div>원</div>
              </ContentArea>
            </Row>
            <Row>
              <Label>업로드 기간</Label>
              <ContentArea>
                <Input type="date" value={formData.uploadStart} readOnly />
                <div style={{ margin: '0 8px' }}>~</div>
                <Input type="date" value={formData.uploadEnd} readOnly />
              </ContentArea>
            </Row>
            <Row>
              <Label>유지 기간</Label>
              <ContentArea>
                <Input type="date" value={formData.keepStart} readOnly />
                <div style={{ margin: '0 8px' }}>~</div>
                <Input type="date" value={formData.keepEnd} readOnly />
              </ContentArea>
            </Row>
            <Row>
              <Label>필수 키워드</Label>
              <ContentArea style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <TagBox>
                  {formData.tags.map((tag, i) => (
                    <Tag key={i}># {tag}</Tag>
                  ))}
                </TagBox>
              </ContentArea>
            </Row>
            <Row>
              <Label>세부 조건</Label>
              <ContentArea style={{ flexDirection: 'column' }}>
                {formData.conditions.map((c, i) => (
                  <ConditionRow key={i}>
                    <ConditionNumber>{i + 1}.</ConditionNumber>
                    <ConditionInput value={c} readOnly />
                  </ConditionRow>
                ))}
              </ContentArea>
            </Row>
            <Row>
              <Label>업로드 사이트</Label>
              <ContentArea>
                <Select value={formData.uploadSite} disabled>
                  <option>네이버 블로그</option>
                  <option>인스타그램</option>
                  <option>유튜브</option>
                </Select>
              </ContentArea>
              <Label>매체 조건</Label>
              <ContentArea style={{ flex: 4 }}>
                <CheckboxWrapper>
                  <Checkbox type="checkbox" checked={formData.textRequired} disabled />
                  <div>글</div>
                  <FixedWidthInput value={formData.textLength} readOnly />
                  <div>자 이상</div>
                </CheckboxWrapper>
                <CheckboxWrapper>
                  <Checkbox type="checkbox" checked={formData.photoRequired} disabled />
                  <div>사진</div>
                  <FixedWidthInput value={formData.photoCount} readOnly />
                  <div>장 이상</div>
                </CheckboxWrapper>
              </ContentArea>
            </Row>
            <Row>
              <Label>상세 설명</Label>
              <ContentArea>
                <Textarea value={formData.description} readOnly />
              </ContentArea>
            </Row>
          </FormCard>
        </Bottom>
      </ContentContainer>
    </Container>
  );
};

export default AdminDetail;


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
`

const MainTitle = styled.h2`
  font-size: 22px;
  font-weight: bold;
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
  background-color: ${({ $reject }) => ($reject ? '#f44336' : '#2196f3')};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }
`;


