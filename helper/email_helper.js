// // const nodemailer = require("emailjs");
const email = require('emailjs');
// const nodemailer = require('nodemailer');
var method = EmailHelper.prototype;
function EmailHelper() { }
var nodemailer = require('nodemailer');

method.generateEmail = async function (email_to, _text, _html, _subject) {
    var mailOptions = {
        from: 'haris.arif103@gmail.com',
        to: email_to,
        text: _text,
        html: _html,
    };

    // Send e-mail using SMTP
    mailOptions.subject = _subject;
    var smtpTransporter = nodemailer.createTransport({
        port: 25,
        host: "email-smtp.ap-northeast-1.amazonaws.com",
        secure: true,
        auth: {
            user: "AKIAU733B6VZPXAE2Q3A",
            pass: "BAzP8hTunpkHnX2OQDMtxrvGt9Hq1wf3fZ3UaI04RFsv",
        },
        debug: true
    });
    console.log("sent")
     await smtpTransporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            // res.status(error.responseCode).send(error.response);
        } else {
            console.log('Message sent: ' + info.response);
            // res.status(200).send(info);
        }
    });
    console.log("sent")
}

method.resetPasswordEmail = async function (email_to, _text, _html,) {
    var mailOptions = {
        from: 'no-reply@eprimedata.com',
        to: email_to,
        text: _text,
        html: _html,
    };

    // Send e-mail using SMTP
    mailOptions.subject = 'reset password request';
    var smtpTransporter = nodemailer.createTransport({
        port: 25,
        host: "email-smtp.ap-northeast-1.amazonaws.com",
        secure: true,
        auth: {
            user: "AKIAU733B6VZPXAE2Q3A",
            pass: "BAzP8hTunpkHnX2OQDMtxrvGt9Hq1wf3fZ3UaI04RFsv",
        },
        debug: true
    });
    console.log("sent")
     await smtpTransporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            // res.status(error.responseCode).send(error.response);
        } else {
            console.log('Message sent: ' + info.response);
            // res.status(200).send(info);
        }
    });
    console.log("sent")
}
module.exports = EmailHelper;