import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // Assuming you are using React Router for navigation
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';
import './PromptComponent.css'; // Import your CSS file

const PromptComponent = () => {
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [prompts, setPrompts] = useState([]);

  const handleAddPrompt = () => {
    if (title.trim() !== '' && story.trim() !== '') {
      setPrompts([{ title, story }, ...prompts]);
      setTitle('');
      setStory('');
    }
  };

  return (
    <div className="prompt-container">
      <h2>Prompt Component</h2>
      <div className="input-container">
        <label htmlFor="titleInput">Title:</label>
        <input
          type="text"
          id="titleInput"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="input-container">
        <label htmlFor="storyInput">Story:</label>
        <textarea
          id="storyInput"
          value={story}
          onChange={(e) => setStory(e.target.value)}
        />
      </div>
      <button onClick={handleAddPrompt}>Add Prompt</button>

      <div className="prompts-container">
        {prompts.slice().reverse().map((item, index) => (
          <motion.div
            key={index}
            className="prompt-card"
            whileHover={{ translateY: -10 }} // Create an overlap effect
          >
            <div className="prompt-title">
              <h3>{item.title}</h3>
              <Link to={`/full-story/${index}`} className="read-more-link">
                <FontAwesomeIcon icon={faArrowCircleRight} />
              </Link>
            </div>
            <p>{item.story}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PromptComponent;
