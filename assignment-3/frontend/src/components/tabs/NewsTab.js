import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Make sure to install axios with `npm install axios`
import './NewsTab.css'
import { useCompany } from '../../context/CompanyProvider';
import NewsModal from '../modals/NewsModal';

const NewsTab = () => {
    const { companyDescription } = useCompany()
    const [newsData, setNewsData] = useState([]);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const symbol = companyDescription?.ticker;
  
    useEffect(() => {
        const fetchNews = async () => {
            try {
            const response = await axios.get(`/api/news/${symbol}`);
            const validNews = response.data
                .filter(article => article.image && article.headline)
                .slice(0, 20); // Take only the first 20 items
            setNewsData(validNews);
            } catch (error) {
            console.error("Error fetching news data:", error);
            }
        };

        fetchNews();
    }, [symbol]);

    const handleArticleClick = (article) => {
        setSelectedArticle(article);
      };
    
    const handleCloseModal = () => {
        setSelectedArticle(null);
    }
  
    return (
        <>
          <div className="news-tab">
            <div className="news-container">
              {newsData.map((article, index) => (
                <div key={index} className="news-card" onClick={() => handleArticleClick(article)}>
                  <div className="info-container">
                    <img src={article.image} alt={article.headline}/>
                    <div className="news-headline">{article.headline}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {selectedArticle && <NewsModal article={selectedArticle} onClose={handleCloseModal} />}
        </>
    );
  };

export default NewsTab;
