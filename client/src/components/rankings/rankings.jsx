import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight, faThumbsUp, faThumbsDown, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './rankings.css';
import TruncateText from '../create/truncateText';
import { useAuth } from '../../context/AuthContext';

const RankingComponent = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [upvotedStories, setUpvotedStories] = useState([]);
  const [downvotedStories, setDownvotedStories] = useState([]);

  const fetchRankings = async () => {
    try {
      console.log(user.user._id);
      const response = await axios.get('https://storygeneration.onrender.com/api/all-stories');

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

  if (stories === null) {
    return (
      <div className='loader-body'>
        <div className="loader">Loading</div>
      </div>
    );
  }
  const handleUpvote = async (index) => {
    const storyIdToUpvote = stories[index]._id;

    if (!upvotedStories.includes(storyIdToUpvote)) {
      try {
        const authToken = `${user.token}`;

        const response = await axios.post(
          `https://storygeneration.onrender.com/api/upvote-story/${storyIdToUpvote}`,
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
          fetchRankings();
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
    const storyIdToDownvote = stories[index]._id;

    if (!downvotedStories.includes(storyIdToDownvote)) {
      try {
        const authToken = `${user.token}`;

        const response = await axios.post(
          `https://storygeneration.onrender.com/api/downvote-story/${storyIdToDownvote}`,
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
          fetchRankings();
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


  return (
    <div className="ranking-container">
      <h2>Story Ranking</h2>
      <div className="story-container">
        {stories.map((item, index) => (
          <div className="story-card" key={index}>
            <div className="prompt-title">
              <Link to={`/full-story/${item._id}`} className="read-more-link">
                <FontAwesomeIcon icon={faArrowCircleRight} />
              </Link>
              <h3>{item.title}</h3>

              <div className="voting-buttons">
                <button className={`voting-button ${item.upvotes.includes(user.user._id) ? 'voted' : ''}`} onClick={() => handleUpvote(index)}>
                  <FontAwesomeIcon icon={faThumbsUp} /> ({item.upvotes.length})
                </button>

                <button className={`voting-button ${item.downvotes.includes(user.user._id) ? 'voted' : ''}`} onClick={() => handleDownvote(index)}>
                  <FontAwesomeIcon icon={faThumbsDown} /> ({item.downvotes.length})
                </button>
              </div>
            </div>
            <TruncateText text={item.content} maxWords={40} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankingComponent;
