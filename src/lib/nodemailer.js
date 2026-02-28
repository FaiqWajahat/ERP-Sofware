import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});


export const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `"Pixvion Support" <${process.env.EMAIL_USER}>`, 
      to: to, // Receiver address
      subject: subject, // Subject line
      html: html, // HTML body content
    };

    // 3. Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return { success: true, info };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};