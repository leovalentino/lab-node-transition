import fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { PrismaClient } from '@prisma/client';

// Load environment variables
const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

const server = fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

// POST /logs route
server.post(
  '/logs',
  {
    schema: {
      body: Type.Object({
        ip: Type.String(),
        userAgent: Type.String(),
      }),
      response: {
        201: Type.Object({
          id: Type.Number(),
          ip: Type.String(),
          timestamp: Type.String(),
          userAgent: Type.String(),
        }),
      },
    },
  },
  async (request, reply) => {
    const { ip, userAgent } = request.body;
    
    // Use async/await to avoid blocking the Event Loop
    const accessLog = await prisma.accessLog.create({
      data: {
        ip,
        userAgent,
        timestamp: new Date(),
      },
    });
    
    reply.code(201);
    return {
      id: accessLog.id,
      ip: accessLog.ip,
      timestamp: accessLog.timestamp.toISOString(),
      userAgent: accessLog.userAgent,
    };
  }
);

// GET /stats route
server.get(
  '/stats',
  {
    schema: {
      response: {
        200: Type.Array(
          Type.Object({
            userAgent: Type.String(),
            count: Type.Number(),
          })
        ),
      },
    },
  },
  async () => {
    // Group by userAgent and count using Prisma's query
    // Use async/await to avoid blocking the Event Loop
    const stats = await prisma.accessLog.groupBy({
      by: ['userAgent'],
      _count: {
        userAgent: true,
      },
      orderBy: {
        _count: {
          userAgent: 'desc',
        },
      },
    });
    
    return stats.map((stat) => ({
      userAgent: stat.userAgent,
      count: stat._count.userAgent,
    }));
  }
);

const start = async () => {
  try {
    await server.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Fastify server running on http://localhost:3001');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  await server.close();
  process.exit(0);
});
