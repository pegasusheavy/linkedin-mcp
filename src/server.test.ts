import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { LinkedInMCPServer } from './server.js';
import { LinkedInClient } from './linkedin-client.js';

vi.mock('@modelcontextprotocol/sdk/server/index.js');
vi.mock('./linkedin-client.js');

describe('LinkedInMCPServer', () => {
  const validConfig = {
    linkedInAccessToken: 'test-token',
    logLevel: 'info' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should throw error if LinkedIn access token is missing', () => {
      const mockServer = {
        setRequestHandler: vi.fn(),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(Server).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const config = { ...validConfig, linkedInAccessToken: undefined };
      expect(() => new LinkedInMCPServer(config)).toThrow('LinkedIn access token is required');
    });

    it('should create server with LinkedIn client', () => {
      const mockServer = {
        setRequestHandler: vi.fn(),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(Server).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const server = new LinkedInMCPServer(validConfig);
      expect(LinkedInClient).toHaveBeenCalledWith('test-token', expect.anything());
    });

    it('should setup request handlers', () => {
      const mockServer = {
        setRequestHandler: vi.fn(),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(Server).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      new LinkedInMCPServer(validConfig);

      expect(mockServer.setRequestHandler).toHaveBeenCalledTimes(2);
    });
  });

  describe('tool registration', () => {
    it('should register LinkedIn tools', async () => {
      let listToolsHandler: any = null;
      const mockServer = {
        setRequestHandler: vi.fn((schema, handler) => {
          if (schema === ListToolsRequestSchema || (schema as any)?.method === 'tools/list') {
            listToolsHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(Server).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      new LinkedInMCPServer(validConfig);

      expect(listToolsHandler).not.toBeNull();
      const result = await listToolsHandler();

      expect(result.tools).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'get_linkedin_profile' }),
          expect.objectContaining({ name: 'get_linkedin_posts' }),
          expect.objectContaining({ name: 'get_linkedin_connections' }),
          expect.objectContaining({ name: 'share_linkedin_post' }),
          expect.objectContaining({ name: 'search_linkedin_people' }),
        ])
      );
      expect(result.tools).toHaveLength(18); // 5 basic + 13 profile management tools
    });
  });

  describe('tool handlers', () => {
    it('should handle get_linkedin_profile tool', async () => {
      let callToolHandler: any = null;
      const mockServer = {
        setRequestHandler: vi.fn((schema, handler) => {
          if (schema === CallToolRequestSchema || (schema as any)?.method === 'tools/call') {
            callToolHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(Server).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const mockProfile = {
        id: 'test-id',
        firstName: 'John',
        lastName: 'Doe',
      };
      const mockLinkedInClient = {
        getProfile: vi.fn().mockResolvedValue(mockProfile),
      };
      vi.mocked(LinkedInClient).mockImplementation(function(this: any) {
        return mockLinkedInClient;
      } as any);

      new LinkedInMCPServer(validConfig);

      expect(callToolHandler).not.toBeNull();
      const result = await callToolHandler({
        params: { name: 'get_linkedin_profile', arguments: {} },
      });

      expect(mockLinkedInClient.getProfile).toHaveBeenCalled();
      expect(result.content[0].text).toContain('test-id');
    });

    it('should handle errors in tool calls', async () => {
      let callToolHandler: any = null;
      const mockServer = {
        setRequestHandler: vi.fn((schema, handler) => {
          if (schema === CallToolRequestSchema || (schema as any)?.method === 'tools/call') {
            callToolHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(Server).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const mockLinkedInClient = {
        getProfile: vi.fn().mockRejectedValue(new Error('API Error')),
      };
      vi.mocked(LinkedInClient).mockImplementation(function(this: any) {
        return mockLinkedInClient;
      } as any);

      new LinkedInMCPServer(validConfig);

      expect(callToolHandler).not.toBeNull();
      const result = await callToolHandler({
        params: { name: 'get_linkedin_profile', arguments: {} },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error');
    });

    it('should handle unknown tool', async () => {
      let callToolHandler: any = null;
      const mockServer = {
        setRequestHandler: vi.fn((schema, handler) => {
          if (schema === CallToolRequestSchema || (schema as any)?.method === 'tools/call') {
            callToolHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(Server).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      new LinkedInMCPServer(validConfig);

      expect(callToolHandler).not.toBeNull();
      const result = await callToolHandler({
        params: { name: 'unknown_tool', arguments: {} },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown tool');
    });

    it('should validate required arguments', async () => {
      let callToolHandler: any = null;
      const mockServer = {
        setRequestHandler: vi.fn((schema, handler) => {
          if (schema === CallToolRequestSchema || (schema as any)?.method === 'tools/call') {
            callToolHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(Server).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      new LinkedInMCPServer(validConfig);

      expect(callToolHandler).not.toBeNull();
      const result = await callToolHandler({
        params: { name: 'share_linkedin_post', arguments: {} },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Text is required');
    });

    it('should handle get_linkedin_posts tool', async () => {
      let callToolHandler: any = null;
      const mockServer = {
        setRequestHandler: vi.fn((schema, handler) => {
          if (schema === CallToolRequestSchema || (schema as any)?.method === 'tools/call') {
            callToolHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(Server).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const mockPosts = [{ id: 'post-1', text: 'Test post' }];
      const mockLinkedInClient = {
        getPosts: vi.fn().mockResolvedValue(mockPosts),
      };
      vi.mocked(LinkedInClient).mockImplementation(function(this: any) {
        return mockLinkedInClient;
      } as any);

      new LinkedInMCPServer(validConfig);

      const result = await callToolHandler({
        params: { name: 'get_linkedin_posts', arguments: { limit: 5 } },
      });

      expect(mockLinkedInClient.getPosts).toHaveBeenCalledWith(5);
      expect(result.content[0].text).toContain('post-1');
    });

    it('should handle get_linkedin_connections tool', async () => {
      let callToolHandler: any = null;
      const mockServer = {
        setRequestHandler: vi.fn((schema, handler) => {
          if (schema === CallToolRequestSchema || (schema as any)?.method === 'tools/call') {
            callToolHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(Server).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const mockConnections = [{ id: 'conn-1', firstName: 'Jane', lastName: 'Doe' }];
      const mockLinkedInClient = {
        getConnections: vi.fn().mockResolvedValue(mockConnections),
      };
      vi.mocked(LinkedInClient).mockImplementation(function(this: any) {
        return mockLinkedInClient;
      } as any);

      new LinkedInMCPServer(validConfig);

      const result = await callToolHandler({
        params: { name: 'get_linkedin_connections', arguments: { limit: 25 } },
      });

      expect(mockLinkedInClient.getConnections).toHaveBeenCalledWith(25);
      expect(result.content[0].text).toContain('Jane');
    });

    it('should handle share_linkedin_post tool', async () => {
      let callToolHandler: any = null;
      const mockServer = {
        setRequestHandler: vi.fn((schema, handler) => {
          if (schema === CallToolRequestSchema || (schema as any)?.method === 'tools/call') {
            callToolHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(Server).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const mockResult = { id: 'post-123', url: 'https://linkedin.com/post/123' };
      const mockLinkedInClient = {
        sharePost: vi.fn().mockResolvedValue(mockResult),
      };
      vi.mocked(LinkedInClient).mockImplementation(function(this: any) {
        return mockLinkedInClient;
      } as any);

      new LinkedInMCPServer(validConfig);

      const result = await callToolHandler({
        params: { name: 'share_linkedin_post', arguments: { text: 'New post' } },
      });

      expect(mockLinkedInClient.sharePost).toHaveBeenCalledWith('New post');
      expect(result.content[0].text).toContain('post-123');
    });

    it('should handle search_linkedin_people tool', async () => {
      let callToolHandler: any = null;
      const mockServer = {
        setRequestHandler: vi.fn((schema, handler) => {
          if (schema === CallToolRequestSchema || (schema as any)?.method === 'tools/call') {
            callToolHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(Server).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const mockPeople = [{ id: 'person-1', firstName: 'Bob', lastName: 'Smith' }];
      const mockLinkedInClient = {
        searchPeople: vi.fn().mockResolvedValue(mockPeople),
      };
      vi.mocked(LinkedInClient).mockImplementation(function(this: any) {
        return mockLinkedInClient;
      } as any);

      new LinkedInMCPServer(validConfig);

      const result = await callToolHandler({
        params: { name: 'search_linkedin_people', arguments: { keywords: 'engineer', limit: 15 } },
      });

      expect(mockLinkedInClient.searchPeople).toHaveBeenCalledWith('engineer', 15);
      expect(result.content[0].text).toContain('Bob');
    });

    it('should require keywords for search_linkedin_people', async () => {
      let callToolHandler: any = null;
      const mockServer = {
        setRequestHandler: vi.fn((schema, handler) => {
          if (schema === CallToolRequestSchema || (schema as any)?.method === 'tools/call') {
            callToolHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(Server).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      new LinkedInMCPServer(validConfig);

      const result = await callToolHandler({
        params: { name: 'search_linkedin_people', arguments: {} },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Keywords are required');
    });
  });

  describe('start and stop', () => {
    it('should start server with transport', async () => {
      const mockServer = {
        setRequestHandler: vi.fn(),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(Server).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const server = new LinkedInMCPServer(validConfig);
      await server.start();

      expect(mockServer.connect).toHaveBeenCalled();
    });

    it('should stop server', async () => {
      const mockServer = {
        setRequestHandler: vi.fn(),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(Server).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const server = new LinkedInMCPServer(validConfig);
      await server.stop();

      expect(mockServer.close).toHaveBeenCalled();
    });
  });
});
