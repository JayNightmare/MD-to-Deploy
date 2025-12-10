# MD to Deploy

**MD to Deploy** is a VS Code extension that allows you to easily generate a static documentation site from your Markdown files. It features a "Maven-like" site structure with a sidebar navigation, customizable branding, and a live preview.

## Features

### Site Generator Panel

Access the dedicated panel via the command `MD to Deploy: Open Site Generator Panel`.

- **File Selection**: Choose which Markdown files to include in your site.
- **Tree View**: Toggle between a flat list and a hierarchical tree view to manage nested documentation.
- **Live Preview**: See changes to your site's title, footer, and accent color in real-time.

### Customization

Customize the look and feel of your documentation site directly from the panel:

- **Site Title**: Set a custom title for your documentation (defaults to your workspace name).
- **Footer Text**: Add custom text to the footer.
- **Accent Color**: Choose a primary color for links, headers, and UI elements.

### Output

The extension generates a `docs/` folder in your workspace containing:

- `index.html`: The main entry point.
- `html/`: Subfolders and HTML files mirroring your Markdown structure.
- `css/`: Stylesheets for the generated site.

## Extension Settings

This extension contributes the following settings:

- `mdToDeploy.siteTitle`: Default title for the generated site.
- `mdToDeploy.footerText`: Default footer text for the generated site.
- `mdToDeploy.accentColor`: Default accent color for the generated site.

## Release Notes

See the [CHANGELOG](CHANGELOG.md) for detailed release notes and updates.
