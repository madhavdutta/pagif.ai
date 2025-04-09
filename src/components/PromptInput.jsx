import React, { useState } from 'react';
import { FaSpinner, FaLightbulb, FaMagic, FaPalette } from 'react-icons/fa';
import { motion } from 'framer-motion';

function PromptInput({ prompt, onPromptChange, onSubmit, isLoading }) {
  const [charCount, setCharCount] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('blue-purple');
  
  const colorThemes = [
    { id: 'blue-purple', name: 'Blue to Purple', colors: ['#3b82f6', '#8b5cf6'], gradient: 'bg-gradient-to-r from-blue-500 to-purple-500' },
    { id: 'green-blue', name: 'Green to Blue', colors: ['#10b981', '#3b82f6'], gradient: 'bg-gradient-to-r from-green-500 to-blue-500' },
    { id: 'red-orange', name: 'Red to Orange', colors: ['#ef4444', '#f59e0b'], gradient: 'bg-gradient-to-r from-red-500 to-amber-500' },
    { id: 'pink-purple', name: 'Pink to Purple', colors: ['#ec4899', '#8b5cf6'], gradient: 'bg-gradient-to-r from-pink-500 to-purple-500' },
    { id: 'teal-cyan', name: 'Teal to Cyan', colors: ['#14b8a6', '#06b6d4'], gradient: 'bg-gradient-to-r from-teal-500 to-cyan-500' },
    { id: 'amber-red', name: 'Amber to Red', colors: ['#f59e0b', '#ef4444'], gradient: 'bg-gradient-to-r from-amber-500 to-red-500' },
    { id: 'indigo-blue', name: 'Indigo to Blue', colors: ['#6366f1', '#3b82f6'], gradient: 'bg-gradient-to-r from-indigo-500 to-blue-500' },
    { id: 'purple-pink', name: 'Purple to Pink', colors: ['#8b5cf6', '#ec4899'], gradient: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { id: 'gray-slate', name: 'Elegant Gray', colors: ['#4b5563', '#64748b'], gradient: 'bg-gradient-to-r from-gray-600 to-slate-500' },
    { id: 'emerald-teal', name: 'Emerald to Teal', colors: ['#10b981', '#14b8a6'], gradient: 'bg-gradient-to-r from-emerald-500 to-teal-500' },
  ];
  
  const handlePromptChange = (e) => {
    const newPrompt = e.target.value;
    onPromptChange(newPrompt);
    setCharCount(newPrompt.length);
  };
  
  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId);
  };
  
  const handleSubmitWithTheme = () => {
    const selectedThemeObj = colorThemes.find(theme => theme.id === selectedTheme);
    const themeColors = selectedThemeObj.colors.join(' and ');
    const themeName = selectedThemeObj.name;
    
    // Append color theme information to the prompt
    const promptWithTheme = `${prompt} Use a color scheme of ${themeName} (${themeColors}) as the main colors for the design.`;
    
    // Call the original onSubmit with the enhanced prompt
    onSubmit(promptWithTheme);
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
        placeholder="Describe the page you want to create in detail. For example: 'Create a modern landing page for a coffee shop with a hero section featuring our signature drinks, a menu section organized by categories, and a contact form with a map showing our location.'"
        className="textarea-field"
        disabled={isLoading}
      />
      
      <div className="mt-4 mb-4">
        <button
          type="button"
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-2 font-medium"
        >
          <FaPalette className="mr-2" /> {showColorPicker ? 'Hide Color Themes' : 'Choose Color Theme'}
        </button>
        
        {showColorPicker && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Select a color theme:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {colorThemes.map(theme => (
                <div
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme.id)}
                  className={`cursor-pointer rounded-md overflow-hidden border-2 transition-all ${selectedTheme === theme.id ? 'border-blue-500 shadow-md scale-105' : 'border-transparent hover:border-gray-300'}`}
                >
                  <div className={`h-12 w-full ${theme.gradient}`}></div>
                  <div className="text-xs p-1 text-center truncate">{theme.name}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Selected theme: <span className="font-medium">{colorThemes.find(t => t.id === selectedTheme)?.name}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-2 mb-4 bg-blue-50 p-3 rounded-lg text-sm text-gray-700 border border-blue-100">
        <div className="flex">
          <FaLightbulb className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
          <p>
            <strong>Pro tip:</strong> For better results, include details about:
            <ul className="mt-1 ml-4 list-disc">
              <li>Layout and sections you want (hero, features, pricing, etc.)</li>
              <li>Animation and interaction styles (fade-in, slide, hover effects)</li>
              <li>Typography preferences (modern, serif, playful, etc.)</li>
              <li>Actual content to include (product details, menu items, etc.)</li>
            </ul>
          </p>
        </div>
      </div>
      
      <motion.button
        onClick={handleSubmitWithTheme}
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
