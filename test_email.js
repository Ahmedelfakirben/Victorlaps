const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: 'admin@sigma-di.ma',
    pass: 'bhktvtjjdhtdgwkt',
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

console.log("Testing connection...");
transporter.verify(function(error, success) {
  if (error) {
    console.log("Connection error:");
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});
