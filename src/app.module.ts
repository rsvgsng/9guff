import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './Auth/auth.module';
import { postModule } from './Posts/post.module';
import { MainModule } from './Main/main.module';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/9guff'),
    AuthModule,
    postModule,
    MainModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
