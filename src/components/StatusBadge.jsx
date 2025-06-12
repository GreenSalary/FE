import React from 'react';
import styled from 'styled-components';

const statusMap = {
  deposited:     { label: '입금완료', bg: '#CEEEDA', color: '#69AC81' },
  completed:     { label: '완료',     bg: '#CEEEDA', color: '#69AC81' },
  complete:     { label: '적합', bg: '#CEEEDA', color: '#69AC81' },
  incomplete:    { label: '미완료',   bg: '#D9D9D9', color: '#878888' },
  not_executed:  { label: '미이행',   bg: '#D9D9D9', color: '#878888' },
  didnt_executed:  { label: '미제출',   bg: '#D9D9D9', color: '#878888' },
  rejected:      { label: '부적합',   bg: '#F6B6B8', color: '#B3475A' },
  '대기중':       { label: '대기중',   bg: '#FFD59A', color: '#996F1A' },
  '진행중':   { label: '진행중',   bg: '#CEEEDA', color: '#69AC81' },
  '마감':        { label: '마감',     bg: '#D9D9D9', color: '#878888' },
  review:        { label: '추가 검토중', bg: '#FFD59A', color: '#996F1A' },
  inquiry:       { label: '문의중',   bg: '#E6F3FF', color: '#0066CC' },
  onlyurlcomplete:     { label: '제출승인', bg: '#CEEEDA', color: '#69AC81' },
  onlyurlrejected:      { label: '제출거절',   bg: '#F6B6B8', color: '#B3475A' },
};

const Badge = styled.span`
  width: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  background-color: ${(props) => props.bg || '#E0E0E0'};
  color: ${(props) => props.color || '#000'};

  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    margin-right: 6px;
    border-radius: 50%;
    background-color: currentColor;
  }
`;

const StatusBadge = ({ status }) => {
  const mapped = statusMap[status] || { label: status, bg: '#E0E0E0', color: '#000' };
  return <Badge bg={mapped.bg} color={mapped.color}>{mapped.label}</Badge>;
};

export default StatusBadge;
