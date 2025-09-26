import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema()
export class Education {
  @Prop({ default: uuidv4 })
  id: string; // UUID

  @Prop({ required: true })
  degree: string;

  @Prop({ required: true })
  institution: string;

  @Prop()
  startYear?: number;

  @Prop()
  endYear?: number;
}
export const EducationSchema = SchemaFactory.createForClass(Education);

@Schema()
export class Project {
  @Prop({ default: uuidv4 })
  id: string; // UUID

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  link?: string;
}
export const ProjectSchema = SchemaFactory.createForClass(Project);

@Schema()
export class SocialLinks {
  @Prop({ default: uuidv4 })
  id: string; // UUID

  @Prop()
  github?: string;

  @Prop()
  linkedin?: string;

  @Prop()
  twitter?: string;

  @Prop()
  website?: string;
}
export const SocialLinksSchema = SchemaFactory.createForClass(SocialLinks);

export type ProfileDocument = Profile & Document;

@Schema({ timestamps: true })
export class Profile {
  @Prop({ unique: true, default: uuidv4 })
  id: string; // main profile UUID

  @Prop({ required: true })
  user_id: string; // link to User

  @Prop({ required: true })
  name: string;

  // ✅ New fields
  @Prop()
  title?: string; // Professional title

  @Prop()
  location?: string; // City, Country

  @Prop()
  avatar?: string; // Profile picture URL

  @Prop()
  experience?: string; // "4+ years" or similar

  @Prop()
  availability?: string; // "Available" | "Busy" | "Open to work"

  // Existing fields
  @Prop({ type: [EducationSchema], default: [] })
  education: Education[];

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ type: [ProjectSchema], default: [] })
  projects: Project[];

  @Prop({ type: SocialLinksSchema, default: () => ({}) })
  socialLinks: SocialLinks;

  @Prop()
  about?: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
