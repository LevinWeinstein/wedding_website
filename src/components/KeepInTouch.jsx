import React, { useState } from 'react';

const KeepInTouch = ({ guests, setGuests, SCRIPT_URL }) => {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Require a fairly specific search (7+ characters) so the full guest list
  // can't be discovered by typing a single letter.
  const filteredGuests = search.length >= 7
    ? guests.filter(g => g.Name.toLowerCase().includes(search.toLowerCase()))
    : [];

  const handleSelectGuest = (guest) => {
    setSelectedGuest(guest);
    setEmail(guest.Email || '');
    setPhone(guest.Phone || '');
    setAddress(guest.Address || '');
  };

  const resetForm = () => {
    setShowForm(false);
    setSubmitted(false);
    setSearch('');
    setSelectedGuest(null);
    setEmail('');
    setPhone('');
    setAddress('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGuest) return;
    // All three fields are optional, but require at least one to avoid
    // submitting an empty form.
    if (!email && !phone && !address) return;
    setIsSubmitting(true);

    // Match the existing guest by name and update their contact info — the
    // remaining fields are sent back unchanged so the backend doesn't wipe them.
    const payload = [{
      name: selectedGuest.Name,
      attending: selectedGuest.Attending || '',
      meal: selectedGuest.Meal || '',
      notes: selectedGuest.Notes || '',
      email: email,
      phone: phone,
      address: address
    }];

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      });
      // Keep the shared guest list in sync so a later action this session
      // (e.g. sending a regret) preserves the email we just saved.
      if (setGuests) {
        setGuests(prev => prev.map(g =>
          g.Name === selectedGuest.Name
            ? { ...g, Email: email, Phone: phone, Address: address }
            : g
        ));
      }
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(resetForm, 3000);
    } catch (err) {
      console.error("Error submitting email:", err);
      setIsSubmitting(false);
      alert("Something went wrong. Please try again!");
    }
  };

  return (
    <div className="regrets-banner keep-in-touch-banner">
      <h3>GIVE US YOUR CONTACT INFO SO WE CAN KEEP IN TOUCH!</h3>
      {!showForm ? (
        <button className="regrets-btn" onClick={() => setShowForm(true)}>SHARE YOUR CONTACT INFO</button>
      ) : (
        <div className="quick-no-form">
          {submitted ? (
            <p className="quick-no-success">Thank you! We'll be in touch.</p>
          ) : !selectedGuest ? (
            <>
              <p style={{fontSize: '0.8rem', marginBottom: '1rem'}}>Search your name to share your contact info:</p>
              <input
                type="text"
                className="quick-no-input"
                placeholder="Your name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
              <button className="nav-link" style={{marginTop: '1rem', fontSize: '0.7rem'}} onClick={() => setShowForm(false)}>Cancel</button>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{marginBottom: '0.5rem', fontWeight: '500'}}>{selectedGuest.Name}</p>
              <p style={{fontSize: '0.8rem', marginBottom: '1rem'}}>All fields optional — share whatever you'd like:</p>
              <input
                type="email"
                className="quick-no-input"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="tel"
                className="quick-no-input"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <textarea
                className="quick-no-input"
                placeholder="Mailing address"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <div style={{display: 'flex', gap: '10px'}}>
                <button type="button" className="rsvp-back-btn" style={{flex: 1}} onClick={() => setSelectedGuest(null)}>Back</button>
                <button type="submit" className="quick-no-submit" style={{flex: 2}} disabled={isSubmitting || (!email && !phone && !address)}>
                  {isSubmitting ? 'Sending...' : 'Share Info'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default KeepInTouch;
