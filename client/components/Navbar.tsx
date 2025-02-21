import React, { useEffect } from 'react';

// 로그인 상태 변경 감지
useEffect(() => {
  if (isAuthenticated) {
    // 로그인 시 알림 데이터 불러오기
    fetchNotifications();
    fetchUnreadCount();
  }
}, [isAuthenticated]); 