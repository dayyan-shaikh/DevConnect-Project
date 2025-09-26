import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { Logger } from '@nestjs/common';
  import { MessageService } from './message.service';
  import { CreateMessageDto } from './dto/create-message.dto';
  
  @WebSocketGateway({
    cors: {
      origin: '*', // tighten in production
    },
    namespace: '/', // default namespace
  })
  export class MessageGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger = new Logger('MessageGateway');
  
    // map of userId -> socketId
    private online = new Map<string, string>();
  
    constructor(private readonly messageService: MessageService) {}
  
    afterInit(server: Server) {
      this.logger.log('Gateway initialized');
    }
  
    handleConnection(client: Socket) {
      this.logger.log(`Client connected: ${client.id}`);
      // Expect client to emit 'identify' with userId after connecting
      client.on('identify', (userId: string) => {
        if (!userId) return;
        this.online.set(userId, client.id);
        client.data.userId = userId;
        this.logger.log(`User ${userId} mapped to socket ${client.id}`);
      });
    }
  
    handleDisconnect(client: Socket) {
      const userId = client.data.userId;
      if (userId && this.online.get(userId) === client.id) {
        this.online.delete(userId);
        this.logger.log(`User ${userId} disconnected and removed from online map`);
      }
    }
  
    /**
     * sendMessage: expects { senderId, receiverId, content }
     * Server saves the message and emits 'message' to receiver if online.
     */
    @SubscribeMessage('sendMessage')
  async onSendMessage(@MessageBody() payload: any, @ConnectedSocket() client: Socket) {
    
    // Parse the payload if it's a string
    let parsedPayload: any;
    if (typeof payload === 'string') {
      try {
        parsedPayload = JSON.parse(payload);
      } catch (error) {
        throw new Error('Invalid payload format');
      }
    } else {
      parsedPayload = payload;
    }
    
    
    // Extract internal fields and clean the payload
    const isNewMessage = parsedPayload._isNew === true;
    const tempId = parsedPayload._tempId || parsedPayload._id;
    const timestamp = parsedPayload._timestamp || Date.now();
    
    // Clean up internal fields before processing
    const { _isNew, _tempId, _timestamp, ...cleanPayload } = parsedPayload;
    
    // Use the clean payload as message data
    const messageData: CreateMessageDto = {
      ...cleanPayload,
      // Preserve the temp ID in the response
      ...(tempId && { _tempId: tempId })
    };
    
    
    // Validate required fields
    if (!messageData.senderId || !messageData.receiverId || !messageData.content) {
      throw new Error('Missing required fields: senderId, receiverId, or content');
    }
      
      // In production, verify messageData.senderId === authenticated user
    const saved = await this.messageService.create(messageData);
    

    // Prepare the response with the saved message
    const response = {
      ...saved.toObject(),
      // Preserve the temp ID if this was a new message
      ...(tempId && { _tempId: tempId }),
      // Add the server timestamp
      _serverTimestamp: new Date()
    };
    

    // Only emit to the receiver if they are online and it's not the sender
    if (messageData.receiverId !== messageData.senderId) {
      const recSocketId = this.online.get(messageData.receiverId);
      if (recSocketId) {
            this.server.to(recSocketId).emit('message', response);
      } else {
      }
    } else {
    }

    // Always send the saved message back to the sender
    // The frontend will use the _tempId to update the message
    console.log('Sending response to sender');
    return response;
    }
  
    // allow client to fetch online map or status if needed
    @SubscribeMessage('isOnline')
    handleIsOnline(@MessageBody() userId: string) {
      return { userId, online: this.online.has(userId) };
    }
  }
  