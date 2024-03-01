import { Injectable, NotAcceptableException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { NotificationsSchema } from "src/Models/notifications.model";
import { PostSchema } from "src/Models/post.model";
import { requestobjectdto } from "src/dto/requestobject.dto";
import { SuccessDTO } from "src/dto/response.dto";

@Injectable()
export class MainService {
    constructor(
        @InjectModel('Notifications')
        private NotificationModel: Model<NotificationsSchema>,
        @InjectModel('Posts')
        private PostModel: Model<PostSchema>
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
            let noti = await this.NotificationModel.find({ owner: req.user }).sort({ createdAt: -1 }).limit(10);
            let x = []
            console.log(noti);
            noti.map((n) => {
                if (n.actionBy.length === 0) return
                x.push
                    ({
                        type: n.NotificationType,
                        message: this.formatNotification(n.actionBy),
                        postID: n.postID,
                        time: n.actionBy[n.actionBy.length - 1]?.actionAt,
                        isSeen: n.isSeen
                    })
            });

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
            let post = await this.PostModel.find({ category: catID }).sort({ createdAt: -1 }).limit(10)
                .select('-comments')
            return new SuccessDTO('Posts retrieved successfully', post);
        } catch (error) {
            throw new NotAcceptableException('Error retrieving posts');
        }
    }

}