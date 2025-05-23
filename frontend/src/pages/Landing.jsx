import { useNavigate } from 'react-router-dom';
import './Landing.css';
import Button from '../components/Button';
import Header from '../components/Header';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <Header />
      <div className="landing-body">
        <div className="landing-title">Welcome to BiasLens</div>
        <p>
          Explore how AI image editing models portray people of different genders, ages, and races in various occupations, and discover potential bias in the results.
        </p>
        <Button label="Let's Try" onClick={() => navigate('/original')} />
      </div>
    </div>
  );
};

export default Landing;