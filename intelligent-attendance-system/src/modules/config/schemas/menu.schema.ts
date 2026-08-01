import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MenuDocument = Menu & Document;

@Schema({ timestamps: true, collection: 'menus' })
export class Menu {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;

  @Prop()
  icon: string;

  @Prop({ type: Types.ObjectId, ref: 'Menu', default: null })
  parentId: Types.ObjectId | null;

  @Prop({ default: 0 })
  order: number;

  @Prop({ type: [String], default: [] })
  roles: string[];

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ default: true })
  isActive: boolean;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
