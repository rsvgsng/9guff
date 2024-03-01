import mongoose from "mongoose";

export interface NotificationDTO {

    NotificationType: 'reaction' | 'comment';
    owner: string;
    postID: string;
    message?: string;
    actionBy?: {
        user?: string;
        action?: string;
        actionAt?: Date;
    }[];
    isSeen?: boolean;
}

export interface NotificationsSchema extends mongoose.Document {
    NotificationType: 'reaction' | 'comment';
    owner: string;
    message?: string;
    postID: string;
    actionBy?: {
        user?: string;
        action?: string;
        actionAt?: Date;
    }[];
    isSeen?: boolean;
}

export const Notifications = new mongoose.Schema<NotificationsSchema>({
    NotificationType: { type: String, required: true },
    owner: { type: String, required: true },
    message: { type: String, required: false },
    postID: { type: String, required: false },
    actionBy: [{
        user: { type: String },
        action: { type: String },
        actionAt: { type: Date, default: Date.now }
    }],
    isSeen: { type: Boolean, default: false }
})