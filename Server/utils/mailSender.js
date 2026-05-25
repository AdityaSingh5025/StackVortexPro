const transactionalEmailsApi = require("../config/brevo");

const mailSender = async (email, title, body) => {
    try {
        const sendSmtpEmail = {
            sender: {
                email: process.env.BREVO_SENDER_EMAIL,
                name: process.env.BREVO_SENDER_NAME || "Aditya Singh - StackVortex",
            },
            to: [{ email }],
            subject: title,
            htmlContent: body,
        };

        const data = await transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
        console.log("EMAIL SENT:", data);

        return {
            ...data,
            response: data.messageId || "Email sent",
        };
    } catch (error) {
        console.error("BREVO ERROR:", error);
        console.log("Error in mailSender", error.message);
    }
};

module.exports = mailSender;
