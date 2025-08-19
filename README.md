# AskDockAI

AskDockAI is a web-based application designed to provide interactive features for users. This project includes a simple frontend built with HTML, CSS, and JavaScript.

## Technologies Used

- **HTML, CSS, JavaScript**: For building the frontend user interface.
- **Node.js**: (if used) For backend logic and server-side operations.
- **Gemini AI Model**: For processing and generating intelligent output from documents and text.

## How It Works

AskDockAI leverages the Gemini AI model to process and analyze documents or text provided by the user. When a user uploads a document (such as a PDF or text file), the website sends the content to Gemini, which intelligently interprets the input and generates relevant output, summaries, or answers based on the document's contents. This enables users to quickly extract insights or information from their files using advanced AI capabilities directly in the browser.

## Features

- Responsive web interface (`public/index.html`)
- Custom styles (`public/style.css`)
- Interactive scripts (`public/script.js`)
- Example test data (`test/data/05-versions-space.pdf`)

## Getting Started

1. Clone the repository:
   ```sh
   git clone https://github.com/CodeForgeNet/AskDockAI.git
   ```
2. Open `public/index.html` in your browser to view the app.

## Project Structure

```
index.js              # Entry point (if using Node.js features)
package.json          # Project metadata and dependencies
public/
	index.html          # Main HTML file
	script.js           # JavaScript logic
	style.css           # CSS styles
test/
	data/
		05-versions-space.pdf  # Sample test data
```

## Usage

- Modify `public/index.html`, `public/script.js`, and `public/style.css` to customize the UI and functionality.
- Use the sample PDF in `test/data/` for testing document-related features.

## License

This project is licensed under the MIT License.
