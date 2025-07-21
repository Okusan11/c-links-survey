import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import NewCustomerSurvey from './components/NewCustomerSurvey';
import RepeaterCustomerSurvey from './components/RepeaterCustomerSurvey';
import GoogleAccount from './components/GoogleAccount';
import ReviewForm from './components/ReviewForm';
import Confirmation from './components/Confirmation';
import Thankyou from './components/Thankyou';
import DegitalGacha from './components/DegitalGacha';

const App: React.FC = () => {
  // 環境変数からベースパスを取得（店舗ID付きのパス）
  const basename = process.env.REACT_APP_BASENAME || '';
  
  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/" element={<Navigate to="/new-customer" replace />} />
        <Route path="/new-customer" element={<NewCustomerSurvey />} />
        <Route path="/repeater-customer" element={<RepeaterCustomerSurvey />} />
        <Route path="/googleaccount" element={<GoogleAccount />} />
        <Route path="/reviewform" element={<ReviewForm />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/thankyou" element={<Thankyou />} />
        <Route path="/gacha" element={<DegitalGacha />} />
      </Routes>
    </Router>
  );
};

export default App;
