import mongoose from "mongoose";


export interface UserSchemaDTO {
    username: string;
    pincode: string;
    joinedDate?: Date;
    lastActive?: Date | any;
    isSuperAdmin: boolean;
    isUserActive?: boolean;
    bio?: string;
    _id: string;
    profileImageUrl?: string;
    coverImage?: string;
    coolDown?: Date;
    postCoolDown?: Date;
}


export interface UserSchema extends mongoose.Document {
    username: string;
    pincode: string;
    isSuperAdmin: boolean;
    profileImageUrl?: string;
    _id: string;
    bio?: string;
    isUserActive?: boolean;
    coverImage?: string;
    joinedDate?: Date;
    lastActive?: Date;
    coolDown?: Date;
    postCoolDown?: Date;
}

export const Users = new mongoose.Schema<UserSchema>({
    username: { type: String, required: true, unique: true },
    pincode: { type: String, required: true },
    joinedDate: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
    bio: { type: String, default: null },
    coverImage: { type: String, default: 'default.png' },
    isSuperAdmin: { type: Boolean, default: false },
    coolDown: { type: Date, default: null },
    isUserActive: { type: Boolean, default: true },
    profileImageUrl: { type: String, default: 'default.png' },
    postCoolDown: { type: Date, default: null }
});



