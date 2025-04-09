import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaKey, FaInfoCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

function ApiKeyManager({ apiKey, onApiKeyChange }) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [inputKey, setInputKey] = useState(apiKey);
  const [isValidFormat, setIsValidFormat] = useState(true);

  useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey]);

  const validateKeyFormat = (key) => {
    // Basic validation for OpenAI API key format (starts with 'sk-' and has sufficient length)
    return key === '' || (key.startsWith('sk-') && key.length > 20);
  };

  const handleInputChange = (e) => {
    const newKey = e.target.value;
    setInputKey(newKey);
    setIsValidFormat(validateKeyFormat(newKey));
  };

  const handleSaveKey = () => {
    if (isValidFormat) {
      onApiKeyChange(inputKey);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-4">
        <FaKey className="text-white mr-2" />
        <h2 className="text-xl font-semibold text-white">OpenAI API Key</h2>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-inner">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="relative flex-grow">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={inputKey}
              onChange={handleInputChange}
              placeholder="Enter your OpenAI API key (starts with sk-)"
              className={`w-full p-3 border ${!isValidFormat ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
            >
              {showApiKey ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button
            onClick={handleSaveKey}
            disabled={!isValidFormat}
            className="mt-3 md:mt-0 md:ml-3 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Save Key
          </button>
        </div>
        
        {!isValidFormat && (
          <p className="text-red-500 mt-2 flex items-center">
            <FaInfoCircle className="mr-1" /> Invalid API key format. OpenAI API keys start with 'sk-'
          </p>
        )}
        
        <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
          <div className="flex items-start">
            <FaInfoCircle className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-700">
                Your API key is stored locally in your browser and never sent to our servers. 
                You can get an OpenAI API key from the <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI dashboard</a>.
              </p>
              <p className="text-sm text-gray-700 mt-1">
                Standard OpenAI API usage rates will apply to your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ApiKeyManager;
