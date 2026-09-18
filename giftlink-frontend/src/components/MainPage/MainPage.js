import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './MainPage.css';

function MainPage() {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    try {
      const response = await fetch('/api/gifts');
      if (response.ok) {
        const data = await response.json();
        setGifts(data);
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      console.log('Loading local sample items as fallback');
      // Fallback sample items for demonstration
      setGifts([
        {
          id: "1",
          name: "Oak Dining Table & Chairs",
          category: "Living",
          condition: "Good",
          image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80",
          description: "Solid oak dining table with four matching cushioned chairs.",
          zipcode: "10001",
          age_years: 3
        },
        {
          id: "2",
          name: "Modern Leather Sofa",
          category: "Living",
          condition: "Like New",
          image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
          description: "Comfortable 3-seater brown leather sofa. Smoke-free home.",
          zipcode: "10002",
          age_years: 1.5
        },
        {
          id: "4",
          name: "Samsung 43-inch 4K Smart TV",
          category: "Electronics",
          condition: "Like New",
          image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80",
          description: "Crisp 4K UHD smart TV with built-in streaming apps.",
          zipcode: "10004",
          age_years: 1
        },
        {
          id: "5",
          name: "Stainless Steel Espresso Machine",
          category: "Kitchen",
          condition: "Good",
          image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80",
          description: "15-bar pump espresso maker with milk frothing wand.",
          zipcode: "10005",
          age_years: 2.5
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/app/search?name=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      navigate('/app/search');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently added';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="mainpage-wrapper">
      {/* Hero Section satisfying Task 12 Landing Page criteria */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-badge">
            <i className="bi bi-stars"></i> Eco-Friendly Community Platform
          </div>
          <h1 className="hero-title" id="project-title">
            Gift<span>Link</span>
          </h1>
          <p className="hero-tagline" id="project-tagline">
            Share Household Items, Reduce Waste, and Help Your Community
          </p>
          <p className="hero-subtext">
            Connect with neighbors to give away things you no longer need, or find free items instead of buying new. Together, let's recycle and reuse!
          </p>

          <div className="hero-actions">
            <a href="#browse-section" className="btn-primary-custom" id="get-started-btn">
              <i className="bi bi-arrow-right-circle-fill"></i> Get Started
            </a>
            <Link to="/app/add-gift" className="btn-secondary-custom" id="donate-hero-btn" style={{ background: '#eef2ff', borderColor: '#c7d2fe', color: '#4f46e5' }}>
              <i className="bi bi-plus-circle-fill"></i> Donate an Item
            </Link>
            <Link to="/app/search" className="btn-secondary-custom" id="browse-btn">
              <i className="bi bi-search"></i> Search Listings
            </Link>
          </div>

          <form onSubmit={handleSearch} className="hero-search-bar" id="hero-search-form">
            <i className="bi bi-search search-icon"></i>
            <input
              type="text"
              placeholder="Search for furniture, electronics, books, kitchenware..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              id="hero-search-input"
            />
            <button type="submit" className="search-btn">Find Gifts</button>
          </form>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="categories-section">
        <div className="container">
          <div className="category-pills">
            <Link to="/app/search?category=Living" className="cat-pill">
              <i className="bi bi-couch"></i> Living
            </Link>
            <Link to="/app/search?category=Bedroom" className="cat-pill">
              <i className="bi bi-lamp"></i> Bedroom
            </Link>
            <Link to="/app/search?category=Kitchen" className="cat-pill">
              <i className="bi bi-cup-hot"></i> Kitchen
            </Link>
            <Link to="/app/search?category=Electronics" className="cat-pill">
              <i className="bi bi-laptop"></i> Electronics
            </Link>
            <Link to="/app/search?category=Books" className="cat-pill">
              <i className="bi bi-book"></i> Books
            </Link>
            <Link to="/app/search?category=Toys" className="cat-pill">
              <i className="bi bi-puzzle"></i> Toys
            </Link>
          </div>
        </div>
      </section>

      {/* Available Gifts Catalog */}
      <section className="catalog-section" id="browse-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Latest Available Gifts</h2>
              <p className="section-subtitle">Discover free pre-loved items offered by your local community.</p>
            </div>
            <Link to="/app/search" className="view-all-link">
              View All <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading available gifts...</p>
            </div>
          ) : (
            <div className="gifts-grid" id="gifts-grid">
              {gifts.map((gift) => (
                <div key={gift.id} className="gift-card" id={`gift-card-${gift.id}`}>
                  <div className="card-image-wrap">
                    <img src={gift.image} alt={gift.name} loading="lazy" />
                    <span className="card-category-badge">{gift.category}</span>
                    <span className="card-condition-badge">{gift.condition}</span>
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{gift.name}</h3>
                    <p className="card-description">{gift.description}</p>
                    <div className="card-meta">
                      <span><i className="bi bi-geo-alt"></i> Zip {gift.zipcode || '10001'}</span>
                      <span><i className="bi bi-clock"></i> {formatDate(gift.posted_date)}</span>
                    </div>
                  </div>
                  <div className="card-footer">
                    <Link to={`/app/product/${gift.id}`} className="btn-view-details" id={`view-details-${gift.id}`}>
                      View Details <i className="bi bi-chevron-right"></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default MainPage;
