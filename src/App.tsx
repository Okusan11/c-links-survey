import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import NewCustomerSurvey from './components/NewCustomerSurvey';
import RepeaterCustomerSurvey from './components/RepeaterCustomerSurvey';
import GoogleAccount from './components/GoogleAccount';
import ReviewForm from './components/ReviewForm';
import Confirmation from './components/Confirmation';
import Thankyou from './components/Thankyou';


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/new-customer" replace />} />
        <Route path="/new-customer" element={<NewCustomerSurvey />} />
        <Route path="/repeater-customer" element={<RepeaterCustomerSurvey />} />
        <Route path="/googleaccount" element={<GoogleAccount />} />
        <Route path="/reviewform" element={<ReviewForm />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/thankyou" element={<Thankyou />} />
      </Routes>
    </Router>
  );
};

export default App;
