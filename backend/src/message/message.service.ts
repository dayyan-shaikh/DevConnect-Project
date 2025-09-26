import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { User } from '../auth/schemas/user.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  /**
   * Create a new message
   */
  async create(dto: CreateMessageDto) {
    const created = new this.messageModel({
      senderId: dto.senderId,
      receiverId: dto.receiverId,
      content: dto.content,
      isRead: false,
    });
    return created.save();
  }

  /**
   * Get conversation between two users ordered ascending by createdAt.
   * Optional cursor-based pagination via `before` (message _id).
   */
  async getConversation(
    userA: string,
    userB: string,
    limit = 50,
    before?: string,
  ) {
    const filter: any = {
      $or: [
        { senderId: userA, receiverId: userB },
        { senderId: userB, receiverId: userA },
      ],
    };

    if (before) {
      // messages with _id < before (older)
      filter._id = { $lt: new Types.ObjectId(before) };
    }

    const msgs = await this.messageModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return msgs.reverse(); // return ascending (oldest -> newest)
  }

  /**
   * Get simple conversation list (partners + last message) for a user.
   * Returns most recent message for each conversation partner.
   */
  async getConversationsForUser(userId: string, limit = 50) {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          $or: [
            { senderId: userId },
            { receiverId: userId },
          ],
        },
      },
      {
        $project: {
          senderId: 1,
          receiverId: 1,
          content: 1,
          createdAt: 1,
          partner: {
            $cond: [
              { $eq: ['$senderId', userId] },
              '$receiverId',
              '$senderId',
            ],
          },
        },
      },
      { $sort: { createdAt: -1 as const } },
      {
        $group: {
          _id: '$partner',
          lastMessage: { $first: '$$ROOT' },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 as const } },
      { $limit: limit },
    ];

    const results = await this.messageModel.aggregate(pipeline).exec();
    
    // Get all partner user IDs
    const partnerIds = results.map(r => r._id);
    
    // Fetch all partner users in one query
    const partners = await this.userModel.find(
      { user_id: { $in: partnerIds } },
      { user_id: 1, name: 1 }
    ).lean();
    
    // Create a map of user_id to user data for quick lookup
    const partnerMap = new Map(partners.map(user => [user.user_id, user]));
    
    // Map the results with partner information
    return results.map((r) => {
      const partner = partnerMap.get(r._id);
      return {
        partnerId: r._id, // Using MongoDB _id as the identifier
        partnerName: partner?.name || 'Unknown User',
        lastMessage: r.lastMessage,
      };
    });
  }

  /**
   * Mark all messages as read between sender and receiver
   */
  async markAsReadBetween(senderId: string, receiverId: string) {
    await this.messageModel.updateMany(
      {
        senderId: senderId,
        receiverId: receiverId,
        isRead: false,
      },
      { $set: { isRead: true } },
    );
  }

  /**
   * Mark single message as read
   */
  async markMessageRead(messageId: string) {
    const res = await this.messageModel.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true },
    );
    if (!res) throw new NotFoundException('Message not found');
    return res;
  }
}
