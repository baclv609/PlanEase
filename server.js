// Back-end: API quản lý tag với Express.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Dummy database for tags
let tags = [
  { id: 1, name: 'Work', color: '#3498db', description: 'Work-related tasks' },
  { id: 2, name: 'Personal', color: '#e67e22', description: 'Personal activities' },
];

// GET /tags: Lấy danh sách tag
app.get('/tags', (req, res) => {
  res.json(tags);
});

// POST /tags: Thêm mới tag
app.post('/tags', (req, res) => {
  const { name, color, description } = req.body;
  if (!name || !color) {
    return res.status(400).json({ message: 'Name and color are required' });
  }

  const newTag = {
    id: tags.length + 1,
    name,
    color,
    description: description || '',
  };

  tags.push(newTag);
  res.status(201).json(newTag);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});