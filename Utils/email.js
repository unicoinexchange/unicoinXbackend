const nodemailer = require("nodemailer");
const pug = require("pug");
const { htmlToText } = require("html-to-text");

module.exports = class Email{
    constructor(user, otpToken){
        this.to = user.email;
        this.firstName = user.name.split(" ")[0];
        this.OTPToken = otpToken;
        this.from = `Unicoin Xchange <${process.env.EMAIL_USERNAME}>`;
    }

    newTransport(){
        if(process.env.NODE_ENV === "production"){
            return 1;
        }

        return nodemailer.createTransport({
            service:"gmail",
            host:process.env.EMAIL_HOST,
            port:process.env.EMAIL_PORT,
            secure:true,
            auth:{
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    };

    async send(template, subject){
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{
            firstName: this.firstName,
            otp: this.OTPToken,
            subject: subject
        });

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html: html,
            text: htmlToText(html)
        }

        await this.newTransport().sendMail(mailOptions)
    }

    async sendOTPEmail(){
        this.send("verifyemail", "Verify Your Email")
    }

    async sendPasswordResetEmail(){
        this.send("passwordresetemail", "Password Reset Email")
    }
}