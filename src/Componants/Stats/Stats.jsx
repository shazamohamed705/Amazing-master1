import React, { useEffect, useRef, useState } from 'react';
import './Stats.css';

export default function Stats() {
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const [hasStarted, setHasStarted] = useState(false);
  const sectionRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  
  const stats = [
    { value: 1000, label: 'وثقوا حساباتهم معنا بنجاح' },
    { value: 440, label: 'يثقون بخدماتنا للتوثيق والنمو' },
    { value: 670, label: 'حصلوا على تفاعل وحضور قوي' },
    { value: 500, label: 'حساب موثق عبر Storage' }
  ];

  // Watch when the section enters/leaves the viewport so we can start the counter on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Section visible → start animation
            setHasStarted(true);
          } else {
            // Section left viewport → reset for next scroll
            setHasStarted(false);
            startTimeRef.current = null;
            setCounts([0, 0, 0, 0]);
          }
        });
      },
      { root: null, threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  // Animate numbers every time section becomes visible (after scroll)
  useEffect(() => {
    if (!hasStarted) return;

    // Longer duration so the counter stays counting for more time
    const duration = 9000; // ms
    // Linear progress so numbers move step-by-step in a clear way
    const easeLinear = (t) => t;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeLinear(progress);
      setCounts(stats.map((stat) => Math.floor(stat.value * eased)));
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCounts(stats.map((s) => s.value));
      }
    };
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [hasStarted]);

  return (
    <section className={`stats ${hasStarted ? 'stats--visible' : ''}`} dir="rtl" ref={sectionRef}>
      <div className="stats__container">
        <h2 className="stats__title">انضم لآلاف التجار الآن</h2>
        <div className="stats__divider" />
        <div className="stats__grid">
          {stats.map((stat, index) => (
            <div key={index} className="stats__item">
              <div className="stats__num">
                <span className={hasStarted ? 'stats__num--animating' : 'stats__num--stable'}>
                  {counts[index].toLocaleString('en-US')}
                </span>+
              </div>
              <div className="stats__label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}