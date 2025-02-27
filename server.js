const express = require('express');
const fileUpload = require('express-fileupload');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process'); // Import exec from child_process to run Python script
const cors = require('cors'); // CORS to handle cross-origin requests


const app = express();
const Port = process.env.PORT || 3500;
const corsOptions = {
    origin: '*', // Allow requests from this origin
    methods: 'GET,POST', // Allow only specific HTTP methods
    optionsSuccessStatus: 200, // Respond with status 200 for OPTIONS requests
};
// Middleware to handle file uploads and CORS
app.use(fileUpload());
app.use(cors(corsOptions)); 
 // Enable CORS for handling requests from different origins (e.g., frontend on a different port)

//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "public")));

// Serve the HTML page when accessing root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','index1.html')); // Serve the index.html
});

app.get('/transcribe', (req, res) => {
    res.send("hello"); 
});

// Handle POST request for file upload and transcription
app.post('/transcribe', (req, res) => {
    console.log('Received POST request at /transcribe');
    
    // Check if the file exists in the request
    if (!req.files || !req.files.audio) {
        console.error("No audio file uploaded.");
        return res.status(400).send('No audio file uploaded.');
    }

    const audioFile = req.files.audio; // Get the audio file from the request
    const uploadDir = path.join(__dirname, 'savedfiles'); // Folder to save uploaded files
    const uploadPath = path.join(uploadDir, audioFile.name); // Full path to save the file

    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Move the uploaded audio file to the savedfiles directory
    audioFile.mv(uploadPath, (err) => {
        if (err) {
            console.error("Error saving file:", err);
            return res.status(500).send('Error saving audio file.');
        }

        console.log("Audio file saved at:", uploadPath);

        // Run the Python script to transcribe the audio file
        const pythonScriptPath = path.join(__dirname, 'transcribe.py');
        console.log(`Executing Python script at: ${pythonScriptPath}`);

        // Use 'python' command instead of 'python3'
        exec(`python "${pythonScriptPath}" "${uploadPath}"`, (error, stdout, stderr) => {
            console.log(`Python exec stdout: ${stdout}`);
            console.log(`Python exec stderr: ${stderr}`);
            
            if (error) {
                console.error(`Exec error: ${error.message}`);
                return res.status(500).send(`Error during transcription: ${error.message}`);
            }
            
            if (stderr) {
                console.error(`Python script stderr: ${stderr}`);
                return res.status(500).send(`Error during transcription: ${stderr}`);
            }

            // Send the transcription result back to the client
            const transcription = stdout.trim().split("\n").pop();
            console.log("Final Transcription:", transcription);
            res.send(transcription); // Send the transcription back to the frontend
        });
    });
});

// Start the server
app.listen(Port, () => console.log(`Server running on port ${Port}`));