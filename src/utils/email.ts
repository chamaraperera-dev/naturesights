import nodemailer from 'nodemailer';
import pug from 'pug';
import { htmlToText } from 'html-to-text';

interface User {
  email: string;
  name: string;
}

export class Email {
  to: string;
  firstName: string;
  url: string;
  confirmURL: any;
  from: string;

  //new Email(user,url).sendWelcome();
  constructor(user: User, url: string, confirmURL: any = null) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.confirmURL = confirmURL;
    this.from = `Nature Sights <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendInBlue',
        auth: {
          user: process.env.SENDINBLUE_USERNAME,
          pass: process.env.SENDINBLUE_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template: string, subject: string) {
    //1) Render HTML based on a pug template
    const html = pug.renderFile(
      `${__dirname}/views/email/${template}.pug`,

      {
        firstName: this.firstName,
        url: this.url,
        confirmURL: this.confirmURL,
        subject,
      }
    );
    //2)Define mail options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject, //same as subject:subject
      html, //same as html:html
      text: htmlToText(html),
    };
    //3) Create a transport and send email

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Nature Sights Family');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
}
