import { Injectable, NotAcceptableException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PostSchema, PostSchemaDTO } from "src/Models/post.model";
import { requestobjectdto } from "src/dto/requestobject.dto";
import { SuccessDTO } from "src/dto/response.dto";
import { badWords, generateRandomId } from "src/utils/generaterandomid.util";
import * as fs from 'fs'
import { commentDTO } from "src/dto/comment.dto";
import { File, FormData } from "formdata-node"

import { NotificationsSchema } from "src/Models/notifications.model";
import { UserSchema } from "src/Models/users.model";



@Injectable()
export class postService {
    constructor(
        @InjectModel('Posts')
        private PostModel: Model<PostSchema>,
        @InjectModel('Notifications')
        private NotificationModel: Model<NotificationsSchema>,
        @InjectModel('Users')
        private UserModel: Model<UserSchema>
    ) { }



    async newPost(post: PostSchemaDTO, file: Express.Multer.File, posttype: 'text' | 'audio' | 'image', req: requestobjectdto): Promise<SuccessDTO | NotAcceptableException> {
        try {

            let coolDownCheck = await this.UserModel.findOne({ username: req.user }).select('coolDown')
            let userActiveCheck = await this.UserModel.findOne({ username: req.user }).select('isUserActive')

            if (coolDownCheck.coolDown > new Date()) {
                throw new NotAcceptableException("You are on a cool down. Please try again later after " + coolDownCheck.coolDown.toLocaleTimeString() + ".")
            }
            if (!userActiveCheck.isUserActive) {
                throw new NotAcceptableException("Your account is currently disabled. Please contact support.")
            }

            let cats = ['a_feeling', 'a_confusion', 'a_problem', 'a_pain', 'an_experience', 'a_habit', 'others']

            if (post.category && !cats.includes(post.category))
                throw new NotAcceptableException("Invalid category.")

            if (posttype !== 'text' && posttype !== 'audio' && posttype !== 'image')
                throw new NotAcceptableException("Invalid post type.")

            if (posttype === 'audio' && !file)
                throw new NotAcceptableException("Audio post must have an attachment.")

            if (posttype === 'image' && !file)
                throw new NotAcceptableException("Image post must have an attachment.")

            if (posttype === 'text' && file)
                throw new NotAcceptableException("Text post cannot have an attachment.")
            if (posttype === 'text') {
                if (post.title.length <= 0 && post.content.length <= 0) {
                    throw new NotAcceptableException("Basic fields are required to create a post.");
                }
                if (post.title.length > 100) throw new NotAcceptableException("Title must be less than 100 characters long.");
                if (post.content.length < 5) throw new NotAcceptableException("Content must be at least 5 characters long.");
                if (post.content.length > 5000) throw new NotAcceptableException("Content must be less than 5000 characters long.");
                if (badWords.some(word => post.content.includes(word)) || badWords.some(word => post.title.includes(word))) {
                    post.isNSFW = true;
                }
                post.user = req.user;
                post.title = post.title ? post.title : null;
                post.postID = generateRandomId(20);
                post.content = post.content ? post.content : null;
                const newPost = new this.PostModel(post);
                await newPost.save();
                fetch('https://ntfy.sh/confess24channel', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: `
                    New post by ${req.user},
                    Title: ${post.title ? post.title : 'No title'},
                    Content: ${post.content},
                    Created at: ${new Date().toLocaleString()},                    
               `
                })
                return new SuccessDTO("Post created successfully.");
            }

            if (posttype == 'image') {
                if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg') throw new NotAcceptableException("Invalid file type. Only jpeg, jpg and png files are allowed.");
                if (file.size > 5000000) throw new NotAcceptableException("File size must be less than 5mb.");
                if (post.title.length <= 0 && post.content.length <= 0) {
                    throw new NotAcceptableException("Either title or content is required to create a post.");
                }
                if (post.title.length > 100) throw new NotAcceptableException("Title must be less than 100 characters long.");
                if (post.content.length < 5) throw new NotAcceptableException("Content must be at least 5 characters long.");
                if (post.content.length > 5000) throw new NotAcceptableException("Content must be less than 5000 characters long.");
                if (badWords.some(word => post.content.includes(word)) || badWords.some(word => post.title.includes(word))) {
                    post.isNSFW = true;
                }
                post.user = req.user;
                post.title = post.title ? post.title : null;
                post.content = post.content ? post.content : null;
                post.postID = generateRandomId(20);
                let fileImage = file.buffer
                let form = new FormData()
                const filex = new File([fileImage], file.originalname, { type: file.mimetype })
                form.append('image', filex)
                try {
                    let a = await fetch('http://localhost:8080/nsfw', {
                        method: 'POST',
                        body: form
                    })
                    let b = await a.json()
                    if (!b) throw new NotAcceptableException("Error with internal verification. Please try again later.")
                    if (b[0]?.className === 'Porn' && b[1]?.className === 'Sexy' || b[1]?.className === 'Hentai') {
                        await this.UserModel.findOneAndUpdate({ username: req.user }, { coolDown: new Date(Date.now() + 1800000) })
                        throw new NotAcceptableException("Congratulations you have received 30 mins cool down! .The image you were trying to upload was against our community guidelines.")
                    }
                    if (b[0]?.className === 'Drawing' && b[1]?.className === 'Hentai' || b[1]?.className === 'Sexy') {
                        await this.UserModel.findOneAndUpdate({ username: req.user }, { coolDown: new Date(Date.now() + 1800000) })
                        throw new NotAcceptableException("Congratulations you have received 30 mins cool down! .The image you were trying to upload was against our community guidelines")
                    }

                } catch (error) {
                    throw error
                }
                if (!fs.existsSync('Uploads')) {
                    fs.mkdirSync('Uploads');
                }
                let randomFileName = generateRandomId(22);
                let fileExtension = file.mimetype.split('/')[1];
                let fileName = randomFileName + '.' + fileExtension;
                let filePath = 'Uploads/' + fileName;
                fs.writeFileSync(filePath, file.buffer);
                post.photoUrl = fileName;
                const newPost = new this.PostModel(post);
                fetch('https://ntfy.sh/confess24channel', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: `
                        New post by ${req.user},
                        Title: ${post.title ? post.title : 'No title'},
                        Content: ${post.content},
                        Image: https://confessapi.unicomate.com/api/storage/${fileName},
                        Created at: ${new Date().toLocaleString()},                    
                   `
                })
                await newPost.save();
                return new SuccessDTO("Post created successfully.");
            }

            if (posttype == 'audio') {
                if (file.mimetype !== 'audio/mpeg' && file.mimetype !== 'audio/webm') throw new NotAcceptableException("Invalid file type. Only webm files are allowed.");
                if (post.title.length <= 0 && post.content.length <= 0) {
                    throw new NotAcceptableException("Either title or content is required to create a post.");
                }

                if (post.title.length > 100) throw new NotAcceptableException("Title must be less than 100 characters long.");
                if (post.content.length < 5) throw new NotAcceptableException("Content must be at least 5 characters long.");
                if (post.content.length > 5000) throw new NotAcceptableException("Content must be less than 5000 characters long.");
                if (badWords.some(word => post.content.includes(word)) || badWords.some(word => post.title.includes(word))) {
                    post.isNSFW = true;
                }
                post.user = req.user;
                post.title = post.title ? post.title : null;
                post.content = post.content = post.content ? post.content : null;
                post.postID = generateRandomId(20);
                if (!fs.existsSync('Uploads')) {
                    fs.mkdirSync('Uploads');
                }
                let randomFileName = generateRandomId(22);
                let fileExtension = file.mimetype.split('/')[1];
                let fileName = randomFileName + '.' + fileExtension;
                let filePath = 'Uploads/' + fileName;
                fs.writeFileSync(filePath, file.buffer);
                post.audioUrl = fileName;
                post.audioLength = post.audioLength;
                const newPost = new this.PostModel(post);
                fetch('https://ntfy.sh/confess24channel', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: `
                    User: ${req.user},
                    Title: ${post.title ? post.title : 'No title'},
                    Content: ${post.content},
                    Created at: ${new Date().toLocaleString()},                    
               `
                })
                await newPost.save();
                return new SuccessDTO("Post created successfully.");
            }


        } catch (error) {
            console.log(error)
            throw new NotAcceptableException(error.message);
        }

    }






    async newComment(
        comment: commentDTO,
        req: requestobjectdto,
        postID: string
    ): Promise<SuccessDTO | NotAcceptableException> {
        try {
            let isUserBan = await this.UserModel.findOne({ username: req.user }).select('isUserActive')
            if (!isUserBan.isUserActive) throw new NotAcceptableException("Your account is currently disabled. Please contact support.")
            if (Object.keys(comment).length === 0) throw new NotAcceptableException("Comment cannot be empty.")
            let post = await this.PostModel.findOne({
                postID: postID
            })
            if (!post) throw new NotAcceptableException("Post not found.")
            post.comments.push({
                user: req.user,

                comment: comment.comment,
            })
            await post.save();
            let noti = await this.NotificationModel.findOne({
                owner: post.user,
                postID: postID,
                isSeen: false,
                NotificationType: 'comment'
            })
            if (req.user !== post.user) {
                if (!noti) {
                    const newNoti = new this.NotificationModel({
                        owner: post.user,
                        postID: postID,
                        NotificationType: 'comment',
                        actionBy: [{
                            user: req.user,
                            action: 'commented'
                        }]
                    })
                    await newNoti.save();
                } else {
                    noti.actionBy.push({
                        user: req.user,
                        action: 'commented'
                    })
                    await noti.save();
                }
            }
            return new SuccessDTO('', post);
        } catch (error) {
            throw error
        }
    }
    async replyToComment(
        reply: commentDTO,
        req: requestobjectdto,
        commentID: string
    ): Promise<SuccessDTO | NotAcceptableException> {
        try {
            let isUserBan = await this.UserModel.findOne({ username: req.user }).select('isUserActive')
            if (!isUserBan.isUserActive) throw new NotAcceptableException("Your account is currently disabled. Please contact support.")
            if (Object.keys(reply).length === 0) throw new NotAcceptableException("Reply cannot be empty.")
            let a = await this.PostModel.findOne({
                "comments._id": commentID
            }).select('comments postID')
            if (!a) throw new NotAcceptableException("Comment not found.")
            let comment = a.comments.find(x => x._id.toString() === commentID)
            if (!comment) throw new NotAcceptableException("Comment not found.")
            if (comment.user !== req.user) {
                let newNoti = new this.NotificationModel({
                    owner: comment.user,
                    postID: a.postID,
                    NotificationType: 'replied',
                    actionBy: [{
                        user: req.user,
                        action: 'replied'
                    }]
                })
                await newNoti.save();
            }
            comment.replies.push({
                user: req.user,
                comment: reply.comment,

            })
            await a.save();
            return new SuccessDTO('ok', a);
        } catch (error) {
            throw error
        }
    }

    async getSinglePost(
        req: requestobjectdto,
        postID: string,
        type: 'comments' | 'reactions' | 'post',
    ): Promise<SuccessDTO | NotAcceptableException> {
        // Make notification seen todo 
        if (type == 'post') {
            try {
                let post = await this.PostModel.findOne({
                    postID: postID
                }).select('-reactedBy -__v -comments ')

                if (!post) throw new NotAcceptableException("Post not found.")
                let totalReactions = post.reactions.crazy + post.reactions.love + post.reactions.haha + post.reactions.wow + post.reactions.sad + post.reactions.angry;
                post.reactionCount = totalReactions;
                post.views = post.views + 1;
                await post.save();
                post.reactions = undefined;
                return new SuccessDTO('ok', post);
            } catch (error) {
                throw new NotAcceptableException(error.message);

            }
        }

        if (type == 'reactions') {
            try {
                let post = await this.PostModel.findOne({
                    postID: postID
                }).select('-comments -__v -content -title -photoUrl -audioUrl -user -postID -createdAt -updatedAt -views -audioLength -reactedBy -reactionCount -category ')
                if (!post) throw new NotAcceptableException("Post not found.")

                return new SuccessDTO('ok', post);
            } catch (error) {
                throw new NotAcceptableException(error.message);
            }
        }
        if (type == 'comments') {
            try {
                let post = await this.PostModel.findOne({
                    postID: postID
                }).select('-reactions -__v -content -title -photoUrl -audioUrl -user -postID -createdAt -updatedAt -views -audioLength -reactedBy -reactionCount -category ')
                if (!post) throw new NotAcceptableException("Post not found.")

                return new SuccessDTO('ok', post);
            } catch (error) {
                throw new NotAcceptableException(error.message);
            }
        }

        return new NotAcceptableException("Invalid type.")

    }

    async reactPost(
        req: requestobjectdto,
        postID: string,
        reaction: 'crazy' | 'love' | 'haha' | 'wow' | 'sad' | 'angry'
    ): Promise<SuccessDTO | NotAcceptableException> {
        try {

            let isUserBan = await this.UserModel.findOne({ username: req.user }).select('isUserActive')
            if (!isUserBan.isUserActive) throw new NotAcceptableException("Your account is currently disabled. Please contact support.")
            let reactionx = ['crazy', 'love', 'haha', 'wow', 'sad', 'angry']
            if (!reactionx.includes(reaction)) throw new NotAcceptableException("Invalid reaction.")

            let post = await this.PostModel.findOne({
                postID: postID
            })
            if (!post) throw new NotAcceptableException("Post not found.")

            let noti = await this.NotificationModel.findOne({
                owner: post.user,
                postID: postID,
                NotificationType: 'reacted'
            })
            let isReacated = post.reactedBy.find(x => x.user === req.user)

            if (isReacated) {
                if (isReacated.reaction === reaction) {
                    post.reactions[reaction] = post.reactions[reaction] - 1;
                    post.reactedBy = post.reactedBy.filter(x => x.user !== req.user)
                    await post.save()
                    let notiDelete = await this.NotificationModel.findOne({
                        owner: post.user,
                        postID: postID,
                        NotificationType: 'reacted',
                    })
                    notiDelete.actionBy = notiDelete?.actionBy?.filter(x => x.user !== req.user)
                    await notiDelete.save();
                    return new SuccessDTO('ok');
                }

                post.reactions[isReacated.reaction] = post.reactions[isReacated.reaction] - 1;
                post.reactions[reaction] = post.reactions[reaction] + 1;
                post.reactedBy = post.reactedBy.filter(x => x.user !== req.user)
                post.reactedBy.push({
                    user: req.user,
                    reaction: reaction
                })

                if (!noti) {
                    const newNoti = new this.NotificationModel({
                        owner: post.user,
                        postID: postID,
                        NotificationType: 'reacted',
                        actionBy: [{
                            user: req.user,
                            action: 'reacted'
                        }]
                    })
                    await newNoti.save();
                    return
                }
                await post.save()
                return new SuccessDTO('ok');
            }
            post.reactions[reaction] = post.reactions[reaction] + 1;
            post.reactedBy.push({
                user: req.user,
                reaction: reaction
            })

            if (!noti) {
                const newNoti = new this.NotificationModel({
                    owner: post.user,
                    postID: postID,
                    NotificationType: 'reacted',
                    actionBy: [{
                        user: req.user,
                        action: 'reacted'
                    }]
                })
                await newNoti.save();
            } else {
                noti.actionBy.push({
                    user: req.user,
                    action: 'reacted'
                })
                await noti.save();
            }
            await post.save();
            return new SuccessDTO('ok');
        } catch (error) {
            console.log(error)

            throw new NotAcceptableException(error.message);
        }
    }



    async getFeed(
        page: number,
        limit: number
    ): Promise<SuccessDTO | NotAcceptableException> {
        try {
            const count = await this.PostModel.countDocuments({}).exec();
            let posts = await this.PostModel.find({
                isVisible: true
            }).select("-reactions  -comments ").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec();

            posts = posts.map(post => {
                post.reactionCount = post.reactedBy?.length;
                post.reactedBy = undefined;
                if (post.content && post.content.length > 100) {
                    post.content = post.content.substring(0, 100) + "..."; // Trim and add ellipsis
                }
                return post;
            });
            return new SuccessDTO('ok', {
                posts: posts,
                count: count
            });
        } catch (error) {
            throw new NotAcceptableException(error.message);
        }
    }



    async getAllPostsAdmin(
        page: number,
        limit: number
    ): Promise<SuccessDTO | NotAcceptableException> {

        {
            try {
                const count = await this.PostModel.countDocuments({}).exec();
                let posts = await this.PostModel.find({}).select("-reactions  -comments -reactedBy -content ").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec();
                return new SuccessDTO('ok', {
                    posts: posts,
                    count: count
                });


            } catch (error) {

            }
        }
    }



    async getAllUsersAdmin(
        page: number,
        limit: number

    ): Promise<SuccessDTO | NotAcceptableException> {

        {
            try {
                const count = await this.UserModel.countDocuments({}).exec();
                let users = await this.UserModel.find({}).select(" -__v").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec();
                return new SuccessDTO('ok', {
                    users: users,
                    count: count
                });
            } catch (error) {

            }
        }
    }

    async deletePostAdmin(
        id: string,
        action: 'delete' | 'hide' | 'isnsfw'
    ): Promise<SuccessDTO | NotAcceptableException> {
        try {
            if (action !== 'delete' && action !== 'hide'
                && action !== 'isnsfw'
            ) throw new NotAcceptableException("Invalid action.")
            if (action === 'delete') {
                let post = await this.PostModel.findOne({ postID: id })
                if (!post) throw new NotAcceptableException("Post not found.")
                await this.NotificationModel.deleteMany({ postID: id })
                await post.deleteOne();
                return new SuccessDTO(`Post deleted successfully.`);
            }
            if (action === 'hide') {
                let post = await this.PostModel.findOne({ postID: id })
                if (!post) throw new NotAcceptableException("Post not found.")
                post.isVisible = !post.isVisible;
                await post.save();
                return new SuccessDTO(`Post ${post.isVisible ? 'restored' : 'hidden'} successfully.`);
            }
            if (action === 'isnsfw') {
                let post = await this.PostModel.findOne({ postID: id })
                if (!post) throw new NotAcceptableException("Post not found.")
                post.isNSFW = !post.isNSFW;
                await post.save();
                return new SuccessDTO(`Post ${post.isNSFW ? 'marked as NSFW' : 'unmarked as NSFW'} successfully.`);
            }
        } catch (error) {
            throw error
        }
    }


    async giveCoolDown(
        id: string,
        action: 'ban' | 'cooldown'
    ): Promise<SuccessDTO | NotAcceptableException> {
        try {
            if (action !== 'ban' && action !== 'cooldown') throw new NotAcceptableException("Invalid action.")
            if (action == 'cooldown') {
                let user = await this.UserModel.findOne({ username: id });
                if (!user) throw new NotAcceptableException("User not found.")
                let coolDown = new Date(Date.now() + 3600000);
                user.coolDown = coolDown;
                await user.save();
                return new SuccessDTO(`User ${id} has been given a 1 hour cool down.`);
            }

            if (action == 'ban') {
                let user = await this.UserModel.findOne({ username: id })
                if (!user) throw new NotAcceptableException("User not found.")
                user.isUserActive = !user.isUserActive;
                await user.save();
                return new SuccessDTO(`User ${id} has been ${user.isUserActive ? 'unbanned' : 'banned'}.`);
            }

        } catch (error) {
            throw error
        }
    }


}