import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UnifiedSurvey from './components/UnifiedSurvey';
import GoogleAccount from './components/GoogleAccount';
import ReviewForm from './components/ReviewForm';
import Confirmation from './components/Confirmation';
import Thankyou from './components/Thankyou';
import { applyThemeColors } from './utils/themeUtils';

const App: React.FC = () => {
  // 環境変数からテーマカラーを適用
  useEffect(() => {
    applyThemeColors();
  }, []);
  // URLから店舗IDを動的に検出（クエリパラメータ形式: /survey?storeId={storeId}）
  const detectBasename = (): string => {
    // 環境変数が設定されている場合はそれを優先
    if (process.env.REACT_APP_BASENAME) {
      console.log(`✓ Using REACT_APP_BASENAME: ${process.env.REACT_APP_BASENAME}`);
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

  // basename が設定されている場合（本番環境）:
  //   /survey?storeId=xxx → basename="/survey" でルート "/" が UnifiedSurvey を表示
  // basename が空の場合（開発環境）:
  //   / → UnifiedSurvey を表示
  return (
    <Router basename={basename}>
      <Routes>
        {/* ルートパスで UnifiedSurvey を表示（basename="/survey" の場合は /survey がルートになる） */}
        <Route path="/" element={<UnifiedSurvey />} />
        <Route path="/googleaccount" element={<GoogleAccount />} />
        <Route path="/reviewform" element={<ReviewForm />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/thankyou" element={<Thankyou />} />
      </Routes>
    </Router>
  );
};

export default App;
