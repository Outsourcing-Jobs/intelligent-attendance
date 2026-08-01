import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Config, ConfigDocument } from './schemas/config.schema';

@Injectable()
export class ConfigService {
  constructor(
    @InjectModel(Config.name) private configModel: Model<ConfigDocument>,
  ) {}

  async getByKey(key: string) {
    const config = await this.configModel.findOne({ key, isActive: true }).lean();
    if (!config) throw new NotFoundException('Config không tồn tại');
    return this.parseValue(config);
  }

  async getByGroup(group: string) {
    const configs = await this.configModel.find({ group, isActive: true }).lean();
    return configs.map((c) => this.parseValue(c));
  }

  async getAll() {
    const configs = await this.configModel.find({ isActive: true }).lean();
    return configs.map((c) => this.parseValue(c));
  }

  async upsert(key: string, value: any, type = 'string', group = 'general', description?: string) {
    const updated = await this.configModel.findOneAndUpdate(
      { key },
      { value, type, group, description },
      { upsert: true, new: true },
    ).lean();
    return this.parseValue(updated);
  }

  private parseValue(config: any) {
    switch (config.type) {
      case 'number':
        return { ...config, value: Number(config.value) };
      case 'boolean':
        return { ...config, value: Boolean(config.value) };
      case 'json':
        return { ...config, value: config.value };
      default:
        return config;
    }
  }
}
