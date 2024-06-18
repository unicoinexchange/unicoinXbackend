const nodemailer = require("nodemailer");
const pug = require("pug");
const { htmlToText } = require("html-to-text");

module.exports = class Email{
    constructor(user, otpToken){
        this.to = user.email;
        this.firstName = user.name.split(" ")[0];
        this.lastName = user.name.split(" ")[1];
        this.OTPToken = otpToken;
        if(user.investmentPlan){
            this.investmentName = user.investmentPlan.name;
            this.investmentAmount = user.investmentPlan.amount;
            this.investmentDuration = user.investmentPlan.duration;
            this.investmentReferralBonus = user.investmentPlan.referralBonus;
            this.investmentTotalReturn = user.investmentPlan.totalReturn;
        }
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
            lastName: this.lastName,
            otp: this.OTPToken,
            investmentName:this.investmentName,
            investmentAmount:this.investmentAmount,
            investmentDuration:this.investmentDuration,
            investmentReferralBonus:this.investmentReferralBonus,
            investmentTotalReturn:this.investmentTotalReturn,
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
        this.send("verifyemail", "Verify your email")
    }

    async sendPasswordResetEmail(){
        this.send("passwordresetemail", "Password reset email")
    }

    async sendInvestmentEmail(){
        this.send("investmentmail", "Investment activation email")
    }
}