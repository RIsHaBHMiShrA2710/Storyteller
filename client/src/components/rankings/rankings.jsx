// frontend/components/RankingComponent.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RankingComponent = () => {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    // Fetch rankings from the server
    const fetchRankings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/all-stories');

        if (response.status === 200) {
          setStories(response.data);
        }
      } catch (error) {
        console.error('Error fetching rankings:', error);
      }
    };

    fetchRankings();
  }, []);

  return (
    <div className="ranking-container">
      <h2>Story Ranking</h2>
      <ul>
        {stories.map((story, index) => (
          <li key={index}>
            <h3>{story.title}</h3>
            <p>{story.content}</p>
            <p>Upvotes: {story.upvotes}</p>
            <p>Downvotes: {story.downvotes}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RankingComponent;
