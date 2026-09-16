import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './SearchPage.css';

function SearchPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('name') || '');
  const [condition, setCondition] = useState('all');
  const [ageYears, setAgeYears] = useState(10);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    executeSearch();
  }, [category, condition, ageYears]);

  const executeSearch = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (category && category !== 'all') queryParams.append('category', category);
      if (searchTerm.trim()) queryParams.append('name', searchTerm.trim());
      if (condition && condition !== 'all') queryParams.append('condition', condition);
      if (ageYears) queryParams.append('age_years', ageYears);

      const res = await fetch(`/api/search?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        throw new Error('Search failed');
      }
    } catch (err) {
      // Fallback search filter
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    executeSearch();
  };

  return (
    <div className="search-page-wrapper">
      <div className="container">
        <div className="search-header">
          <h1>Search & Filter Listings</h1>
          <p>Find exact household items by category, condition, and keyword.</p>
        </div>

        {/* Filters Box */}
        <div className="filter-card">
          <form onSubmit={handleFormSubmit} className="filter-form">
            <div className="form-group-filter">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="Living">Living</option>
                <option value="Bedroom">Bedroom</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Electronics">Electronics</option>
                <option value="Books">Books</option>
                <option value="Toys">Toys</option>
                <option value="Music">Music</option>
                <option value="Sports">Sports</option>
                <option value="Home Decor">Home Decor</option>
              </select>
            </div>

            <div className="form-group-filter">
              <label>Condition</label>
              <select value={condition} onChange={(e) => setCondition(e.target.value)}>
                <option value="all">Any Condition</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            <div className="form-group-filter">
              <label>Max Age: {ageYears} {ageYears === 1 ? 'year' : 'years'}</label>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={ageYears}
                onChange={(e) => setAgeYears(e.target.value)}
              />
            </div>

            <div className="form-group-filter flex-grow">
              <label>Search Keyword</label>
              <div className="search-input-wrap">
                <input
                  type="text"
                  placeholder="e.g. Table, Sofa, Guitar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="btn-filter-search">
                  <i className="bi bi-search"></i> Search
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Search Results */}
        <div className="results-container">
          <h2>Matching Results ({results.length})</h2>

          {loading ? (
            <div className="loading-state">Searching matching items...</div>
          ) : results.length > 0 ? (
            <div className="gifts-grid">
              {results.map((gift) => (
                <div key={gift.id} className="gift-card">
                  <div className="card-image-wrap">
                    <img src={gift.image} alt={gift.name} />
                    <span className="card-category-badge">{gift.category}</span>
                    <span className="card-condition-badge">{gift.condition}</span>
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{gift.name}</h3>
                    <p className="card-description">{gift.description}</p>
                  </div>
                  <div className="card-footer">
                    <Link to={`/app/product/${gift.id}`} className="btn-view-details">
                      View Details <i className="bi bi-chevron-right"></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results-card">
              <i className="bi bi-search"></i>
              <h3>No items matched your filters</h3>
              <p>Try broadening your search or adjusting the category and condition filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
