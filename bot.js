const axios = require('axios');
const nodemailer = require('nodemailer');

const websites = ['https:etech.org.pk'];
const errorWebsites = new Set(); 
const transporter = nodemailer.createTransport({
  host: '',
  port: 587,
  secure: false,
  auth: {
    user: '',
    pass: ''  
  }
});

const mailOptions = {
  from: '',
  to: '',
  subject: 'Website Alert',
};

const checkWebsites = async () => {
  for (const website of websites) {
    try {
      const response = await axios.get(website);

     
      if (response.status === 404) {
        console.log(`${website} returned 404 - Page Not Found`);
        if (!errorWebsites.has(website)) {
          sendEmailNotification(website, '404 Error - Page Not Found');
          errorWebsites.add(website); 
          setTimeout(() => recheckWebsite(website), 10 * 60 * 1000); 
        }
      } else if (response.status >= 500 && response.status < 600) {
        console.log(`${website} returned a 5xx server error`);
        if (!errorWebsites.has(website)) {
          sendEmailNotification(website, `Server Error - Status Code: ${response.status}`);
          errorWebsites.add(website); 
          setTimeout(() => recheckWebsite(website), 10 * 60 * 1000);
        }
      } else {
        console.log(`${website} is online. Status: ${response.status}`);
      }
    } catch (error) {
      if (!errorWebsites.has(website)) {
        console.log(`${website} is offline or unreachable.`);
        sendEmailNotification(website, 'Website is Offline or Not Reachable');
        errorWebsites.add(website); 
        setTimeout(() => recheckWebsite(website), 10* 60 * 1000); 
      }
    }
  }
};

const recheckWebsite = async (website) => {
  try {
    const response = await axios.get(website);

   
    if (response.status < 400) {
      console.log(`${website} is back online. Status: ${response.status}`);
      sendEmailNotification(website, `Website is back online!\n\n\n\nRegards\nDevOps Team`);
      errorWebsites.delete(website); 
    } else {
      console.log(`${website} is still having issues. Status: ${response.status}`);
      setTimeout(() => recheckWebsite(website), 10 * 60 * 1000); 
    }
  } catch (error) {
    console.log(`${website} is still unreachable. Retrying in 10 minutes...\n\n\n\nRegards\nDevOps Team`);
    setTimeout(() => recheckWebsite(website), 10 * 60 * 1000); 
  }
};

const sendEmailNotification = async (website, message) => {
  console.log(`Sending email notification: ${website}: ${message}`);

  const emailOptions = {
    ...mailOptions,
    text: `Website Alert: ${website} is having an issue - ${message} \n\n\n\nRegards\nDevOps Team`
  };

  try {
    await transporter.sendMail(emailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


setInterval(checkWebsites, 60 * 1000);
