const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = 8089;

// PostgreSQL bağlantı havuzu oluşturma
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'AnimalClinic',
    password: '06.ankara.06',
    port: 5432,
});

app.use(express.static('public')); // Örnek için resimleri saklamak için bir "public" klasörü oluşturuldu

// Basit bir form sunmak için rotayı oluşturun
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'uploadImage.html'));
});

// Veritabanından resim URL'lerini çekme
app.get('/images', (req, res) => {
    pool.query('SELECT path FROM images', (error, results) => {
        if (error) {
            res.status(500).json({ message: 'Database error', error });
        } else {
            const imageUrls = results.rows.map(row => row.path);
            res.json(imageUrls);
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
