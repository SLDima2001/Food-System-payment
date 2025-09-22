// routes/emailRoute.js
import express from 'express';
import nodemailer from 'nodemailer';
import 'dotenv/config'

const router = express.Router();

// Route for the first form
router.post('/form1', async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    // Create a transporter
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'lahirutoursorg@gmail.com', // Your email
        pass: 'wnvddlqypbboyutp' // Your email password
      }
    });

    // Email options
    let mailOptions = {
      from: 'lahirutoursorg@gmail.com',
      to: 'dimalshapraveen2001@gmail.com', // Recipient email
      subject: 'Contact Form Submission',
      text: `
      Name: ${name}\n
      Email: ${email}\n
      Phone: ${phone}\n
      Message: ${message}
      `
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send('Failed to send email');
      } else {
        return res.status(200).send('Email sent successfully');
      }
    });
  } catch (error) {
    return res.status(500).send('An error occurred while sending the email');
  }
});




export default router;
