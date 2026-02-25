import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const listServices = createTool({
  id: 'listServices',
  description:
    'List all active services with their prices for each vehicle type (hatch/sedan, SUV, 4x4)',
  inputSchema: z.object({}),
  execute: async () => {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        priceHatchSedan: true,
        priceSuv: true,
        price4x4: true,
        isExtra: true,
      },
    });
    return { services };
  },
});
