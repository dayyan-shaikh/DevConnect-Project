import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  senderId: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  receiverId: string;

  @IsString()
  @IsOptional()
  _tempId?: string;

  @IsOptional()
  _isNew?: boolean;

  @IsOptional()
  _timestamp?: number;
}
