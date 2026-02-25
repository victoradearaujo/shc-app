import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const listAllClients = createTool({
  id: 'listAllClients',
  description: 'List all clients with their name, phone, email, and vehicle count',
  inputSchema: z.object({}),
  execute: async () => {
    const clients = await prisma.client.findMany({
      orderBy: { firstName: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        _count: { select: { vehicles: true } },
      },
    });
    return { clients };
  },
});

export const getClientInfo = createTool({
  id: 'getClientInfo',
  description:
    'Look up a client by name (partial match on first or last name). Returns contact info and their vehicles.',
  inputSchema: z.object({
    name: z.string().describe('Client name to search for (partial match)'),
  }),
  execute: async (inputData) => {
    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { firstName: { contains: inputData.name } },
          { lastName: { contains: inputData.name } },
        ],
      },
      include: {
        vehicles: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            vehicleType: true,
            color: true,
            rego: true,
          },
        },
      },
    });
    if (clients.length === 0) {
      return { error: `No client found matching "${inputData.name}"` };
    }
    return { clients };
  },
});
