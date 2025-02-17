import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SurveyForm from './components/SurveyForm';
import GoogleAccount from './components/GoogleAccount';
import ReviewForm from './components/ReviewForm';
import Confirmation from './components/Confirmation';
import Thankyou from './components/Thankyou';


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/surveyform" element={<SurveyForm />} />
        <Route path="/googleaccount" element={<GoogleAccount />} />
        <Route path="/reviewform" element={<ReviewForm />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/thankyou" element={<Thankyou />} />
      </Routes>
    </Router>
  );
};

export default App;
