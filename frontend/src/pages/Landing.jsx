import { useNavigate } from 'react-router-dom';
import './Landing.css';
import Button from '../components/Button';
import Header from '../components/Header';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <Header />
      
      {/* Announcement Banner */}
      <div className="landing-announcement">
          ⚠️ Our APIs have been downgraded and may run slowly or become unavailable.
          If you encounter any issues, consider cloning our{' '}
          <a
            href="https://github.com/ongzn/MDS11_BiasLens.git"
            target="_blank"
            rel="noopener noreferrer"
            className="announcement-link"
          >
            GitHub
          </a>{' '}
          repository and running the app locally.
        </div>

      <div className="landing-body">
        <div className="landing-title">Welcome to BiasLens</div>
        <p>
          Explore how AI image editing models portray people of different genders, ages and races in various occupations, and discover potential bias in the results.
        </p>

      <div className="landing-features">
        <div className="landing-card">
          <div className="landing-subtitle">What You Can Do</div>
          <ul>
            <li>Generate 1–5 seed images based on demographics</li>
            <li>Upload up to 5 custom images</li>
            <li>Apply up to 3 occupation prompts</li>
            <li>Choose a model: InstructPix2Pix, Img2Img or MagicBrush</li>
          </ul>
        </div>
      </div>

        <div className="landing-cta">
          <Button label="Let's Try" onClick={() => navigate('/original')} />
        </div>
      </div>
    </div>
  );
};

export default Landing;