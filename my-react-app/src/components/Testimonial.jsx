import React, { useState, useEffect } from 'react';

const items = [
  { quote: '"TaskMaster helped our small team coordinate sprints and reduce meeting time — we ship faster now."', author: '— Priya K., Product Manager' },
  { quote: '"We moved from email chaos to clear tasks; collaboration is so much easier."', author: '— Ahmed S., CTO' },
  { quote: '"Students loved the group features — assignments and time tracking made projects smoother."', author: '— Dr. Gupta, Lecturer' }
];

export default function Testimonial() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % items.length), 4200);
    return () => clearInterval(t);
  }, []);

  const current = items[index];
  return (
    <section className="testimonial container">
      <div className="testimonial-card fade-in">
        <p className="quote">{current.quote}</p>
        <div className="author">{current.author}</div>
      </div>
    </section>
  );
}
