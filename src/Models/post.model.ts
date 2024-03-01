import mongoose from "mongoose";


export interface PostSchemaDTO {
    title?: string;
    content?: string;
    user?: string;
    createdAt?: Date;
    category?: string;
    photoUrl?: string;
    reactedBy?: {
        user?: string;
        reaction?: string;
    }[];
    audioUrl?: string;
    postID?: string;
    reactions?: {
        crazy?: number;
        love?: number;
        haha?: number;
        wow?: number;
        sad?: number;
        angry?: number;
    };
    views?: number;
    comments?: {
        user?: string;
        comment?: string;
        commentID?: string;

        replies?: {
            user?: string;
            comment?: string;
            createdAt?: Date;
        }[];
        createdAt?: Date;
    }[];
}
export interface PostSchema extends mongoose.Document {
    title?: string;
    content?: string;
    postID?: string;
    user?: string;
    createdAt?: Date;
    category?: string;
    photoUrl?: string;
    audioUrl?: string;
    reactions?: {
        crazy?: number;
        love?: number;
        haha?: number;
        wow?: number;
        sad?: number;
        angry?: number;
    };
    views?: number;
    reactedBy?: {
        user?: string;
        reaction?: string;
    }[];
    comments?: {
        user?: string;
        comment?: string;
        commentID?: string;
        replies?: {
            user?: string;
            comment?: string;
        }[];
        createdAt?: Date;
    }[];
}

export const Posts = new mongoose.Schema<PostSchema>({
    title: { type: String, required: false },
    photoUrl: { type: String, default: null },
    audioUrl: { type: String, default: null },
    category: { type: String, required: true },
    reactedBy: [{
        user: { type: String, required: true },
        reaction: { type: String, required: true }
    }],
    postID: { type: String, required: true, unique: true },
    content: {
        type: String,
        required: true
    },
    user: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },

    reactions: {
        crazy: { type: Number, default: 0 },
        love: { type: Number, default: 0 },
        haha: { type: Number, default: 0 },
        wow: { type: Number, default: 0 },
        sad: { type: Number, default: 0 },
        angry: { type: Number, default: 0 }
    },
    views: { type: Number, default: 0 },
    comments: [{
        user: { type: String, required: true },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        commentID: { type: String, required: false, unique: true },
        replies: [{
            user: { type: String, required: true },
            comment: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }]
    }]
});