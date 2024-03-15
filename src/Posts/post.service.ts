import { Injectable, NotAcceptableException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PostSchema, PostSchemaDTO } from "src/Models/post.model";
import { requestobjectdto } from "src/dto/requestobject.dto";
import { SuccessDTO } from "src/dto/response.dto";
import { generateRandomId } from "src/utils/generaterandomid.util";
import * as fs from 'fs'
import { commentDTO } from "src/dto/comment.dto";
import { NotificationsSchema } from "src/Models/notifications.model";
@Injectable()
export class postService {

    constructor(
        @InjectModel('Posts')
        private PostModel: Model<PostSchema>,
        @InjectModel('Notifications')
        private NotificationModel: Model<NotificationsSchema>
    ) { }
    async newPost(post: PostSchemaDTO, file: Express.Multer.File, posttype: 'text' | 'audio' | 'image', req: requestobjectdto): Promise<SuccessDTO | NotAcceptableException> {
        try {
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
                if (post.content.length < 10) throw new NotAcceptableException("Content must be at least 10 characters long.");
                if (post.content.length > 5000) throw new NotAcceptableException("Content must be less than 5000 characters long.");
                post.user = req.user;
                post.title = post.title ? post.title : null;
                post.postID = generateRandomId(20);
                const newPost = new this.PostModel(post);
                console.log(newPost)
                await newPost.save();
                return new SuccessDTO("Post created successfully.");
            }

            if (posttype == 'image') {
                if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg') throw new NotAcceptableException("Invalid file type. Only jpeg, jpg and png files are allowed.");
                if (file.size > 5000000) throw new NotAcceptableException("File size must be less than 5mb.");
                if (post.title.length <= 0 && post.content.length <= 0) {
                    throw new NotAcceptableException("Either title or content is required to create a post.");
                }
                if (post.title.length > 100) throw new NotAcceptableException("Title must be less than 100 characters long.");
                if (post.content.length < 10) throw new NotAcceptableException("Content must be at least 10 characters long.");
                if (post.content.length > 5000) throw new NotAcceptableException("Content must be less than 5000 characters long.");
                post.user = req.user;
                post.title = post.title ? post.title : null;
                post.content = post.content ? post.content : null;
                post.postID = generateRandomId(20);
                if (!fs.existsSync('uploads')) {
                    fs.mkdirSync('uploads');
                }
                let randomFileName = generateRandomId(22);
                let fileExtension = file.mimetype.split('/')[1];
                let fileName = randomFileName + '.' + fileExtension;
                let filePath = 'uploads/' + fileName;
                fs.writeFileSync(filePath, file.buffer);
                post.photoUrl = fileName;
                const newPost = new this.PostModel(post);
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
                post.user = req.user;
                post.title = post.title ? post.title : null;
                post.userDP = post.content = post.content ? post.content : null;
                post.postID = generateRandomId(20);
                if (!fs.existsSync('uploads')) {
                    fs.mkdirSync('uploads');
                }
                let randomFileName = generateRandomId(22);
                let fileExtension = file.mimetype.split('/')[1];
                let fileName = randomFileName + '.' + fileExtension;
                let filePath = 'uploads/' + fileName;
                fs.writeFileSync(filePath, file.buffer);
                post.audioUrl = fileName;
                post.audioLength = post.audioLength;
                const newPost = new this.PostModel(post);
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
            throw new NotAcceptableException(error.message);
        }
    }
    async replyToComment(
        reply: commentDTO,
        req: requestobjectdto,
        commentID: string
    ): Promise<SuccessDTO | NotAcceptableException> {
        try {
            if (Object.keys(reply).length === 0) throw new NotAcceptableException("Reply cannot be empty.")
            let a = await this.PostModel.findOne({
                "comments._id": commentID
            }).select('comments postID')
            if (!a) throw new NotAcceptableException("Comment not found.")
            let comment = a.comments.find(x => x._id.toString() === commentID)
            console.log(comment)
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
            throw new NotAcceptableException(error.message);
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
            let posts = await this.PostModel.find({}).select("-reactions  -comments ").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec();

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
}