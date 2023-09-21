import React, { useEffect, useId, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import './SegmentControl.css';

export default function SegmentControl() {
  // Wrap the initialization of 'items' in useMemo to memoize its value
  const items = useMemo(() => ['Create', 'Rankings'], []);

  const location = useLocation();
  const pathname = location.pathname.toLowerCase();

  // Determine the initial index based on the URL pathname
  const initialIndex = items.findIndex(item => pathname.includes(item.toLowerCase()));

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const id = useId();

  const handleItemClick = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    // Update currentIndex based on the URL pathname
    const newIndex = items.findIndex(item => pathname.includes(item.toLowerCase()));
    setCurrentIndex(newIndex !== -1 ? newIndex : -1);
  }, [pathname, items]); // Include 'items' in the dependency array

  return (
    <div className="segments">
      <div className="control-container">
        {items.map((item, index) => {
          const isSelected = currentIndex === index;

          return (
            <NavLink
              to={`/${item.toLowerCase()}`}
              activeClassName="active"
              className={`control-item ${isSelected ? 'selected' : ''}`}
              onClick={() => handleItemClick(index)}
              key={index}
            >
              {isSelected && (
                <motion.div layoutId={id} className="control-item-bg"></motion.div>
              )}
              <div className={`control-item-text ${isSelected ? 'selected-text' : ''}`}>
                {item}
              </div>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
