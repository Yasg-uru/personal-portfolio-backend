import { NextFunction, Request, Response } from "express";
import { Transporter } from "../util/sendmail.util";
class NotificationController {
  public async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, message, name } = req.body;
      const mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.NOTIFICATION_EMAIL || "yashpawar12122004@gmail.com", // Replace with your email
        subject: `New Message from ${name}`,
        text: message, // Plain text fallback
        html: `
              <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
                  <h1 style="margin: 0;">New Message Received</h1>
                </div>
                <div style="padding: 20px;">
                  <h2 style="color: #4CAF50;">Details</h2>
                  <p><strong>From:</strong> ${name} (${email})</p>
                  <p><strong>Message:</strong></p>
                  <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; font-size: 14px; color: #555;">
                    ${message}
                  </div>
                </div>
                <footer style="background-color: #f4f4f4; color: #666; padding: 10px 20px; text-align: center; font-size: 12px;">
                  <p style="margin: 0;">This message was sent from your portfolio contact form.</p>
                  <p style="margin: 0;">&copy; ${new Date().getFullYear()} Your Portfolio. All Rights Reserved.</p>
                </footer>
              </div>
            `,
      };
      await Transporter.sendMail(mailOptions);
      res.status(200).json({
        message: "message send successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
export default new NotificationController();
