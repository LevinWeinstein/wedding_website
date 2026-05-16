import React, { useState, useEffect } from 'react';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import './App.css';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyvr8it1UNDgrvQmKOEoAsiBmTtg_LSlYgdUsshkpYqnQv26Wf3yAjxkeOekIxuUrMeGA/exec';

const App = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [timeLeft, setTimeLeft] = useState({ days: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  
  // RSVP State
  const [guests, setGuests] = useState([]);
  const [rsvpSearch, setRsvpSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState([]);
  const [groupResponses, setGroupResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoadingGuests, setIsLoadingGuests] = useState(true);

  useEffect(() => {
    // Fetch real guests from Google Sheets
    fetch(SCRIPT_URL)
      .then(res => res.json())
      .then(data => {
        setGuests(data);
        setIsLoadingGuests(false);
      })
      .catch(err => {
        console.error("Error fetching guests:", err);
        setIsLoadingGuests(false);
      });

    const weddingDate = new Date('July 24, 2027 16:30:00').getTime();
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = weddingDate - now;
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24))
      });
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 86400000); // Update daily
    return () => clearInterval(timer);
  }, []);

  const tabs = ['Home', 'Our Story', 'Photos', 'Travel', 'Registry', 'RSVP'];

  const galleryPhotos = Array.from({ length: 17 }, (_, i) => ({
    src: `${import.meta.env.BASE_URL}images/gallery/photo_${i + 3}.jpg`
  }));

  const filteredGuests = rsvpSearch.length >= 2 
    ? guests.filter(g => g.Name.toLowerCase().includes(rsvpSearch.toLowerCase()))
    : [];

  const handleSelectGuest = (guest) => {
    // Find everyone in the same GroupID
    const group = guests.filter(g => g.GroupID === guest.GroupID && guest.GroupID !== '');
    // If no GroupID, just the individual
    const finalGroup = group.length > 0 ? group : [guest];
    
    setSelectedGroup(finalGroup);
    
    const initialResponses = {};
    finalGroup.forEach(member => {
      initialResponses[member.Name] = { 
        name: member.Name,
        attending: member.Attending || '', 
        meal: member.Meal || '', 
        notes: member.Notes || '', 
        email: member.Email || '', 
        phone: member.Phone || '' 
      };
    });
    setGroupResponses(initialResponses);
  };

  const updateResponse = (name, field, value) => {
    setGroupResponses(prev => ({
      ...prev,
      [name]: { ...prev[name], [field]: value }
    }));
  };

  const handleSubmitRSVP = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = Object.values(groupResponses);

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Apps Script requires no-cors for simple POSTs
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      // Since no-cors doesn't return success body, we assume success if no error thrown
      setIsSubmitting(false);
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting RSVP:", err);
      setIsSubmitting(false);
      alert("Something went wrong. Please try again!");
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  return (
    <div className="app-container">
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={galleryPhotos}
      />

      {isMenuOpen && (
        <div className="mobile-menu-overlay">
          <button className="close-menu" onClick={toggleMenu}>&times;</button>
          <div className="mobile-menu-links">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`mobile-nav-link ${activeTab === tab ? 'active' : ''}`}
                onClick={() => handleTabClick(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-frame">
        <div className="content-wrapper">
          <header className="header">
            <div className="mobile-header-top">
              <button className="hamburger-btn" onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
              </button>
              <div className="mobile-title">
                {activeTab === 'Home' ? 'K&L' : activeTab}
              </div>
              <div className="spacer"></div>
            </div>
            
            <div className="bow-container">
              <img src={`${import.meta.env.BASE_URL}images/photo_2.jpg`} alt="Decorative Bow" className="header-bow" />
            </div>
            <h1 className="names-title">Katie & Levin</h1>
            <div className="header-details">
              <p className="desktop-details">JULY 24, 2027 • MILL VALLEY, CALIFORNIA</p>
              <p className="mobile-details">JULY 24, 2027 • MILL VALLEY, CALIFORNIA</p>
              <p>{timeLeft.days} DAYS TO GO!</p>
            </div>
          </header>

          <nav className="tab-nav desktop-nav">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="tab-content">
            {activeTab === 'Home' && (
              <div className="tab-pane home-pane">
                <div className="home-info-grid">
                  <div className="info-item">
                    <h2 className="handwritten">July 24,<br />2027</h2>
                  </div>
                  <div className="divider"></div>
                  <div className="info-item">
                    <h2 className="handwritten">Mill Valley<br />California</h2>
                  </div>
                </div>
                
                <div className="mobile-home-info">
                   <h2 className="handwritten">July 24, 2027</h2>
                   <div className="mobile-dot">•</div>
                   <h2 className="handwritten">Mill Valley, California</h2>
                </div>

                <button className="rsvp-hero-btn" onClick={() => setActiveTab('RSVP')}>RSVP</button>
                
                <div className="wedding-day-summary">
                  <h3>WEDDING DAY</h3>
                  <p className="summary-date">JULY 24, 2027</p>
                  <hr className="summary-hr" />
                  <div className="ceremony-details">
                    <h4>CEREMONY & RECEPTION</h4>
                    <p>The Outdoor Art Club</p>
                    <p>1 West Blithedale Avenue, Mill Valley, CA, 94941, United States</p>
                  </div>
                  <hr className="summary-hr" />
                </div>
              </div>
            )}

            {activeTab === 'Our Story' && (
              <div className="tab-pane story-pane">
                <h2 className="story-title">LEVIN LOVES KATIE & KATIE LOVES LEVIN -- SUPREME!</h2>
                <div className="story-image-container">
                  <img src={`${import.meta.env.BASE_URL}images/photo_20.jpg`} alt="Katie and Levin on a cliff" className="main-story-image" />
                </div>
                <div className="story-verbatim-text">
                  <p>Katie and Levin's romance blossomed while they were living in San Francisco. Their first date was at Java Beach Cafe. Katie was there early; Levin ordered a BLT for breakfast. Engrossed in conversation, they walked on Ocean Beach down to The Cliff House and back multiple times over. Parting ways with a "we should do this again sometime," and they did.</p>
                  <p>After one such occasion, Levin "accidentally" left his jacket at Katie's apartment. They made plans to hang out again, and lo and behold he continued to "forget" the jacket. It hung on the back of Katie's door for months. The jacket would probably be hanging there to this day if not for Katie matching into a residency program in Seattle.</p>
                  <p>Katie found out she'd be heading to the PNW while sitting on one of those very same dunes where the pair had their first date. Before Katie even had the chance to process the information, let alone tell anyone, Levin had already applied for and secured a new job position in Seattle so he could go with her.</p>
                  <p>Since moving North, Katie and Levin found a home for themselves surrounded by flowers and filled it to the gills with photos, a Uhaul truck worth of trinkets, silly songs, and a little one-eyed dog named Twiggy.</p>
                  <p>In March 2026, Levin, Katie, and Twiggy drove down the coast to celebrate Katie's birthday. Little did she know that Levin was planning to bring her back to where it all started. Expecting to find a friend's bonfire, Katie turned around to find a kneeling Levin instead. They christened the union with a cold plunge into the ocean -- one of their favorite customs -- and thus began their happily ever after.</p>
                  <p>Levin and Katie can't wait to celebrate with you in July 2027!</p>
                </div>
              </div>
            )}

            {activeTab === 'Photos' && (
              <div className="tab-pane photos-pane">
                <div className="gallery-grid">
                  {galleryPhotos.map((photo, idx) => (
                    <div 
                      key={idx} 
                      className="gallery-item" 
                      onClick={() => {
                        setIndex(idx);
                        setOpen(true);
                      }}
                    >
                      <img src={photo.src} alt={`Wedding ${idx + 1}`} loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {['Travel', 'Registry'].includes(activeTab) && (
              <div className="tab-pane">
                <h2 className="section-title">{activeTab}</h2>
                <p className="text-center">Details coming soon...</p>
              </div>
            )}
            
            {activeTab === 'RSVP' && (
              <div className="tab-pane rsvp-pane">
                {!submitted ? (
                  <div className="rsvp-container">
                    <h2 className="section-title">RSVP</h2>
                    {selectedGroup.length === 0 ? (
                      <div className="rsvp-search-box">
                        <p>To RSVP, please search for your name below:</p>
                        <input 
                          type="text" 
                          placeholder={isLoadingGuests ? "Loading guest list..." : "Enter your name..."}
                          className="rsvp-input"
                          value={rsvpSearch}
                          onChange={(e) => setRsvpSearch(e.target.value)}
                          disabled={isLoadingGuests}
                        />
                        {filteredGuests.length > 0 && (
                          <div className="guest-results">
                            {filteredGuests.map(guest => (
                              <button 
                                key={guest.Name} 
                                className="guest-choice"
                                onClick={() => handleSelectGuest(guest)}
                              >
                                {guest.Name}
                              </button>
                            ))}
                          </div>
                        )}
                        {rsvpSearch.length >= 2 && filteredGuests.length === 0 && !isLoadingGuests && (
                          <p className="no-results">We couldn't find your name. Please try another variation or contact us!</p>
                        )}
                      </div>
                    ) : (
                      <div className="rsvp-form">
                        <p className="selected-name">Welcome! Please RSVP for your party:</p>
                        <form onSubmit={handleSubmitRSVP}>
                          {selectedGroup.map(member => (
                            <div key={member.Name} className="group-member-card">
                              <h3 className="member-name">{member.Name}</h3>
                              
                              <div className="form-group">
                                <label>ATTENDING?</label>
                                <div className="radio-group-row">
                                  <label><input type="radio" name={`attending-${member.Name}`} value="yes" required onChange={(e) => updateResponse(member.Name, 'attending', e.target.value)} /> Yes</label>
                                  <label><input type="radio" name={`attending-${member.Name}`} value="no" onChange={(e) => updateResponse(member.Name, 'attending', e.target.value)} /> No</label>
                                </div>
                              </div>

                              {groupResponses[member.Name]?.attending === 'yes' && (
                                <>
                                  <div className="form-group">
                                    <label>MEAL PREFERENCE</label>
                                    <select className="rsvp-select" required onChange={(e) => updateResponse(member.Name, 'meal', e.target.value)}>
                                      <option value="">Select a meal...</option>
                                      <option value="beef">Grilled Filet Mignon</option>
                                      <option value="fish">Pan-Seared Sea Bass</option>
                                      <option value="veg">Wild Mushroom Risotto (V)</option>
                                    </select>
                                  </div>

                                  <div className="form-grid">
                                    <div className="form-group">
                                      <label>EMAIL</label>
                                      <input type="email" className="rsvp-input-small" placeholder="email@example.com" onChange={(e) => updateResponse(member.Name, 'email', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                      <label>PHONE</label>
                                      <input type="tel" className="rsvp-input-small" placeholder="555-555-5555" onChange={(e) => updateResponse(member.Name, 'phone', e.target.value)} />
                                    </div>
                                  </div>

                                  <div className="form-group">
                                    <label>ALLERGIES / NOTES</label>
                                    <textarea className="rsvp-textarea" placeholder="Any special requests?" onChange={(e) => updateResponse(member.Name, 'notes', e.target.value)}></textarea>
                                  </div>
                                </>
                              )}
                              <hr className="member-divider" />
                            </div>
                          ))}

                          <div className="rsvp-buttons">
                            <button type="button" className="rsvp-back-btn" onClick={() => setSelectedGroup([])}>Back</button>
                            <button type="submit" className="rsvp-submit-btn" disabled={isSubmitting}>
                              {isSubmitting ? 'Submitting...' : 'Submit All RSVPs'}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rsvp-success">
                    <h3>Thank you!</h3>
                    <p>Your party's RSVPs have been received.</p>
                    <button className="rsvp-back-btn" onClick={() => {
                      setSubmitted(false);
                      setSelectedGroup([]);
                      setRsvpSearch('');
                    }}>Done</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
