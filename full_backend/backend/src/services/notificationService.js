import Notification from "../models/Notification.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendNotification = async (userId, notificationData) => {
  try {
    const notification = new Notification({
      userId,
      ...notificationData
    });

    await notification.save();
    return notification;
  } catch (err) {
    console.error("Error sending notification:", err);
  }
};

export const sendEmailNotification = async (email, subject, message) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html: message
    });
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

export const sendSlackNotification = async (webhookUrl, message) => {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message })
    });

    return response.ok;
  } catch (err) {
    console.error("Error sending Slack notification:", err);
  }
};

export const getNotificationsForUser = async (userId, unreadOnly = false) => {
  try {
    let query = { userId };
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return notifications;
  } catch (err) {
    console.error("Error fetching notifications:", err);
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true, readAt: new Date() },
      { new: true }
    );

    return notification;
  } catch (err) {
    console.error("Error marking notification as read:", err);
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    await Notification.findByIdAndDelete(notificationId);
  } catch (err) {
    console.error("Error deleting notification:", err);
  }
};
