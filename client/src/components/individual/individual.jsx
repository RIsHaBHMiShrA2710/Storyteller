import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams from react-router-dom
import axios from 'axios'; // Import axios for making API requests
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import "./individual.css"
function Individual() {
    // State to store the story data
    const { user } = useAuth();
    const [story, setStory] = useState(null);
    const [upvotedStories, setUpvotedStories] = useState([]);
    const [downvotedStories, setDownvotedStories] = useState([]);

    // Get the storyId from route parameters
    const { storyId } = useParams();
    const fetchStoryData = async () => {
        try {
            // Replace 'YOUR_API_ENDPOINT' with the actual API endpoint to fetch story data by ID

            const response = await axios.get(`http://localhost:5000/api/full-story/${storyId}`);
            if (response.status === 200) {
                const storyData = response.data;
                setStory(storyData);
            } else {
                // Handle errors here
                console.error('Failed to fetch story data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        // Fetch the story data based on the provided story ID
        // Call the fetchStoryData function
        fetchStoryData();
    }, [storyId]);

    // Render loading while fetching data
    if (story === null) {
        return <div>Loading...</div>;
    }
    const handleUpvote = async (storyId) => {
        const storyIdToUpvote = storyId;

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
                    fetchStoryData();
                } else {
                    console.error('Failed to upvote story.');
                }
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    // User is not authenticated, show alert
                    alert('Please log in or register to upvote.');
                } else {
                    console.error('Error:', error);
                }
            }
        }
    };


    const handleDownvote = async (storyId) => {

        const storyIdToDownvote = storyId;

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
                    fetchStoryData();
                } else {
                    console.error('Failed to upvote story.');
                }
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    // User is not authenticated, show alert
                    alert('Please log in or register to upvote.');
                } else {
                    console.error('Error:', error);
                }
            }
        }
    };


// Render the story details once data is available
return (
    <div className='individual-container'>
        <div className='individual-story'>
            <h1 className='individual-story-title'>{story.title}</h1>
            <hr className='individual-line'/>
            <p className='individual-story-content'>{story.content}</p>
            <div className='indidual-story-votes'>
                <button className='voting-button' onClick={() => handleUpvote(storyId)}>
                    <FontAwesomeIcon icon={faThumbsUp} />({story.upvotes.length})
                </button>
                <button className='voting-button' onClick={() => handleDownvote(storyId)}>
                    <FontAwesomeIcon icon={faThumbsDown} /> ({story.downvotes.length})
                </button>
            </div>
        </div>
    </div>
);
}

export default Individual;
