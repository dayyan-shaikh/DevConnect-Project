import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: String, required: true })
  senderId: string;

  @Prop({ type: String, required: true })
  receiverId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  isRead: boolean;
}

export type MessageDocument = Message & Document;
export const MessageSchema = SchemaFactory.createForClass(Message);