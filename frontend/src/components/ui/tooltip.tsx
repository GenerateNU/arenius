import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  textContent: string | { title: string; body: string };
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ textContent, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Determine if we're receiving a string or an object with title/body
  const hasStructuredContent = typeof textContent === 'object' && textContent.title && textContent.body;
  
  // Update position when visibility changes or on resize
  useEffect(() => {
    if (!isVisible || !triggerRef.current) return;
    
    const updatePosition = () => {
      if (!triggerRef.current || !tooltipRef.current) return;
      
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Start with default positioning
      let left = triggerRect.left + window.scrollX;
      
      // Check if tooltip would overflow right edge of viewport
      if (left + tooltipRect.width > viewportWidth) {
        // Adjust left position to align tooltip right edge with viewport edge
        // with a small padding
        left = viewportWidth - tooltipRect.width - 10;
      }
      
      // Check if tooltip would overflow left edge of viewport
      if (left < 0) {
        left = 10; // Add a small padding from left edge
      }
      
      setPosition({
        top: triggerRect.top + window.scrollY,
        left: left
      });
    };
    
    // Initial position update
    updatePosition();
    
    // Update position on window resize
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [isVisible]);
  
  return (
    <div className="inline-flex items-center">
      <div 
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center"
      >
        {children}
      </div>
      
      {isVisible && typeof window !== 'undefined' && createPortal(
        <div 
          className="z-50 fixed" 
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            pointerEvents: 'none'
          }}
        >
          <div 
            ref={tooltipRef}
            className="relative transform -translate-y-full mb-2"
          >
            <div className="px-4 py-3 text-sm text-gray-700 bg-white rounded-md shadow-md -translate-x-5 left-0 w-64 md:w-80 border border-gray-100">
              {hasStructuredContent ? (
                <React.Fragment>
                  <span className="font-bold">{(textContent as { title: string; body: string }).title}: </span>
                  {(textContent as { title: string; body: string }).body}
                </React.Fragment>
              ) : (
                <React.Fragment>{textContent as string}</React.Fragment>
              )}
              <div className="absolute w-2 h-2 bg-white border-r border-b border-gray-100 transform rotate-45 left-6 -bottom-1"></div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};