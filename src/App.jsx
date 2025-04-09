import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import ApiKeyManager from './components/ApiKeyManager';
import PromptInput from './components/PromptInput';
import PagePreview from './components/PagePreview';
import ExportOptions from './components/ExportOptions';
import { getApiKey, saveApiKey, getGenerationHistory, saveGenerationHistory } from './utils/storage';
import { generateContent } from './utils/openai';
import { FaCode, FaEye, FaFileExport, FaHistory, FaLightbulb } from 'react-icons/fa';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [generationHistory, setGenerationHistory] = useState([]);
  const [showApiKeyManager, setShowApiKeyManager] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');

  useEffect(() => {
    const loadApiKey = async () => {
      const savedKey = await getApiKey();
      if (savedKey) {
        setApiKey(savedKey);
        setShowApiKeyManager(false);
      } else {
        setShowApiKeyManager(true);
      }
    };
    
    const loadHistory = async () => {
      const history = await getGenerationHistory();
      setGenerationHistory(history);
    };
    
    loadApiKey();
    loadHistory();
  }, []);

  const handleApiKeyChange = async (newKey) => {
    setApiKey(newKey);
    await saveApiKey(newKey);
    setShowApiKeyManager(false);
    toast.success('API key saved successfully!');
  };

  const handlePromptSubmit = async (forceRegenerate = false) => {
    if (!apiKey) {
      setError('Please enter an OpenAI API key first');
      setShowApiKeyManager(true);
      return;
    }
    
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      toast.error('Please enter a prompt');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setGenerationProgress('Generating your page...');
    
    try {
      // Simple progress updates
      const progressMessages = [
        'Analyzing your requirements...',
        'Creating page structure...',
        'Designing visual elements...',
        'Adding styles and animations...',
        'Finalizing your page...'
      ];
      
      let progressIndex = 0;
      const progressInterval = setInterval(() => {
        if (progressIndex < progressMessages.length) {
          setGenerationProgress(progressMessages[progressIndex]);
          progressIndex++;
        }
      }, 2000);
      
      let enhancedPrompt = prompt;
      
      if (forceRegenerate) {
        enhancedPrompt += " IMPORTANT: Create a COMPLETE page with ALL sections fully implemented, not just placeholders. Include DETAILED CONTENT in each section. Use vibrant colors and Tailwind CSS for a beautiful design.";
        setGenerationProgress('Regenerating with more detail and better design...');
      }
      
      const html = await generateContent(apiKey, enhancedPrompt);
      
      // Clear the interval
      clearInterval(progressInterval);
      
      if (!html || html.trim() === '') {
        throw new Error('Generated HTML is empty. Please try again with a different prompt.');
      }
      
      setGeneratedHtml(html);
      
      // Add to history
      const newHistoryItem = {
        id: Date.now(),
        prompt,
        timestamp: new Date().toISOString(),
        preview: html.substring(0, 100) + '...'
      };
      
      const updatedHistory = [newHistoryItem, ...generationHistory].slice(0, 10);
      setGenerationHistory(updatedHistory);
      saveGenerationHistory(updatedHistory);
      
      // Switch to preview tab
      setTabIndex(1);
      toast.success('Page generated successfully!');
    } catch (err) {
      console.error('Error generating content:', err);
      setError(err.message || 'Failed to generate content. Please check your API key and try again.');
      toast.error(err.message || 'Failed to generate content. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
      setGenerationProgress('');
    }
  };

  const handleRegenerate = () => {
    handlePromptSubmit(true);
  };

  const loadFromHistory = (historyItem) => {
    setPrompt(historyItem.prompt);
    toast.info('Prompt loaded from history');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <header className="gradient-bg text-white p-6 shadow-md">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">AI Page Generator</h1>
            <button 
              onClick={() => setShowApiKeyManager(!showApiKeyManager)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded transition-all duration-200"
            >
              {showApiKeyManager ? 'Hide API Settings' : 'API Settings'}
            </button>
          </div>
          
          {showApiKeyManager && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 bg-white bg-opacity-10 p-4 rounded-lg"
            >
              <ApiKeyManager apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
            </motion.div>
          )}
        </div>
      </header>
      
      <main className="container mx-auto p-6 max-w-6xl">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants} className="md:col-span-1">
            <div className="card p-6 h-full">
              <PromptInput 
                prompt={prompt} 
                onPromptChange={setPrompt} 
                onSubmit={() => handlePromptSubmit(false)}
                isLoading={isLoading}
              />
              {error && <p className="text-red-500 mt-2">{error}</p>}
              
              {isLoading && generationProgress && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{generationProgress}</p>
                </div>
              )}
              
              {generationHistory.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <FaHistory className="mr-2" /> Recent Prompts
                  </h3>
                  <div className="max-h-60 overflow-y-auto">
                    {generationHistory.map(item => (
                      <div 
                        key={item.id} 
                        className="p-3 border border-gray-200 rounded mb-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => loadFromHistory(item)}
                      >
                        <p className="text-sm font-medium truncate">{item.prompt}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <FaLightbulb className="mr-2" /> Prompt Ideas
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => setPrompt("Create a modern landing page for a SaaS product with hero section, features, pricing, and contact form. Use a vibrant blue and purple gradient color scheme with smooth fade-in animations for each section. Include hover effects on buttons and cards.")}
                    className="text-left p-2 w-full text-sm bg-blue-50 hover:bg-blue-100 rounded"
                  >
                    Colorful SaaS Landing Page
                  </button>
                  <button 
                    onClick={() => setPrompt("Design a personal portfolio page for a photographer with a full-screen image gallery, about section, and contact information. Use a dark theme with vibrant accent colors and subtle animations when scrolling between sections. Add hover effects that zoom in on portfolio images.")}
                    className="text-left p-2 w-full text-sm bg-blue-50 hover:bg-blue-100 rounded"
                  >
                    Colorful Photography Portfolio
                  </button>
                  <button 
                    onClick={() => setPrompt("Create a restaurant website with an elegant hero section, animated menu that organizes food by category, and a reservation form. Use warm, vibrant colors like deep reds, oranges and golds with serif fonts. Add subtle animations for menu items and a parallax effect for the background images.")}
                    className="text-left p-2 w-full text-sm bg-blue-50 hover:bg-blue-100 rounded"
                  >
                    Colorful Restaurant Website
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="md:col-span-2">
            <div className="card h-full">
              <Tabs selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
                <TabList className="flex bg-gray-100 p-0 rounded-t-lg overflow-hidden">
                  <Tab className="flex items-center py-3 px-6 focus:outline-none cursor-pointer border-b-2 border-transparent transition-all duration-200 hover:bg-gray-200">
                    <FaEye className="mr-2" /> Preview
                  </Tab>
                  <Tab className="flex items-center py-3 px-6 focus:outline-none cursor-pointer border-b-2 border-transparent transition-all duration-200 hover:bg-gray-200">
                    <FaCode className="mr-2" /> Code
                  </Tab>
                  <Tab className="flex items-center py-3 px-6 focus:outline-none cursor-pointer border-b-2 border-transparent transition-all duration-200 hover:bg-gray-200">
                    <FaFileExport className="mr-2" /> Export
                  </Tab>
                </TabList>
                
                <div className="p-6">
                  <TabPanel>
                    <PagePreview 
                      html={generatedHtml} 
                      isLoading={isLoading} 
                      progressMessage={generationProgress}
                      onRegenerate={handleRegenerate}
                    />
                  </TabPanel>
                  
                  <TabPanel>
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <FaCode className="mr-2 text-blue-600" /> HTML Code
                      </h2>
                      <div className="code-preview">
                        {generatedHtml ? (
                          <div className="border border-gray-300 rounded">
                            <pre className="p-4 overflow-x-auto bg-gray-50 text-sm">
                              {generatedHtml}
                            </pre>
                          </div>
                        ) : (
                          <div className="text-gray-400 flex items-center justify-center h-40 border border-gray-200 rounded">
                            Generate content to view the HTML code
                          </div>
                        )}
                      </div>
                    </div>
                  </TabPanel>
                  
                  <TabPanel>
                    {generatedHtml ? (
                      <ExportOptions html={generatedHtml} />
                    ) : (
                      <div className="text-gray-400 flex items-center justify-center h-40 border border-gray-200 rounded">
                        Generate content to access export options
                      </div>
                    )}
                  </TabPanel>
                </div>
              </Tabs>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-12 bg-white rounded-lg shadow-md p-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div variants={itemVariants} className="text-center">
              <div className="flex justify-center">
                <FaLightbulb className="feature-icon" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered Design</h3>
              <p className="text-gray-600">Create beautiful, animated HTML pages from text prompts with professional styling and modern design elements.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center">
              <div className="flex justify-center">
                <FaCode className="feature-icon" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Complete HTML Package</h3>
              <p className="text-gray-600">Generate responsive, animated pages with all styling and functionality included in a single HTML file.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center">
              <div className="flex justify-center">
                <FaFileExport className="feature-icon" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Multiple Export Options</h3>
              <p className="text-gray-600">Export your generated pages as HTML, Markdown, Google Docs, PNG image, or complete ZIP package.</p>
            </motion.div>
          </div>
        </motion.div>
      </main>
      
      <footer className="bg-gray-800 text-white p-6 mt-12">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">AI Page Generator</h2>
              <p className="text-gray-400 mt-1">Create beautiful web pages with AI</p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <p>&copy; {new Date().getFullYear()} AI Page Generator. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
