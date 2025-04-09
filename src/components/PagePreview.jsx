import React, { useRef, useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { FaSpinner, FaExpand, FaCompress, FaDesktop, FaRedo } from 'react-icons/fa';
import { motion } from 'framer-motion';

function PagePreview({ html, isLoading, progressMessage, onRegenerate }) {
  const sanitizedHtml = DOMPurify.sanitize(html);
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(600);

  // Ensure Tailwind CSS is included in the HTML
  const ensureTailwindCSS = (htmlContent) => {
    if (!htmlContent) return htmlContent;
    
    // Check if Tailwind is already included
    if (htmlContent.includes('tailwindcss') || htmlContent.includes('tailwind.css')) {
      return htmlContent;
    }
    
    // Add Tailwind CSS via CDN to the head
    const headEndIndex = htmlContent.toLowerCase().indexOf('</head>');
    if (headEndIndex !== -1) {
      const tailwindCDN = '<script src="https://cdn.tailwindcss.com"></script>';
      return htmlContent.slice(0, headEndIndex) + tailwindCDN + htmlContent.slice(headEndIndex);
    }
    
    // If no head tag, wrap the content with proper HTML structure including Tailwind
    if (!htmlContent.toLowerCase().includes('<html')) {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `;
    }
    
    return htmlContent;
  };

  const htmlWithTailwind = ensureTailwindCSS(sanitizedHtml);

  useEffect(() => {
    if (html && iframeRef.current) {
      // Wait for iframe to load then adjust height
      const iframe = iframeRef.current;
      iframe.onload = () => {
        try {
          const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
          const scrollHeight = iframeDocument.documentElement.scrollHeight;
          setIframeHeight(Math.max(600, scrollHeight));
        } catch (e) {
          console.error("Could not adjust iframe height:", e);
        }
      };
    }
  }, [html]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <FaDesktop className="mr-2 text-blue-600" /> Live Preview
        </h2>
        <div className="flex items-center">
          {html && (
            <button
              onClick={onRegenerate}
              className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors duration-200 mr-2"
              aria-label="Regenerate"
              title="Regenerate with more detail"
            >
              <FaRedo />
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors duration-200"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>
      
      <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-white">
        {isLoading && (
          <div className="loading-overlay">
            <div className="flex flex-col items-center">
              <FaSpinner className="animate-spin text-blue-600 text-3xl mb-2" />
              <p className="text-gray-700">{progressMessage || 'Generating your page...'}</p>
              <div className="w-48 h-1 bg-gray-200 rounded-full mt-3">
                <div className="h-1 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
        
        {html ? (
          <iframe
            ref={iframeRef}
            srcDoc={htmlWithTailwind}
            title="Page Preview"
            className="preview-frame"
            style={{ height: `${isFullscreen ? '90vh' : iframeHeight}px` }}
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="flex items-center justify-center h-[600px] bg-gray-50">
            <div className="text-center p-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No preview available</h3>
                <p className="mt-1 text-sm text-gray-500">Generate a page to see the preview here</p>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PagePreview;
