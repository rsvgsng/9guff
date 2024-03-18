import mongoose from "mongoose";


export interface UserSchemaDTO {
    username: string;
    pincode: string;
    joinedDate?: Date;
    lastActive?: Date;
    isSuperAdmin: boolean;
    isUserActive?: boolean;
    _id: string;
    profileImageUrl?: string;
    coolDown?: Date;
    postCoolDown?: Date;
}


export interface UserSchema extends mongoose.Document {
    username: string;
    pincode: string;
    isSuperAdmin: boolean;
    profileImageUrl?: string;
    _id: string;
    isUserActive?: boolean;
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
    isSuperAdmin: { type: Boolean, default: false },
    coolDown: { type: Date, default: null },
    isUserActive: { type: Boolean, default: true },
    profileImageUrl: { type: String, default: 'default.png' },
    postCoolDown: { type: Date, default: null }
});



