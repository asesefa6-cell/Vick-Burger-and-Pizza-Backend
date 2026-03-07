import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';

jest.mock('../src/modules/reporting/reports.service', () => ({
  getDailyReport: jest.fn(async (businessId: string) => ({
    businessId,
    date: '2026-03-06T00:00:00.000Z',
    totalOrders: 5,
    totalRevenue: '125.00',
    ordersPerTable: [],
    topItems: [],
    orderStatusSummary: { Pending: 2, Preparing: 1, Ready: 1, Delivered: 1 },
  })),
  getWeeklyOrMonthlyReport: jest.fn(async (businessId: string, period: 'weekly' | 'monthly') => ({
    businessId,
    period,
    startDate: '2026-03-01T00:00:00.000Z',
    endDate: '2026-03-06T23:59:59.999Z',
    totalOrders: 25,
    totalRevenue: '560.00',
    trends: [],
    topItems: [],
    orderStatusSummary: { Pending: 5, Preparing: 3, Ready: 2, Delivered: 15 },
  })),
  getOrderStatusSummary: jest.fn(async (businessId: string) => ({
    businessId,
    startDate: '2026-03-01T00:00:00.000Z',
    endDate: '2026-03-06T23:59:59.999Z',
    statusCounts: { Pending: 5, Preparing: 3, Ready: 2, Delivered: 15 },
  })),
  getBusinessPerformance: jest.fn(async (businessId: string) => ({
    businessId,
    totalRevenue: '560.00',
    totalOrders: 25,
    tableUtilization: [],
  })),
}));

const secret = 'test-secret';
process.env.JWT_SECRET = secret;

const makeToken = (role: string, businessId?: string) =>
  jwt.sign({ userId: 'user-1', role, businessId }, secret, { expiresIn: '1h' });

const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });
const bizId = '1c7b8a14-2d7b-4b7d-9c7c-2b77edc8b2c3';

describe('Reporting APIs', () => {
  it('returns daily report for admin', async () => {
    const token = makeToken('Admin', bizId);
    const res = await request(app)
      .get('/reports/daily')
      .set(authHeader(token))
      .query({ businessId: bizId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.businessId).toBe(bizId);
  });

  it('blocks access without token', async () => {
    const res = await request(app).get('/reports/daily').query({ businessId: bizId });
    expect(res.status).toBe(401);
  });

  it('blocks access for waiter role', async () => {
    const token = makeToken('Waiter', bizId);
    const res = await request(app)
      .get('/reports/daily')
      .set(authHeader(token))
      .query({ businessId: bizId });

    expect(res.status).toBe(403);
  });

  it('blocks access for mismatched business', async () => {
    const token = makeToken('Admin', 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa');
    const res = await request(app)
      .get('/reports/daily')
      .set(authHeader(token))
      .query({ businessId: bizId });

    expect(res.status).toBe(403);
  });

  it('returns weekly report', async () => {
    const token = makeToken('Manager', bizId);
    const res = await request(app)
      .get('/reports/weekly')
      .set(authHeader(token))
      .query({ businessId: bizId });

    expect(res.status).toBe(200);
    expect(res.body.data.period).toBe('weekly');
  });

  it('returns monthly report', async () => {
    const token = makeToken('Admin', bizId);
    const res = await request(app)
      .get('/reports/monthly')
      .set(authHeader(token))
      .query({ businessId: bizId });

    expect(res.status).toBe(200);
    expect(res.body.data.period).toBe('monthly');
  });

  it('returns order status summary', async () => {
    const token = makeToken('Manager', bizId);
    const res = await request(app)
      .get('/reports/order-status')
      .set(authHeader(token))
      .query({ businessId: bizId });

    expect(res.status).toBe(200);
    expect(res.body.data.statusCounts).toBeDefined();
  });
});
