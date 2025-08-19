# AskDockAI

AskDockAI leverages the Gemini AI model to process and analyze user-supplied documents or text (e.g. PDFs or plain text). When a file is uploaded, the application sends the content to Gemini, which intelligently interprets it and generates relevant output—summaries, insights, or directly answers user queries—right within the browser. Plus, once the response is generated, AskDockAI will email the output to the user, enabling them to conveniently receive and reference the analysis wherever they prefer.

## Technologies Used

- **HTML, CSS, JavaScript**: For building the frontend user interface.
- **Node.js**: (if used) For backend logic and server-side operations.
- **Gemini AI Model**: For processing and generating intelligent output from documents and text.


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
