# Change Log

All notable changes to the "md-to-deploy" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.1.5] - 2025-12-28

- **Bug Fix:** Downgraded to vscode 1.104.0 to fix compatibility issues with other IDEs like AntiGravity and Cursor.

## [0.1.4] - 2025-12-23

- **Bug Fix:** CSS was not being grabbed from the template so css was moved to a inject statement if css file can't be grabbed.

## [0.1.0] - 2025-12-10

### Added

- **Site Generator Panel**: A dedicated webview panel to manage site generation.
- **Live Preview**: Real-time preview of the generated site's look and feel.
- **Tree View**: View and select files using a hierarchical folder structure.
- **Customization**: Configure Site Title, Footer Text, and Accent Color directly from the panel.
- **Settings Persistence**: Customization settings are saved to VS Code configuration.
- **Recursive Generation**: Support for generating sites from nested folder structures.

## [Unreleased]

- Initial release
