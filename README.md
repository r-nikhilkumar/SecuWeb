# Website Security Checker

A comprehensive **Website Security Checker** that analyzes URLs in real-time to assess the security of a website. It performs multiple checks to ensure the safety, reliability, and compliance of websites with industry-standard security protocols. The tool provides a detailed security report, visualizes scores, and highlights security vulnerabilities.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Demo](#demo)
- [API Endpoint](#apiendpoint)

## Features

- **Real-Time Security Checks:** Analyze website security by fetching data from the backend and performing security checks in real-time using websocket.
- **Visualized Security Scores:** Circular progress bars display security scores and thresholds (color-coded for easy interpretation).
- **Detailed Security Report:** A step-by-step breakdown of the checks performed, highlighting issues in real time.
- **Progress Indicators:** Shows which checks are completed and which are still in progress.
- **Responsive UI:** User-friendly interface designed to work smoothly across all devices.
- **Redux State Management:** Efficiently manages state for real-time updates across different components.

## Tech Stack

- **Frontend:**
  - Vite
  - React
  - Redux
  - CSS/SCSS for styling
  - WebSocket

- **Backend:**
  - Node.js / Django
  - RESTful API
  - Real-time data fetching
  - WebSocket

- **Other Technologies:**
  - Circular progress indicators
  - JSON for security check results

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/website-security-checker.git
    cd website-security-checker
    ```

2. Install dependencies for the frontend:
    ```bash
    cd frontend
    npm install
    ```

3. Install dependencies for the backend:
    ```bash
    cd backend
    npm install
    ```

4. Set up environment variables in a `.env` file for the backend (e.g., API keys, server URLs).

5. Run the development servers:

   - **Frontend (Vite):**
     ```bash
     npm run dev
     ```

   - **Backend:**
     ```bash
     npm start
     ```

## Usage

1. Enter a URL into the input field on the homepage.
2. Click on "Check Security" to begin the analysis.
3. Watch as progress bars indicate the status of each security check.
4. View the final security report, with detailed information on vulnerabilities and overall security score.

### Demo
![Screenshot (261)](https://github.com/user-attachments/assets/9d66480e-f254-4bf8-90e0-4a92d21d176f)
or
visit [Link](https://secuweb.vercel.app/)

### API Endpoint:
[API](https://secuwebapi.onrender.com)

