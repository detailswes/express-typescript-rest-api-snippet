import * as nodemailer from "nodemailer";
import { config } from "../config/env";

const transport = nodemailer.createTransport({
  host: config.mailHost,
  port: config.mailPort,
  auth: {
    user: config.mailUsername,
    pass: config.mailPassword,
  },
});

export class NodeMailer {
  static sendEmail(data: {
    to: string[];
    subject: string;
    html: string;
  }): Promise<nodemailer.SentMessageInfo> {
    return transport.sendMail({
      from: `"${config.mailFromName}" <${config.mailFromEmail}>`,
      to: data.to,
      subject: data.subject,
      html: data.html,
    });
  }
}
