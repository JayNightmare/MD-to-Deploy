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
            cssContent = `/* Default CSS fallback */ body { font-family: sans-serif; }`;
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
