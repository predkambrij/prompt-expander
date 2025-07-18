# Prompt Variable Expander

A simple web application that allows users to create dynamic prompt templates with variables and easily fill them in to generate expanded prompts.

## Features

- **Multiple Variable Formats**: Supports `{{variable}}`, `{variable}`, and `$variable` syntax
- **Dynamic Form Generation**: Automatically creates input fields for detected variables in order of appearance
- **Real-time Expansion**: Updates the expanded prompt as you type
- **Copy to Clipboard**: One-click copying of the final expanded prompt
- **Responsive Design**: Works on desktop and mobile devices
- **GitHub Pages Ready**: Pure HTML/CSS/JS with no build process required

## Usage

### Running Locally

To run the expander locally:

```bash
python3 -m http.server 8000
```

Then open your web browser and navigate to:
```
http://localhost:8000/
```

### Using the Application

1. **Enter Your Template**: Paste or type your prompt template in the "Prompt Template" textarea
2. **Use Variables**: Include variables using any of these formats:
   - `{{variable_name}}` - Double curly braces
   - `{variable_name}` - Single curly braces  
   - `$variable_name` - Dollar sign prefix
3. **Fill Variables**: Input fields will automatically appear for each detected variable
4. **Copy Result**: Click "Copy to Clipboard" to copy the expanded prompt

## Example

**Template:**
```
Hello {{name}}, welcome to {platform}! Your account balance is $balance.
```

**Variables Detected:**
- `name`
- `platform` 
- `balance`

**Expanded Result:**
```
Hello John, welcome to GitHub! Your account balance is $150.
```

## Hosting on GitHub Pages

1. Create a new repository named `prompt-expander` on GitHub
2. Upload these files to the repository
3. Go to Settings → Pages
4. Select "Deploy from a branch" and choose your main branch
5. Your app will be available at `https://yourusername.github.io/prompt-expander`

## Live Demo

Visit the live application at: https://predkambrij.github.io/prompt-expander/

## Browser Support

Works in all modern browsers that support:
- ES6 Classes
- Async/Await
- Clipboard API (with fallback for older browsers)

## Development

### Running Tests

Install dependencies:
```bash
npm install
```

Run tests:
```bash
npm test
```

Run tests in watch mode (for development):
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

The test suite covers:
- Variable detection for all supported formats (`{{}}`, `{}`, `$`)
- Template expansion logic
- Edge cases and error handling
- Integration scenarios with real-world prompts

## Files

- `index.html` - Main application structure
- `style.css` - Responsive styling and design
- `script.js` - Variable detection and dynamic form functionality
- `test/script.test.js` - Comprehensive test suite
- `package.json` - Node.js project configuration
- `README.md` - This documentation