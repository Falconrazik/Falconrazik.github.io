import React from 'react';
import './NewsModal.css'; // Ensure you have a corresponding CSS file for styling
import twitterLogo from '../../img/twitter.png';
import facebookLogo from '../../img/facebook.png';

const formatDate = (unixTimestamp) => {
    const milliseconds = unixTimestamp * 1000; // Convert to milliseconds
    const dateObject = new Date(milliseconds);
  
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return dateObject.toLocaleDateString("en-US", options); // Adjust the locale as needed
};

const NewsModal = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <div className="modal-background">
      <div className="modal-container">
        <div className="top-container">
            <h2>{article.source}</h2>
            <button className="close-button" onClick={onClose}>×</button>
        </div>
        <p>{formatDate(article.datetime)}</p>
        <hr></hr>
        <h4>{article.headline}</h4>
        <p style={{fontSize: 15}}>{article.summary}</p>
        <p style={{fontSize: 15}}>For more detail click <a target="_blank" href={article.url}>here</a></p>

        <div className="test-container">
          Share
          <div className="share-footer">
            <a 
                className="twitter-share-button" 
                target="_blank" 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.headline)}&url=${encodeURIComponent(article.url)}`}
            >
                <img src={twitterLogo} />
            </a>
            <a 
                className="facebook-share-button" 
                target="_blank" 
                rel="noopener noreferrer" 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(article.url)}`}
                style={{marginLeft: 15}}
            >
                <img src={facebookLogo} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsModal;
