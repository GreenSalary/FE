// src/pages/StatusTestPage.jsx
import React from 'react';
import StatusBadge from '../components/StatusBadge';

const StatusTestPage = () => {
  const testStatuses = [
    'deposited',
    'completed',
    'incomplete',
    'not_executed',
    'rejected',
    'pending',
    'in_progress',
    'closed',
  ];

  return (
    <div style={{ padding: '40px' }}>
      <h2>📌 상태 뱃지 미리보기</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
        {testStatuses.map(status => (
          <div key={status}>
            <StatusBadge status={status} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusTestPage;
