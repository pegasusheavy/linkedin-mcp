import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { LinkedInMCPServer } from './server.js';
import { LinkedInClient } from './linkedin-client.js';

vi.mock('@modelcontextprotocol/sdk/server/mcp.js');
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
        tool: vi.fn(),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const config = { ...validConfig, linkedInAccessToken: undefined };
      expect(() => new LinkedInMCPServer(config)).toThrow('LinkedIn access token is required');
    });

    it('should create server with LinkedIn client', () => {
      const mockServer = {
        tool: vi.fn(),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const server = new LinkedInMCPServer(validConfig);
      expect(LinkedInClient).toHaveBeenCalledWith('test-token', expect.anything());
    });

    it('should register all 18 tools', () => {
      const mockServer = {
        tool: vi.fn(),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      new LinkedInMCPServer(validConfig);

      // Should have called tool() 18 times (5 social + 13 profile management)
      expect(mockServer.tool).toHaveBeenCalledTimes(18);
      
      // Verify key tools are registered
      const toolNames = mockServer.tool.mock.calls.map(call => call[0]);
      expect(toolNames).toContain('get_linkedin_profile');
      expect(toolNames).toContain('get_linkedin_posts');
      expect(toolNames).toContain('get_linkedin_connections');
      expect(toolNames).toContain('share_linkedin_post');
      expect(toolNames).toContain('search_linkedin_people');
      expect(toolNames).toContain('add_linkedin_skill');
      expect(toolNames).toContain('delete_linkedin_skill');
      expect(toolNames).toContain('add_linkedin_position');
      expect(toolNames).toContain('update_linkedin_position');
      expect(toolNames).toContain('delete_linkedin_position');
      expect(toolNames).toContain('add_linkedin_education');
      expect(toolNames).toContain('delete_linkedin_education');
      expect(toolNames).toContain('add_linkedin_certification');
      expect(toolNames).toContain('delete_linkedin_certification');
      expect(toolNames).toContain('add_linkedin_publication');
      expect(toolNames).toContain('delete_linkedin_publication');
      expect(toolNames).toContain('add_linkedin_language');
      expect(toolNames).toContain('delete_linkedin_language');
    });
  });

  describe('tool handlers', () => {
    it('should handle get_linkedin_profile tool', async () => {
      let profileHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'get_linkedin_profile') {
            profileHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
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

      expect(profileHandler).not.toBeNull();
      const result = await profileHandler({});

      expect(mockLinkedInClient.getProfile).toHaveBeenCalled();
      expect(result.content[0].text).toContain('test-id');
    });

    it('should handle get_linkedin_posts tool', async () => {
      let postsHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'get_linkedin_posts') {
            postsHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
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

      const result = await postsHandler({ limit: 5 });

      expect(mockLinkedInClient.getPosts).toHaveBeenCalledWith(5);
      expect(result.content[0].text).toContain('post-1');
    });

    it('should handle get_linkedin_connections tool', async () => {
      let connectionsHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'get_linkedin_connections') {
            connectionsHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
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

      const result = await connectionsHandler({ limit: 25 });

      expect(mockLinkedInClient.getConnections).toHaveBeenCalledWith(25);
      expect(result.content[0].text).toContain('Jane');
    });

    it('should handle share_linkedin_post tool', async () => {
      let shareHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'share_linkedin_post') {
            shareHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
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

      const result = await shareHandler({ text: 'New post' });

      expect(mockLinkedInClient.sharePost).toHaveBeenCalledWith('New post');
      expect(result.content[0].text).toContain('post-123');
    });

    it('should require text for share_linkedin_post', async () => {
      let shareHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'share_linkedin_post') {
            shareHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      new LinkedInMCPServer(validConfig);

      await expect(shareHandler({ text: '' })).rejects.toThrow('Text is required');
    });

    it('should handle search_linkedin_people tool', async () => {
      let searchHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'search_linkedin_people') {
            searchHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
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

      const result = await searchHandler({ keywords: 'engineer', limit: 15 });

      expect(mockLinkedInClient.searchPeople).toHaveBeenCalledWith('engineer', 15);
      expect(result.content[0].text).toContain('Bob');
    });

    it('should require keywords for search_linkedin_people', async () => {
      let searchHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'search_linkedin_people') {
            searchHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      new LinkedInMCPServer(validConfig);

      await expect(searchHandler({ keywords: '' })).rejects.toThrow('Keywords are required');
    });

    it('should handle add_linkedin_skill tool', async () => {
      let skillHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'add_linkedin_skill') {
            skillHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const mockResult = { id: 'skill-123' };
      const mockLinkedInClient = {
        addSkill: vi.fn().mockResolvedValue(mockResult),
      };
      vi.mocked(LinkedInClient).mockImplementation(function(this: any) {
        return mockLinkedInClient;
      } as any);

      new LinkedInMCPServer(validConfig);

      const result = await skillHandler({ name: 'TypeScript' });

      expect(mockLinkedInClient.addSkill).toHaveBeenCalledWith({ name: 'TypeScript' });
      expect(result.content[0].text).toContain('TypeScript');
      expect(result.content[0].text).toContain('skill-123');
    });

    it('should handle delete_linkedin_skill tool', async () => {
      let deleteSkillHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'delete_linkedin_skill') {
            deleteSkillHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const mockLinkedInClient = {
        deleteSkill: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(LinkedInClient).mockImplementation(function(this: any) {
        return mockLinkedInClient;
      } as any);

      new LinkedInMCPServer(validConfig);

      const result = await deleteSkillHandler({ skillId: 'skill-123' });

      expect(mockLinkedInClient.deleteSkill).toHaveBeenCalledWith('skill-123');
      expect(result.content[0].text).toContain('skill-123');
    });

    it('should handle add_linkedin_position tool', async () => {
      let positionHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'add_linkedin_position') {
            positionHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const mockResult = { id: 'position-123' };
      const mockLinkedInClient = {
        addPosition: vi.fn().mockResolvedValue(mockResult),
      };
      vi.mocked(LinkedInClient).mockImplementation(function(this: any) {
        return mockLinkedInClient;
      } as any);

      new LinkedInMCPServer(validConfig);

      const result = await positionHandler({
        title: 'Software Engineer',
        company: 'Acme Corp',
        startYear: 2020,
        current: true,
      });

      expect(mockLinkedInClient.addPosition).toHaveBeenCalled();
      expect(result.content[0].text).toContain('Software Engineer');
      expect(result.content[0].text).toContain('Acme Corp');
    });

    it('should handle update_linkedin_position tool', async () => {
      let updatePositionHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'update_linkedin_position') {
            updatePositionHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const mockLinkedInClient = {
        updatePosition: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(LinkedInClient).mockImplementation(function(this: any) {
        return mockLinkedInClient;
      } as any);

      new LinkedInMCPServer(validConfig);

      const result = await updatePositionHandler({
        positionId: 'position-123',
        title: 'Senior Engineer',
      });

      expect(mockLinkedInClient.updatePosition).toHaveBeenCalled();
      expect(result.content[0].text).toContain('position-123');
    });

    it('should handle delete_linkedin_position tool', async () => {
      let deletePositionHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'delete_linkedin_position') {
            deletePositionHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const mockLinkedInClient = {
        deletePosition: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(LinkedInClient).mockImplementation(function(this: any) {
        return mockLinkedInClient;
      } as any);

      new LinkedInMCPServer(validConfig);

      const result = await deletePositionHandler({ positionId: 'position-123' });

      expect(mockLinkedInClient.deletePosition).toHaveBeenCalledWith('position-123');
      expect(result.content[0].text).toContain('position-123');
    });

    it('should handle add_linkedin_education tool', async () => {
      let educationHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'add_linkedin_education') {
            educationHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const mockResult = { id: 'education-123' };
      const mockLinkedInClient = {
        addEducation: vi.fn().mockResolvedValue(mockResult),
      };
      vi.mocked(LinkedInClient).mockImplementation(function(this: any) {
        return mockLinkedInClient;
      } as any);

      new LinkedInMCPServer(validConfig);

      const result = await educationHandler({
        schoolName: 'MIT',
        degree: 'BS',
        fieldOfStudy: 'Computer Science',
      });

      expect(mockLinkedInClient.addEducation).toHaveBeenCalled();
      expect(result.content[0].text).toContain('MIT');
    });

    it('should handle delete_linkedin_education tool', async () => {
      let deleteEducationHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'delete_linkedin_education') {
            deleteEducationHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const mockLinkedInClient = {
        deleteEducation: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(LinkedInClient).mockImplementation(function(this: any) {
        return mockLinkedInClient;
      } as any);

      new LinkedInMCPServer(validConfig);

      const result = await deleteEducationHandler({ educationId: 'education-123' });

      expect(mockLinkedInClient.deleteEducation).toHaveBeenCalledWith('education-123');
      expect(result.content[0].text).toContain('education-123');
    });

    it('should handle add_linkedin_certification tool', async () => {
      let certificationHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'add_linkedin_certification') {
            certificationHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const mockResult = { id: 'cert-123' };
      const mockLinkedInClient = {
        addCertification: vi.fn().mockResolvedValue(mockResult),
      };
      vi.mocked(LinkedInClient).mockImplementation(function(this: any) {
        return mockLinkedInClient;
      } as any);

      new LinkedInMCPServer(validConfig);

      const result = await certificationHandler({
        name: 'AWS Certified',
        authority: 'Amazon',
      });

      expect(mockLinkedInClient.addCertification).toHaveBeenCalled();
      expect(result.content[0].text).toContain('AWS Certified');
    });

    it('should handle delete_linkedin_certification tool', async () => {
      let deleteCertHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'delete_linkedin_certification') {
            deleteCertHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const mockLinkedInClient = {
        deleteCertification: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(LinkedInClient).mockImplementation(function(this: any) {
        return mockLinkedInClient;
      } as any);

      new LinkedInMCPServer(validConfig);

      const result = await deleteCertHandler({ certificationId: 'cert-123' });

      expect(mockLinkedInClient.deleteCertification).toHaveBeenCalledWith('cert-123');
      expect(result.content[0].text).toContain('cert-123');
    });

    it('should handle add_linkedin_publication tool', async () => {
      let publicationHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'add_linkedin_publication') {
            publicationHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const mockResult = { id: 'pub-123' };
      const mockLinkedInClient = {
        addPublication: vi.fn().mockResolvedValue(mockResult),
      };
      vi.mocked(LinkedInClient).mockImplementation(function(this: any) {
        return mockLinkedInClient;
      } as any);

      new LinkedInMCPServer(validConfig);

      const result = await publicationHandler({
        name: 'My Research Paper',
        publisher: 'IEEE',
      });

      expect(mockLinkedInClient.addPublication).toHaveBeenCalled();
      expect(result.content[0].text).toContain('My Research Paper');
    });

    it('should handle delete_linkedin_publication tool', async () => {
      let deletePubHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'delete_linkedin_publication') {
            deletePubHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const mockLinkedInClient = {
        deletePublication: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(LinkedInClient).mockImplementation(function(this: any) {
        return mockLinkedInClient;
      } as any);

      new LinkedInMCPServer(validConfig);

      const result = await deletePubHandler({ publicationId: 'pub-123' });

      expect(mockLinkedInClient.deletePublication).toHaveBeenCalledWith('pub-123');
      expect(result.content[0].text).toContain('pub-123');
    });

    it('should handle add_linkedin_language tool', async () => {
      let languageHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'add_linkedin_language') {
            languageHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const mockResult = { id: 'lang-123' };
      const mockLinkedInClient = {
        addLanguage: vi.fn().mockResolvedValue(mockResult),
      };
      vi.mocked(LinkedInClient).mockImplementation(function(this: any) {
        return mockLinkedInClient;
      } as any);

      new LinkedInMCPServer(validConfig);

      const result = await languageHandler({
        name: 'Spanish',
        proficiency: 'PROFESSIONAL_WORKING',
      });

      expect(mockLinkedInClient.addLanguage).toHaveBeenCalled();
      expect(result.content[0].text).toContain('Spanish');
    });

    it('should handle delete_linkedin_language tool', async () => {
      let deleteLangHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'delete_linkedin_language') {
            deleteLangHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const mockLinkedInClient = {
        deleteLanguage: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(LinkedInClient).mockImplementation(function(this: any) {
        return mockLinkedInClient;
      } as any);

      new LinkedInMCPServer(validConfig);

      const result = await deleteLangHandler({ languageId: 'lang-123' });

      expect(mockLinkedInClient.deleteLanguage).toHaveBeenCalledWith('lang-123');
      expect(result.content[0].text).toContain('lang-123');
    });

    it('should handle errors in tool calls', async () => {
      let profileHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'get_linkedin_profile') {
            profileHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const mockLinkedInClient = {
        getProfile: vi.fn().mockRejectedValue(new Error('API Error')),
      };
      vi.mocked(LinkedInClient).mockImplementation(function(this: any) {
        return mockLinkedInClient;
      } as any);

      new LinkedInMCPServer(validConfig);

      await expect(profileHandler({})).rejects.toThrow('API Error');
    });

    it('should use default limit for get_linkedin_posts when not provided', async () => {
      let postsHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'get_linkedin_posts') {
            postsHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
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

      await postsHandler({});

      expect(mockLinkedInClient.getPosts).toHaveBeenCalledWith(10);
    });

    it('should use default limit for get_linkedin_connections when not provided', async () => {
      let connectionsHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'get_linkedin_connections') {
            connectionsHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
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

      await connectionsHandler({});

      expect(mockLinkedInClient.getConnections).toHaveBeenCalledWith(50);
    });

    it('should use default limit for search_linkedin_people when not provided', async () => {
      let searchHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'search_linkedin_people') {
            searchHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
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

      await searchHandler({ keywords: 'engineer' });

      expect(mockLinkedInClient.searchPeople).toHaveBeenCalledWith('engineer', 10);
    });

    it('should require skill name for add_linkedin_skill', async () => {
      let skillHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'add_linkedin_skill') {
            skillHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      new LinkedInMCPServer(validConfig);

      await expect(skillHandler({ name: '' })).rejects.toThrow('Skill name is required');
    });

    it('should require required fields for add_linkedin_position', async () => {
      let positionHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'add_linkedin_position') {
            positionHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      new LinkedInMCPServer(validConfig);

      await expect(positionHandler({ title: 'Engineer' })).rejects.toThrow('Title, company, and start year are required');
    });

    it('should require school name for add_linkedin_education', async () => {
      let educationHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'add_linkedin_education') {
            educationHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      new LinkedInMCPServer(validConfig);

      await expect(educationHandler({ schoolName: '' })).rejects.toThrow('School name is required');
    });

    it('should require certification name and authority', async () => {
      let certificationHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'add_linkedin_certification') {
            certificationHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      new LinkedInMCPServer(validConfig);

      await expect(certificationHandler({ name: 'AWS' })).rejects.toThrow('Certification name and authority are required');
    });

    it('should require publication name', async () => {
      let publicationHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'add_linkedin_publication') {
            publicationHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      new LinkedInMCPServer(validConfig);

      await expect(publicationHandler({ name: '' })).rejects.toThrow('Publication name is required');
    });

    it('should require language name', async () => {
      let languageHandler: any = null;
      const mockServer = {
        tool: vi.fn((name, _desc, _schema, handler) => {
          if (name === 'add_linkedin_language') {
            languageHandler = handler;
          }
        }),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      new LinkedInMCPServer(validConfig);

      await expect(languageHandler({ name: '' })).rejects.toThrow('Language name is required');
    });
  });

  describe('start and stop', () => {
    it('should start server with transport', async () => {
      const mockServer = {
        tool: vi.fn(),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const server = new LinkedInMCPServer(validConfig);
      await server.start();

      expect(mockServer.connect).toHaveBeenCalled();
    });

    it('should stop server', async () => {
      const mockServer = {
        tool: vi.fn(),
        connect: vi.fn(),
        close: vi.fn(),
      };
      vi.mocked(McpServer).mockImplementation(function(this: any) {
        return mockServer;
      } as any);

      const server = new LinkedInMCPServer(validConfig);
      await server.stop();

      expect(mockServer.close).toHaveBeenCalled();
    });
  });
});
