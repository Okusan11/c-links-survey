import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import UnifiedSurvey from './components/UnifiedSurvey';
import GoogleAccount from './components/GoogleAccount';
import ReviewForm from './components/ReviewForm';
import Confirmation from './components/Confirmation';
import Thankyou from './components/Thankyou';

const App: React.FC = () => {
  // URLから店舗IDを動的に検出（クエリパラメータ形式: /survey?storeId={storeId}）
  const detectBasename = (): string => {
    // 環境変数が設定されている場合はそれを優先
    if (process.env.REACT_APP_BASENAME) {
      return process.env.REACT_APP_BASENAME;
    }

    // クエリパラメータから店舗IDを検出
    const urlParams = new URLSearchParams(window.location.search);
    const storeId = urlParams.get('storeId');

    if (storeId) {
      console.log(`✓ Detected store from query parameter: ${storeId}`);
      return '/survey'; // basenameは/surveyに固定
    }

    // デフォルト: basenameなし（開発環境）
    console.log('ℹ️ No store ID detected, using root path');
    return '';
  };

  const basename = detectBasename();

  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/" element={<Navigate to="/survey" replace />} />
        <Route path="/survey" element={<UnifiedSurvey />} />
        <Route path="/googleaccount" element={<GoogleAccount />} />
        <Route path="/reviewform" element={<ReviewForm />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/thankyou" element={<Thankyou />} />
      </Routes>
    </Router>
  );
};

export default App;
