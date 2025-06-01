import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaInfoCircle } from 'react-icons/fa';
import './Header.css';
import ModeToggle from './ModeToggle';
import { FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import Button from './Button';
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
        '2. Use the slider to choose how many face images to fetch (1–5).',          // # COMMENT: reflect 1–10 image fetch limit
      ],
      tip: {
        title: 'Why it matters',
        icon: '🧠',
        text: 'A consistent and well-defined demographic group is critical for fair and meaningful analysis. By controlling for gender, age, and race—and limiting the fetch to 1–5 images—you ensure that any differences in AI outputs are due to model behavior, not input volume inconsistencies.',  // # COMMENT: include fetch limit rationale
      },
      toggleWarning: '🔄 You can switch to "Custom" mode to upload your own face images instead — but note this will remove any existing generated images.',
    },
    custom: {
      intro: 'In this step, you’ll upload your own images and define a demographic label for analysis. These images will be edited with different occupations in the next step.',
      steps: [
        '1. Upload 1–5 clear face images of the same individual.',       // # COMMENT: enforce max upload limit
        '2. The system will automatically check each image for facial features.',
      ],
      tip: {
        title: 'Why it matters',
        icon: '🧠',
        text: 'Uploading a uniform set of personal images (up to 5) allows you to evaluate how your appearance may be interpreted or altered by AI, while testing for consistency in detection and editing.',
      },
      toggleWarning: '🔄 You can switch to "Default" mode to generate new images by demographic — but switching will remove all your uploaded images.',
      legend: [
        {
          icon: <FaCheckCircle color="green" size={18} />,
          label: 'Face detected (Can be use)',
        },
        {
          icon: <FaExclamationCircle color="orange" size={18} />,
          label: 'Unverified (Not yet checked)',
        },
        {
          icon: <FaExclamationCircle color="red" size={18} />,
          label: 'No face detected (Cannot be use)',
        },
      ],
    },
  },
  '/transformed': {
    intro: 'In this step, you will apply occupation-based transformations to the generated face images using AI image editing models.',
    steps: [
      '1. Choose an image editing model: Instructpix2pix, Img2Img, or MagicBrush.',   // # COMMENT: list available models
      '2. Select the number of professions (up to 3) to test.',                         // # COMMENT: enforce profession limit
      '3. Apply each profession to your demographic group and view transformations.',
    ],
    tip: {
      title: 'Why it matters',
      icon: '🧪',
      text: 'AI image editing models trained on large datasets often reflect social patterns. By selecting up to three professions and three model options, you can systematically inspect how different models and roles influence portrayals across demographics, revealing potential biases.', // # COMMENT: mention model and profession limits in tip
    },
  },
  '/result': {
    intro: 'This step presents the final analysis of how the AI model visually transformed individuals across different occupations. You’ll now interpret the bias scores and observe how your selected demographic was represented.',
    steps: [
      '1. Compare the original and transformed images to see how the AI model changed visual features for each occupation.',
      '2. Review the gender, age, and skin-tone bias scores to understand where significant changes occurred.',
      '3. Explore the bias distribution chart and overall summary to evaluate the extent and severity of detected bias.',
    ],
    tip: {
      title: 'Why it matters',
      icon: '📊',
      text: 'This stage helps you identify whether the AI model produced fair or biased portrayals when assigning professional roles. By examining visual outputs and bias metrics, \
      you can detect underrepresentation or reinforcement of demographic stereotypes and compare results across up to three professions and model choices.',
    }, toggleWarning: '📁 Clicking "Export CSV" will download a file with all bias analysis results for further review.',
  }
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
            <div className="tooltip-wrapper">
              <FaInfoCircle
                className="info-icon"
                onClick={() => setPanelOpen(true)}
              />
              <span className="tooltip-text">Click for more info</span>
            </div>
          )}
        </div>

        {pathname === '/result' && (
          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={() => {
                const event = new CustomEvent('export-csv');
                window.dispatchEvent(event);
              }}
              className="bg-white text-gray-800 border border-gray-300 px-3 py-1.5 text-[12px] rounded-sm hover:bg-gray-100 transition"
            >
              Export CSV
            </button>
          </div>
        )}

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
          {content.toggleWarning && (
            <div className="panel-warning">
              <p>{content.toggleWarning}</p>
            </div>
          )}
          {pathname === '/original' && mode === 'custom' && content.legend && (
            <div className="panel-status-legend">
              <h4 className="panel-section-title">Face Detection Legend:</h4>
              <ul>
                {content.legend.map((item, i) => (
                  <li key={i} className="legend-item" title={item.label}>
                    {item.icon}
                    <span className="legend-label">{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Header;