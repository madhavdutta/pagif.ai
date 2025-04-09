import React, { useState, useRef } from 'react';
import { 
  FaDownload, 
  FaGoogle, 
  FaMarkdown, 
  FaCode, 
  FaImage, 
  FaFileArchive,
  FaClipboard,
  FaCheck,
  FaFileExport,
  FaSpinner
} from 'react-icons/fa';
import { htmlToMarkdown, htmlToGoogleDocsFormat } from '../utils/converter';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

function ExportOptions({ html }) {
  const [showHtmlCode, setShowHtmlCode] = useState(false);
  const [showMarkdownCode, setShowMarkdownCode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState('');
  const [copied, setCopied] = useState(false);
  const previewRef = useRef(null);
  
  const markdown = htmlToMarkdown(html);
  const googleDocsMarkdown = htmlToGoogleDocsFormat(html);

  const downloadHtml = () => {
    setIsExporting(true);
    setExportType('html');
    
    try {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated-page.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('HTML downloaded successfully!');
    } catch (error) {
      console.error('Error downloading HTML:', error);
      toast.error('Failed to download HTML');
    } finally {
      setIsExporting(false);
      setExportType('');
    }
  };

  const downloadMarkdown = () => {
    setIsExporting(true);
    setExportType('markdown');
    
    try {
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated-page.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Markdown downloaded successfully!');
    } catch (error) {
      console.error('Error downloading Markdown:', error);
      toast.error('Failed to download Markdown');
    } finally {
      setIsExporting(false);
      setExportType('');
    }
  };

  const exportToGoogleDocs = () => {
    setIsExporting(true);
    setExportType('google');
    
    try {
      // Create a form to submit to Google Docs
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://docs.google.com/document/create';
      form.target = '_blank';
      
      // Add the content as a hidden input
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'document_content';
      input.value = googleDocsMarkdown;
      form.appendChild(input);
      
      // Submit the form
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      toast.success('Exported to Google Docs!');
    } catch (error) {
      console.error('Error exporting to Google Docs:', error);
      toast.error('Failed to export to Google Docs');
    } finally {
      setIsExporting(false);
      setExportType('');
    }
  };

  const exportAsImage = async () => {
    setIsExporting(true);
    setExportType('image');
    
    try {
      // Create a temporary iframe to render the HTML
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.top = '-9999px';
      iframe.style.width = '1200px';
      iframe.style.height = '800px';
      document.body.appendChild(iframe);
      
      // Write the HTML to the iframe
      iframe.contentDocument.open();
      const iframeContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { margin: 0; font-family: system-ui, sans-serif; }
            </style>
          </head>
          <body>${html}</body>
        </html>
      `;
      iframe.contentDocument.write(iframeContent);
      iframe.contentDocument.close();
      
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Capture the iframe content as an image
      const node = iframe.contentDocument.body;
      const dataUrl = await toPng(node, { width: 1200, height: 800 });
      
      // Download the image
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'generated-page.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up
      document.body.removeChild(iframe);
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Error exporting as image:', error);
      toast.error('Failed to export as image');
    } finally {
      setIsExporting(false);
      setExportType('');
    }
  };

  const exportAsZip = async () => {
    setIsExporting(true);
    setExportType('zip');
    
    try {
      const zip = new JSZip();
      
      // Add HTML file
      zip.file("index.html", html);
      
      // Add Markdown file
      zip.file("README.md", markdown);
      
      // Add a simple CSS file
      zip.file("styles.css", `
        /* Extracted styles from the generated HTML */
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.5;
          margin: 0;
          padding: 0;
        }
      `);
      
      // Generate the zip file
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "generated-page-package.zip");
      toast.success('ZIP package downloaded successfully!');
    } catch (error) {
      console.error('Error creating ZIP package:', error);
      toast.error('Failed to create ZIP package');
    } finally {
      setIsExporting(false);
      setExportType('');
    }
  };

  const copyToClipboard = (content, type) => {
    navigator.clipboard.writeText(content).then(
      () => {
        setCopied(true);
        toast.success(`${type} copied to clipboard!`);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast.error('Failed to copy to clipboard');
      }
    );
  };

  return (
    <div className="mt-2">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <FaFileExport className="mr-2 text-blue-600" /> Export Options
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="card p-4 hover:shadow-lg cursor-pointer"
          onClick={downloadHtml}
        >
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FaCode className="text-green-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold">HTML File</h3>
              <p className="text-sm text-gray-600">Download as a complete HTML file</p>
            </div>
            {isExporting && exportType === 'html' && (
              <FaSpinner className="animate-spin ml-auto text-green-600" />
            )}
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="card p-4 hover:shadow-lg cursor-pointer"
          onClick={downloadMarkdown}
        >
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <FaMarkdown className="text-purple-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold">Markdown</h3>
              <p className="text-sm text-gray-600">Download as a Markdown document</p>
            </div>
            {isExporting && exportType === 'markdown' && (
              <FaSpinner className="animate-spin ml-auto text-purple-600" />
            )}
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="card p-4 hover:shadow-lg cursor-pointer"
          onClick={exportToGoogleDocs}
        >
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <FaGoogle className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold">Google Docs</h3>
              <p className="text-sm text-gray-600">Export directly to Google Docs</p>
            </div>
            {isExporting && exportType === 'google' && (
              <FaSpinner className="animate-spin ml-auto text-blue-600" />
            )}
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="card p-4 hover:shadow-lg cursor-pointer"
          onClick={exportAsImage}
        >
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <FaImage className="text-yellow-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold">Image</h3>
              <p className="text-sm text-gray-600">Export as PNG image</p>
            </div>
            {isExporting && exportType === 'image' && (
              <FaSpinner className="animate-spin ml-auto text-yellow-600" />
            )}
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="card p-4 hover:shadow-lg cursor-pointer"
          onClick={exportAsZip}
        >
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <FaFileArchive className="text-red-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold">Complete Package</h3>
              <p className="text-sm text-gray-600">Download as ZIP with HTML, CSS, and Markdown</p>
            </div>
            {isExporting && exportType === 'zip' && (
              <FaSpinner className="animate-spin ml-auto text-red-600" />
            )}
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="card p-4 hover:shadow-lg cursor-pointer"
          onClick={() => copyToClipboard(html, 'HTML')}
        >
          <div className="flex items-center">
            <div className="bg-gray-100 p-3 rounded-full mr-4">
              <FaClipboard className="text-gray-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold">Copy to Clipboard</h3>
              <p className="text-sm text-gray-600">Copy HTML code to clipboard</p>
            </div>
            {copied && (
              <FaCheck className="ml-auto text-green-600" />
            )}
          </div>
        </motion.div>
      </div>
      
      <div className="mt-8">
        <div className="mb-6">
          <button
            onClick={() => setShowHtmlCode(!showHtmlCode)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
          >
            <FaCode className="mr-2" /> {showHtmlCode ? 'Hide HTML Code' : 'Show HTML Code'}
          </button>
          
          {showHtmlCode && (
            <div className="mt-2 border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                <span className="font-medium">HTML</span>
                <button 
                  onClick={() => copyToClipboard(html, 'HTML')}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  {copied ? <FaCheck className="mr-1" /> : <FaClipboard className="mr-1" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="code-preview">
                <SyntaxHighlighter 
                  language="html" 
                  style={docco} 
                  wrapLines={true}
                  customStyle={{ margin: 0, maxHeight: '400px' }}
                >
                  {html}
                </SyntaxHighlighter>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <button
            onClick={() => setShowMarkdownCode(!showMarkdownCode)}
            className="flex items-center text-purple-600 hover:text-purple-800 mb-2"
          >
            <FaMarkdown className="mr-2" /> {showMarkdownCode ? 'Hide Markdown Code' : 'Show Markdown Code'}
          </button>
          
          {showMarkdownCode && (
            <div className="mt-2 border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                <span className="font-medium">Markdown</span>
                <button 
                  onClick={() => copyToClipboard(markdown, 'Markdown')}
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
                >
                  {copied ? <FaCheck className="mr-1" /> : <FaClipboard className="mr-1" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="code-preview">
                <SyntaxHighlighter 
                  language="markdown" 
                  style={docco} 
                  wrapLines={true}
                  customStyle={{ margin: 0, maxHeight: '400px' }}
                >
                  {markdown}
                </SyntaxHighlighter>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExportOptions;
