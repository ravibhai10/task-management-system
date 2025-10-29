import React from 'react';

export default function Logos() {
  const logos = ['Acme', 'Globex', 'Initech', 'Umbrella'];
  return (
    <section className="logos container">
      <div className="logos-inner d-flex justify-content-between align-items-center">
        {logos.map((l) => (
          <div key={l} className="logo-pill">{l}</div>
        ))}
      </div>
    </section>
  );
}
