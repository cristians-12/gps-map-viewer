# Project Blueprint

## Overview

This project is a real-time GPS tracker that displays a location on a map. It consists of a React frontend and a Node.js backend, now configured to run as a single, unified server for deployment.

## Features

*   **Real-time location tracking:** The map updates in real-time as new GPS data is received.
*   **Interactive map:** The map is interactive and allows users to pan and zoom.
*   **WebSocket communication:** The frontend and backend communicate using WebSockets for efficient real-time data transfer.

## Current Plan

The project has been successfully re-architected to solve WebSocket connection failures on Vercel. The key was to move from a serverless model to a **single, unified server**.

### Architecture Solution:

1.  **Unified Server:** The `server/server.js` file now acts as a single, persistent server that:
    *   Serves the static React application files.
    *   Manages the WebSocket connections.
    *   Handles API requests (e.g., `/gps-update`).

2.  **Deployment Build Process:** A critical `vercel.json` configuration was created to orchestrate the deployment correctly. It instructs Vercel to:
    *   **First, build the frontend:** Run the React build process to create the `dist` directory containing the static web application.
    *   **Then, run the server:** Route all incoming traffic to the `server/server.js` file, which then serves the application from the newly created `dist` directory.

This two-step process resolved the "Not Found" error and ensures that the server can both serve the web page and maintain the necessary long-lived WebSocket connections. The application is now fully configured for a robust production deployment on Vercel.
