import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schemas/message.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { Profile, ProfileSchema } from '../profile/schemas/profile.schema';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MessageGateway } from './message.gateway';
import { AuthModule } from '../auth/auth.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
      { name: Profile.name, schema: ProfileSchema }
    ]),
    AuthModule,
    ProfileModule
  ],
  providers: [MessageService, MessageGateway],
  controllers: [MessageController],
  exports: [MessageService],
})
export class MessageModule {}
