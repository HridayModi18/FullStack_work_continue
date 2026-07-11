import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PostMedia from './PostMedia';
import './MediaCarousel.css';

const MediaCarousel = ({ urls, type }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!urls || urls.length === 0) return null;
  if (urls.length === 1) return <PostMedia url={urls[0]} type={type} />;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % urls.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + urls.length) % urls.length);
  };

  return (
    <div className="media-carousel-container">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.2 }}
          className="carousel-slide"
        >
          <PostMedia url={urls[currentIndex]} type={type} />
        </motion.div>
      </AnimatePresence>

      <button className="carousel-btn prev" onClick={prevSlide}>
        <ChevronLeft size={20} />
      </button>
      <button className="carousel-btn next" onClick={nextSlide}>
        <ChevronRight size={20} />
      </button>

      <div className="carousel-indicators">
        {urls.map((_, idx) => (
          <div
            key={idx}
            className={`indicator-dot ${idx === currentIndex ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MediaCarousel;
