// src/components/ImageCarousel.jsx
import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import './ImageCarousel.css';

const ImageCarousel = ({ slides }) => (
  <Carousel
    showThumbs={false}
    infiniteLoop
    useKeyboardArrows
    dynamicHeight
    emulateTouch
    swipeable
  >
    {slides.map((slide, idx) => (
      <div className="slide" key={idx}>
        <div className="slide-pair">
          <figure>
            <img src={slide.input} alt={`input-${idx}`} />
            <figcaption>Input</figcaption>
          </figure>
          <figure>
            <img src={slide.output} alt={`output-${idx}`} />
            <figcaption>Output</figcaption>
          </figure>
        </div>
      </div>
    ))}
  </Carousel>
);

export default ImageCarousel;
