# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A pure HTML/CSS/JavaScript web application for expanding prompt templates with variables. Supports multiple variable formats (`{{variable}}`, `{variable}`, `$variable`) and provides real-time dynamic form generation.

## Development Commands

### Local Development
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000/ in browser.

### Deployment
Static files deploy directly to GitHub Pages - no build process required.

## Architecture

### Core Components
- **PromptVariableExpander Class** (`script.js`): Main application logic with ES6 class structure
- **Variable Detection**: Regex-based parsing supporting three variable formats with position-aware ordering
- **Dynamic UI Generation**: Creates input forms based on detected variables in template order
- **Real-time Updates**: Event-driven template expansion as user types

### Key Files
- `index.html`: Semantic HTML structure with accessibility considerations
- `script.js`: Single-class architecture with methods for detection, UI rendering, and clipboard operations
- `style.css`: CSS Grid responsive layout with modern design patterns

### Variable Processing Flow
1. Template parsing with multiple regex patterns
2. Variable deduplication while preserving order of first appearance
3. Dynamic form field generation with data binding
4. Real-time template substitution with fallback display for empty values

### Technical Features
- **Clipboard API**: Modern async/await with document.execCommand fallback
- **Responsive Design**: CSS Grid with mobile-first approach
- **No Dependencies**: Pure vanilla JavaScript with browser compatibility
- **GitHub Pages Ready**: Static hosting with proper meta tags and SEO

## Browser Compatibility
Requires ES6 Classes, async/await, and Clipboard API (with fallback support).