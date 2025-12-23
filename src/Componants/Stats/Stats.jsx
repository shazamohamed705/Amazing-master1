import React, { useEffect, useRef, useState, useMemo } from 'react';
import './Stats.css';

export default function Stats() {
  const [projectData, setProjectData] = useState({});
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const [hasStarted, setHasStarted] = useState(false);
  const sectionRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  // Fetch project data with caching
  useEffect(() => {
    const fetchProjectData = async () => {
      const cacheKey = 'stats_project_data';
      const cacheExpiry = 5 * 60 * 1000; // 5 minutes

      // Check cache first
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < cacheExpiry) {
            setProjectData(data);
            return;
          }
        }
      } catch (error) {
        console.warn('Error reading cache:', error);
      }

      // Fetch from API with timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch('https://storage-te.com/backend/api/frontend/setting', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.project_data_settings) {
            // Parse the JSON string
            const parsedData = JSON.parse(data.project_data_settings);
            setProjectData(parsedData);

            // Cache the data
            try {
              localStorage.setItem(cacheKey, JSON.stringify({
                data: parsedData,
                timestamp: Date.now()
              }));
            } catch (error) {
              console.warn('Error caching data:', error);
            }
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('Request timed out, using cached/default data');
        } else {
          console.error('Error fetching project data:', error);
        }
      }
    };

    fetchProjectData();
  }, []);

  // Get stats from projectData or fallback to defaults
  const stats = useMemo(() => {
    return [
      {
        value: parseInt(projectData.verified_accounts) || 1000,
        label: 'وثقوا حساباتهم معنا بنجاح'
      },
      {
        value: parseInt(projectData.trusted_accounts) || 440,
        label: 'يثقون بخدماتنا للتوثيق والنمو'
      },
      {
        value: parseInt(projectData.strong_engagement) || 670,
        label: 'حصلوا على تفاعل وحضور قوي'
      },
      {
        value: parseInt(projectData.trusted_services) || 500,
        label: 'حساب موثق عبر Storage'
      }
    ];
  }, [projectData]);

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