import React, { useState } from 'react';

const RsvpForm = ({ guests, isLoadingGuests, SCRIPT_URL }) => {
  const [rsvpSearch, setRsvpSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState([]);
  const [groupResponses, setGroupResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const filteredGuests = rsvpSearch.length >= 2
    ? guests.filter(g => g.Name.toLowerCase().includes(rsvpSearch.toLowerCase()))
    : [];

  const handleSelectGuest = (guest) => {
    const group = guests.filter(g => g.GroupID === guest.GroupID && guest.GroupID !== '');
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
        mode: 'no-cors',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setIsSubmitting(false);
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting RSVP:", err);
      setIsSubmitting(false);
      alert("Something went wrong. Please try again!");
    }
  };

  return (
    <div className="rsvp-container">
      <h2 className="section-title">RSVP</h2>
      {!submitted ? (
        <>
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
                        <label>
                          <input 
                            type="radio" 
                            name={`attending-${member.Name}`} 
                            value="yes" 
                            required 
                            onChange={(e) => updateResponse(member.Name, 'attending', e.target.value)} 
                          /> Yes
                        </label>
                        <label>
                          <input 
                            type="radio" 
                            name={`attending-${member.Name}`} 
                            value="no" 
                            onChange={(e) => updateResponse(member.Name, 'attending', e.target.value)} 
                          /> No
                        </label>
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
        </>
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
  );
};

export default RsvpForm;
