import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import './GiftsPage.css';

const CATEGORIES = ['All', 'Living', 'Bedroom', 'Kitchen', 'Electronics', 'Books', 'Toys', 'Music', 'Sports', 'Home Decor'];

const FALLBACK_GIFTS = [
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
];

function GiftsPage() {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Debounce search input by 300ms to avoid spamming server requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchGifts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      params.append('sort', sortBy);
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedCondition !== 'All') params.append('condition', selectedCondition);
      if (debouncedSearch) params.append('search', debouncedSearch);

      const response = await fetch(`${API_BASE_URL}/api/gifts?${params.toString()}`);
      if (!response.ok) {
        throw new Error('API failed');
      }

      const data = await response.json();
      if (data && Array.isArray(data.gifts) && data.pagination) {
        setGifts(data.gifts);
        setPagination(data.pagination);
      } else if (Array.isArray(data)) {
        setGifts(data);
        setPagination({
          total: data.length,
          page: 1,
          limit: data.length || limit,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch (err) {
      // Offline fallback filtering & pagination
      const filtered = FALLBACK_GIFTS.filter((item) => {
        const matchCategory = selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchCondition = selectedCondition === 'All' || item.condition.toLowerCase() === selectedCondition.toLowerCase();
        const matchSearch =
          !debouncedSearch ||
          item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          item.description.toLowerCase().includes(debouncedSearch.toLowerCase());
        return matchCategory && matchCondition && matchSearch;
      });
      setGifts(filtered);
      setPagination({
        total: filtered.length,
        page: 1,
        limit,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, selectedCategory, selectedCondition, debouncedSearch, sortBy]);

  useEffect(() => {
    fetchGifts();
  }, [fetchGifts]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages || newPage === page) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedCondition('All');
    setSearchQuery('');
    setDebouncedSearch('');
    setPage(1);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently added';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const startItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

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
              <select
                value={selectedCondition}
                onChange={(e) => {
                  setSelectedCondition(e.target.value);
                  setPage(1);
                }}
              >
                <option value="All">All Conditions</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            <div className="dropdown-group">
              <label><i className="bi bi-sort-down"></i> Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
              >
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
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog Status Bar */}
        <div className="catalog-status-bar">
          <span>
            {pagination.total > 0 ? (
              <>Showing <strong>{startItem}–{endItem}</strong> of <strong>{pagination.total}</strong> items available</>
            ) : (
              <>Showing <strong>0</strong> items available</>
            )}
          </span>

          <div className="status-bar-actions">
            <div className="per-page-select">
              <label htmlFor="items-per-page">Per page:</label>
              <select
                id="items-per-page"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
              </select>
            </div>

            {(selectedCategory !== 'All' || selectedCondition !== 'All' || searchQuery) && (
              <button className="btn-reset-filters" onClick={resetFilters}>
                <i className="bi bi-arrow-counterclockwise"></i> Reset Filters
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="gifts-loading">
            <div className="spinner"></div>
            <p>Loading available gift listings...</p>
          </div>
        ) : gifts.length > 0 ? (
          <>
            <div className="gifts-catalog-grid">
              {gifts.map((gift) => (
                <div key={gift.id || gift._id} className="gift-card" id={`gift-card-${gift.id}`}>
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
                    <Link to={`/app/product/${gift.id || gift._id}`} className="btn-view-details" id={`view-details-${gift.id}`}>
                      View Details & Request <i className="bi bi-chevron-right"></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <>
                <nav className="pagination-bar" aria-label="Gift catalog pagination">
                  <button
                    type="button"
                    className="page-btn"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    <i className="bi bi-chevron-left"></i> Prev
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`page-btn ${pageNum === pagination.page ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                      aria-current={pageNum === pagination.page ? 'page' : undefined}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="page-btn"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next <i className="bi bi-chevron-right"></i>
                  </button>
                </nav>
                <div className="pagination-summary">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total gifts)
                </div>
              </>
            )}
          </>
        ) : (
          <div className="gifts-empty-state">
            <div className="empty-icon"><i className="bi bi-inbox"></i></div>
            <h3>No gift items match your current filters</h3>
            <p>Try selecting a different category or clearing your search keywords.</p>
            <button
              className="btn-primary-custom"
              onClick={resetFilters}
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
