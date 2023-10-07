import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowCircleRight,
  faThumbsUp,
  faThumbsDown,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import './PromptComponent.css';
import axios from 'axios';
import TruncateText from './truncateText';
import { useAuth } from '../../context/AuthContext';

const PromptComponent = () => {
  const { user, logout } = useAuth(); // Access the user and logout function from the context
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [prompts, setPrompts] = useState([]);
  const [upvotedStories, setUpvotedStories] = useState([]);
  const [downvotedStories, setDownvotedStories] = useState([]);


  const fetchUserHistory = async () => {
    try {
      if (!user) return;
      const authToken = `${JSON.parse(localStorage.getItem('user')).token}`;
      console.log(authToken);
      console.log(user);
  
      const response = await axios.get('http://localhost:5000/api/user-history', {
        headers: {
          Authorization: authToken,
        },
      });

      if (response.status === 200) {
        setPrompts(response.data);
      }
    } catch (error) {
      console.error('Error fetching user history:', error);
  
      // Handle token expiration (401 Unauthorized)
      if (error.response && error.response.status === 401) {
        alert('Your session has expired. Please log in again.');
        logout(); // Call your logout function to clear user state
        // Redirect to the login page
        // Navigate to your login page using your router's navigation method
        // Example: navigate("/login");
      }
    }
  };
  

  useEffect(() => {
    fetchUserHistory();
  }, [user]);

  const handleAddPrompt = async () => {
    if (title.trim() !== '' && story.trim() !== '') {
      try {
        const authToken = `${user.token}`;

        const response = await axios.post(
          'http://localhost:5000/api/add-prompt',
          { title, content: story },
          {
            headers: {
              Authorization: authToken,
            },
          }
        );

        if (response.status === 200) {
          fetchUserHistory();
          setTitle('');
          setStory('');
        } else {
          console.error('Failed to add prompt.');
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // User is not authenticated, show alert
          alert('Please log in or register to generate a story.');
        } else {
          console.error('Error:', error);
        }
      }
    }
  };

  const handleUpvote = async (index) => {
    const storyIdToUpvote = prompts[index]._id;

    if (!upvotedStories.includes(storyIdToUpvote)) {
      try {
        const authToken = `${user.token}`;

        const response = await axios.post(
          `http://localhost:5000/api/upvote-story/${storyIdToUpvote}`,
          {},
          {
            headers: {
              Authorization: authToken,
            },
          }
        );

        if (response.status === 200) {
          // Update the state to reflect that the user has upvoted this story
          setUpvotedStories([...upvotedStories, storyIdToUpvote]);
          fetchUserHistory();
        } else if (response.status === 401) {
          // User is not authenticated, show alert
          alert('Please log in or register to upvote.');
        } else {
          console.error('Failed to upvote story.');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleDownvote = async (index) => {
    const storyIdToDownvote = prompts[index]._id;

    if (!downvotedStories.includes(storyIdToDownvote)) {
      try {
        const authToken = `${user.token}`;

        const response = await axios.post(
          `http://localhost:5000/api/downvote-story/${storyIdToDownvote}`,
          {},
          {
            headers: {
              Authorization: authToken,
            },
          }
        );

        if (response.status === 200) {
          // Update the state to reflect that the user has downvoted this story
          setDownvotedStories([...downvotedStories, storyIdToDownvote]);
          fetchUserHistory();
        } else if (response.status === 401) {
          // User is not authenticated, show alert
          alert('Please log in or register to downvote.');
        } else {
          console.error('Failed to downvote story.');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleDelete = async (index) => {
    const storyIdToDelete = prompts[index]._id;

    try {
      const authToken = `${user.token}`;

      const response = await axios.delete(
        `http://localhost:5000/api/delete-story/${storyIdToDelete}`,
        {
          headers: {
            Authorization: authToken,
          },
        }
      );

      if (response.status === 200) {
        // Remove the deleted story from the prompts state
        const updatedPrompts = [...prompts];
        updatedPrompts.splice(index, 1);
        setPrompts(updatedPrompts);
      } else {
        console.error('Failed to delete story.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className='home-background'>
      <div className="prompt-container">
        <h2>Generate your Story</h2>

        {user && (
          <div className="user-info">
            <p>Welcome, {user.username}!</p>
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
          <label htmlFor="storyInput">Story:</label>
          <textarea
            id="storyInput"
            value={story}
            onChange={(e) => setStory(e.target.value)}
          />
        </div>
        <button className='prompt-button' onClick={handleAddPrompt}>Generate Story</button>

        <div className="history-container">
          {prompts.map((item, index) => (
            <motion.div
              key={index}
              className="prompt-card"
              whileHover={{ translateY: -20 }}
            >
              <div className="prompt-title">
                <Link to={`/full-story/${item._id}`} className="read-more-link">
                  <FontAwesomeIcon icon={faArrowCircleRight} />
                </Link>
                <h3>{item.title}</h3>

                <div className="voting-buttons">
                  <button className='delete-button' onClick={() => handleDelete(index)}>
                    <FontAwesomeIcon icon={faTrashCan} />
                  </button>

                  <button className='voting-button' onClick={() => handleUpvote(index)}>
                    <FontAwesomeIcon icon={faThumbsUp} />({item.upvotes.length})
                  </button>

                  <button className='voting-button' onClick={() => handleDownvote(index)}>
                    <FontAwesomeIcon icon={faThumbsDown} /> ({item.downvotes.length})
                  </button>

                </div>

              </div>
              <TruncateText text={item.content} maxWords={20} />


            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromptComponent;
