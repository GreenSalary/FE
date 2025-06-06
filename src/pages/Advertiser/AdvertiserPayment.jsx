import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: bold;
`;

const TableWrapper = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ScrollBody = styled.div`
  overflow-y: auto;
  max-height: calc(100vh - 220px);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ddd;
    border-radius: 3px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

const Colgroup = styled.colgroup`
  col:nth-child(1) {
    width: 50%;
  }
  col:nth-child(2) {
    width: 25%;
  }
  col:nth-child(3) {
    width: 25%;
  }
`;

const Thead = styled.thead`
  position: sticky;
  top: 0;
  z-index: 1;
`;

const Tr = styled.tr`
  &:last-child td {
    border-bottom: none;
  }
`;

const Th = styled.th`
  padding: 16px;
  font-size: 14px;
  font-weight: bold;
  border-bottom: 1px solid #eee;
  color: #333;

  &:nth-child(1) {
    text-align: left;
  }
  &:nth-child(2) {
    text-align: center;
  }
  &:nth-child(3) {
    text-align: right;
  }
`;

const Td = styled.td`
  padding: 16px;
  font-size: 14px;
  border-bottom: 1px solid #eee;
  word-break: break-word;
  white-space: normal;

  &:nth-child(1) {
    text-align: left;
  }
  &:nth-child(2) {
    text-align: center;
  }
  &:nth-child(3) {
    text-align: right;
  }
`;

const dummyPayments = [
  { id: 1, name: '홍길동', time: '2025-05-15 14:31', amount: '30,000원' },
  { id: 2, name: '이름이매우매우매우매우매우매우매우긴홍길동테스트', time: '2025-05-15 11:11', amount: '30,000원' },
  { id: 3, name: '홍길동', time: '2025-05-15 08:24', amount: '30,000원' },
  { id: 1, name: '홍길동', time: '2025-05-15 14:31', amount: '30,000원' },
  { id: 2, name: '이름이매우매우매우매우매우매우매우긴홍길동테스트', time: '2025-05-15 11:11', amount: '30,000원' },
  { id: 3, name: '홍길동', time: '2025-05-15 08:24', amount: '30,000원' },
  { id: 1, name: '홍길동', time: '2025-05-15 14:31', amount: '30,000원' },
  { id: 2, name: '이름이매우매우매우매우매우매우매우긴홍길동테스트', time: '2025-05-15 11:11', amount: '30,000원' },
  { id: 3, name: '홍길동', time: '2025-05-15 08:24', amount: '30,000원' },
  { id: 1, name: '홍길동', time: '2025-05-15 14:31', amount: '30,000원' },
  { id: 2, name: '이름이매우매우매우매우매우매우매우긴홍길동테스트', time: '2025-05-15 11:11', amount: '30,000원' },
  { id: 3, name: '홍길동', time: '2025-05-15 08:24', amount: '30,000원' },
  { id: 1, name: '홍길동', time: '2025-05-15 14:31', amount: '30,000원' },
  { id: 2, name: '이름이매우매우매우매우매우매우매우긴홍길동테스트', time: '2025-05-15 11:11', amount: '30,000원' },
  { id: 3, name: '홍길동', time: '2025-05-15 08:24', amount: '30,000원' },
  { id: 1, name: '홍길동', time: '2025-05-15 14:31', amount: '30,000원' },
  { id: 2, name: '이름이매우매우매우매우매우매우매우긴홍길동테스트', time: '2025-05-15 11:11', amount: '30,000원' },
  { id: 3, name: '홍길동', time: '2025-05-15 08:24', amount: '30,000원' },
  { id: 1, name: '홍길동', time: '2025-05-15 14:31', amount: '30,000원' },
  { id: 2, name: '이름이매우매우매우매우매우매우매우긴홍길동테스트', time: '2025-05-15 11:11', amount: '30,000원' },
  { id: 3, name: '홍길동', time: '2025-05-15 08:24', amount: '30,000원' },
  { id: 1, name: '홍길동', time: '2025-05-15 14:31', amount: '30,000원' },
  { id: 2, name: '이름이매우매우매우매우매우매우매우긴홍길동테스트', time: '2025-05-15 11:11', amount: '30,000원' },
  { id: 3, name: '홍길동', time: '2025-05-15 08:24', amount: '30,000원' },
  { id: 1, name: '홍길동', time: '2025-05-15 14:31', amount: '30,000원' },
  { id: 2, name: '이름이매우매우매우매우매우매우매우긴홍길동테스트', time: '2025-05-15 11:11', amount: '30,000원' },
  { id: 3, name: '홍길동', time: '2025-05-15 08:24', amount: '30,000원' },
  { id: 1, name: '홍길동', time: '2025-05-15 14:31', amount: '30,000원' },
  { id: 2, name: '이름이매우매우매우매우매우매우매우긴홍길동테스트', time: '2025-05-15 11:11', amount: '30,000원' },
  { id: 3, name: '홍길동', time: '2025-05-15 08:24', amount: '30,000원' }
];

const AdvertiserPayment = () => {
  return (
    <Container>
      <Title>광고이름1</Title>
      <TableWrapper>
        <Table>
          <Colgroup />
          <Thead>
            <Tr>
              <Th>이름</Th>
              <Th>입금시간</Th>
              <Th>보수</Th>
            </Tr>
          </Thead>
        </Table>
        <ScrollBody>
          <Table>
            <Colgroup />
            <tbody>
              {dummyPayments.map((p) => (
                <Tr key={p.id}>
                  <Td>{p.name}</Td>
                  <Td>{p.time}</Td>
                  <Td>{p.amount}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </ScrollBody>
      </TableWrapper>
    </Container>
  );
};

export default AdvertiserPayment;
