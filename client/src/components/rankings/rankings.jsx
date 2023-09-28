import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight, faThumbsUp, faThumbsDown, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './rankings.css';
import { useAuth } from '../../context/AuthContext';

const RankingComponent = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [upvotedStories, setUpvotedStories] = useState([]);
  const [downvotedStories, setDownvotedStories] = useState([]);

  const fetchRankings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/all-stories');

      if (response.status === 200) {
        // Sort the stories based on the upvote-to-downvote ratio
        const sortedStories = response.data.sort((a, b) => {
          const ratioA = a.upvotes.length - a.downvotes.length;
          const ratioB = b.upvotes.length - b.downvotes.length;
          return ratioB - ratioA; // Sort in descending order
        });

        setStories(sortedStories);
        console.log(stories);
      }
    } catch (error) {
      console.error('Error fetching rankings:', error);
    }
  };

  useEffect(() => {
    // Fetch rankings from the server
    fetchRankings();
  }, []);

  const handleUpvote = async (index) => {
    const storyIdToUpvote = stories[index]._id;
    console.log(storyIdToUpvote);
    if (!upvotedStories.includes(storyIdToUpvote)) {
      try {
        // Make a POST request to update the upvotes on the server
        const response = await axios.post(
          `http://localhost:5000/api/upvote-story/${storyIdToUpvote}`,
          {},
          { withCredentials: true }
        );

        if (response.status === 200) {
          // Update the state to reflect that the user has upvoted this story
          setUpvotedStories([...upvotedStories, storyIdToUpvote]);
          // Fetch rankings again to update the list
          fetchRankings();
        } else {
          console.error('Failed to upvote story.');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleDownvote = async (index) => {
    const storyIdToDownvote = stories[index]._id;

    if (!downvotedStories.includes(storyIdToDownvote)) {
      try {
        // Make a POST request to update the downvotes on the server
        const response = await axios.post(
          `http://localhost:5000/api/downvote-story/${storyIdToDownvote}`,
          {},
          { withCredentials: true }
        );

        if (response.status === 200) {
          // Update the state to reflect that the user has downvoted this story
          setDownvotedStories([...downvotedStories, storyIdToDownvote]);
          // Fetch rankings again to update the list
          fetchRankings();
        } else {
          console.error('Failed to downvote story.');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <div className="ranking-container">
      <h2>Story Ranking</h2>
      <div className="story-container">
        {stories.map((item, index) => (
          <div className="story-card" key={index}>
            <div className="prompt-title">
              <Link to={`/full-story/${index}`} className="read-more-link">
                <FontAwesomeIcon icon={faArrowCircleRight} />
              </Link>
              <h3>{item.title}</h3>

              <div className="voting-buttons">
                <button className="voting-button" onClick={() => handleUpvote(index)}>
                  <FontAwesomeIcon icon={faThumbsUp} /> ({item.upvotes.length})
                </button>

                <button className="voting-button" onClick={() => handleDownvote(index)}>
                  <FontAwesomeIcon icon={faThumbsDown} /> ({item.downvotes.length})
                </button>
              </div>
            </div>
            <p>{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankingComponent;
