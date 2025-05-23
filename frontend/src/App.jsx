import { useEffect } from 'react';
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import OriginalImages from './pages/OriginalImages';
import TransformedImages from './pages/TransformedImages';
import Result from './pages/Result';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const isHardRefresh = performance.navigation.type === 1; // Reload
    const isNotLanding = location.pathname !== '/';
    const firstLoad = sessionStorage.getItem('app_loaded_once') !== 'true';

    if (isHardRefresh && isNotLanding && firstLoad) {
      navigate('/');
    }

    sessionStorage.setItem('app_loaded_once', 'true');
  }, [location, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/original" element={<OriginalImages />} />
      <Route path="/transformed" element={<TransformedImages />} />
      <Route path="/result" element={<Result />} /> 
    </Routes>
  );
};

export default App;