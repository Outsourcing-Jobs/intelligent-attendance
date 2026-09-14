import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint for Render/Kubernetes' })
  getHealth() {
    return {
      status: 'ok',
      service: 'intelligent-attendance-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Root ping endpoint' })
  getRoot() {
    return {
      service: 'Intelligent Attendance API',
      status: 'online',
      version: '1.0.0',
      docs: '/api/docs',
    };
  }
}
