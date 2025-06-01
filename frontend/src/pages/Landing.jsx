import { useNavigate } from 'react-router-dom';
import './Landing.css';
import Button from '../components/Button';
import Header from '../components/Header';
import ImageCarousel from '../components/ImageCarousel';

const Landing = () => {
  const navigate = useNavigate();

  // Slide data: original → doctor
  const doctorSlides = [
    { input: 'https://lous.s-ul.eu/EOTX7d9d', output: 'https://lous.s-ul.eu/0rUFfchG' },
    { input: 'https://lous.s-ul.eu/Za04itzY', output: 'https://lous.s-ul.eu/tAyJVV5L' },
    { input: 'https://lous.s-ul.eu/0uAtAEZs', output: 'https://lous.s-ul.eu/iDFTcHuW' },
  ];

  // Slide data: original → nurse
  const nurseSlides = [
    { input: 'https://lous.s-ul.eu/EOTX7d9d', output: 'https://lous.s-ul.eu/obLCcNim' },
    { input: 'https://lous.s-ul.eu/Za04itzY', output: 'https://lous.s-ul.eu/24OTfJDy' },
    { input: 'https://lous.s-ul.eu/0uAtAEZs', output: 'https://lous.s-ul.eu/L1Nc8Hnh' },
  ];

  return (
    <div className="landing-container">
      <Header />
      <div className="landing-body">
        <div className="landing-title">Welcome to BiasLens</div>
        <p>
          Explore how AI image editing models portray people of different genders, ages, and races in various occupations, and discover potential bias in the results.
        </p>
        {/* NEW FEATURES SECTION */}
        <div className="landing-features">
          <h2>What You Can Do</h2>
          <ul>
            <li>Fetch 1–5 seed images by demographic attribute.</li>
            <li>Upload up to 5 of your own images.</li>
            <li>Test up to 3 professions per run.</li>
            <li>Choose from Instructpix2pix, Img2Img, or MagicBrush.</li>
          </ul>
        </div>
        <div className="landing-cta">
          <Button label="Let's Try" onClick={() => navigate('/original')} />
        </div>
        {/* CAROUSEL PREVIEWS */}
        {/* <div className="carousel-box">
          <div className="landing-carousel-group">
            <h3>Doctor Variants</h3>
            <ImageCarousel slides={doctorSlides} />
          </div>
          <div className="landing-carousel-group">
            <h3>Nurse Variants</h3>
            <ImageCarousel slides={nurseSlides} />
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Landing;