import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // 1. Obtenemos la URL (con un fallback de seguridad para asegurar que nunca sea undefined)
    const connectionString = process.env.DATABASE_URL;
    
    // 2. Creamos el pool de conexión nativo de Postgres
    const pool = new Pool({ 
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      }
    });
    
    // 3. Lo envolvemos en el adaptador de Prisma
    const adapter = new PrismaPg(pool);

    // 4. Inicializamos Prisma pasándole EXCLUSIVAMENTE el adaptador, como exige la v7
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}