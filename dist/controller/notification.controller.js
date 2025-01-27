"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sendmail_util_1 = require("../util/sendmail.util");
class NotificationController {
    sendMessage(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
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
                yield sendmail_util_1.Transporter.sendMail(mailOptions);
                res.status(200).json({
                    message: "message send successfully",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new NotificationController();
