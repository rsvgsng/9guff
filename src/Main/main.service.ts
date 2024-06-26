import { Injectable, NotAcceptableException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { NotificationsSchema } from "src/Models/notifications.model";
import { PostSchema } from "src/Models/post.model";
import { UserSchema, UserSchemaDTO } from "src/Models/users.model";
import { requestobjectdto } from "src/dto/requestobject.dto";
import { SuccessDTO } from "src/dto/response.dto";
import { generateRandomId } from "src/utils/generaterandomid.util";
import * as fs from 'fs'
import { File, FormData } from "formdata-node"

@Injectable()
export class MainService {

    constructor(
        @InjectModel('Notifications')
        private NotificationModel: Model<NotificationsSchema>,
        @InjectModel('Posts')
        private PostModel: Model<PostSchema>,
        @InjectModel('Users')
        private UserModel: Model<UserSchemaDTO>,
    ) { }

    formatNotification(actionBy?: {
        user?: string;
        action?: string;
        actionAt?: Date;
    }[]) {
        let len = actionBy.length;
        let recent = actionBy[len - 1];
        let recentAction = recent?.action;
        let recentUser = recent?.user;
        let message = '';
        if (recentAction === 'reacted') {
            if (len === 1) {
                message = `${recentUser} reacted to your post`
            } else if (len === 2) {
                message = `${recentUser} and ${actionBy[len - 2].user} reacted to your post`
            } else {
                message = `${recentUser}, ${actionBy[len - 2].user} and ${len - 2} others reacted to your post`
            }
        } else if (recentAction === 'commented') {
            if (len === 1) {
                message = `${recentUser} commented on your post`
            } else if (len === 2) {
                message = `${recentUser} and ${actionBy[len - 2].user} commented on your post`
            } else {
                message = `${recentUser}, ${actionBy[len - 2].user} and ${len - 2} others commented on your post`
            }
        } else if (recentAction === 'replied') {
            if (len === 1) {
                message = `${recentUser} replied to your comment`
            } else if (len === 2) {
                message = `${recentUser} and ${actionBy[len - 2].user} replied to your comment`
            } else {
                message = `${recentUser}, ${actionBy[len - 2].user} and ${len - 2} others replied to your comment`
            }
        }
        return message;
    }

    async getNotifications(req: requestobjectdto): Promise<SuccessDTO | NotAcceptableException> {
        try {
            let noti = await this.NotificationModel.find({ owner: req.user }).sort({ createdOn: -1 }).limit(20)
            let likedNotis = []
            let commentedNotis = []
            noti.map((n) => {
                if (n?.actionBy[0]?.action === 'reacted') {
                    likedNotis.push(n)
                } else {
                    commentedNotis.push(n)
                }
            })
            let x = {
                liked: likedNotis,
                commented: commentedNotis,
                unseenNotiCount: noti.filter((n) => !n.isSeen).length
            }
            delete req.user;
            return new SuccessDTO('Notifications retrieved successfully', x);
        } catch (error) {
            console.log(error);
            throw new NotAcceptableException('Error retrieving notifications');
        }
    }


    async getPostByCategory(req: requestobjectdto, catID: string): Promise<SuccessDTO | NotAcceptableException> {
        try {
            let cats = ['a_feeling', 'a_confusion', 'a_problem', 'a_pain', 'an_experience', 'a_habit', 'others']
            if (!cats.includes(catID)) {
                throw new NotAcceptableException('Invalid category');
            }
            let post = await this.PostModel.find({ category: catID }).sort({ createdAt: -1 }).select('').limit(10)
                .select('-comments')
            post = post.map(post => {
                post.reactionCount = post.reactedBy?.length;
                post.reactedBy = undefined;
                if (post.content && post.content.length > 100) {
                    post.content = post.content.substring(0, 100) + "..."; // Trim and add ellipsis
                }
                return post;
            });
            return new SuccessDTO('Posts retrieved successfully', post);
        } catch (error) {
            throw new NotAcceptableException('Error retrieving posts');
        }
    }

    async markAllAsRead(
        req: requestobjectdto
    ): Promise<SuccessDTO | NotAcceptableException> {
        try {
            let noti = await this.NotificationModel.find({ owner: req.user });
            if (!noti) {
                throw new NotAcceptableException('Something went wrong!');
            }
            noti.map((n) => {
                n.isSeen = true;
                n.save();
            })
            return new SuccessDTO('All notifications marked as seen successfully');
        } catch (error) {
            throw error
        }
    }

    async markSeenNoti(
        req: requestobjectdto,
        id: string
    ) {
        try {
            let noti = await this.NotificationModel.find({ owner: req.user });
            if (!noti) {
                throw new NotAcceptableException('Something went wrong!');
            }
            let notiIndex = noti.find((n) => n._id.toString() === id.toString());
            if (!notiIndex) {
                throw new NotAcceptableException('Notification not found');
            }
            notiIndex.isSeen = true;
            await notiIndex.save();
            return new SuccessDTO('Notification marked as seen successfully');
        } catch (error) {
            throw error
        }
    }

    async ping(
        req: requestobjectdto
    ): Promise<SuccessDTO | NotAcceptableException> {
        try {
            let p = await this.UserModel.findOne({ username: req.user })
            if (!p) throw new NotAcceptableException('Session Invalid');
            return new SuccessDTO('pong', {
                userName: p.username,
                id: p._id,
                userType: p.isSuperAdmin ? 'Admin' : 'User',
                userCoolDown: p.coolDown > new Date() ?
                    p.coolDown.getTime() - new Date().getTime()
                    : false,
                userBan: !p.isUserActive,
                userPremium: p.isPremium,
            });
        } catch (error) {
            throw error
        }
    }


    async getUserProfile(
        userID: string,
        type: 'details' | 'posts'
    ): Promise<SuccessDTO | NotAcceptableException> {

        try {

            if (type === 'details') {

                if (!userID.match(/^[0-9a-fA-F]{24}$/)) {
                    let user = await this.UserModel.findOne({ username: userID }).select('-pinCode');
                    if (!user) throw new NotAcceptableException();
                    let totalPostCount = await this.PostModel.find({ user: user.username }).sort({ createdAt: -1 }).countDocuments()
                    let recentlyActive = user.lastActive;
                    let userName = user.username;
                    let joinedDate = user.joinedDate
                    let isUserCoolDown = user.coolDown > new Date() ? user.coolDown.getTime() - new Date().getTime() : false;
                    let isUserBanned = !user.isUserActive;
                    let coverPic = user.coverImage;
                    let bio = user.bio
                    let post = {
                        totalPostCount,
                        bio,
                        isUserCoolDown,
                        coverPic,
                        isUserBanned,
                        recentlyActive,
                        userName,
                        joinedDate
                    }
                    return new SuccessDTO('User profile retrieved successfully', post);
                }

                let user = await this.UserModel.findOne({ _id: userID }).select('-pinCode');
                if (!user) throw new NotAcceptableException();
                let totalPostCount = await this.PostModel.find({ user: user.username }).sort({ createdAt: -1 }).limit(10).countDocuments()
                let recentlyActive = user.lastActive;
                let userName = user.username;
                let isUserBanned = !user.isUserActive;
                let bio = user.bio
                let coverPic = user.coverImage;
                let joinedDate = user.joinedDate
                let isUserCoolDown = user.coolDown > new Date() ? user.coolDown.getTime() - new Date().getTime() : false;
                let post = {
                    totalPostCount,
                    isUserBanned,
                    recentlyActive,
                    bio,
                    userName,
                    coverPic,
                    isUserCoolDown,
                    joinedDate
                }
                return new SuccessDTO('User profile retrieved successfully', post);
            }

            if (type === 'posts') {
                if (!userID.match(/^[0-9a-fA-F]{24}$/)) {
                    let user = await this.UserModel.findOne({ username: userID, }).select('-pinCode');
                    if (!user) throw new NotAcceptableException();
                    let totalPosts = await this.PostModel.find({ user: user.username, isVisible: true, isAnonymous: false }).sort({ createdAt: -1 }).select('-comments -reactions ')
                    totalPosts = totalPosts.map(post => {
                        post.reactionCount = post.reactedBy?.length;
                        post.reactedBy = undefined;
                        if (post.content && post.content.length > 100) {
                            post.content = post.content.substring(0, 100) + "..."; // Trim and add ellipsis
                        }
                        return post;
                    });
                    return new SuccessDTO('User profile posts retrieved successfully', totalPosts);
                }

                let user = await this.UserModel.findOne({ _id: userID }).select('-pinCode');
                if (!user) throw new NotAcceptableException();
                let totalPosts = await this.PostModel.find({ user: user.username, isVisible: true, isAnonymous: false }).sort({ createdAt: -1 }).select('-comments -reactions  -reactedBy')
                totalPosts = totalPosts.map(post => {
                    post.reactionCount = post.reactedBy?.length;
                    post.reactedBy = undefined;
                    if (post.content && post.content.length > 100) {
                        post.content = post.content.substring(0, 100) + "..."; // Trim and add ellipsis
                    }
                    return post;
                });
                return new SuccessDTO('User profile posts retrieved successfully', totalPosts);
            }

            return new SuccessDTO('Invalid type provided');

        } catch (error) {
            throw new NotAcceptableException('Error retrieving user profile');
        }
    }


    async changeDp(
        req: requestobjectdto,
        file: Express.Multer.File
    ): Promise<SuccessDTO | NotAcceptableException> {
        try {
            let a = await this.UserModel.findOne({ username: req.user })
            if (a.coolDown > new Date()) throw new NotAcceptableException('You cannot change your profile picture at the moment. You have a cool down period. Please try again later.')
            if (!a) throw new NotAcceptableException('User not found');
            if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg') throw new NotAcceptableException('Invalid file type png and jpg only');
            let randomFileName = a.username;
            if (file.size > 2000000) throw new NotAcceptableException('File size too large. Max file size is 2mb');
            let fileImage = file.buffer
            let form = new FormData()
            const filex = new File([fileImage], file.originalname, { type: file.mimetype })
            form.append('image', filex)
            try {
                let a = await fetch('http://localhost:8082/nsfw', {
                    method: 'POST',
                    body: form
                })
                let b = await a.json()
                console.log(b)
                if (!b) throw new NotAcceptableException("Error with internal verification. Please try again later.")

                if (b[0]?.className === 'Porn' || b[0]?.className === 'Sexy' || b[0]?.className === "Hentai") {
                    await this.UserModel.findOneAndUpdate({ username: req.user }, { coolDown: new Date(Date.now() + 600000) });
                    throw new NotAcceptableException("Congratulations you have received 10 mins cool down! .The image you were trying to upload was against our community guidelines.");
                }

            } catch (error) {
                throw error
            }
            let fileExtension = file.mimetype.split('/')[1];
            let fileName = randomFileName + '.' + fileExtension;
            if (!fs.existsSync('Uploads/dp')) {
                fs.mkdirSync('Uploads/dp', { recursive: true });
            }
            const profilePicturesFolder = 'Uploads/dp/';
            fs.readdir(profilePicturesFolder, async (err, files) => {
                if (err) {
                    return new NotAcceptableException('Error reading directory');
                }
                const filex = files.filter(filename => filename.startsWith(`${randomFileName}.`));
                if (filex.length > 0) {
                    filex.map(async (f) => {
                        fs.unlinkSync(profilePicturesFolder + f)
                        let filePath = 'Uploads/dp/' + fileName;

                        fs.writeFileSync(filePath, file.buffer);
                        a.profileImageUrl = fileName;
                        await a.save();
                    })

                }
                else {
                    let filePath = 'Uploads/dp/' + fileName;
                    fs.writeFileSync(filePath, file.buffer);
                    a.profileImageUrl = fileName;
                    await a.save();
                }
            })


            return new SuccessDTO('Profile picture changed successfully', { profileImageUrl: fileName });
        } catch (error) {
            console.log(error)
            throw error
        }
    }










    async changeCover(
        req: requestobjectdto,
        file: Express.Multer.File
    ): Promise<SuccessDTO | NotAcceptableException> {
        try {
            let a = await this.UserModel.findOne({ username: req.user })
            if (a.coolDown > new Date()) throw new NotAcceptableException('You cannot change your profile picture at the moment. You have a cool down period. Please try again later.')
            if (!a) throw new NotAcceptableException('User not found');
            if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg') throw new NotAcceptableException('Invalid file type png and jpg only');
            let randomFileName = generateRandomId(18);
            if (file.size > 2000000) throw new NotAcceptableException('File size too large. Max file size is 2mb');
            let fileImage = file.buffer
            let form = new FormData()
            const filex = new File([fileImage], file.originalname, { type: file.mimetype })
            form.append('image', filex)
            try {
                let a = await fetch('http://localhost:8082/nsfw', {
                    method: 'POST',
                    body: form
                })
                let b = await a.json()
                console.log(b)
                if (!b) throw new NotAcceptableException("Error with internal verification. Please try again later.")
                if (b[0]?.className === 'Porn' || b[0]?.className === 'Sexy' || b[0]?.className === 'Hentai') {
                    await this.UserModel.findOneAndUpdate({ username: req.user }, { coolDown: new Date(Date.now() + 600000) });
                    throw new NotAcceptableException("Congratulations you have received 10 mins cool down! .The image you were trying to upload was against our community guidelines.");
                }

            } catch (error) {
                throw error
            }
            let fileExtension = file.mimetype.split('/')[1];
            let fileName = randomFileName + '.' + fileExtension;
            if (!fs.existsSync('Uploads/cp')) {
                fs.mkdirSync('Uploads/cp', { recursive: true });
            }
            if (a.coverImage) {
                if (a.coverImage === "default.png") { } else {
                    fs.unlinkSync('Uploads/cp/' + a.coverImage);
                }
            }
            let filePath = 'Uploads/cp/' + fileName;
            fs.writeFileSync(filePath, file.buffer);
            a.coverImage = fileName;
            await a.save();
            return new SuccessDTO('Cover image updated Successfully');
        } catch (error) {
            console.log(error)
            throw error
        }
    }


    async getRecentlyActiveUsers(
        req: requestobjectdto
    ): Promise<SuccessDTO | NotAcceptableException> {
        try {
            let users = await this.UserModel.find({
                lastActive: {
                    $gt:
                        new Date(new Date().setDate(new Date().getDate() - 30))

                }
            })
                .select('lastActive  username')
                .sort({ lastActive: -1 })
                .limit(50);

            return new SuccessDTO('Recently active users retrieved successfully', users);
        } catch (error) {
            throw new NotAcceptableException('Error retrieving recently active users');
        }
    }

}