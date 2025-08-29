const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages/login.html'));
}); 

// Estudiante
app.get('/estudiante', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'estudiante.html'));
});

// Profesor
app.get('/profesor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'profesor.html'));
})

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});