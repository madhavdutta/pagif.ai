import OpenAI from 'openai';

export async function generateContent(apiKey, prompt) {
  try {
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Required for client-side usage
    });

    // Single-step generation with a comprehensive prompt
    const enhancedPrompt = `
Generate a complete, professional HTML page based on this description:
"${prompt}"

Requirements:
1. Create a SINGLE HTML FILE with Tailwind CSS included via CDN
2. Include any JavaScript in a <script> tag at the end of the body
3. Use semantic HTML5 elements (header, nav, section, footer, etc.)
4. Implement a modern, visually appealing design with professional styling using Tailwind CSS
5. Use a vibrant, colorful design with a cohesive color scheme appropriate for the content
6. Add subtle animations and transitions for interactive elements
7. Ensure the page is fully responsive for mobile, tablet, and desktop
8. Include placeholder images using https://placehold.co
9. Add hover effects for buttons and interactive elements
10. Implement proper spacing, padding, and margins for visual hierarchy
11. Use Google Fonts for typography - specifically use clean sans-serif fonts like Poppins, Inter, or Montserrat
12. Include all necessary meta tags
13. Ensure the page is accessible with proper ARIA attributes

TAILWIND CSS REQUIREMENTS:
1. Include the latest Tailwind CSS via CDN in the head section
2. Use Tailwind's utility classes for all styling (colors, spacing, typography, etc.)
3. Implement a colorful design using Tailwind's color palette (blue, indigo, purple, pink, etc.)
4. Use Tailwind's flex and grid utilities for precise layout and alignment
5. Implement responsive design using Tailwind's responsive prefixes (sm:, md:, lg:, etc.)
6. Use Tailwind's transition and transform utilities for animations and hover effects
7. Implement shadows, rounded corners, and other design elements using Tailwind classes
8. Use Tailwind's typography utilities for proper text hierarchy and readability
9. Implement proper spacing using Tailwind's margin and padding utilities
10. Use Tailwind's container class for proper content width and centering

FORMATTING REQUIREMENTS:
1. Use proper heading hierarchy (h1, h2, h3, etc.) with clear visual distinction between heading levels
2. Format all tables with proper headers, borders, and alternating row colors for readability
3. Ensure consistent spacing between sections and elements
4. Use appropriate font sizes, weights, and line heights for readability
5. Implement proper text alignment and justification
6. Use monospace fonts for code sections or technical content
7. Ensure all text has sufficient contrast against backgrounds
8. Format lists (ordered and unordered) with proper indentation and bullet/number styles
9. Use appropriate emphasis (bold, italic) for important content
10. Implement proper paragraph spacing and text flow

DESIGN AND COLOR REQUIREMENTS:
1. Use a vibrant, colorful design that's visually engaging
2. Implement gradient backgrounds for key sections using Tailwind's bg-gradient classes
3. Use accent colors to highlight important elements and calls to action
4. Ensure proper color contrast for accessibility
5. Use color psychology appropriate to the content (e.g., blue for trust, green for growth)
6. Implement colorful cards, buttons, and UI elements
7. Use subtle color transitions and hover effects
8. Include colorful icons or visual elements where appropriate
9. Use color to create visual hierarchy and guide the user's attention
10. Ensure the color scheme is cohesive and professional

IMPORTANT: 
- Return ONLY the complete HTML code. Do not include any explanations, markdown formatting, or code block syntax.
- The HTML must be COMPLETE with all sections fully implemented, not just a skeleton or partial implementation.
- Include DETAILED CONTENT in each section, not just placeholders or "More content follows..." comments.
- Implement ALL features mentioned in the prompt with full detail and styling.
- The page should be PRODUCTION-READY, as if it were going to be deployed immediately.
`;

    console.log("Generating HTML...");
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview", // Using the latest GPT-4 model available
      messages: [
        { 
          role: "system", 
          content: "You are an expert web developer and designer who creates beautiful, colorful, production-ready HTML pages using Tailwind CSS. You excel at creating visually stunning designs with vibrant colors, proper alignment, and professional styling. You are especially skilled at using Tailwind's utility classes to create modern, responsive layouts with perfect spacing and typography. You write clean, semantic HTML with Tailwind CSS classes. You create COMPLETE pages with all sections fully implemented, not just skeletons. You include detailed content in each section, not just placeholders. You only return complete HTML code without any explanations, markdown formatting, or code block syntax." 
        },
        { role: "user", content: enhancedPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    // Extract the HTML from the response
    let generatedHtml = response.choices[0].message.content.trim();
    
    // If the response is wrapped in code blocks, remove them
    if (generatedHtml.startsWith('```html')) {
      generatedHtml = generatedHtml.replace(/^```html\n/, '').replace(/```$/, '');
    } else if (generatedHtml.startsWith('```')) {
      generatedHtml = generatedHtml.replace(/^```\n/, '').replace(/```$/, '');
    }
    
    // Ensure the HTML has proper doctype if missing
    if (!generatedHtml.toLowerCase().includes('<!doctype')) {
      generatedHtml = `<!DOCTYPE html>\n${generatedHtml}`;
    }
    
    // Ensure there's a viewport meta tag for responsiveness
    if (!generatedHtml.toLowerCase().includes('viewport')) {
      const headEndIndex = generatedHtml.toLowerCase().indexOf('</head>');
      if (headEndIndex !== -1) {
        const viewportMeta = '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
        generatedHtml = generatedHtml.slice(0, headEndIndex) + viewportMeta + generatedHtml.slice(headEndIndex);
      }
    }

    // Ensure Tailwind CSS is included
    if (!generatedHtml.toLowerCase().includes('tailwindcss')) {
      const headEndIndex = generatedHtml.toLowerCase().indexOf('</head>');
      if (headEndIndex !== -1) {
        const tailwindCDN = '<script src="https://cdn.tailwindcss.com"></script>';
        generatedHtml = generatedHtml.slice(0, headEndIndex) + tailwindCDN + generatedHtml.slice(headEndIndex);
      }
    }

    // Add Google Fonts if not present - focusing on sans-serif and monospace fonts
    if (!generatedHtml.toLowerCase().includes('fonts.googleapis.com')) {
      const headEndIndex = generatedHtml.toLowerCase().indexOf('</head>');
      if (headEndIndex !== -1) {
        const googleFonts = '<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Fira+Code:wght@400;500;600&display=swap" rel="stylesheet">';
        generatedHtml = generatedHtml.slice(0, headEndIndex) + googleFonts + generatedHtml.slice(headEndIndex);
      }
    }
    
    // Add Tailwind config for custom fonts if not present
    if (!generatedHtml.toLowerCase().includes('tailwind.config')) {
      const headEndIndex = generatedHtml.toLowerCase().indexOf('</head>');
      if (headEndIndex !== -1) {
        const tailwindConfig = `
<script>
  tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
          heading: ['Montserrat', 'system-ui', 'sans-serif'],
          mono: ['Fira Code', 'monospace'],
        },
        colors: {
          primary: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
          },
          secondary: {
            50: '#f5f3ff',
            100: '#ede9fe',
            200: '#ddd6fe',
            300: '#c4b5fd',
            400: '#a78bfa',
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
            800: '#5b21b6',
            900: '#4c1d95',
          },
          accent: {
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f9a8d4',
            400: '#f472b6',
            500: '#ec4899',
            600: '#db2777',
            700: '#be185d',
            800: '#9d174d',
            900: '#831843',
          },
        },
      },
    },
  }
</script>`;
        generatedHtml = generatedHtml.slice(0, headEndIndex) + tailwindConfig + generatedHtml.slice(headEndIndex);
      }
    }
    
    // Add basic animation CSS if not present
    if (!generatedHtml.toLowerCase().includes('@keyframes')) {
      const headEndIndex = generatedHtml.toLowerCase().indexOf('</head>');
      if (headEndIndex !== -1) {
        const animationCSS = `
<style>
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideInFromBottom {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes slideInFromLeft {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideInFromRight {
    from { transform: translateX(20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  .animate-fade-in {
    animation: fadeIn 1s ease forwards;
  }
  
  .animate-slide-in {
    animation: slideInFromBottom 0.5s ease forwards;
  }
  
  .animate-slide-left {
    animation: slideInFromLeft 0.5s ease forwards;
  }
  
  .animate-slide-right {
    animation: slideInFromRight 0.5s ease forwards;
  }
  
  .animate-pulse {
    animation: pulse 2s infinite;
  }
  
  .delay-100 { animation-delay: 0.1s; }
  .delay-200 { animation-delay: 0.2s; }
  .delay-300 { animation-delay: 0.3s; }
  .delay-400 { animation-delay: 0.4s; }
  .delay-500 { animation-delay: 0.5s; }
</style>`;
        generatedHtml = generatedHtml.slice(0, headEndIndex) + animationCSS + generatedHtml.slice(headEndIndex);
      }
    }
    
    // Check if the HTML is too short or incomplete
    if (generatedHtml.length < 1000) {
      throw new Error('Generated HTML is incomplete. Please try again with a more detailed prompt.');
    }
    
    // Check for placeholder comments like "More content follows..."
    if (generatedHtml.includes('More content follows') || generatedHtml.includes('<!-- More content')) {
      // Try to generate again with a stronger instruction
      console.log("Detected incomplete content, regenerating...");
      return generateContent(apiKey, prompt + " Make sure to include COMPLETE content for all sections, not just placeholders or comments.");
    }
    
    console.log("HTML generation complete!");
    return generatedHtml;
  } catch (error) {
    console.error('Error generating HTML:', error);
    throw new Error(error.message || 'Failed to generate content');
  }
}
