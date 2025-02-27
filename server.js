const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const axios = require('axios'); // Use axios to call Flask API
const cors = require('cors');

const app = express();
const Port = process.env.PORT || 3500;

app.use(fileUpload());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index1.html'));
});

app.post('/transcribe', async (req, res) => {
    console.log('Received POST request at /transcribe');

    if (!req.files || !req.files.audio) {
        return res.status(400).send('No audio file uploaded.');
    }

    const audioFile = req.files.audio;
    const uploadPath = path.join(__dirname, 'savedfiles', audioFile.name);

    if (!fs.existsSync('savedfiles')) {
        fs.mkdirSync('savedfiles', { recursive: true });
    }

    audioFile.mv(uploadPath, async (err) => {
        if (err) {
            return res.status(500).send('Error saving audio file.');
        }

        console.log("Audio file saved:", uploadPath);

        try {
            const formData = new FormData();
            formData.append("audio", fs.createReadStream(uploadPath));

            const response = await axios.post("http://localhost:5000/transcribe", formData, {
                headers: { ...formData.getHeaders() }
            });

            res.send(response.data.transcription);
        } catch (error) {
            console.error("Error calling transcribe API:", error);
            res.status(500).send("Error during transcription.");
        }
    });
});

app.listen(Port, () => console.log(`Server running on port ${Port}`));
