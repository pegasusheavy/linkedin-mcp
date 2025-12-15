// Using Server class for advanced use cases (custom tool handlers)
// Note: MCP SDK recommends McpServer for high-level API, but it's not available yet
// @ts-ignore - Suppress deprecation warning
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { LinkedInClient } from './linkedin-client.js';
import { Logger } from './logger.js';
import { ServerConfig, ToolResult, ToolArguments } from './types.js';

export class LinkedInMCPServer {
  private server: Server;
  private linkedInClient: LinkedInClient;
  private logger: Logger;

  constructor(config: ServerConfig) {
    this.logger = new Logger(config.logLevel);
    this.server = new Server(
      {
        name: 'linkedin-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize clients
    if (!config.linkedInAccessToken) {
      throw new Error('LinkedIn access token is required');
    }
    this.linkedInClient = new LinkedInClient(config.linkedInAccessToken, this.logger);

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: 'get_linkedin_profile',
          description: 'Get the authenticated user\'s LinkedIn profile information',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_linkedin_posts',
          description: 'Get the user\'s recent LinkedIn posts',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of posts to retrieve (default: 10)',
                default: 10,
              },
            },
          },
        },
        {
          name: 'get_linkedin_connections',
          description: 'Get the user\'s LinkedIn connections',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of connections to retrieve (default: 50)',
                default: 50,
              },
            },
          },
        },
        {
          name: 'share_linkedin_post',
          description: 'Share a new post on LinkedIn',
          inputSchema: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description: 'The text content of the post',
              },
            },
            required: ['text'],
          },
        },
        {
          name: 'search_linkedin_people',
          description: 'Search for people on LinkedIn',
          inputSchema: {
            type: 'object',
            properties: {
              keywords: {
                type: 'string',
                description: 'Search keywords',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results (default: 10)',
                default: 10,
              },
            },
            required: ['keywords'],
          },
        },
        {
          name: 'add_linkedin_skill',
          description: 'Add a skill to your LinkedIn profile',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'The name of the skill to add',
              },
            },
            required: ['name'],
          },
        },
        {
          name: 'delete_linkedin_skill',
          description: 'Delete a skill from your LinkedIn profile',
          inputSchema: {
            type: 'object',
            properties: {
              skillId: {
                type: 'string',
                description: 'The ID of the skill to delete',
              },
            },
            required: ['skillId'],
          },
        },
        {
          name: 'add_linkedin_position',
          description: 'Add a work position to your LinkedIn profile',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Job title',
              },
              company: {
                type: 'string',
                description: 'Company name',
              },
              description: {
                type: 'string',
                description: 'Job description (optional)',
              },
              startYear: {
                type: 'number',
                description: 'Start year',
              },
              startMonth: {
                type: 'number',
                description: 'Start month (1-12, optional)',
              },
              endYear: {
                type: 'number',
                description: 'End year (optional, omit if current)',
              },
              endMonth: {
                type: 'number',
                description: 'End month (1-12, optional)',
              },
              current: {
                type: 'boolean',
                description: 'Is this your current position?',
              },
            },
            required: ['title', 'company', 'startYear'],
          },
        },
        {
          name: 'update_linkedin_position',
          description: 'Update an existing position on your LinkedIn profile',
          inputSchema: {
            type: 'object',
            properties: {
              positionId: {
                type: 'string',
                description: 'The ID of the position to update',
              },
              title: {
                type: 'string',
                description: 'Job title (optional)',
              },
              company: {
                type: 'string',
                description: 'Company name (optional)',
              },
              description: {
                type: 'string',
                description: 'Job description (optional)',
              },
              startYear: {
                type: 'number',
                description: 'Start year (optional)',
              },
              startMonth: {
                type: 'number',
                description: 'Start month (1-12, optional)',
              },
              endYear: {
                type: 'number',
                description: 'End year (optional)',
              },
              endMonth: {
                type: 'number',
                description: 'End month (1-12, optional)',
              },
            },
            required: ['positionId'],
          },
        },
        {
          name: 'delete_linkedin_position',
          description: 'Delete a position from your LinkedIn profile',
          inputSchema: {
            type: 'object',
            properties: {
              positionId: {
                type: 'string',
                description: 'The ID of the position to delete',
              },
            },
            required: ['positionId'],
          },
        },
        {
          name: 'add_linkedin_education',
          description: 'Add education to your LinkedIn profile',
          inputSchema: {
            type: 'object',
            properties: {
              schoolName: {
                type: 'string',
                description: 'Name of the school',
              },
              degree: {
                type: 'string',
                description: 'Degree name (optional)',
              },
              fieldOfStudy: {
                type: 'string',
                description: 'Field of study (optional)',
              },
              startYear: {
                type: 'number',
                description: 'Start year (optional)',
              },
              startMonth: {
                type: 'number',
                description: 'Start month (1-12, optional)',
              },
              endYear: {
                type: 'number',
                description: 'End year (optional)',
              },
              endMonth: {
                type: 'number',
                description: 'End month (1-12, optional)',
              },
              grade: {
                type: 'string',
                description: 'Grade or GPA (optional)',
              },
              activities: {
                type: 'string',
                description: 'Activities and societies (optional)',
              },
            },
            required: ['schoolName'],
          },
        },
        {
          name: 'delete_linkedin_education',
          description: 'Delete education from your LinkedIn profile',
          inputSchema: {
            type: 'object',
            properties: {
              educationId: {
                type: 'string',
                description: 'The ID of the education entry to delete',
              },
            },
            required: ['educationId'],
          },
        },
        {
          name: 'add_linkedin_certification',
          description: 'Add a certification to your LinkedIn profile',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Certification name',
              },
              authority: {
                type: 'string',
                description: 'Issuing authority/organization',
              },
              licenseNumber: {
                type: 'string',
                description: 'License or certification number (optional)',
              },
              startYear: {
                type: 'number',
                description: 'Issue year (optional)',
              },
              startMonth: {
                type: 'number',
                description: 'Issue month (1-12, optional)',
              },
              endYear: {
                type: 'number',
                description: 'Expiration year (optional)',
              },
              endMonth: {
                type: 'number',
                description: 'Expiration month (1-12, optional)',
              },
              url: {
                type: 'string',
                description: 'URL to certification (optional)',
              },
            },
            required: ['name', 'authority'],
          },
        },
        {
          name: 'delete_linkedin_certification',
          description: 'Delete a certification from your LinkedIn profile',
          inputSchema: {
            type: 'object',
            properties: {
              certificationId: {
                type: 'string',
                description: 'The ID of the certification to delete',
              },
            },
            required: ['certificationId'],
          },
        },
        {
          name: 'add_linkedin_publication',
          description: 'Add a publication to your LinkedIn profile',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Publication name',
              },
              publisher: {
                type: 'string',
                description: 'Publisher name (optional)',
              },
              year: {
                type: 'number',
                description: 'Publication year (optional)',
              },
              month: {
                type: 'number',
                description: 'Publication month (1-12, optional)',
              },
              day: {
                type: 'number',
                description: 'Publication day (1-31, optional)',
              },
              description: {
                type: 'string',
                description: 'Publication description (optional)',
              },
              url: {
                type: 'string',
                description: 'URL to publication (optional)',
              },
            },
            required: ['name'],
          },
        },
        {
          name: 'delete_linkedin_publication',
          description: 'Delete a publication from your LinkedIn profile',
          inputSchema: {
            type: 'object',
            properties: {
              publicationId: {
                type: 'string',
                description: 'The ID of the publication to delete',
              },
            },
            required: ['publicationId'],
          },
        },
        {
          name: 'add_linkedin_language',
          description: 'Add a language to your LinkedIn profile',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Language name',
              },
              proficiency: {
                type: 'string',
                description: 'Proficiency level',
                enum: ['ELEMENTARY', 'LIMITED_WORKING', 'PROFESSIONAL_WORKING', 'FULL_PROFESSIONAL', 'NATIVE_OR_BILINGUAL'],
              },
            },
            required: ['name'],
          },
        },
        {
          name: 'delete_linkedin_language',
          description: 'Delete a language from your LinkedIn profile',
          inputSchema: {
            type: 'object',
            properties: {
              languageId: {
                type: 'string',
                description: 'The ID of the language to delete',
              },
            },
            required: ['languageId'],
          },
        },
      ];

      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args = {} } = request.params;
      this.logger.info(`Tool called: ${name}`);

      try {
        let result: ToolResult;
        switch (name) {
          case 'get_linkedin_profile':
            result = await this.handleGetProfile();
            break;
          case 'get_linkedin_posts':
            result = await this.handleGetPosts(args);
            break;
          case 'get_linkedin_connections':
            result = await this.handleGetConnections(args);
            break;
          case 'share_linkedin_post':
            result = await this.handleSharePost(args);
            break;
          case 'search_linkedin_people':
            result = await this.handleSearchPeople(args);
            break;
          case 'add_linkedin_skill':
            result = await this.handleAddSkill(args);
            break;
          case 'delete_linkedin_skill':
            result = await this.handleDeleteSkill(args);
            break;
          case 'add_linkedin_position':
            result = await this.handleAddPosition(args);
            break;
          case 'update_linkedin_position':
            result = await this.handleUpdatePosition(args);
            break;
          case 'delete_linkedin_position':
            result = await this.handleDeletePosition(args);
            break;
          case 'add_linkedin_education':
            result = await this.handleAddEducation(args);
            break;
          case 'delete_linkedin_education':
            result = await this.handleDeleteEducation(args);
            break;
          case 'add_linkedin_certification':
            result = await this.handleAddCertification(args);
            break;
          case 'delete_linkedin_certification':
            result = await this.handleDeleteCertification(args);
            break;
          case 'add_linkedin_publication':
            result = await this.handleAddPublication(args);
            break;
          case 'delete_linkedin_publication':
            result = await this.handleDeletePublication(args);
            break;
          case 'add_linkedin_language':
            result = await this.handleAddLanguage(args);
            break;
          case 'delete_linkedin_language':
            result = await this.handleDeleteLanguage(args);
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
        return result as any;
      } catch (error) {
        this.logger.error(`Error handling tool ${name}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        } as any;
      }
    });
  }

  private async handleGetProfile(): Promise<ToolResult> {
    const profile = await this.linkedInClient.getProfile();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(profile, null, 2),
        },
      ],
    };
  }

  private async handleGetPosts(args: ToolArguments): Promise<ToolResult> {
    const limit = (args.limit as number) || 10;
    const posts = await this.linkedInClient.getPosts(limit);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(posts, null, 2),
        },
      ],
    };
  }

  private async handleGetConnections(args: ToolArguments): Promise<ToolResult> {
    const limit = (args.limit as number) || 50;
    const connections = await this.linkedInClient.getConnections(limit);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(connections, null, 2),
        },
      ],
    };
  }

  private async handleSharePost(args: ToolArguments): Promise<ToolResult> {
    const text = args.text as string;
    if (!text) {
      throw new Error('Text is required for sharing a post');
    }
    const result = await this.linkedInClient.sharePost(text);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async handleSearchPeople(args: ToolArguments): Promise<ToolResult> {
    const keywords = args.keywords as string;
    if (!keywords) {
      throw new Error('Keywords are required for searching people');
    }
    const limit = (args.limit as number) || 10;
    const people = await this.linkedInClient.searchPeople(keywords, limit);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(people, null, 2),
        },
      ],
    };
  }

  private async handleAddSkill(args: ToolArguments): Promise<ToolResult> {
    const name = args.name as string;
    if (!name) {
      throw new Error('Skill name is required');
    }
    const result = await this.linkedInClient.addSkill({ name });
    return {
      content: [
        {
          type: 'text',
          text: `Successfully added skill: ${name} (ID: ${result.id})`,
        },
      ],
    };
  }

  private async handleDeleteSkill(args: ToolArguments): Promise<ToolResult> {
    const skillId = args.skillId as string;
    if (!skillId) {
      throw new Error('Skill ID is required');
    }
    await this.linkedInClient.deleteSkill(skillId);
    return {
      content: [
        {
          type: 'text',
          text: `Successfully deleted skill: ${skillId}`,
        },
      ],
    };
  }

  private async handleAddPosition(args: ToolArguments): Promise<ToolResult> {
    const title = args.title as string;
    const company = args.company as string;
    const startYear = args.startYear as number;

    if (!title || !company || !startYear) {
      throw new Error('Title, company, and start year are required');
    }

    const position = {
      title,
      company,
      description: args.description as string | undefined,
      startDate: {
        year: startYear,
        month: args.startMonth as number | undefined,
      },
      endDate: args.endYear ? {
        year: args.endYear as number,
        month: args.endMonth as number | undefined,
      } : undefined,
      current: args.current as boolean | undefined,
    };

    const result = await this.linkedInClient.addPosition(position);
    return {
      content: [
        {
          type: 'text',
          text: `Successfully added position: ${title} at ${company} (ID: ${result.id})`,
        },
      ],
    };
  }

  private async handleUpdatePosition(args: ToolArguments): Promise<ToolResult> {
    const positionId = args.positionId as string;
    if (!positionId) {
      throw new Error('Position ID is required');
    }

    const updates: any = {};
    if (args.title) updates.title = args.title;
    if (args.company) updates.company = args.company;
    if (args.description) updates.description = args.description;

    if (args.startYear) {
      updates.startDate = {
        year: args.startYear as number,
        month: args.startMonth as number | undefined,
      };
    }

    if (args.endYear) {
      updates.endDate = {
        year: args.endYear as number,
        month: args.endMonth as number | undefined,
      };
    }

    await this.linkedInClient.updatePosition(positionId, updates);
    return {
      content: [
        {
          type: 'text',
          text: `Successfully updated position: ${positionId}`,
        },
      ],
    };
  }

  private async handleDeletePosition(args: ToolArguments): Promise<ToolResult> {
    const positionId = args.positionId as string;
    if (!positionId) {
      throw new Error('Position ID is required');
    }
    await this.linkedInClient.deletePosition(positionId);
    return {
      content: [
        {
          type: 'text',
          text: `Successfully deleted position: ${positionId}`,
        },
      ],
    };
  }

  private async handleAddEducation(args: ToolArguments): Promise<ToolResult> {
    const schoolName = args.schoolName as string;
    if (!schoolName) {
      throw new Error('School name is required');
    }

    const education = {
      schoolName,
      degree: args.degree as string | undefined,
      fieldOfStudy: args.fieldOfStudy as string | undefined,
      startDate: args.startYear ? {
        year: args.startYear as number,
        month: args.startMonth as number | undefined,
      } : undefined,
      endDate: args.endYear ? {
        year: args.endYear as number,
        month: args.endMonth as number | undefined,
      } : undefined,
      grade: args.grade as string | undefined,
      activities: args.activities as string | undefined,
    };

    const result = await this.linkedInClient.addEducation(education);
    return {
      content: [
        {
          type: 'text',
          text: `Successfully added education: ${schoolName} (ID: ${result.id})`,
        },
      ],
    };
  }

  private async handleDeleteEducation(args: ToolArguments): Promise<ToolResult> {
    const educationId = args.educationId as string;
    if (!educationId) {
      throw new Error('Education ID is required');
    }
    await this.linkedInClient.deleteEducation(educationId);
    return {
      content: [
        {
          type: 'text',
          text: `Successfully deleted education: ${educationId}`,
        },
      ],
    };
  }

  private async handleAddCertification(args: ToolArguments): Promise<ToolResult> {
    const name = args.name as string;
    const authority = args.authority as string;

    if (!name || !authority) {
      throw new Error('Certification name and authority are required');
    }

    const certification = {
      name,
      authority,
      licenseNumber: args.licenseNumber as string | undefined,
      startDate: args.startYear ? {
        year: args.startYear as number,
        month: args.startMonth as number | undefined,
      } : undefined,
      endDate: args.endYear ? {
        year: args.endYear as number,
        month: args.endMonth as number | undefined,
      } : undefined,
      url: args.url as string | undefined,
    };

    const result = await this.linkedInClient.addCertification(certification);
    return {
      content: [
        {
          type: 'text',
          text: `Successfully added certification: ${name} from ${authority} (ID: ${result.id})`,
        },
      ],
    };
  }

  private async handleDeleteCertification(args: ToolArguments): Promise<ToolResult> {
    const certificationId = args.certificationId as string;
    if (!certificationId) {
      throw new Error('Certification ID is required');
    }
    await this.linkedInClient.deleteCertification(certificationId);
    return {
      content: [
        {
          type: 'text',
          text: `Successfully deleted certification: ${certificationId}`,
        },
      ],
    };
  }

  private async handleAddPublication(args: ToolArguments): Promise<ToolResult> {
    const name = args.name as string;
    if (!name) {
      throw new Error('Publication name is required');
    }

    const publication = {
      name,
      publisher: args.publisher as string | undefined,
      date: args.year ? {
        year: args.year as number,
        month: args.month as number | undefined,
        day: args.day as number | undefined,
      } : undefined,
      description: args.description as string | undefined,
      url: args.url as string | undefined,
    };

    const result = await this.linkedInClient.addPublication(publication);
    return {
      content: [
        {
          type: 'text',
          text: `Successfully added publication: ${name} (ID: ${result.id})`,
        },
      ],
    };
  }

  private async handleDeletePublication(args: ToolArguments): Promise<ToolResult> {
    const publicationId = args.publicationId as string;
    if (!publicationId) {
      throw new Error('Publication ID is required');
    }
    await this.linkedInClient.deletePublication(publicationId);
    return {
      content: [
        {
          type: 'text',
          text: `Successfully deleted publication: ${publicationId}`,
        },
      ],
    };
  }

  private async handleAddLanguage(args: ToolArguments): Promise<ToolResult> {
    const name = args.name as string;
    if (!name) {
      throw new Error('Language name is required');
    }

    const language = {
      name,
      proficiency: args.proficiency as 'ELEMENTARY' | 'LIMITED_WORKING' | 'PROFESSIONAL_WORKING' | 'FULL_PROFESSIONAL' | 'NATIVE_OR_BILINGUAL' | undefined,
    };

    const result = await this.linkedInClient.addLanguage(language);
    return {
      content: [
        {
          type: 'text',
          text: `Successfully added language: ${name} (ID: ${result.id})`,
        },
      ],
    };
  }

  private async handleDeleteLanguage(args: ToolArguments): Promise<ToolResult> {
    const languageId = args.languageId as string;
    if (!languageId) {
      throw new Error('Language ID is required');
    }
    await this.linkedInClient.deleteLanguage(languageId);
    return {
      content: [
        {
          type: 'text',
          text: `Successfully deleted language: ${languageId}`,
        },
      ],
    };
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.logger.info('LinkedIn MCP Server started');
  }

  async stop(): Promise<void> {
    await this.server.close();
    this.logger.info('LinkedIn MCP Server stopped');
  }
}

