import React, { useEffect } from "react";
import './CustomCursor.css';

const CustomCursor = () => {
  useEffect(() => {
    const cursor = document.querySelector(".custom-cursor");

    if (!cursor) return;

    const moveCursor = (e) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };

    // Hide default cursor
    document.body.style.cursor = 'none';

    document.addEventListener("mousemove", moveCursor);
    
    return () => {
      document.removeEventListener("mousemove", moveCursor);
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <div className="custom-cursor"></div>
  );
};

export default CustomCursor;









