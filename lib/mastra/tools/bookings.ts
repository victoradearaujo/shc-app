import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Helper: convert a YYYY-MM-DD string to a local-midnight Date range [start, end)
function dateStringToRange(dateStr: string): { start: Date; end: Date } {
  const [year, month, day] = dateStr.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  const end = new Date(year, month - 1, day + 1);
  return { start, end };
}

const bookingSelect = {
  id: true,
  bookingDate: true,
  bookingTime: true,
  status: true,
  estimatedPrice: true,
  finalPrice: true,
  notes: true,
  client: { select: { id: true, firstName: true, lastName: true, phone: true } },
  vehicle: { select: { id: true, make: true, model: true, vehicleType: true } },
  service: { select: { id: true, name: true } },
} as const;

export const listTodaysBookings = createTool({
  id: 'listTodaysBookings',
  description: 'List all bookings scheduled for today',
  inputSchema: z.object({}),
  execute: async () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const today = `${y}-${m}-${d}`;

    const { start, end } = dateStringToRange(today);

    const bookings = await prisma.booking.findMany({
      where: { bookingDate: { gte: start, lt: end } },
      orderBy: { bookingTime: 'asc' },
      select: bookingSelect,
    });
    return { date: today, count: bookings.length, bookings };
  },
});

export const listBookingsByDate = createTool({
  id: 'listBookingsByDate',
  description: 'List all bookings for a specific date',
  inputSchema: z.object({
    date: z.string().describe('Date in YYYY-MM-DD format'),
  }),
  execute: async (inputData) => {
    const { start, end } = dateStringToRange(inputData.date);

    const bookings = await prisma.booking.findMany({
      where: { bookingDate: { gte: start, lt: end } },
      orderBy: { bookingTime: 'asc' },
      select: bookingSelect,
    });
    return { date: inputData.date, count: bookings.length, bookings };
  },
});

export const createBooking = createTool({
  id: 'createBooking',
  description: 'Create a new booking',
  inputSchema: z.object({
    clientId: z.string().describe('Client ID'),
    vehicleId: z.string().describe('Vehicle ID'),
    serviceId: z.string().describe('Service ID'),
    date: z.string().describe('Date in YYYY-MM-DD format'),
    time: z.string().optional().describe('Time in HH:MM format (optional)'),
    notes: z.string().optional().describe('Optional notes'),
  }),
  execute: async (inputData) => {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: inputData.vehicleId },
      select: { vehicleType: true },
    });
    const service = await prisma.service.findUnique({
      where: { id: inputData.serviceId },
      select: { priceHatchSedan: true, priceSuv: true, price4x4: true },
    });

    if (!vehicle || !service) {
      return { error: 'Vehicle or service not found' };
    }

    let estimatedPrice = service.priceHatchSedan;
    if (vehicle.vehicleType === 'suv') estimatedPrice = service.priceSuv;
    if (vehicle.vehicleType === '4x4') estimatedPrice = service.price4x4;

    const [year, month, day] = inputData.date.split('-').map(Number);
    const bookingDate = new Date(year, month - 1, day);

    const booking = await prisma.booking.create({
      data: {
        clientId: inputData.clientId,
        vehicleId: inputData.vehicleId,
        serviceId: inputData.serviceId,
        bookingDate,
        bookingTime: inputData.time || null,
        notes: inputData.notes || null,
        status: 'booked',
        estimatedPrice,
      },
      select: bookingSelect,
    });

    return { success: true, booking };
  },
});

export const updateBookingStatus = createTool({
  id: 'updateBookingStatus',
  description:
    'Update a booking status. Actions: "start" (booked→in_progress), "complete" (in_progress→completed), "cancel" (booked/in_progress→cancelled)',
  inputSchema: z.object({
    bookingId: z.string().describe('Booking ID'),
    action: z.enum(['start', 'complete', 'cancel']).describe('Action to perform'),
    finalPrice: z.number().optional().describe('Final price (only for complete action)'),
    cancelReason: z.string().optional().describe('Reason for cancellation (only for cancel action)'),
  }),
  execute: async (inputData) => {
    const statusMap: Record<'start' | 'complete' | 'cancel', string> = {
      start: 'in_progress',
      complete: 'completed',
      cancel: 'cancelled',
    };
    const newStatus = statusMap[inputData.action];

    const data: Record<string, unknown> = { status: newStatus };
    if (inputData.action === 'complete' && inputData.finalPrice !== undefined) {
      data.finalPrice = inputData.finalPrice;
    }
    if (inputData.action === 'cancel' && inputData.cancelReason) {
      data.cancellationReason = inputData.cancelReason;
    }

    const booking = await prisma.booking.update({
      where: { id: inputData.bookingId },
      data,
      select: bookingSelect,
    });

    return { success: true, booking };
  },
});
