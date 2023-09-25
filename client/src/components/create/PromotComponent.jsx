import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';
import './PromptComponent.css';
import axios from 'axios'; // Import Axios
import { useAuth } from '../../context/AuthContext'; // Adjust the path as needed

const PromptComponent = () => {
  const { user } = useAuth(); // Access user data from the context
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [prompts, setPrompts] = useState([]);
  axios.defaults.withCredentials = true;

  useEffect(() => {
    // Fetch user's history when the component mounts
    fetchUserHistory();
  }, []);

  const fetchUserHistory = async () => {
    try {
      // Make a GET request to fetch the user's history
      const response = await axios.get("http://localhost:5000/api/user-history");

      if (response.status === 200) {
        setPrompts(response.data);
      }
    } catch (error) {
      console.error('Error fetching user history:', error);
    }
  };

  const handleAddPrompt = async () => {
    if (title.trim() !== '' && story.trim() !== '') {
      try {
        // Make a POST request to store the prompt
        console.log(user);
        const response = await axios.post('http://localhost:5000/api/add-prompt', { title, story, user }, { withCredentials: true });


        if (response.status === 200) {
          // Prompt added successfully, fetch and update the user's history
          fetchUserHistory();

          setTitle('');
          setStory('');
        } else {
          // Handle error
          console.error('Failed to add prompt.');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <div className="prompt-container">
      <h2>Prompt Component</h2>

      {/* Display user info if authenticated */}
      {user && (
        <div className="user-info">
          <p>Welcome, {user.username}!</p>
          {/* You can add more user-related information here */}
        </div>
      )}

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
            whileHover={{ translateX: -50 }}
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
