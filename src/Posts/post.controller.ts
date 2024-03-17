import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { postService } from "./post.service";
import { PostSchemaDTO } from "src/Models/post.model";
import { AuthGuard, SuperAuthGarud } from "src/gaurds/Authgaurd.gaurd";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { requestobjectdto } from "src/dto/requestobject.dto";
import { commentDTO } from "src/dto/comment.dto";

@Controller("posts")
export class PostController {
    constructor(
        private readonly postService: postService
    ) { }

    @UseGuards(AuthGuard)
    @Post("newPost")
    @UseInterceptors(FileInterceptor('file'))
    async newPost(
        @Body() post: PostSchemaDTO,
        @Req() req: requestobjectdto,
        @Query("posttype") posttype: 'text' | 'audio' | 'image',
        @UploadedFile() file: Express.Multer.File
    ) {
        return this.postService.newPost(post, file, posttype, req);

    }

    @UseGuards(AuthGuard)
    @Put("comment/:id")
    async comment(
        @Body() comment: commentDTO,
        @Req() req: requestobjectdto,
        @Param("id") id: string

    ) {
        return this.postService.newComment(comment, req, id);
    }


    @UseGuards(AuthGuard)
    @Put("comment/reply/:id")
    async replyToComment(
        @Body() reply: commentDTO,
        @Req() req: requestobjectdto,
        @Param("id") CommentID: string
    ) {
        return this.postService.replyToComment(reply, req, CommentID);
    }

    @UseGuards(AuthGuard)
    @Put("reactPost/:id/:reaction")
    async reactPost(
        @Req() req: requestobjectdto,
        @Param("id") id: string,
        @Param("reaction") reaction: 'crazy' | 'love' | 'haha' | 'wow' | 'sad' | 'angry'
    ) {
        return this.postService.reactPost(req, id, reaction);
    }

    @UseGuards(AuthGuard)
    @Get("singlePost/:id")
    async singlePost(
        @Req() req: requestobjectdto,
        @Param("id") id: string,
        @Query("type") type: 'comments' | 'reactions' | 'post',
    ) {
        return this.postService.getSinglePost(req, id, type);
    }


    @Get("feed")
    async getFeed(
        @Query("page") page: number,
        @Query("limit") limit: number
    ) {
        return this.postService.getFeed(page, limit)
    }


    // SuperAdmin Routes


    @UseGuards(SuperAuthGarud)
    @Get("allPosts")
    async allPosts(
        @Query("page") page: number,
        @Query("limit") limit: number
    ) {
        return this.postService.getAllPostsAdmin(page, limit)
    }

    @UseGuards(SuperAuthGarud)
    @Get("allUsers")
    async allUsers(
        @Query("page") page: number,
        @Query("limit") limit: number
    ) {
        return this.postService.getAllUsersAdmin(page, limit)

    }

    @UseGuards(SuperAuthGarud)
    @Delete("deletePost/:id")
    async deletePost(
        @Param("id") id: string,
        @Query("action") query: 'delete' | 'hide'
    ) {
        return this.postService.deletePostAdmin(id, query);
    }


    @UseGuards(SuperAuthGarud)
    @Put('coolDown/:id')
    async giveCoolDown(
        @Param("id") id: string,
        @Query("action") query: 'ban' | 'cooldown'
    ) {
        return this.postService.giveCoolDown(id, query);
    }

}