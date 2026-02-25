import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';

import { listServices } from '../tools/services';
import { listAllClients, getClientInfo } from '../tools/clients';
import {
  listTodaysBookings,
  listBookingsByDate,
  createBooking,
  updateBookingStatus,
} from '../tools/bookings';

export const assistantAgent = new Agent({
  id: 'sunshine-assistant',
  name: 'Sunshine Hot Cars Assistant',
  instructions:
    'You are a business assistant for Sunshine Hot Cars, a car detailing business. You help the owner quickly look up bookings, clients, and services, and perform simple actions like creating bookings or updating their status. Be concise and practical. Format responses clearly — use bullet points or tables for lists. Do not answer questions unrelated to the business.',
  model: anthropic('claude-haiku-4-5-20251001'),
  tools: {
    listServices,
    listAllClients,
    getClientInfo,
    listTodaysBookings,
    listBookingsByDate,
    createBooking,
    updateBookingStatus,
  },
});
