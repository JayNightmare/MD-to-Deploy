import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import MarkdownIt = require('markdown-it');

export class SiteGenerator {
    private md: MarkdownIt;

    constructor() {
        this.md = new MarkdownIt();
    }

    public async generateSite(files: string[], extensionUri: vscode.Uri, options: { accentColor: string, siteTitle: string, footerText: string }) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        const docsPath = path.join(rootPath, 'docs');

        // Ensure docs directory exists
        if (!fs.existsSync(docsPath)) {
            fs.mkdirSync(docsPath);
        }

        // Copy CSS
        const cssPath = path.join(docsPath, 'css');
        if (!fs.existsSync(cssPath)) {
            fs.mkdirSync(cssPath);
        }
        
        // Read the template CSS
        // We try to find it in src/templates (dev) or templates (prod if copied)
        // For robustness in this dev environment, we'll look in src/templates
        let cssContent = '';
        try {
            // Try src/templates/styles.css
            const cssUri = vscode.Uri.joinPath(extensionUri, 'src', 'templates', 'styles.css');
            const cssData = await vscode.workspace.fs.readFile(cssUri);
            cssContent = new TextDecoder().decode(cssData);
        } catch (e) {
            console.warn('Could not read CSS from src/templates, trying fallback', e);
            // Fallback: try to read from a relative path if bundled differently or just use default
            cssContent = `
            /* Maven-like Site Styles - Dark Mode Default */
:root {
    --bg-color: #1e1e1e;
    --text-color: #d4d4d4;
    --header-bg: #252526;
    --sidebar-bg: #252526;
    --border-color: #3e3e42;
    --accent-color: #007acc;
    /* Default, overridden by inline styles */
    --accent-text-color: #ffffff;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: var(--bg-color);
    color: var(--text-color);
}

header {
    background-color: var(--header-bg);
    border-bottom: 1px solid var(--border-color);
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
}

header h1 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--accent-color);
}

.container {
    display: flex;
    flex: 1;
    position: relative;
}

nav {
    width: 250px;
    background-color: var(--sidebar-bg);
    border-right: 1px solid var(--border-color);
    padding: 1rem;
    flex-shrink: 0;
}

nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

nav li {
    margin-bottom: 0.5rem;
}

nav a {
    color: var(--text-color);
    text-decoration: none;
    display: block;
    padding: 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s;
}

nav a:hover {
    background-color: var(--accent-color);
    color: var(--accent-text-color);
}

main {
    flex: 1;
    padding: 2rem;
    max-width: 800px;
    overflow-x: auto;
}

/* Markdown Content Styling */
main h1,
main h2,
main h3,
main h4,
main h5,
main h6 {
    color: var(--accent-color);
    margin-top: 1.5em;
    margin-bottom: 0.5em;
}

main a {
    color: var(--accent-color);
    text-decoration: none;
}

main a:hover {
    text-decoration: underline;
}

main code {
    background-color: #2d2d2d;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
}

main pre {
    background-color: #2d2d2d;
    padding: 1rem;
    border-radius: 5px;
    overflow-x: auto;
}

main pre code {
    background-color: transparent;
    padding: 0;
}

main blockquote {
    border-left: 4px solid var(--accent-color);
    margin: 0;
    padding-left: 1rem;
    color: #a0a0a0;
}

footer {
    background-color: var(--header-bg);
    border-top: 1px solid var(--border-color);
    padding: 1rem;
    text-align: center;
    margin-top: auto;
    font-size: 0.9rem;
    color: #808080;
}

/* Hamburger Menu */
#sidebar-toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    flex-direction: column;
    gap: 5px;
}

.bar {
    width: 25px;
    height: 3px;
    background-color: var(--text-color);
    display: block;
    border-radius: 2px;
}

/* Responsive Styles */
@media (max-width: 768px) {
    #sidebar-toggle {
        display: flex;
    }

    nav {
        position: absolute;
        top: 0;
        left: -280px;
        /* Hide off-screen (width + padding) */
        height: 100%;
        z-index: 1000;
        transition: left 0.3s ease;
        box-shadow: 2px 0 10px rgba(0, 0, 0, 0.5);
    }

    nav.active {
        left: 0;
    }

    main {
        padding: 1rem;
    }
}
            `;
        }
        
        fs.writeFileSync(path.join(cssPath, 'styles.css'), cssContent);

        const htmlRootPath = path.join(docsPath, 'html');
        if (!fs.existsSync(htmlRootPath)) {
            fs.mkdirSync(htmlRootPath, { recursive: true });
        }

        const generatedFiles: { original: string, relativeHtmlPath: string, title: string }[] = [];

        // Generate HTML for each file
        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');
            const htmlContent = this.md.render(content);
            const relativePath = path.relative(rootPath, file);
            const fileName = path.basename(file, '.md');
            
            // Structure: docs/html/[parent_folder]/[filename].html
            const relativeDir = path.dirname(relativePath);
            const sanitizedRelativeDir = this.sanitizePath(relativeDir);
            const outputDir = path.join(htmlRootPath, sanitizedRelativeDir);
            
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const outputPath = path.join(outputDir, `${fileName}.html`);
            
            // Store info for navigation generation
            const relativeHtmlPath = path.relative(docsPath, outputPath); // e.g. html/foo/bar.html
            generatedFiles.push({
                original: file,
                relativeHtmlPath: relativeHtmlPath,
                title: fileName
            });
        }

        // Second pass to write files with correct navigation links
        for (const page of generatedFiles) {
            const outputPath = path.join(docsPath, page.relativeHtmlPath);
            const content = fs.readFileSync(page.original, 'utf-8');
            const htmlContent = this.md.render(content);
            
            const fullHtml = this.wrapHtml(htmlContent, page.title, generatedFiles, outputPath, docsPath, options);
            fs.writeFileSync(outputPath, fullHtml);
        }

        // Generate Index Page
        this.generateIndexPage(docsPath, generatedFiles, options);

        vscode.window.showInformationMessage(`Site generated in ${docsPath}`);
    }

    private generateIndexPage(docsPath: string, pages: { relativeHtmlPath: string, title: string }[], options: { accentColor: string, siteTitle: string, footerText: string }) {
        const indexPath = path.join(docsPath, 'index.html');
        const links = pages.map(p => `<li><a href="${p.relativeHtmlPath}">${p.title}</a></li>`).join('\n');
        
        const content = `
            <h2>Welcome to the Documentation</h2>
            <p>Select a page from the navigation or the list below:</p>
            <ul>
                ${links}
            </ul>
        `;

        const fullHtml = this.wrapHtml(content, 'Home', pages, indexPath, docsPath, options);
        fs.writeFileSync(indexPath, fullHtml);
    }

    private sanitizePath(p: string): string {
        return p.split(path.sep).map(part => part === '.' ? part : part.replace(/^\./, '')).join(path.sep);
    }

    private getContrastColor(hexColor: string): string {
        // Remove hash if present
        const hex = hexColor.replace('#', '');
    
        // Parse RGB
        const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
        const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
        const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
    
        // Calculate relative luminance using WCAG formula
        const getLuminance = (c: number) => {
            const sRGB = c / 255;
            return sRGB <= 0.03928 
                ? sRGB / 12.92 
                : Math.pow((sRGB + 0.055) / 1.055, 2.4);
        };
    
        const L = 0.2126 * getLuminance(r) + 0.7152 * getLuminance(g) + 0.0722 * getLuminance(b);
    
        // Calculate contrast ratios
        const whiteContrast = (1.0 + 0.05) / (L + 0.05);
        const blackContrast = (L + 0.05) / (0.0 + 0.05);
    
        return whiteContrast > blackContrast ? '#ffffff' : '#000000';
    }

    private wrapHtml(content: string, title: string, pages: { relativeHtmlPath: string, title: string }[], currentPath: string, docsRoot: string, options: { accentColor: string, siteTitle: string, footerText: string }): string {
        // Calculate relative path to CSS
        const cssRelPath = path.relative(path.dirname(currentPath), path.join(docsRoot, 'css', 'styles.css'));
        const contrastColor = this.getContrastColor(options.accentColor);
        
        // Generate navigation links
        const navLinks = pages.map(p => {
            // Calculate relative path from current file to the link target
            // Target: docsRoot + p.relativeHtmlPath
            // From: path.dirname(currentPath)
            const targetPath = path.join(docsRoot, p.relativeHtmlPath);
            const relLink = path.relative(path.dirname(currentPath), targetPath);
            return `<li><a href="${relLink}">${p.title}</a></li>`;
        }).join('\n');

        // Add link to Home
        const homeLink = path.relative(path.dirname(currentPath), path.join(docsRoot, 'index.html'));
        const nav = `
            <ul>
                <li><a href="${homeLink}"><strong>Home</strong></a></li>
                ${navLinks}
            </ul>
        `;

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${options.siteTitle}</title>
    <link rel="stylesheet" href="${cssRelPath}"> 
    <style>
        :root {
            --accent-color: ${options.accentColor};
            --accent-text-color: ${contrastColor};
        }
    </style>
</head>
<body>
    <header>
        <button id="sidebar-toggle" aria-label="Toggle Navigation">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
        </button>
        <h1>${options.siteTitle}</h1>
    </header>
    <div class="container">
        <nav id="sidebar">
            ${nav}
        </nav>
        <main>
            ${content}
        </main>
    </div>
    <footer>
        <p>${options.footerText}</p>
    </footer>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const toggle = document.getElementById('sidebar-toggle');
            const sidebar = document.getElementById('sidebar');

            if (toggle && sidebar) {
                toggle.addEventListener('click', () => {
                    sidebar.classList.toggle('active');
                });

                // Optional: Close sidebar when clicking outside on mobile
                document.addEventListener('click', (e) => {
                    if (window.innerWidth <= 768 && 
                        sidebar.classList.contains('active') && 
                        !sidebar.contains(e.target) && 
                        !toggle.contains(e.target)) {
                        sidebar.classList.remove('active');
                    }
                });
            }
        });
    </script>
</body>
</html>`;
    }
}
