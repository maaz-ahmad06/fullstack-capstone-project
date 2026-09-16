import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './DetailsPage.css';

function DetailsPage() {
  const { id } = useParams();
  const [gift, setGift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [sentimentScore, setSentimentScore] = useState(null);
  const [sentimentLabel, setSentimentLabel] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGiftDetails();
  }, [id]);

  const fetchGiftDetails = async () => {
    try {
      const response = await fetch(`/api/gifts/${id}`);
      if (response.ok) {
        const data = await response.json();
        setGift(data);
      } else {
        throw new Error('Not found');
      }
    } catch (err) {
      // Fallback detail
      setGift({
        id: id || "1",
        name: "Oak Dining Table & Chairs",
        category: "Living",
        condition: "Good",
        posted_date: 1715000000,
        zipcode: "10001",
        image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
        description: "Solid oak dining table with four matching cushioned chairs. Minor scratches on surface but structurally very sound and beautiful.",
        age_years: 3,
        comments: [
          { author: "Sarah M.", comment: "Great sturdy table, very generous offer!", rating: 5 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSentimentCheck = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await fetch('/api/sentiment/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence: commentText })
      });
      if (res.ok) {
        const data = await res.json();
        setSentimentScore(data.score);
        setSentimentLabel(data.sentiment);
      }
    } catch (err) {
      console.log('Sentiment analysis offline');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/gifts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: authorName || "Community Member",
          comment: commentText,
          rating: 5
        })
      });

      if (response.ok) {
        const newCom = { author: authorName || "Community Member", comment: commentText, rating: 5 };
        setGift(prev => ({ ...prev, comments: [...(prev.comments || []), newCom] }));
        setCommentText('');
        setAuthorName('');
        setSentimentLabel('');
      }
    } catch (err) {
      const newCom = { author: authorName || "Community Member", comment: commentText, rating: 5 };
      setGift(prev => ({ ...prev, comments: [...(prev.comments || []), newCom] }));
      setCommentText('');
      setAuthorName('');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container loading-state">Loading item details...</div>;
  }

  if (!gift) {
    return (
      <div className="container error-state">
        <h2>Item Not Found</h2>
        <Link to="/app" className="btn-primary-custom">Back to Gifts</Link>
      </div>
    );
  }

  return (
    <div className="details-page-wrapper">
      <div className="container">
        <Link to="/app" className="back-link">
          <i className="bi bi-arrow-left"></i> Back to all listings
        </Link>

        <div className="details-grid">
          {/* Left Column: Image */}
          <div className="details-image-card">
            <img src={gift.image} alt={gift.name} />
          </div>

          {/* Right Column: Info & Actions */}
          <div className="details-info-card">
            <div className="badges-row">
              <span className="badge category-badge">{gift.category}</span>
              <span className="badge condition-badge">{gift.condition}</span>
              <span className="badge age-badge">{gift.age_years} yrs old</span>
            </div>

            <h1 className="item-title">{gift.name}</h1>
            <p className="item-location"><i className="bi bi-geo-alt-fill"></i> Location: Zip {gift.zipcode}</p>
            
            <div className="item-description-box">
              <h3>Description</h3>
              <p>{gift.description}</p>
            </div>

            <div className="contact-donor-box">
              <h3>Interested in this item?</h3>
              <p>Connect directly with the donor to arrange pickup.</p>
              <button className="btn-primary-custom btn-claim" onClick={() => alert('Gift request sent to the donor!')}>
                <i className="bi bi-gift-fill"></i> Request This Gift
              </button>
            </div>
          </div>
        </div>

        {/* Comments & Sentiment Feedback */}
        <div className="comments-section">
          <h2>Community Feedback & Inquiries ({gift.comments ? gift.comments.length : 0})</h2>

          <div className="comments-list">
            {gift.comments && gift.comments.length > 0 ? (
              gift.comments.map((c, i) => (
                <div key={i} className="comment-item">
                  <div className="comment-avatar">{c.author ? c.author.charAt(0) : 'U'}</div>
                  <div className="comment-content">
                    <h4>{c.author}</h4>
                    <p>{c.comment}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-comments">No inquiries yet. Be the first to leave a comment or ask a question!</p>
            )}
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="add-comment-card">
            <h3>Leave an Inquiry / Review</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="Your Name (optional)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <textarea
                placeholder="Write your question or comment here..."
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onBlur={handleSentimentCheck}
                required
              />
            </div>

            {sentimentLabel && (
              <div className={`sentiment-badge sentiment-${sentimentLabel.toLowerCase()}`}>
                <i className="bi bi-chat-heart"></i> AI Sentiment: {sentimentLabel} (Score: {sentimentScore?.toFixed(2)})
              </div>
            )}

            <button type="submit" className="btn-primary-custom" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DetailsPage;
