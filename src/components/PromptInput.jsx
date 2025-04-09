import React, { useState } from 'react';
import { FaSpinner, FaLightbulb, FaMagic } from 'react-icons/fa';
import { motion } from 'framer-motion';

function PromptInput({ prompt, onPromptChange, onSubmit, isLoading }) {
  const [charCount, setCharCount] = useState(0);
  
  const handlePromptChange = (e) => {
    const newPrompt = e.target.value;
    onPromptChange(newPrompt);
    setCharCount(newPrompt.length);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FaMagic className="mr-2 text-blue-600" /> 
        Create Your Page
      </h2>
      
      <div className="mb-2 flex justify-between items-center">
        <label htmlFor="prompt-input" className="text-sm font-medium text-gray-700">
          Describe your page in detail
        </label>
        <span className={`text-xs ${charCount > 500 ? 'text-green-600' : 'text-gray-500'}`}>
          {charCount} characters
        </span>
      </div>
      
      <textarea
        id="prompt-input"
        value={prompt}
        onChange={handlePromptChange}
        placeholder="Describe the page you want to create in detail. For example: 'Create a modern landing page for a coffee shop with a hero section featuring our signature drinks, a menu section organized by categories, and a contact form with a map showing our location. Use warm, earthy colors and smooth animations.'"
        className="textarea-field"
        disabled={isLoading}
      />
      
      <div className="mt-2 mb-4 bg-blue-50 p-3 rounded-lg text-sm text-gray-700 border border-blue-100">
        <div className="flex">
          <FaLightbulb className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
          <p>
            <strong>Pro tip:</strong> For better results, include details about:
            <ul className="mt-1 ml-4 list-disc">
              <li>Layout and sections you want (hero, features, pricing, etc.)</li>
              <li>Specific color scheme (blue/purple, warm earthy tones, etc.)</li>
              <li>Animation and interaction styles (fade-in, slide, hover effects)</li>
              <li>Typography preferences (modern, serif, playful, etc.)</li>
              <li>Actual content to include (product details, menu items, etc.)</li>
            </ul>
          </p>
        </div>
      </div>
      
      <motion.button
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full mt-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 flex items-center justify-center transition-colors duration-200"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            Generating Your Page...
          </>
        ) : (
          <>
            <FaMagic className="mr-2" />
            Generate Page
          </>
        )}
      </motion.button>
    </div>
  );
}

export default PromptInput;
