const express = require('express');
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3001;

// Enable CORS middleware
app.use(cors({
  origin: 'http://localhost:3000'
}));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1024, 
    fieldSize: 1024 * 1024 * 1024
  }
});

// MySQL connection configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '*****',
  database: '*****'
});

// Connect to MySQL
connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
});

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  host: 'mail.*******.com',
  port: 465,
  secure: true,
  auth: {
    user: 'info@*****.com',
    pass: '********'
  }
});

// Fetch subscribers' email addresses from the database
app.get('/subscribers', (req, res) => {
  connection.query('SELECT email FROM subscribers', (error, results) => {
    if (error) {
      console.error('Error fetching subscribers:', error);
      res.status(500).send('Error fetching subscribers');
      return;
    }
    const emails = results.map(result => result.email);
    res.json(emails);
  });
});

// Handle form submission and send emails to subscribers
app.post('/send-email', upload.single('file'), (req, res) => {
  const { title, message } = req.body;

  // Fetch subscribers' email addresses from the database
  connection.query('SELECT email FROM subscribers', (error, results) => {
    if (error) {
      console.error('Error fetching subscribers:', error);
      res.status(500).send('Error fetching subscribers');
      return;
    }
    const emails = results.map(result => result.email);

    // email message
    let mailOptions = {
      from: 'info@*****.com',
      bcc: emails, 
      subject: title,
      html: message, 
      attachments: []
    };

    // Add attachment if file is uploaded
    if (req.file) {
      const attachmentPath = path.join(__dirname, 'uploads', req.file.filename);
      if (fs.existsSync(attachmentPath)) {
        const attachmentData = fs.readFileSync(attachmentPath);
        mailOptions.attachments.push({
          filename: req.file.originalname,
          content: attachmentData
        });

        // Delete uploaded file after sending email
        fs.unlink(attachmentPath, err => {
          if (err) {
            console.error('Error deleting file:', err);
          } else {
            console.log('File deleted successfully:', attachmentPath);
          }
        });
      } else {
        console.error('File does not exist:', attachmentPath);
      }
    }

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Error sending email');
      } else {
        console.log('Email sent: ' + info.response);
        res.status(200).send('Email sent successfully!');
      }
    });
  });
});

// Route to handle image uploads
app.post('/upload-image', upload.single('image'), (req, res) => {
  const imageUrl = 'https://emailsenderserver.wendonews.com/' + req.file.path.replace(/\\/g, '/');
  res.json({ imageUrl });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});