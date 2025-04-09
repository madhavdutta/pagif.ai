import { convert } from 'html-to-markdown';
import TurndownService from 'turndown';

export function htmlToMarkdown(html) {
  try {
    // First try with html-to-markdown
    const options = {
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      emDelimiter: '*'
    };
    
    let markdown = convert(html, options);
    
    // If the result seems incomplete or problematic, try with turndown as a fallback
    if (!markdown || markdown.length < 10 || markdown.includes('[object Object]')) {
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        bulletListMarker: '-',
        codeBlockStyle: 'fenced',
        emDelimiter: '*'
      });
      
      // Improve image handling
      turndownService.addRule('images', {
        filter: 'img',
        replacement: function (content, node) {
          const alt = node.alt || '';
          const src = node.getAttribute('src') || '';
          const title = node.title || '';
          const titlePart = title ? ` "${title}"` : '';
          return src ? `![${alt}](${src}${titlePart})` : '';
        }
      });
      
      markdown = turndownService.turndown(html);
    }
    
    return markdown;
  } catch (error) {
    console.error('Error converting HTML to Markdown:', error);
    
    // Last resort fallback
    try {
      const turndownService = new TurndownService();
      return turndownService.turndown(html);
    } catch (secondError) {
      console.error('Secondary error converting HTML to Markdown:', secondError);
      return '# Error converting to Markdown\n\nThere was an error converting the HTML to Markdown format.';
    }
  }
}

export function enhanceMarkdownForGoogleDocs(markdown) {
  // Add special formatting to improve Google Docs import
  let enhanced = markdown;
  
  // Add a title at the top
  if (!enhanced.startsWith('# ')) {
    enhanced = '# Generated Page\n\n' + enhanced;
  }
  
  // Add page break before major sections
  enhanced = enhanced.replace(/\n## /g, '\n\n---\n\n## ');
  
  // Ensure proper spacing for lists
  enhanced = enhanced.replace(/\n- /g, '\n\n- ');
  
  // Improve table formatting
  enhanced = enhanced.replace(/\n\|/g, '\n\n|');
  
  return enhanced;
}

export function htmlToGoogleDocsFormat(html) {
  const markdown = htmlToMarkdown(html);
  return enhanceMarkdownForGoogleDocs(markdown);
}
