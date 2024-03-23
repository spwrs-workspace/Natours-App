const { convert } = require('html-to-text');
const nodemailer = require('nodemailer');
const pug = require('pug');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Natours App <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // sendgrid real emails

      //   return nodemailer.createTransport({
      //     service:'SendGrid',
      //     auth:{
      //       name: process.env.SENDGRID_USER,
      //       pass: process.env.SENDGRID_PASS
      //     }
      //   })
      // }

      //google real emails

      return nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });
    }

    //for development purpose
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  //actually sends emails
  async send(template, subject) {
    //create html from the received template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // console.log(this.url);
    //mailOptions
    const mailoptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      //for spam filters, email rates and some peoples like plain text emails hence
      text: convert(html),
    };

    //send mail
    await this.newTransport().sendMail(mailoptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Natours Family');
  }

  async sendPasswordResetToken() {
    await this.send(
      'resetPassword',
      'Your Reset Password Link (Hurry else it will expire in 10 min)',
    );
  }
};
