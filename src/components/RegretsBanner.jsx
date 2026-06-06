import React, { useState } from 'react';

const RegretsBanner = ({ guests, SCRIPT_URL }) => {
  const [showRegretsForm, setShowRegretsForm] = useState(false);
  const [regretsSearch, setRegretsSearch] = useState('');
  const [selectedRegretGuest, setSelectedRegretGuest] = useState(null);
  const [declineList, setDeclineList] = useState([]);
  const [regretsSubmitted, setRegretsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Require a fairly specific search (7+ characters) so the full guest list
  // can't be discovered by typing a single letter.
  const filteredRegrets = regretsSearch.length >= 7
    ? guests.filter(g => g.Name.toLowerCase().includes(regretsSearch.toLowerCase()))
    : [];

  const handleSelectRegretGuest = (guest) => {
    const group = guests.filter(g => g.GroupID === guest.GroupID && guest.GroupID !== '');
    const finalGroup = group.length > 0 ? group : [guest];
    setSelectedRegretGuest(guest);
    // Default to only the person who searched
    setDeclineList([guest.Name]);
  };

  const toggleDeclineMember = (name) => {
    setDeclineList(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleQuickNo = async (e) => {
    e.preventDefault();
    if (declineList.length === 0) return;
    setIsSubmitting(true);
    
    const payload = declineList.map(name => {
      // The backend overwrites every column on the matched row, so send back
      // the guest's existing email/phone to avoid wiping a "keep in touch"
      // email someone may have shared earlier.
      const guest = guests.find(g => g.Name === name) || {};
      return {
        name: name,
        attending: 'no',
        meal: 'N/A',
        notes: 'Quick Decline from Banner',
        email: guest.Email || '',
        phone: guest.Phone || ''
      };
    });

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      });
      setIsSubmitting(false);
      setRegretsSubmitted(true);
      setTimeout(() => {
        setShowRegretsForm(false);
        setRegretsSubmitted(false);
        setRegretsSearch('');
        setSelectedRegretGuest(null);
        setDeclineList([]);
      }, 3000);
    } catch (err) {
      console.error("Error submitting Regret:", err);
      setIsSubmitting(false);
      alert("Something went wrong. Please try again!");
    }
  };

  return (
    <div className="regrets-banner hero-regrets-banner">
      <h3>CAN'T ATTEND? LET US KNOW HERE</h3>
      {!showRegretsForm ? (
        <button className="regrets-btn" onClick={() => setShowRegretsForm(true)}>LET US KNOW</button>
      ) : (
        <div className="quick-no-form">
          {regretsSubmitted ? (
            <p className="quick-no-success">Thank you for letting us know. We'll miss you!</p>
          ) : (
            <>
              {!selectedRegretGuest ? (
                <>
                  <p style={{fontSize: '0.8rem', marginBottom: '1rem'}}>Search your name to quickly decline:</p>
                  <input 
                    type="text" 
                    className="quick-no-input" 
                    placeholder="Your name..."
                    value={regretsSearch}
                    onChange={(e) => setRegretsSearch(e.target.value)}
                  />
                  {filteredRegrets.length > 0 && (
                    <div className="guest-results">
                      {filteredRegrets.map(guest => (
                        <button 
                          key={guest.Name} 
                          className="guest-choice"
                          onClick={() => handleSelectRegretGuest(guest)}
                        >
                          {guest.Name}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <form onSubmit={handleQuickNo}>
                  <p style={{marginBottom: '0.5rem', fontWeight: '500'}}>Thank you for your early reply!</p>
                  <p style={{marginBottom: '1.5rem', fontSize: '0.9rem'}}>We're sorry we won't see you!</p>
                  
                  <p style={{marginBottom: '1rem', fontStyle: 'italic', fontSize: '0.9rem'}}>Who from your party can <span style={{textDecoration: 'underline'}}>definitely</span> not attend?</p>
                  
                  <div className="decline-checklist" style={{textAlign: 'left', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    {guests.filter(g => g.GroupID === selectedRegretGuest.GroupID && selectedRegretGuest.GroupID !== '').map(member => (
                      <label key={member.Name} style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', cursor: 'pointer'}}>
                        <input 
                          type="checkbox" 
                          checked={declineList.includes(member.Name)}
                          onChange={() => toggleDeclineMember(member.Name)}
                          style={{width: '20px', height: '20px'}}
                        />
                        {member.Name}
                      </label>
                    ))}
                    {(!selectedRegretGuest.GroupID || selectedRegretGuest.GroupID === '') && (
                       <label style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem'}}>
                         <input type="checkbox" checked={true} readOnly style={{width: '20px', height: '20px'}} />
                         {selectedRegretGuest.Name}
                       </label>
                    )}
                  </div>

                  <div style={{display: 'flex', gap: '10px'}}>
                    <button type="button" className="rsvp-back-btn" style={{flex: 1}} onClick={() => setSelectedRegretGuest(null)}>Back</button>
                    <button type="submit" className="quick-no-submit" style={{flex: 2}} disabled={isSubmitting || declineList.length === 0}>
                      {isSubmitting ? 'Sending...' : `Decline for ${declineList.length} Guest${declineList.length !== 1 ? 's' : ''}`}
                    </button>
                  </div>
                </form>
              )}
              {!selectedRegretGuest && (
                <button className="nav-link" style={{marginTop: '1rem', fontSize: '0.7rem'}} onClick={() => setShowRegretsForm(false)}>Cancel</button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RegretsBanner;
