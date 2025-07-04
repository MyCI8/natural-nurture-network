import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock Supabase auth endpoints
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        role: 'authenticated',
      },
    });
  }),

  // Mock API endpoints
  http.get('*/rest/v1/remedies', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Test Remedy',
        summary: 'Test remedy summary',
        status: 'published',
      },
    ]);
  }),

  http.get('*/rest/v1/experts', () => {
    return HttpResponse.json([
      {
        id: '1',
        full_name: 'Dr. Test Expert',
        title: 'Medical Doctor',
        bio: 'Test expert bio',
      },
    ]);
  }),

  http.get('*/rest/v1/videos', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'Test Video',
        description: 'Test video description',
        status: 'published',
      },
    ]);
  }),
];