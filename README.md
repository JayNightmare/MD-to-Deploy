# MD to Deploy

**MD to Deploy** is a VS Code extension that allows you to easily generate a static documentation site from your Markdown files. It features a "Maven-like" site structure with a sidebar navigation, customizable branding, and a live preview.

## How to Use

### VSCode Section

1. Ensure you have Markdown files in your workspace.
2. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
3. Run the command `MD to Deploy: Open Site Generator Panel`.
4. Use the panel to select files, customize your site, and preview changes.
5. Click the "Generate Site" button to create your documentation site in the `docs/` folder.

<video controls src="20251210-1536-45.1215448.mp4" title="Title"></video>

### Publishing to GitHub Pages

1. Go to the GitHub Repo and go to `Settings` > `Pages` and set the source to the `docs/` folder to publish your site.
2. Go back to the `Code` page and click on the Cog icon on About and enable `Use your GitHub Pages Website` to see your published site.

<video controls src="20251210-1539-12.1842441.mp4" title="Title"></video>

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
