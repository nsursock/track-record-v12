import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const isModernStyle = process.argv.includes('--style=modern');

// Simple HTML to PDF conversion function
async function generatePDF() {
  console.log('📚 Generating PDF from principle files...');

    // Read all principle files
  const principlesDir = path.join(process.cwd(), 'src', 'app', 'principles');
  const principleFiles = [
    'strategic-detachment.njk',
    'never-retreat.njk', 
    'radical-honesty.njk',
    'calculated-absence.njk',
    'sovereign-power.njk',
    'fearless-presence.njk',
    'never-yield-manipulation.njk',
    'emotional-intelligence.njk',
    'universal-respect.njk'
  ];

  // Validate principles directory exists
  if (!fs.existsSync(principlesDir)) {
    throw new Error(`Principles directory not found: ${principlesDir}`);
  }

  // Extract content from each principle
  const principles = [];

  for (const filename of principleFiles) {
    const filePath = path.join(principlesDir, filename);
    
    // Validate file exists and read content
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Principle file not found: ${filename}`);
      continue;
    }

    let content;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      console.warn(`⚠️  Failed to read ${filename}: ${error.message}`);
      continue;
    }

    // Extract frontmatter with better parsing
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    let title = filename.replace('.njk', '').replace(/-/g, ' ');
    let description = '';

    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const titleMatch = frontmatter.match(/title:\s*(.+)/);
      const descMatch = frontmatter.match(/description:\s*(.+)/);

      if (titleMatch) title = titleMatch[1].replace('- Life Principles', '').trim();
      if (descMatch) description = descMatch[1].trim();
    } else {
      console.warn(`⚠️  No frontmatter found in ${filename}`);
    }

    // Extract main content (removing navigation and HTML structure)
    let mainContent = content.replace(/^---[\s\S]*?---/, '');

    // Remove navigation sections
    mainContent = mainContent.replace(/<nav[\s\S]*?<\/nav>/g, '');

    // Extract the prose content and clean it up
    const articleMatch = mainContent.match(/<article[\s\S]*?<\/article>/);
    if (articleMatch) {
      let articleContent = articleMatch[0];

      // Extract the main principle content section
      const sectionMatch = articleContent.match(/<section[^>]*>[\s\S]*?<\/section>/);
      if (sectionMatch) {
        let sectionContent = sectionMatch[0];

        // Clean up HTML tags but preserve structure
        sectionContent = sectionContent
          .replace(/<section[^>]*>/, '')
          .replace(/<\/section>$/, '')
          .replace(/<div[^>]*class="flex[^"]*"[^>]*>[\s\S]*?<\/div>/g, '') // Remove flex containers
          .replace(/<div[^>]*class="w-12[^"]*"[^>]*>[\s\S]*?<\/div>/g, '') // Remove icon containers
          .replace(/<span[^>]*class="icon-[^"]*"[^>]*><\/span>/g, '') // Remove icons
          .replace(/<nav[\s\S]*?<\/nav>/g, '') // Remove any remaining nav
          .trim();

        principles.push({
          title,
          description,
          content: sectionContent
        });
      } else {
        console.warn(`⚠️  No section content found in ${filename}`);
      }
    } else {
      console.warn(`⚠️  No article content found in ${filename}`);
    }
  }

  // Validate we have principles to process
  if (principles.length === 0) {
    throw new Error('No principles were successfully parsed. Check your .njk files.');
  }

  console.log(`✅ Successfully parsed ${principles.length} principle${principles.length !== 1 ? 's' : ''}`);

  // Style definitions
  const defaultStyles = `
        @page {
            margin: 1in;
            size: letter;
        }
        
        body {
            font-family: "Times New Roman", serif;
            line-height: 1.6;
            color: #333;
            font-size: 12pt;
        }
        
        .cover {
            text-align: center;
            page-break-after: always;
            padding-top: 200px;
        }
        
        .cover h1 {
            font-size: 2.5em;
            color: #2c3e50;
            margin-bottom: 0.5em;
            font-weight: bold;
        }
        
        .cover .subtitle {
            font-size: 1.2em;
            color: #7f8c8d;
            margin-bottom: 2em;
            font-style: italic;
        }
        
        .cover .author {
            font-size: 1.1em;
            color: #34495e;
            margin-top: 3em;
        }
        
        .toc {
            page-break-after: always;
        }
        
        .toc h2 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 0.5em;
            margin-bottom: 1em;
        }
        
        .toc ol {
            font-size: 1.1em;
            line-height: 2;
            padding-left: 2.5em;
            list-style-position: outside;
        }
        
        .toc ol li {
            margin-bottom: 0.5em;
            display: list-item;
            list-style-type: decimal;
            line-height: 1.6;
            padding-left: 0.5em;
        }
        
        .toc ol li::before {
            content: none;
        }
        
        .principle {
            page-break-before: always;
            margin-bottom: 2em;
        }
        
        .principle-header {
            margin-bottom: 2em;
            padding-bottom: 1em;
            border-bottom: 3px solid #3498db;
        }
        
        .principle-number {
            font-size: 3em;
            color: #3498db;
            font-weight: bold;
            line-height: 1;
            margin-bottom: 0.2em;
        }
        
        .principle-title {
            font-size: 1.8em;
            color: #2c3e50;
            font-weight: bold;
            margin-bottom: 0.5em;
        }
        
        .principle-subtitle {
            font-size: 1.1em;
            color: #7f8c8d;
            font-style: italic;
            margin-bottom: 1em;
        }
        
        .principle-description {
            font-size: 1.1em;
            color: #555;
            line-height: 1.7;
            margin-bottom: 1.5em;
        }
        
        h1, h2, h3, h4, h5, h6 {
            color: #2c3e50;
            font-weight: bold;
        }
        
        h1 { font-size: 1.8em; margin: 1.5em 0 1em 0; }
        h2 { font-size: 1.5em; margin: 1.3em 0 0.8em 0; }
        h3 { font-size: 1.3em; margin: 1.2em 0 0.7em 0; }
        h4 { font-size: 1.1em; margin: 1.1em 0 0.6em 0; }
        
        p {
            margin-bottom: 1em;
            text-align: justify;
        }
        
        ul, ol {
            margin-bottom: 1em;
            padding-left: 2em;
        }
        
        li {
            margin-bottom: 0.5em;
        }
        
        .highlight-box {
            background: #f8f9fa;
            border-left: 4px solid #3498db;
            padding: 1em;
            margin: 1em 0;
            border-radius: 4px;
        }
        
        .highlight-box h4 {
            color: #3498db;
            margin-top: 0;
        }
        
        .case-study {
            background: #f0f8ff;
            border: 1px solid #3498db;
            padding: 1.5em;
            margin: 1.5em 0;
            border-radius: 8px;
        }
        
        .case-study h4 {
            color: #2c3e50;
            margin-top: 0;
            font-size: 1.2em;
        }
        
        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1em;
            margin: 1em 0;
        }
        
        .grid-item {
            border: 1px solid #ddd;
            padding: 1em;
            border-radius: 6px;
            background: #fafafa;
        }
        
        .grid-item h4 {
            margin-top: 0;
            color: #3498db;
            font-size: 1em;
        }
        
        .implementation {
            page-break-after: always;
            margin-top: 3em;
        }
        
        .implementation h2 {
            color: #27ae60;
            border-bottom: 2px solid #27ae60;
        }
        
        .page-break {
            page-break-before: always;
            margin-top: 2em;
        }
        
        strong {
            color: #2c3e50;
        }
        
        @page {
            @top-center { 
                content: "9 Life Principles for Maximum Impact";
                font-family: "Times New Roman", serif;
                font-size: 9pt;
                color: #2c3e50;
                margin-top: 0.5in;
            }
            @bottom-right { 
                content: "Page " counter(page);
                font-family: "Times New Roman", serif;
                font-size: 9pt;
                color: #666;
            }
            @bottom-left { 
                content: "Track Record";
                font-family: "Times New Roman", serif;
                font-size: 9pt;
                color: #666;
            }
        }
        
        @page :first {
            @top-center { content: ""; }
            @bottom-left { content: ""; }
            @bottom-right { content: ""; }
        }
    `;

      const modernStyles = `
     @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
     
     :root {
       --primary: #003366;
       --secondary: #444;
       --accent: #f3f3f3;
       --highlight: #dce6f2;
       --font-mono-body: 'IBM Plex Mono', monospace;
       --font-mono-header: 'Fira Code', monospace;
     }
    
    @page {
      margin: 1in;
      size: A4;
    }
    
         body {
       font-family: var(--font-mono-body);
       line-height: 1.7;
       font-size: 11.5pt;
       color: var(--secondary);
       background: white;
       font-weight: 400;
     }
     
     h1, h2, h3, h4, h5, h6 {
       font-family: var(--font-mono-header);
       color: var(--primary);
       font-weight: 600;
       letter-spacing: -0.02em;
     }
    
    h1 { font-size: 2em; margin: 2em 0 1em; }
    h2 { font-size: 1.6em; margin: 1.5em 0 1em; border-bottom: 2px solid var(--primary); }
    h3 { font-size: 1.3em; margin: 1.2em 0 0.8em; }
    
    p {
      margin: 1em 0;
      text-align: justify;
    }
    
    ul, ol {
      padding-left: 1.5em;
      margin-bottom: 1em;
    }
    
    li {
      margin-bottom: 0.5em;
    }
    
    .cover {
      text-align: center;
      padding-top: 200px;
      page-break-after: always;
    }
    
         .cover h1 {
       font-size: 3em;
       font-family: var(--font-mono-header);
       color: var(--primary);
       font-weight: 700;
       letter-spacing: -0.03em;
     }
    
    .cover .subtitle {
      font-size: 1.3em;
      font-style: italic;
      color: var(--secondary);
    }
    
    .cover .author {
      font-size: 1.1em;
      color: var(--primary);
      margin-top: 3em;
    }
    
    .toc {
      page-break-after: always;
    }
    
    .toc h2 {
      font-size: 1.5em;
      color: var(--primary);
      margin-bottom: 0.5em;
      border-bottom: 2px solid var(--primary);
    }
    
    .toc ol {
      font-size: 1.1em;
      padding-left: 2.5em;
      line-height: 1.8;
      list-style-position: outside;
    }
    
    .toc ol li {
      margin-bottom: 0.5em;
      display: list-item;
      list-style-type: decimal;
      line-height: 1.6;
      padding-left: 0.5em;
    }
    
    .toc ol li::before {
      content: none;
    }
    
    .principle-number {
      font-size: 2.5em;
      color: var(--primary);
      margin-bottom: 0.2em;
    }
    
         .principle-title {
       font-size: 1.8em;
       color: var(--primary);
       font-family: var(--font-mono-header);
       font-weight: 700;
       letter-spacing: -0.02em;
     }
    
    .principle-description {
      font-size: 1.1em;
      color: #555;
      font-style: italic;
    }
    
    .highlight-box {
      background-color: var(--highlight);
      border-left: 5px solid var(--primary);
      padding: 1em 1.5em;
      font-style: italic;
      border-radius: 4px;
      margin: 1em 0;
    }
    
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1em;
      margin: 1.5em 0;
    }
    
         .principle {
       page-break-before: always;
       margin-bottom: 2em;
     }
     
     .principle-header {
       margin-bottom: 2em;
       padding-bottom: 1em;
       border-bottom: 3px solid var(--primary);
     }
     
     .grid-item {
       background: #fff;
       border: 1px solid #ccc;
       padding: 1em;
       border-radius: 4px;
       box-shadow: 0 1px 3px rgba(0,0,0,0.08);
     }
     
     .page-break {
       page-break-before: always;
       margin-top: 2em;
     }
    
    @page {
      @top-center { 
        content: "9 Life Principles for Maximum Impact";
        font-family: var(--font-mono-header);
        font-size: 9pt;
        color: var(--primary);
        margin-top: 0.5in;
      }
      @bottom-right { 
        content: "Page " counter(page);
        font-family: var(--font-mono-body);
        font-size: 9pt;
        color: #666;
      }
      @bottom-left { 
        content: "Track Record";
        font-family: var(--font-mono-body);
        font-size: 9pt;
        color: #666;
      }
    }
    
    @page :first {
      @top-center { content: ""; }
      @bottom-left { content: ""; }
      @bottom-right { content: ""; }
    }
    `;


  // Generate comprehensive HTML content
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>9 Life Principles for Maximum Impact</title>
    <style>
        ${isModernStyle ? modernStyles : defaultStyles}
    </style>
</head>
<body>
    <!-- Cover Page -->
    <div class="cover">
        <h1>9 Life Principles for Maximum Impact</h1>
        <div class="subtitle">Battle-tested wisdom for navigating life's complexities</div>
        <div class="author">Track Record</div>
    </div>

    <!-- Table of Contents -->
    <div class="toc">
        <h2>Table of Contents</h2>
        <ol>
            <li>Introduction</li>
            ${principles.map((principle, index) => `<li>${principle.title}</li>`).join('\n            ')}
            <li>Implementation Guide</li>
            <li>Final Thoughts</li>
        </ol>
    </div>

    <!-- Introduction -->
    <div class="principle">
        <h2>Introduction</h2>
        <p>In a world overflowing with advice, why focus on just nine principles? Because complexity is the enemy of execution. These aren't random insights—they're the distilled essence of what separates those who thrive from those who merely survive.</p>
        
        <p>Each principle addresses a fundamental aspect of human interaction and self-management. Together, they form a comprehensive framework for maintaining your power, protecting your interests, and building authentic relationships while navigating an increasingly complex world.</p>
        
        <p>The French have a saying: "Les conseils les plus simples sont les plus difficiles à suivre" (The simplest advice is the hardest to follow). These principles are simple to understand but require discipline to implement. The payoff? A life of greater autonomy, deeper relationships, and strategic clarity.</p>
    </div>

    <!-- Principles -->
    ${principles.map((principle, index) => `
    <div class="principle">
        <div class="principle-header">
            <div class="principle-number">${index + 1}</div>
            <div class="principle-title">${principle.title}</div>
            <div class="principle-description">${principle.description}</div>
        </div>
        
        <div class="principle-content">
            ${cleanHTMLForPDF(principle.content)}
        </div>
    </div>
    `).join('')}

    <!-- Implementation Guide -->
    <div class="implementation">
        <h2 class="page-break">Your Implementation Journey</h2>
        
        <h3>9-Week Foundation Plan</h3>
        <ul>
            <li><strong>Week 1:</strong> Practice strategic detachment in one recurring drama situation</li>
            <li><strong>Week 2:</strong> Address one situation you've been avoiding (stand your ground)</li>
            <li><strong>Week 3:</strong> Have one radically honest conversation with a trusted ally</li>
            <li><strong>Week 4:</strong> Implement calculated absence with one relationship or commitment</li>
            <li><strong>Week 5:</strong> Begin building one pillar of sovereign power (emergency fund, new skill, etc.)</li>
            <li><strong>Week 6:</strong> Practice fearless presence in one challenging situation daily</li>
            <li><strong>Week 7:</strong> Identify and resist one form of manipulation using proven scripts</li>
            <li><strong>Week 8:</strong> Practice emotional awareness and impact assessment for one week</li>
            <li><strong>Week 9:</strong> Implement universal respect practices in all key relationships</li>
        </ul>
        
        <h3>Long-term Mastery Building</h3>
        <ul>
            <li><strong>Month 1-3:</strong> Build emergency fund, develop outside interests</li>
            <li><strong>Month 4-6:</strong> Diversify professional skills and social connections</li>
            <li><strong>Month 7-12:</strong> Create multiple income sources and identity pillars</li>
            <li><strong>Year 2+:</strong> Maintain and optimize your sovereign lifestyle</li>
        </ul>
        
    </div>

    <!-- Final Thoughts Section -->
    <div class="implementation">
        <h2 class="page-break">Final Thoughts</h2>
        <p>These nine principles work together to create a framework for maximum impact in your personal and professional life. They're not quick fixes—they're fundamental shifts in how you operate in the world.</p>
        
        <p>Remember: complexity is the enemy of execution. Focus on implementing one principle at a time, building the habit until it becomes natural, then moving to the next.</p>
        
        <p>The payoff? A life of greater autonomy, deeper relationships, and strategic clarity in navigating an increasingly complex world.</p>
    </div>
</body>
</html>
`;

  /**
   * Modular HTML cleaning functions for better testability and maintainability
   */

  /**
   * Removes duplicate title and quote sections from principle content
   * @param {string} html - Raw HTML content
   * @returns {string} HTML with duplicate headers removed
   */
  function removeDuplicateHeaders(html) {
    return html.replace(/<div>\s*<h1[^>]*>.*?<\/h1>\s*<p[^>]*>.*?<\/p>\s*<\/div>\s*<\/div>\s*/g, '');
  }

  /**
   * Converts Tailwind CSS classes to PDF-compatible classes
   * @param {string} html - HTML with Tailwind classes
   * @returns {string} HTML with PDF-friendly classes
   */
  function convertTailwindToPDFClasses(html) {
    return html
      .replace(/<div[^>]*class="[^"]*bg-gradient[^"]*"[^>]*>/g, '<div class="highlight-box">')
      .replace(/<div[^>]*class="[^"]*grid[^"]*"[^>]*>/g, '<div class="grid">')
      .replace(/<div[^>]*class="[^"]*p-[46][^"]*"[^>]*>/g, '<div class="grid-item">');
  }

  /**
   * Removes all CSS class attributes from HTML elements
   * @param {string} html - HTML with class attributes
   * @returns {string} Clean HTML without class attributes
   */
  function cleanAllClasses(html) {
    return html
      .replace(/<h([1-6])[^>]*class="[^"]*"[^>]*>/g, '<h$1>')
      .replace(/<p[^>]*class="[^"]*"[^>]*>/g, '<p>')
      .replace(/<ul[^>]*class="[^"]*"[^>]*>/g, '<ul>')
      .replace(/<ol[^>]*class="[^"]*"[^>]*>/g, '<ol>')
      .replace(/<li[^>]*class="[^"]*"[^>]*>/g, '<li>')
      .replace(/<strong[^>]*class="[^"]*"[^>]*>/g, '<strong>')
      .replace(/class="[^"]*"/g, '');
  }

  /**
   * Normalizes whitespace and formatting for PDF generation
   * @param {string} html - HTML content
   * @returns {string} Normalized HTML
   */
  function normalizeWhitespace(html) {
    return html
      .replace(/\s+>/g, '>')
      .trim();
  }

  /**
   * Main HTML cleaning pipeline - applies all cleaning operations in sequence
   * @param {string} html - Raw HTML from .njk files
   * @returns {string} Clean HTML ready for PDF generation
   */
  function cleanHTMLForPDF(html) {
    let cleaned = html;
    cleaned = removeDuplicateHeaders(cleaned);
    cleaned = convertTailwindToPDFClasses(cleaned);
    cleaned = cleanAllClasses(cleaned);
    cleaned = normalizeWhitespace(cleaned);
    return cleaned;
  }

  // Create output directory
  const outputDir = path.join(process.cwd(), 'src', 'assets', 'pdfs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write temporary HTML file for PDF generation
  const htmlPath = path.normalize(path.join(outputDir, 'life-principles-ebook.html'));
  const pdfPath = path.normalize(path.join(outputDir, 'life-principles-ebook.pdf'));
  
  try {
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`📄 Creating temporary HTML file for PDF conversion...`);
  } catch (error) {
    throw new Error(`Failed to write HTML file: ${error.message}`);
  }

  try {
    // Method 1: Try using wkhtmltopdf if available
    console.log('🔄 Attempting to generate PDF with wkhtmltopdf...');
    const wkCommand = `wkhtmltopdf --page-size A4 --margin-top 0.75in --margin-right 0.75in --margin-bottom 0.75in --margin-left 0.75in --disable-smart-shrinking --no-header-line --no-footer-line "${htmlPath}" "${pdfPath}"`;
    execSync(wkCommand, { stdio: 'pipe' });
    
    // Validate PDF was created
    if (fs.existsSync(pdfPath)) {
      console.log(`✅ PDF generated successfully with wkhtmltopdf: ${pdfPath}`);
      return pdfPath;
    }
  } catch (error) {
    console.log(`⚠️  wkhtmltopdf failed: ${error.message || 'Command not found'}`);
  }

  try {
    // Method 2: Try using headless Chrome via chrome/chromium
    console.log('🔄 Attempting to generate PDF with Chrome headless...');
    const chromeCommands = [
      'google-chrome',
      'chromium-browser',
      'chromium',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    ];

    for (const chromeCmd of chromeCommands) {
      try {
        const chromeCommand = `"${chromeCmd}" --headless --disable-gpu --print-to-pdf="${pdfPath}" --no-margins --run-all-compositor-stages-before-draw --virtual-time-budget=5000 --print-to-pdf-no-header "${htmlPath}"`;
        execSync(chromeCommand, { stdio: 'pipe' });
        
        // Validate PDF was created
        if (fs.existsSync(pdfPath)) {
          console.log(`✅ PDF generated successfully with Chrome: ${pdfPath}`);
          // Clean up temporary HTML file
          try {
            fs.unlinkSync(htmlPath);
            console.log(`🧹 Cleaned up temporary HTML file`);
          } catch (cleanupError) {
            console.warn(`⚠️  Could not clean up HTML file: ${cleanupError.message}`);
          }
          return pdfPath;
        }
      } catch (err) {
        console.log(`⚠️  Chrome command failed (${chromeCmd}): ${err.message || 'Unknown error'}`);
        continue;
      }
    }
  } catch (error) {
    console.log('⚠️  Chrome headless not available...');
  }

  // Fallback: Keep HTML file and provide instructions
  console.log(`
📄 PDF generation tools not available on this system.
✅ HTML version ready at: ${htmlPath}

To convert to PDF:
1. Open the HTML file in Chrome/Safari
2. Print → Save as PDF → Choose "More settings" → Paper size: A4 → Margins: Default
3. Save as: life-principles-ebook.pdf
4. Move the PDF to: ${outputDir}/

Or install wkhtmltopdf for automatic PDF generation:
- macOS: brew install wkhtmltopdf
- Ubuntu: sudo apt-get install wkhtmltopdf
- Windows: Download from https://wkhtmltopdf.org/downloads.html
`);

  return htmlPath;
}

// Helper function to extract clean text content from HTML
function extractTextContent(html) {
  return html
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Run the PDF generation
generatePDF()
  .then(outputPath => {
    console.log(`\n🎉 Ebook generation complete: ${outputPath}`);
  })
  .catch(error => {
    console.error('❌ Error generating ebook:', error);
    process.exit(1);
  }); 