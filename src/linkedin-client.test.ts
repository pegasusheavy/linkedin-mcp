import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { LinkedInClient } from './linkedin-client.js';
import { Logger } from './logger.js';

vi.mock('axios');

describe('LinkedInClient', () => {
  const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as unknown as Logger;

  let client: LinkedInClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new LinkedInClient('test-token', mockLogger);
  });

  describe('constructor', () => {
    it('should create axios client with correct config', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.linkedin.com/v2',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });
    });
  });

  describe('getProfile', () => {
    it('should fetch and return LinkedIn profile', async () => {
      const mockResponse = {
        data: {
          id: 'test-id',
          localizedFirstName: 'John',
          localizedLastName: 'Doe',
          headline: 'Software Engineer',
          vanityName: 'johndoe',
        },
      };

      const mockClient = {
        get: vi.fn().mockResolvedValue(mockResponse),
      };
      vi.mocked(axios.create).mockReturnValue(mockClient as any);
      client = new LinkedInClient('test-token', mockLogger);

      const profile = await client.getProfile();

      expect(mockClient.get).toHaveBeenCalledWith('/me');
      expect(profile).toEqual({
        id: 'test-id',
        firstName: 'John',
        lastName: 'Doe',
        headline: 'Software Engineer',
        vanityName: 'johndoe',
      });
    });

    it('should handle errors when fetching profile', async () => {
      const mockClient = {
        get: vi.fn().mockRejectedValue(new Error('API Error')),
      };
      vi.mocked(axios.create).mockReturnValue(mockClient as any);
      client = new LinkedInClient('test-token', mockLogger);

      await expect(client.getProfile()).rejects.toThrow('Failed to fetch LinkedIn profile');
    });

    it('should handle profile with nested name structure', async () => {
      const mockResponse = {
        data: {
          id: 'test-id',
          firstName: { localized: { en_US: 'Jane' } },
          lastName: { localized: { en_US: 'Smith' } },
        },
      };

      const mockClient = {
        get: vi.fn().mockResolvedValue(mockResponse),
      };
      vi.mocked(axios.create).mockReturnValue(mockClient as any);
      client = new LinkedInClient('test-token', mockLogger);

      const profile = await client.getProfile();

      expect(profile.firstName).toBe('Jane');
      expect(profile.lastName).toBe('Smith');
    });
  });

  describe('getPosts', () => {
    it('should fetch and return LinkedIn posts', async () => {
      const mockResponse = {
        data: {
          elements: [
            {
              id: 'post-1',
              author: 'urn:li:person:123',
              created: { time: 1234567890000 },
              specificContent: {
                'com.linkedin.ugc.ShareContent': {
                  shareCommentary: { text: 'Test post' },
                },
              },
              likesSummary: { totalLikes: 10 },
              commentsSummary: { totalComments: 5 },
              sharesSummary: { totalShares: 2 },
            },
          ],
        },
      };

      const mockClient = {
        get: vi.fn().mockResolvedValue(mockResponse),
      };
      vi.mocked(axios.create).mockReturnValue(mockClient as any);
      client = new LinkedInClient('test-token', mockLogger);

      const posts = await client.getPosts(10);

      expect(mockClient.get).toHaveBeenCalledWith('/ugcPosts', {
        params: {
          q: 'authors',
          authors: 'urn:li:person:me',
          count: 10,
        },
      });
      expect(posts).toHaveLength(1);
      expect(posts[0].text).toBe('Test post');
      expect(posts[0].likeCount).toBe(10);
    });

    it('should handle empty posts response', async () => {
      const mockResponse = { data: {} };

      const mockClient = {
        get: vi.fn().mockResolvedValue(mockResponse),
      };
      vi.mocked(axios.create).mockReturnValue(mockClient as any);
      client = new LinkedInClient('test-token', mockLogger);

      const posts = await client.getPosts();

      expect(posts).toEqual([]);
    });

    it('should handle errors when fetching posts', async () => {
      const mockClient = {
        get: vi.fn().mockRejectedValue(new Error('API Error')),
      };
      vi.mocked(axios.create).mockReturnValue(mockClient as any);
      client = new LinkedInClient('test-token', mockLogger);

      await expect(client.getPosts()).rejects.toThrow('Failed to fetch LinkedIn posts');
    });
  });

  describe('getConnections', () => {
    it('should fetch and return LinkedIn connections', async () => {
      const mockResponse = {
        data: {
          elements: [
            {
              id: 'conn-1',
              firstName: { localized: { en_US: 'Alice' } },
              lastName: { localized: { en_US: 'Johnson' } },
              headline: 'Product Manager',
            },
          ],
        },
      };

      const mockClient = {
        get: vi.fn().mockResolvedValue(mockResponse),
      };
      vi.mocked(axios.create).mockReturnValue(mockClient as any);
      client = new LinkedInClient('test-token', mockLogger);

      const connections = await client.getConnections(50);

      expect(mockClient.get).toHaveBeenCalledWith('/connections', {
        params: {
          q: 'viewer',
          start: 0,
          count: 50,
        },
      });
      expect(connections).toHaveLength(1);
      expect(connections[0].firstName).toBe('Alice');
    });

    it('should handle errors when fetching connections', async () => {
      const mockClient = {
        get: vi.fn().mockRejectedValue(new Error('API Error')),
      };
      vi.mocked(axios.create).mockReturnValue(mockClient as any);
      client = new LinkedInClient('test-token', mockLogger);

      await expect(client.getConnections()).rejects.toThrow('Failed to fetch LinkedIn connections');
    });
  });

  describe('sharePost', () => {
    it('should create and share a LinkedIn post', async () => {
      const mockProfileResponse = {
        data: {
          id: 'user-123',
          localizedFirstName: 'John',
          localizedLastName: 'Doe',
        },
      };

      const mockPostResponse = {
        data: {
          id: 'post-456',
        },
      };

      const mockClient = {
        get: vi.fn().mockResolvedValue(mockProfileResponse),
        post: vi.fn().mockResolvedValue(mockPostResponse),
      };
      vi.mocked(axios.create).mockReturnValue(mockClient as any);
      client = new LinkedInClient('test-token', mockLogger);

      const result = await client.sharePost('Test post content');

      expect(mockClient.post).toHaveBeenCalledWith('/ugcPosts', {
        author: 'urn:li:person:user-123',
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: 'Test post content',
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      });
      expect(result.id).toBe('post-456');
      expect(result.url).toContain('post-456');
    });

    it('should handle errors when sharing post', async () => {
      const mockClient = {
        get: vi.fn().mockRejectedValue(new Error('API Error')),
        post: vi.fn(),
      };
      vi.mocked(axios.create).mockReturnValue(mockClient as any);
      client = new LinkedInClient('test-token', mockLogger);

      await expect(client.sharePost('Test')).rejects.toThrow('Failed to create LinkedIn post');
    });
  });

  describe('searchPeople', () => {
    it('should search for people on LinkedIn', async () => {
      const mockResponse = {
        data: {
          elements: [
            {
              id: 'person-1',
              firstName: { localized: { en_US: 'Bob' } },
              lastName: { localized: { en_US: 'Smith' } },
              headline: 'Designer',
            },
          ],
        },
      };

      const mockClient = {
        get: vi.fn().mockResolvedValue(mockResponse),
      };
      vi.mocked(axios.create).mockReturnValue(mockClient as any);
      client = new LinkedInClient('test-token', mockLogger);

      const people = await client.searchPeople('designer', 10);

      expect(mockClient.get).toHaveBeenCalledWith('/search', {
        params: {
          q: 'people',
          keywords: 'designer',
          count: 10,
        },
      });
      expect(people).toHaveLength(1);
      expect(people[0].headline).toBe('Designer');
    });

    it('should handle errors when searching people', async () => {
      const mockClient = {
        get: vi.fn().mockRejectedValue(new Error('API Error')),
      };
      vi.mocked(axios.create).mockReturnValue(mockClient as any);
      client = new LinkedInClient('test-token', mockLogger);

      await expect(client.searchPeople('test')).rejects.toThrow('Failed to search LinkedIn people');
    });
  });
});

