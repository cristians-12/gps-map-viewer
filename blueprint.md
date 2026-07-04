# Project Blueprint

## Overview

This project is a real-time GPS tracker that displays a location on a map. It consists of a React frontend and a Node.js backend.

## Features

*   **Real-time location tracking:** The map updates in real-time as new GPS data is received.
*   **Interactive map:** The map is interactive and allows users to pan and zoom.
*   **WebSocket communication:** The frontend and backend communicate using WebSockets for efficient real-time data transfer.

## Current Plan

I have updated the frontend to dynamically determine the WebSocket URL. It now uses a secure WebSocket connection (`wss://`) when the application is loaded over HTTPS. I also removed the hardcoded port to ensure it works correctly in both local and deployed environments. This resolves the "Mixed Content" error.