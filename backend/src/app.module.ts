// app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://dayyanshaikh16:Dayyan%403890@cluster0.jhhyf.mongodb.net/devconnect'),
    AuthModule,
    ProfileModule,
    MessageModule,
  ],
})
export class AppModule {}