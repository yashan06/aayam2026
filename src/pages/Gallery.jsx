import React, { useState, useEffect } from 'react';

export default function Gallery() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightbox, setLightbox] = useState({ isOpen: false, imgSrc: '', title: '', category: '' });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gallery?_t=${Date.now()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.images)) {
        setGalleryItems(data.images);
      }
    } catch (err) {
      console.error('Error fetching gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (src, title, category) => {
    setLightbox({ isOpen: true, imgSrc: src, title, category });
  };

  const closeLightbox = () => {
    setLightbox({ ...lightbox, isOpen: false });
  };

  // Get unique categories for pill filter
  const categories = ['All', ...Array.from(new Set(galleryItems.map(item => item.category).filter(Boolean)))];

  const filteredItems = activeCategory === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <>
      {/* HERO */}
      <section className="page-hero">
        <div className="page-hero-bg"></div>
        <div className="page-hero-inner">
          <div className="page-hero-content animate-in">
            <div className="section-tag">OUR GALLERY</div>
            <h1 className="page-title">Capturing<br /><span className="gold">Memories.</span></h1>
            <p className="page-desc">Visual highlights and memorable moments from AAYAM UIT events and campus life.</p>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section style={{ padding: '60px 40px 80px', background: 'var(--cream-dark)', minHeight: '60vh' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          {/* CATEGORY FILTER HEADER - SHOW ALL ONLY */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
            <span style={{
              padding: '8px 24px',
              fontSize: '13px',
              fontWeight: 800,
              borderRadius: '30px',
              background: 'var(--navy)',
              color: 'var(--gold-pale)',
              boxShadow: '0 4px 14px rgba(15,27,60,0.2)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              🖼️ All Gallery Moments
            </span>
          </div>

          {/* GALLERY GRID */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--navy)', fontWeight: 600 }}>Loading gallery...</div>
          ) : galleryItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', color: '#64748b' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🖼️</div>
              <h3 style={{ color: 'var(--navy)', fontSize: '20px', marginBottom: '8px' }}>No Images Found</h3>
              <p style={{ fontSize: '14px', margin: 0 }}>There are currently no gallery photos published.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '28px' }}>
              {galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="g-item hover-card"
                  onClick={() => openLightbox(item.image, item.title, item.category)}
                  style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}
                >
                  <div style={{ height: '230px', overflow: 'hidden', position: 'relative', background: 'var(--navy)' }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(15,27,60,0.75) 100%)', opacity: 0, transition: 'opacity 0.3s ease' }} className="img-overlay" />
                  </div>
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--navy)' }}>{item.title}</h3>
                    <span style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: 600 }}>Zoom ↗</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      {lightbox.isOpen && (
        <div
          onClick={closeLightbox}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,27,60,0.92)', backdropFilter: 'blur(12px)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <button onClick={closeLightbox} style={{ position: 'absolute', top: '24px', right: '32px', color: '#fff', fontSize: '36px', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
          <img src={lightbox.imgSrc} alt={lightbox.title} style={{ maxWidth: '90%', maxHeight: '75vh', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', border: '2px solid rgba(200, 146, 42, 0.4)' }} />
          <div style={{ color: 'var(--gold-pale)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '16px' }}>{lightbox.category}</div>
          <div style={{ color: '#fff', fontFamily: "'Playfair Display',serif", fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>{lightbox.title}</div>
        </div>
      )}
    </>
  );
}
