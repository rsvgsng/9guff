import mongoose from "mongoose";


export interface UserSchemaDTO {
    username: string;
    pincode: string;
    joinedDate?: Date;
    lastActive?: Date;
    _id: string;
    profileImageUrl?: string;
}


export interface UserSchema extends mongoose.Document {
    username: string;
    pincode: string;
    profileImageUrl?: string;
    _id: string;
    joinedDate?: Date;
    lastActive?: Date;
}

export const Users = new mongoose.Schema<UserSchema>({
    username: { type: String, required: true },
    pincode: { type: String, required: true },
    joinedDate: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
    profileImageUrl: { type: String, default: 'default.png' }
});



