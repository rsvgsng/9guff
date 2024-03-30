import mongoose from "mongoose";


export interface PostSchemaDTO {
    title?: string;
    content?: string;
    user?: string;
    createdAt?: Date;
    category?: string;
    isAnonymous?: boolean;
    disableComments?: boolean;
    photoUrl?: string;
    reactedBy?: {
        user?: string;
        reaction?: string;
    }[];
    audioLength?: string;
    userDP: string;
    isVisible?: boolean;
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
    videoUrl: string;
    reactionCount?: number;
    commentCount?: number;
    isNSFW: boolean;
    comments?: {
        user?: string;
        comment?: string;
        _id?: string;
        replies?: {
            user?: string;
            comment?: string;
            createdAt?: Date;
        }[];
        createdAt?: Date;
    }[];
}
export interface PostSchema extends mongoose.Document {
    isVisible?: boolean;
    title?: string;
    content?: string;
    postID?: string;
    user?: string;
    isAnonymous?: boolean;
    disableComments?: boolean;
    createdAt?: Date;
    category?: string;
    photoUrl?: string;
    audioLength?: string;
    userDP: string;
    commentCount?: number;
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
    loli: any;
    videoUrl: string;
    reactionCount?: number;

    isNSFW?: boolean;
    comments?: {
        user?: string;
        comment?: string;
        _id?: string;
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
    audioLength: { type: String, default: null },
    audioUrl: { type: String, default: null },
    videoUrl: { type: String, default: null },
    category: { type: String, required: true },
    userDP: { type: String, required: false },
    reactedBy: [{
        user: { type: String, required: true },
        reaction: { type: String, required: true }
    }],
    isNSFW: { type: Boolean, default: false },
    reactionCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    postID: { type: String, required: true },

    isVisible: { type: Boolean, default: true },
    disableComments: { type: Boolean, default: false },
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
    isAnonymous: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    comments: [{
        user: { type: String, required: false },
        comment: { type: String, required: false },
        createdAt: { type: Date, default: Date.now },

        replies: [{
            user: { type: String, required: false },
            comment: { type: String, required: false },
            createdAt: { type: Date, default: Date.now }
        }]
    }]
});