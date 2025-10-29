import React, { useState } from 'react';

function Card({ title, price, bullets, primary, onChoose }) {
  return (
    <div className="col-md-4">
      <div className={`card pricing-card ${primary ? 'accent' : ''}`}>
        {primary && <div className="ribbon">Popular</div>}
        <div className="card-body">
          <h5 className="card-title">{title}</h5>
          <h6 className="card-price">{price}</h6>
          <ul>
            {bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
          <div style={{ marginTop: 12 }}>
            <button onClick={onChoose} className={`btn ${primary ? 'btn-primary' : 'btn-outline-secondary'}`}>Choose</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Pricing() {
  const [showContact, setShowContact] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [sent, setSent] = useState(false);

  const handleChooseTeam = () => alert('Team plan chosen — nice!');
  const handleChooseEnterprise = () => setShowContact(true);

  const handleSendContact = (e) => {
    e.preventDefault();
    // fake submit
    setSent(true);
    setTimeout(() => {
      setShowContact(false);
      setContactEmail('');
      setContactMsg('');
      setSent(false);
      alert('Thanks — our sales team will contact you soon!');
    }, 900);
  };

  return (
    <section className="pricing container">
      <h2 className="text-center mb-4">Pricing</h2>
      <div className="row">
        <Card title="Free" price="Free" bullets={["Up to 5 team members", "Basic task management", "Community support"]} onChoose={() => alert('Free plan selected')} />
        <Card title="Team" price="$8 / user / mo" bullets={["Unlimited members", "Time tracking & dashboards", "Email support"]} primary onChoose={handleChooseTeam} />
        <Card title="Enterprise" price="Contact us" bullets={["SLA & onboarding", "Custom integrations", "Priority support"]} onChoose={handleChooseEnterprise} />
      </div>

      {showContact && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h4>Contact Sales</h4>
            <form onSubmit={handleSendContact}>
              <div className="form-group">
                <label>Your email</label>
                <input required value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea required value={contactMsg} onChange={e => setContactMsg(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowContact(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit">{sent ? 'Sending...' : 'Send'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
