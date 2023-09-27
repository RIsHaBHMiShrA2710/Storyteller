import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight, faThumbsUp, faThumbsDown, faArrowUpAZ, faTrashCan } from '@fortawesome/free-solid-svg-icons'; // Import the upvote and downvote icons
import './PromptComponent.css';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const PromptComponent = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [prompts, setPrompts] = useState([]);
  const [upvotedStories, setUpvotedStories] = useState([]);
  const [downvotedStories, setDownvotedStories] = useState([]);

  axios.defaults.withCredentials = true;

  const fetchUserHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user-history');

      if (response.status === 200) {
        setPrompts(response.data);
      }
    } catch (error) {
      console.error('Error fetching user history:', error);
    }
  };

  useEffect(() => {
    console.log(user);
    fetchUserHistory();
  }, []);

  const handleAddPrompt = async () => {
    if (title.trim() !== '' && story.trim() !== '') {
      try {
        console.log(user);
        const response = await axios.post('http://localhost:5000/api/add-prompt', { title, content: story, user }, { withCredentials: true });

        if (response.status === 200) {
          fetchUserHistory();
          setTitle('');
          setStory('');
        } else {
          console.error('Failed to add prompt.');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleUpvote = async (index) => {
    const storyIdToUpvote = prompts[index]._id;
  
    if (!upvotedStories.includes(storyIdToUpvote)) {
      try {
        // Make a POST request to update the upvotes on the server
        const response = await axios.post(
          `http://localhost:5000/api/upvote-story/${storyIdToUpvote}`,
          { withCredentials: true }
        );
  
        if (response.status === 200) {
          // Update the state to reflect that the user has upvoted this story
          setUpvotedStories([...upvotedStories, storyIdToUpvote]);
          fetchUserHistory();
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
        // Make a POST request to update the downvotes on the server
        const response = await axios.post(
          `http://localhost:5000/api/downvote-story/${storyIdToDownvote}`,
          { withCredentials: true }
        );
  
        if (response.status === 200) {
          // Update the state to reflect that the user has upvoted this story
          setDownvotedStories([...downvotedStories, storyIdToDownvote]);
          fetchUserHistory();
        } else {
          console.error('Failed to upvote story.');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };
  const handleDelete = async (index) => {
    // Retrieve the story ID from the prompts state
    const storyIdToDelete = prompts[index]._id;

    try {
      // Make a DELETE request to delete the story by ID
      const response = await axios.delete(`http://localhost:5000/api/delete-story/${storyIdToDelete}`, { withCredentials: true });

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
    <div className="prompt-container">
      <h2>Prompt Component</h2>

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
        {prompts.map((item, index) => (
          <motion.div
            key={index}
            className="prompt-card"
            whileHover={{ translateY: -20 }}
          >
            <div className="prompt-title">
              <Link to={`/full-story/${index}`} className="read-more-link">
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
            <p>{item.content}</p>

          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PromptComponent;
