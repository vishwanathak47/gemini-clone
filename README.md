# Gemini Clone - Full Stack AI Chat Application

A high-fidelity clone of the Google Gemini UI, built with the MERN stack (MongoDB, Express, React, Node.js). This application features real-time streaming AI responses, markdown rendering, and persistent chat history.

## 🚀 Live Demo
https://gemini-qmao.onrender.com

## ✨ Key Features

*   **Real-time AI Streaming:** Leverages Server-Sent Events (SSE) logic to stream responses token-by-token for a fluid user experience.
*   **Contextual Conversations:** The AI remembers previous messages in the session, allowing for multi-turn conversations.
*   **Rich Text Rendering:** Supports Markdown, code blocks (with syntax highlighting), lists, and bold text.
*   **Persistent History:** All chats are stored in MongoDB, allowing users to revisit past conversations.
*   **Responsive Design:** Fully responsive UI built with Tailwind CSS, supporting both Dark and Light modes.
*   **Multi-Session Management:** Create new chats, switch between active chats, and delete old conversations.

## 🛠️ Tech Stack

*   **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide React, React Markdown.
*   **Backend:** Node.js, Express.js.
*   **Database:** MongoDB Atlas (Mongoose ODM).
*   **AI:** Google Gemini API (`gemini-2.5-flash` model).

## ⚙️ Installation & Run Locally

1.  **Clone the repository**
    ```bash
    git clone https://github.com/vishwanathak47/gemini-clone.git
    cd gemini-clone
    ```

2.  **Setup Environment Variables**
    Create a `.env` file in the root directory (use `.env.example` as a reference):
    ```env
    API_KEY=your_google_gemini_api_key
    MONGODB_URI=your_mongodb_connection_string
    PORT=5000
    ```

3.  **Install Dependencies**
    ```bash
    npm install
    ```

4.  **Run the Application**
    Open two terminals:

    *Terminal 1 (Backend):*
    ```bash
    npm run server
    ```

    *Terminal 2 (Frontend):*
    ```bash
    npm start
    ```

## ⚠️ Known Limitations & Future Improvements

This project was built as a portfolio demonstration of full-stack capabilities and AI integration. Please note the following design choices:

1.  **Open API / Auth:**
    *   *Current State:* The application uses a simple username-based session for demonstration purposes. It does not currently implement secure authentication (JWT/OAuth).
    *   *Future Improvement:* In a production environment, I would integrate Firebase Auth or Auth0 to securely handle user sessions and protect API endpoints.

2.  **API Rate Limiting:**
    *   This project uses the Google Gemini Free Tier API, which has a limit of 15 requests per minute. Heavy usage may result in temporary errors.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is open source.
