import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaInfoCircle } from 'react-icons/fa';
import './Header.css';
import ModeToggle from './ModeToggle';

const pageTitles = {
  '/original': 'Select Demographics',
  '/transformed': 'Transform Images',
  '/result': 'Bias Evaluation',
};

const panelContent = {
  '/original': {
    default: {
      intro: 'In this step, you’ll define a specific demographic group to generate face images. These images will be used for AI-based editing in the next step.',
      steps: [
        '1. Select a Gender, Age Group, and Race.',
        '2. Use the slider to choose how many face images to generate.',
      ],
      tip: {
        title: 'Why it matters',
        icon: '🧠',
        text: 'A consistent and well-defined demographic group is critical for fair and meaningful analysis. By controlling for gender, age, and race at this stage, we can later assess how AI models alter or stereotype individuals based on their attributes. This ensures that any differences in output reflect the model’s behavior rather than inconsistencies in the input.',
      },
    },
    custom: {
      intro: 'In this step, you’ll upload your own images and define a demographic label for analysis. These images will be edited with different occupations in the next step.',
      steps: [
        '1. Upload 1–10 clear face images of the same person.',
        '2. The system will automatically check each image for facial features.',
      ],
      tip: {
        title: 'Why it matters',
        icon: '🧠',
        text: 'Uploading consistent personal images allows you to evaluate how your appearance may be interpreted or altered by AI. It also helps test if models apply stereotypical changes based on perceived attributes.',
      },
    },
  },
  '/transformed': {
    intro: 'In this step, you will apply occupation-based transformations to the generated face images using AI image editing models.',
    steps: [
      '1. Choose an image editing model such as InstructPix2Pix, Img2Img, or MagicBrush.',
      '2. Select up to 5 occupations to apply to your demographic group.',
    ],
    tip: {
      title: 'Why it matters',
      icon: '🧪',
      text: 'AI image editing models are trained on large datasets and often reflect social patterns present in that data. When occupations are applied to a fixed demographic group, the visual results can reveal how the model interprets professional roles in relation to race, gender, and age. This step is essential for identifying subtle biases or stereotypical portrayals that may appear in how different occupations are visually represented.',
    },
  },
  '/result': {
    intro: 'This step presents the final analysis of how the AI model visually transformed individuals across different occupations. You’ll now interpret the bias scores and observe how your selected demographic was represented.',
    steps: [
      '1. Compare the original and transformed images to see how the AI model changed visual features for each occupation.',
      '2. Review the gender and age bias scores to understand where significant changes occurred.',
      '3. Explore the bias distribution chart and overall summary to evaluate the extent and severity of detected bias.',
    ],
    tip: {
      title: 'Why it matters',
      icon: '📊',
      text: 'This stage helps you identify whether the AI model produced fair or biased portrayals when assigning professional roles. By examining the visual outputs and corresponding bias scores, you can detect patterns of underrepresentation or potential reinforcement of demographic stereotypes.',
    },
  },
};

const Header = ({ mode, setMode }) => {
  const location = useLocation();
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef(null);

  const pathname = location.pathname;
  const showPanel = pathname !== '/';
  const pageTitle =
  pathname === '/original' && mode === 'custom'
    ? 'Upload Image'
    : pageTitles[pathname] || '';

  let content;
  if (pathname === '/original') {
    content = panelContent['/original'][mode === 'custom' ? 'custom' : 'default'];
  } else {
    content = panelContent[pathname];
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanelOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setPanelOpen(false);
      }
    };

    if (panelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [panelOpen]);

  return (
    <>
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          BiasLens
          {pageTitle && <span className="page-title"> ｜{pageTitle}</span>}
          {showPanel && (
            <FaInfoCircle
              className="info-icon"
              title="More info"
              onClick={() => setPanelOpen(true)}
            />
          )}
        </div>

        {pathname === '/original' && (
          <ModeToggle mode={mode} setMode={setMode} />
        )}
      </div>

      {showPanel && (
        <div ref={panelRef} className={`side-panel ${panelOpen ? 'open' : ''}`}>
          <button className="close-btn" onClick={() => setPanelOpen(false)}>
            &times;
          </button>
          <h3 className="panel-title">{pageTitle}</h3>
          <p className="panel-intro">{content.intro}</p>

          <h4 className="panel-section-title">Steps:</h4>
          <ol className="panel-steps">
            {content.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>

          <div className="panel-tip">
            <strong>{content.tip.icon} {content.tip.title}</strong>
            <p>{content.tip.text}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;