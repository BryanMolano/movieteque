import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController
{
  constructor(private readonly dataSource: DataSource)
  {
  }

  // Liveness: el proceso responde. No toca la base de datos.
  @Get()
  live()
  {
    return { status: 'ok' };
  }

  // Readiness: además, la base responde. Úsalo a mano o en despliegues.
  @Get('db')
  async db()
  {
    try
    {
      await Promise.race([
        this.dataSource.query('SELECT 1'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
      ]);
      return { status: 'ok', db: 'ok' };
    }
    catch
    {
      throw new ServiceUnavailableException({ status: 'error', db: 'down' });
    }
  }
}
