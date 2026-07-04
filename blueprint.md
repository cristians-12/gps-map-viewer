# Project Blueprint

## Overview

This project is a real-time GPS tracker that displays a location on a map. It consists of a React frontend and a Node.js backend, architected as a single, unified application for robust deployment on Vercel.

## Features

*   **Real-time location tracking:** The map updates in real-time as new GPS data is received.
*   **Interactive map:** The map is interactive and allows users to pan and zoom.
*   **WebSocket communication:** The frontend and backend communicate using WebSockets for efficient real-time data transfer.

## Final Deployment Architecture

After encountering persistent WebSocket connection failures on Vercel, the project was re-architected to follow the platform's best practices for full-stack applications with stateful servers.

### Core Problem:

Vercel's default serverless environment and build process complexities were preventing the successful upgrade of HTTP requests to persistent WebSocket connections.

### Solution: Unified Project Structure

1.  **Single `package.json`:** All project dependencies (both frontend and backend) and scripts were consolidated into the root `package.json`. The redundant `server/package.json` was removed. This eliminates ambiguity during the build process.

2.  **Automated Vercel Build:** A `"vercel-build": "npm run build"` script was added to the root `package.json`. Vercel automatically detects and runs this script, ensuring the React frontend is always built into the `dist` folder **before** the server starts.

3.  **Simplified `vercel.json`:** The deployment configuration was simplified to a single rewrite rule: `{ "rewrites": [{ "source": "/(.*)", "destination": "/server/server.js" }] }`. This directs all incoming traffic to the Node.js server.

4.  **Unified Server Logic:** The `server/server.js` file acts as the single entry point, responsible for serving the static files from the `dist` directory and handling all WebSocket connections.

This architecture provides a clear, robust, and Vercel-recommended deployment pattern that solves the WebSocket connection issues. The application is now correctly configured to build the frontend and then launch the persistent server, ensuring seamless real-time communication.
