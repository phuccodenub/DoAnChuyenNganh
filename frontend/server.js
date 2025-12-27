// Simple server for SPA routing on Render
// This handles client-side routing by serving index.html for all routes
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const DIST_PATH = path.join(__dirname, 'dist');

// Serve static files
app.use(express.static(DIST_PATH));

// SPA fallback: serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving static files from ${DIST_PATH}`);
});

