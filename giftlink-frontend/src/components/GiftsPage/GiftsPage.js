import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './GiftsPage.css';

const CATEGORIES = ['All', 'Living', 'Bedroom', 'Kitchen', 'Electronics', 'Books', 'Toys', 'Music', 'Sports', 'Home Decor'];

function GiftsPage() {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gifts');
      if (response.ok) {
        const data = await response.json();
        setGifts(data);
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      // Fallback sample data
      setGifts([
        {
          id: "1",
          name: "Oak Dining Table & Chairs",
          category: "Living",
          condition: "Good",
          image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80",
          description: "Solid oak dining table with four matching cushioned chairs.",
          zipcode: "10001",
          posted_date: 1715000000,
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
          posted_date: 1715050000,
          age_years: 1.5
        },
        {
          id: "3",
          name: "Queen Size Bed Frame",
          category: "Bedroom",
          condition: "Good",
          image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
          description: "Minimalist wooden queen size bed frame with slats included.",
          zipcode: "10003",
          posted_date: 1715100000,
          age_years: 2
        },
        {
          id: "4",
          name: "Samsung 43-inch 4K Smart TV",
          category: "Electronics",
          condition: "Like New",
          image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80",
          description: "Crisp 4K UHD smart TV with built-in streaming apps.",
          zipcode: "10004",
          posted_date: 1715150000,
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
          posted_date: 1715200000,
          age_years: 2.5
        },
        {
          id: "6",
          name: "Acoustic Guitar with Gig Bag",
          category: "Music",
          condition: "Fair",
          image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80",
          description: "Full size beginner dreadnought acoustic guitar with warm tone.",
          zipcode: "10006",
          posted_date: 1715250000,
          age_years: 4
        }
      ]);
    } finally {
      setLoading(false);
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

  // Filter and sort items
  const filteredGifts = gifts
    .filter((item) => {
      const matchCategory = selectedCategory === 'All' || item.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchCondition = selectedCondition === 'All' || item.condition?.toLowerCase() === selectedCondition.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchCondition && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return (b.posted_date || 0) - (a.posted_date || 0);
      if (sortBy === 'oldest') return (a.posted_date || 0) - (b.posted_date || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

  return (
    <div className="gifts-page-wrapper">
      <div className="container">
        {/* Page Top Header */}
        <div className="gifts-page-header">
          <div>
            <div className="header-badge">
              <i className="bi bi-gift-fill"></i> Community Catalog
            </div>
            <h1>Available Free Gifts</h1>
            <p>Browse all items shared by local community members for reuse and recycling.</p>
          </div>
          <Link to="/app/add-gift" className="btn-primary-custom btn-header-donate">
            <i className="bi bi-plus-circle-fill"></i> Donate an Item
          </Link>
        </div>

        {/* Filter Toolbar */}
        <div className="gifts-toolbar-card">
          <div className="search-bar-wrap">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Filter by keyword (e.g., table, sofa, TV, kitchen)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="btn-clear-search" onClick={() => setSearchQuery('')}>
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>

          <div className="toolbar-dropdowns">
            <div className="dropdown-group">
              <label><i className="bi bi-tag"></i> Condition:</label>
              <select value={selectedCondition} onChange={(e) => setSelectedCondition(e.target.value)}>
                <option value="All">All Conditions</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            <div className="dropdown-group">
              <label><i className="bi bi-sort-down"></i> Sort:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="category-tabs-row">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog Content */}
        <div className="catalog-status-bar">
          <span>Showing <strong>{filteredGifts.length}</strong> items available</span>
          {(selectedCategory !== 'All' || selectedCondition !== 'All' || searchQuery) && (
            <button
              className="btn-reset-filters"
              onClick={() => {
                setSelectedCategory('All');
                setSelectedCondition('All');
                setSearchQuery('');
              }}
            >
              <i className="bi bi-arrow-counterclockwise"></i> Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="gifts-loading">
            <div className="spinner"></div>
            <p>Loading available gift listings...</p>
          </div>
        ) : filteredGifts.length > 0 ? (
          <div className="gifts-catalog-grid">
            {filteredGifts.map((gift) => (
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
                    View Details & Request <i className="bi bi-chevron-right"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="gifts-empty-state">
            <div className="empty-icon"><i className="bi bi-inbox"></i></div>
            <h3>No gift items match your current filters</h3>
            <p>Try selecting a different category or clearing your search keywords.</p>
            <button
              className="btn-primary-custom"
              onClick={() => {
                setSelectedCategory('All');
                setSelectedCondition('All');
                setSearchQuery('');
              }}
              style={{ marginTop: '1rem' }}
            >
              View All Items
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GiftsPage;
