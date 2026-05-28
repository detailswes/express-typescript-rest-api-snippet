import { NodeMailer } from "../utils/NodeMailer";
import { logger } from "../config/logger";

interface VerificationEmailJob {
  email: string;
  token: number;
}

const queue: VerificationEmailJob[] = [];
let processing = false;

async function processQueue(): Promise<void> {
  if (processing || queue.length === 0) {
    return;
  }

  processing = true;

  while (queue.length > 0) {
    const job = queue.shift();
    if (!job) {
      continue;
    }

    try {
      await NodeMailer.sendEmail({
        to: [job.email],
        subject: "Email Verification",
        html: `<h1>Your verification code: ${job.token}</h1>`,
      });
      logger.info({ email: job.email }, "Verification email sent");
    } catch (error) {
      logger.error(
        { email: job.email, err: error },
        "Failed to send verification email"
      );
    }
  }

  processing = false;
}

export class EmailService {
  static queueVerificationEmail(email: string, token: number): void {
    if (process.env.NODE_ENV === "test") {
      return;
    }

    queue.push({ email, token });
    setImmediate(() => {
      processQueue().catch((error) => {
        logger.error({ err: error }, "Email queue processing failed");
      });
    });
  }
}
