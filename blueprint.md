# Project Blueprint

## Overview

This project is a real-time GPS tracker that displays a location on a map. It consists of a React frontend and a Node.js backend, now configured to run as a single, unified server for deployment.

## Features

*   **Real-time location tracking:** The map updates in real-time as new GPS data is received.
*   **Interactive map:** The map is interactive and allows users to pan and zoom.
*   **WebSocket communication:** The frontend and backend communicate using WebSockets for efficient real-time data transfer.

## Current Plan

The persistent WebSocket connection failures on Vercel were due to its default serverless architecture, which does not support the long-lived connections required by WebSockets. 

To solve this, I have re-architected the project to run as a **single, stateful server** on deployment:

1.  **Unified Server Logic:** The `server/server.js` file has been updated to not only handle WebSocket connections and API requests, but also to serve the static files of the built React application.

2.  **Deployment Configuration:** The `vercel.json` file has been configured to route all incoming traffic to this single, persistent server. This ensures the server stays active to maintain WebSocket connections.

This new architecture correctly supports WebSockets in a Vercel environment and should resolve the connection errors. The application is now a single, cohesive unit, making it more robust for production.
