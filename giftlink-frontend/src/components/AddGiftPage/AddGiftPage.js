import React, { useState, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import './AddGiftPage.css';

const PRESET_IMAGES = [
  { label: 'Sofa / Couch', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80', cat: 'Living' },
  { label: 'Dining Table', url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80', cat: 'Living' },
  { label: 'Laptop / PC', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80', cat: 'Electronics' },
  { label: 'Smart TV', url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80', cat: 'Electronics' },
  { label: 'Espresso Maker', url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80', cat: 'Kitchen' },
  { label: 'Acoustic Guitar', url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80', cat: 'Music' },
  { label: 'Books Stack', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80', cat: 'Books' },
  { label: 'Bed Frame', url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80', cat: 'Bedroom' }
];

function AddGiftPage() {
  const { isLoggedIn, userName } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Living');
  const [condition, setCondition] = useState('Good');
  const [ageYears, setAgeYears] = useState(1);
  const [zipcode, setZipcode] = useState('10001');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // File Upload State
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handlePresetSelect = (preset) => {
    setImageUrl(preset.url);
    setUploadSuccess('');
    setUploadError('');
    if (preset.cat) setCategory(preset.cat);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploadError('');
    setUploadSuccess('');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Only JPG, PNG, WEBP, or GIF images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File is too large. Maximum allowed size is 5MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Image upload failed.');
      }

      const finalUrl = `${API_BASE_URL}${data.imageUrl}`;
      setImageUrl(finalUrl);
      setUploadSuccess(`Uploaded: ${file.name}`);
    } catch (err) {
      setUploadError(err.message || 'Could not upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide an item title.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a brief description.');
      return;
    }

    setLoading(true);

    const newGiftPayload = {
      id: Date.now().toString(),
      name: name.trim(),
      category,
      condition,
      age_years: parseFloat(ageYears) || 1,
      zipcode: zipcode.trim() || '10001',
      image: imageUrl.trim() || PRESET_IMAGES[0].url,
      description: description.trim(),
      posted_date: Math.floor(Date.now() / 1000),
      donorName: userName || 'Guest Donor',
      comments: []
    };

    try {
      const token = sessionStorage.getItem('auth-token');
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/gifts`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newGiftPayload)
      });

      if (!response.ok) {
        throw new Error('Failed to create gift listing.');
      }

      const data = await response.json();
      const giftId = data.gift?.id || newGiftPayload.id;
      navigate(`/app/product/${giftId}`);
    } catch (err) {
      console.error(err);
      setError('Error creating listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-gift-wrapper">
      <div className="container">
        <div className="add-gift-header">
          <Link to="/app" className="back-link">
            <i className="bi bi-arrow-left"></i> Back to listings
          </Link>
          <h1>Donate & List a Pre-Loved Item</h1>
          <p>Give your unwanted household items a second life by offering them to your local community for free.</p>
        </div>

        {!isLoggedIn && (
          <div className="auth-alert-banner">
            <i className="bi bi-info-circle-fill"></i>
            <div>
              <span>You are listing as a guest. </span>
              <Link to="/app/login" className="login-link-inline">Log in</Link> or <Link to="/app/register" className="login-link-inline">Register</Link> to manage all your listings under your account profile.
            </div>
          </div>
        )}

        {error && (
          <div className="alert-error-banner">
            <i className="bi bi-exclamation-triangle-fill"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-gift-form-card">
          <div className="form-grid">
            {/* Left Section: Details */}
            <div className="form-column">
              <div className="form-group-custom">
                <label htmlFor="gift-name">Item Name / Title <span className="req">*</span></label>
                <input
                  type="text"
                  id="gift-name"
                  placeholder="e.g. Solid Wood Coffee Table, Samsung Microwave"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-custom">
                <div className="form-group-custom">
                  <label htmlFor="gift-category">Category <span className="req">*</span></label>
                  <select
                    id="gift-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
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

                <div className="form-group-custom">
                  <label htmlFor="gift-condition">Condition <span className="req">*</span></label>
                  <select
                    id="gift-condition"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                  >
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>

              <div className="form-row-custom">
                <div className="form-group-custom">
                  <label htmlFor="gift-age">Item Age (Years)</label>
                  <input
                    type="number"
                    id="gift-age"
                    min="0"
                    max="50"
                    step="0.5"
                    value={ageYears}
                    onChange={(e) => setAgeYears(e.target.value)}
                  />
                </div>

                <div className="form-group-custom">
                  <label htmlFor="gift-zipcode">Pickup Zip Code</label>
                  <input
                    type="text"
                    id="gift-zipcode"
                    placeholder="e.g. 10001"
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group-custom">
                <label htmlFor="gift-description">Description & Dimensions <span className="req">*</span></label>
                <textarea
                  id="gift-description"
                  rows={4}
                  placeholder="Describe condition, pickup instructions, reasons for giving away..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Right Section: Image Upload & Preview */}
            <div className="form-column">
              <div className="form-group-custom" style={{ marginBottom: '0.5rem' }}>
                <label>Upload Item Photo from Device</label>
                <div
                  className={`upload-dropzone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="gift-image-file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                  />
                  <i className={`bi ${uploading ? 'bi-cloud-arrow-up-fill' : 'bi-cloud-upload'} upload-dropzone-icon`}></i>
                  <div className="upload-dropzone-title">
                    {uploading ? 'Uploading photo...' : 'Click to upload or drag & drop photo'}
                  </div>
                  <div className="upload-dropzone-sub">
                    Supports JPG, PNG, WEBP, GIF (Max 5MB)
                  </div>

                  {uploadSuccess && (
                    <div className="upload-status-badge upload-status-success">
                      <i className="bi bi-check-circle-fill"></i> {uploadSuccess}
                    </div>
                  )}
                  {uploadError && (
                    <div className="upload-status-badge upload-status-error">
                      <i className="bi bi-exclamation-triangle-fill"></i> {uploadError}
                    </div>
                  )}
                </div>
              </div>

              <div className="upload-or-divider">or paste photo URL</div>

              <div className="form-group-custom">
                <label htmlFor="gift-image">Item Photo URL</label>
                <input
                  type="text"
                  id="gift-image"
                  placeholder="https://images.unsplash.com/... or /uploads/..."
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setUploadSuccess('');
                  }}
                />
              </div>

              <div className="presets-section">
                <label className="sub-label">Or Pick a Quick Sample Photo:</label>
                <div className="presets-list">
                  {PRESET_IMAGES.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`preset-pill ${imageUrl === preset.url ? 'active' : ''}`}
                      onClick={() => handlePresetSelect(preset)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="image-preview-box">
                <label className="sub-label">Live Photo Preview:</label>
                <div className="preview-frame">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Item preview"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  ) : (
                    <div className="no-preview">
                      <i className="bi bi-image"></i>
                      <span>No image provided</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions-footer">
            <Link to="/app" className="btn-secondary-custom">
              Cancel
            </Link>
            <button type="submit" className="btn-primary-custom btn-post" disabled={loading}>
              <i className="bi bi-gift-fill"></i>
              {loading ? 'Publishing Item...' : 'Publish Gift Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddGiftPage;
