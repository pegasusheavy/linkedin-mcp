import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { LinkedInClient } from './linkedin-client.js';
import { Logger } from './logger.js';
import { ServerConfig, LinkedInPosition, LinkedInLanguage, LinkedInEducation, LinkedInCertification, LinkedInPublication } from './types.js';

// Tool result type to avoid deep type inference issues
type ToolResult = {
  content: Array<{ type: 'text'; text: string }>;
};

export class LinkedInMCPServer {
  private server: McpServer;
  private linkedInClient: LinkedInClient;
  private logger: Logger;

  constructor(config: ServerConfig) {
    this.logger = new Logger(config.logLevel);

    // Initialize McpServer
    this.server = new McpServer(
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

    // Initialize LinkedIn client
    if (!config.linkedInAccessToken) {
      throw new Error('LinkedIn access token is required');
    }
    this.linkedInClient = new LinkedInClient(config.linkedInAccessToken, this.logger);

    this.setupTools();
  }

  private setupTools(): void {
    // Social & Content Tools
    // Note: McpServer.tool() is marked deprecated but is still the correct API to use
    // The deprecation warning is for a different use case; this is the recommended way for our server

    this.server.tool(
      'get_linkedin_profile',
      'Get the authenticated user\'s LinkedIn profile information',
      {},
      async (): Promise<ToolResult> => {
        this.logger.info('Tool called: get_linkedin_profile');
        try {
          const profile = await this.linkedInClient.getProfile();
          return {
            content: [{ type: 'text', text: JSON.stringify(profile, null, 2) }],
          };
        } catch (error) {
          this.logger.error('Error in get_linkedin_profile:', error);
          throw error;
        }
      }
    );

    this.server.tool(
      'get_linkedin_posts',
      'Get the user\'s recent LinkedIn posts',
      {
        limit: z.number().optional().describe('Maximum number of posts to retrieve (default: 10)'),
      },
      async ({ limit }): Promise<ToolResult> => {
        this.logger.info('Tool called: get_linkedin_posts');
        try {
          const posts = await this.linkedInClient.getPosts(limit || 10);
          return {
            content: [{ type: 'text', text: JSON.stringify(posts, null, 2) }],
          };
        } catch (error) {
          this.logger.error('Error in get_linkedin_posts:', error);
          throw error;
        }
      }
    );

    this.server.tool(
      'get_linkedin_connections',
      'Get the user\'s LinkedIn connections',
      {
        limit: z.number().optional().describe('Maximum number of connections to retrieve (default: 50)'),
      },
      async ({ limit }): Promise<ToolResult> => {
        this.logger.info('Tool called: get_linkedin_connections');
        try {
          const connections = await this.linkedInClient.getConnections(limit || 50);
          return {
            content: [{ type: 'text', text: JSON.stringify(connections, null, 2) }],
          };
        } catch (error) {
          this.logger.error('Error in get_linkedin_connections:', error);
          throw error;
        }
      }
    );

    this.server.tool(
      'share_linkedin_post',
      'Share a new post on LinkedIn',
      {
        text: z.string().describe('The text content of the post'),
      },
      async ({ text }): Promise<ToolResult> => {
        this.logger.info('Tool called: share_linkedin_post');
        try {
          if (!text) {
            throw new Error('Text is required for sharing a post');
          }
          const result = await this.linkedInClient.sharePost(text);
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        } catch (error) {
          this.logger.error('Error in share_linkedin_post:', error);
          throw error;
        }
      }
    );

    this.server.tool(
      'search_linkedin_people',
      'Search for people on LinkedIn',
      {
        keywords: z.string().describe('Search keywords'),
        limit: z.number().optional().describe('Maximum number of results (default: 10)'),
      },
      async ({ keywords, limit }): Promise<ToolResult> => {
        this.logger.info('Tool called: search_linkedin_people');
        try {
          if (!keywords) {
            throw new Error('Keywords are required for searching people');
          }
          const people = await this.linkedInClient.searchPeople(keywords, limit || 10);
          return {
            content: [{ type: 'text', text: JSON.stringify(people, null, 2) }],
          };
        } catch (error) {
          this.logger.error('Error in search_linkedin_people:', error);
          throw error;
        }
      }
    );

    // Profile Management Tools - Skills

    this.server.tool(
      'add_linkedin_skill',
      'Add a skill to your LinkedIn profile',
      {
        name: z.string().describe('The name of the skill to add'),
      },
      async ({ name }): Promise<ToolResult> => {
        this.logger.info('Tool called: add_linkedin_skill');
        try {
          if (!name) {
            throw new Error('Skill name is required');
          }
          const result = await this.linkedInClient.addSkill({ name });
          return {
            content: [{ type: 'text', text: `Successfully added skill: ${name} (ID: ${result.id})` }],
          };
        } catch (error) {
          this.logger.error('Error in add_linkedin_skill:', error);
          throw error;
        }
      }
    );

    this.server.tool(
      'delete_linkedin_skill',
      'Delete a skill from your LinkedIn profile',
      {
        skillId: z.string().describe('The ID of the skill to delete'),
      },
      async ({ skillId }): Promise<ToolResult> => {
        this.logger.info('Tool called: delete_linkedin_skill');
        try {
          if (!skillId) {
            throw new Error('Skill ID is required');
          }
          await this.linkedInClient.deleteSkill(skillId);
          return {
            content: [{ type: 'text', text: `Successfully deleted skill: ${skillId}` }],
          };
        } catch (error) {
          this.logger.error('Error in delete_linkedin_skill:', error);
          throw error;
        }
      }
    );

    // Profile Management Tools - Positions

    this.server.tool(
      'add_linkedin_position',
      'Add a work position to your LinkedIn profile',
      {
        title: z.string().describe('Job title'),
        company: z.string().describe('Company name'),
        description: z.string().optional().describe('Job description'),
        startYear: z.number().describe('Start year'),
        startMonth: z.number().optional().describe('Start month (1-12)'),
        endYear: z.number().optional().describe('End year (omit if current)'),
        endMonth: z.number().optional().describe('End month (1-12)'),
        current: z.boolean().optional().describe('Is this your current position?'),
      },
      async ({ title, company, description, startYear, startMonth, endYear, endMonth, current }): Promise<ToolResult> => {
        this.logger.info('Tool called: add_linkedin_position');
        try {
          if (!title || !company || !startYear) {
            throw new Error('Title, company, and start year are required');
          }
          const startDate = { year: startYear } as { year: number; month?: number };
          if (startMonth !== undefined) startDate.month = startMonth;

          const endDate = endYear ? ({ year: endYear } as { year: number; month?: number }) : undefined;
          if (endDate && endMonth !== undefined) endDate.month = endMonth;

          const position: LinkedInPosition = {
            title,
            company,
            description,
            startDate,
            endDate,
            current,
          };
          const result = await this.linkedInClient.addPosition(position);
          return {
            content: [{ type: 'text', text: `Successfully added position: ${title} at ${company} (ID: ${result.id})` }],
          };
        } catch (error) {
          this.logger.error('Error in add_linkedin_position:', error);
          throw error;
        }
      }
    );

    this.server.tool(
      'update_linkedin_position',
      'Update an existing position on your LinkedIn profile',
      {
        positionId: z.string().describe('The ID of the position to update'),
        title: z.string().optional().describe('Job title'),
        company: z.string().optional().describe('Company name'),
        description: z.string().optional().describe('Job description'),
        startYear: z.number().optional().describe('Start year'),
        startMonth: z.number().optional().describe('Start month (1-12)'),
        endYear: z.number().optional().describe('End year'),
        endMonth: z.number().optional().describe('End month (1-12)'),
      },
      async ({ positionId, title, company, description, startYear, startMonth, endYear, endMonth }): Promise<ToolResult> => {
        this.logger.info('Tool called: update_linkedin_position');
        try {
          if (!positionId) {
            throw new Error('Position ID is required');
          }
          const updates: any = {};
          if (title) updates.title = title;
          if (company) updates.company = company;
          if (description) updates.description = description;
          if (startYear) updates.startDate = { year: startYear, month: startMonth };
          if (endYear) updates.endDate = { year: endYear, month: endMonth };

          await this.linkedInClient.updatePosition(positionId, updates);
          return {
            content: [{ type: 'text', text: `Successfully updated position: ${positionId}` }],
          };
        } catch (error) {
          this.logger.error('Error in update_linkedin_position:', error);
          throw error;
        }
      }
    );

    this.server.tool(
      'delete_linkedin_position',
      'Delete a position from your LinkedIn profile',
      {
        positionId: z.string().describe('The ID of the position to delete'),
      },
      async ({ positionId }): Promise<ToolResult> => {
        this.logger.info('Tool called: delete_linkedin_position');
        try {
          if (!positionId) {
            throw new Error('Position ID is required');
          }
          await this.linkedInClient.deletePosition(positionId);
          return {
            content: [{ type: 'text', text: `Successfully deleted position: ${positionId}` }],
          };
        } catch (error) {
          this.logger.error('Error in delete_linkedin_position:', error);
          throw error;
        }
      }
    );

    // Profile Management Tools - Education

    this.server.tool(
      'add_linkedin_education',
      'Add education to your LinkedIn profile',
      {
        schoolName: z.string().describe('Name of the school'),
        degree: z.string().optional().describe('Degree name'),
        fieldOfStudy: z.string().optional().describe('Field of study'),
        startYear: z.number().optional().describe('Start year'),
        startMonth: z.number().optional().describe('Start month (1-12)'),
        endYear: z.number().optional().describe('End year'),
        endMonth: z.number().optional().describe('End month (1-12)'),
        grade: z.string().optional().describe('Grade or GPA'),
        activities: z.string().optional().describe('Activities and societies'),
      },
      async ({ schoolName, degree, fieldOfStudy, startYear, startMonth, endYear, endMonth, grade, activities }): Promise<ToolResult> => {
        this.logger.info('Tool called: add_linkedin_education');
        try {
          if (!schoolName) {
            throw new Error('School name is required');
          }
          const startDate = startYear ? ({ year: startYear } as { year: number; month?: number }) : undefined;
          if (startDate && startMonth !== undefined) startDate.month = startMonth;

          const endDate = endYear ? ({ year: endYear } as { year: number; month?: number }) : undefined;
          if (endDate && endMonth !== undefined) endDate.month = endMonth;

          const education: LinkedInEducation = {
            schoolName,
            degree,
            fieldOfStudy,
            startDate,
            endDate,
            grade,
            activities,
          };
          const result = await this.linkedInClient.addEducation(education);
          return {
            content: [{ type: 'text', text: `Successfully added education: ${schoolName} (ID: ${result.id})` }],
          };
        } catch (error) {
          this.logger.error('Error in add_linkedin_education:', error);
          throw error;
        }
      }
    );

    this.server.tool(
      'delete_linkedin_education',
      'Delete education from your LinkedIn profile',
      {
        educationId: z.string().describe('The ID of the education entry to delete'),
      },
      async ({ educationId }): Promise<ToolResult> => {
        this.logger.info('Tool called: delete_linkedin_education');
        try {
          if (!educationId) {
            throw new Error('Education ID is required');
          }
          await this.linkedInClient.deleteEducation(educationId);
          return {
            content: [{ type: 'text', text: `Successfully deleted education: ${educationId}` }],
          };
        } catch (error) {
          this.logger.error('Error in delete_linkedin_education:', error);
          throw error;
        }
      }
    );

    // Profile Management Tools - Certifications

    this.server.tool(
      'add_linkedin_certification',
      'Add a certification to your LinkedIn profile',
      {
        name: z.string().describe('Certification name'),
        authority: z.string().describe('Issuing authority/organization'),
        licenseNumber: z.string().optional().describe('License or certification number'),
        startYear: z.number().optional().describe('Issue year'),
        startMonth: z.number().optional().describe('Issue month (1-12)'),
        endYear: z.number().optional().describe('Expiration year'),
        endMonth: z.number().optional().describe('Expiration month (1-12)'),
        url: z.string().optional().describe('URL to certification'),
      },
      async ({ name, authority, licenseNumber, startYear, startMonth, endYear, endMonth, url }): Promise<ToolResult> => {
        this.logger.info('Tool called: add_linkedin_certification');
        try {
          if (!name || !authority) {
            throw new Error('Certification name and authority are required');
          }
          const startDate = startYear ? ({ year: startYear } as { year: number; month?: number }) : undefined;
          if (startDate && startMonth !== undefined) startDate.month = startMonth;

          const endDate = endYear ? ({ year: endYear } as { year: number; month?: number }) : undefined;
          if (endDate && endMonth !== undefined) endDate.month = endMonth;

          const certification: LinkedInCertification = {
            name,
            authority,
            licenseNumber,
            startDate,
            endDate,
            url,
          };
          const result = await this.linkedInClient.addCertification(certification);
          return {
            content: [{ type: 'text', text: `Successfully added certification: ${name} from ${authority} (ID: ${result.id})` }],
          };
        } catch (error) {
          this.logger.error('Error in add_linkedin_certification:', error);
          throw error;
        }
      }
    );

    this.server.tool(
      'delete_linkedin_certification',
      'Delete a certification from your LinkedIn profile',
      {
        certificationId: z.string().describe('The ID of the certification to delete'),
      },
      async ({ certificationId }): Promise<ToolResult> => {
        this.logger.info('Tool called: delete_linkedin_certification');
        try {
          if (!certificationId) {
            throw new Error('Certification ID is required');
          }
          await this.linkedInClient.deleteCertification(certificationId);
          return {
            content: [{ type: 'text', text: `Successfully deleted certification: ${certificationId}` }],
          };
        } catch (error) {
          this.logger.error('Error in delete_linkedin_certification:', error);
          throw error;
        }
      }
    );

    // Profile Management Tools - Publications

    this.server.tool(
      'add_linkedin_publication',
      'Add a publication to your LinkedIn profile',
      {
        name: z.string().describe('Publication name'),
        publisher: z.string().optional().describe('Publisher name'),
        year: z.number().optional().describe('Publication year'),
        month: z.number().optional().describe('Publication month (1-12)'),
        day: z.number().optional().describe('Publication day (1-31)'),
        description: z.string().optional().describe('Publication description'),
        url: z.string().optional().describe('URL to publication'),
      },
      async ({ name, publisher, year, month, day, description, url }): Promise<ToolResult> => {
        this.logger.info('Tool called: add_linkedin_publication');
        try {
          if (!name) {
            throw new Error('Publication name is required');
          }
          const date = year ? ({ year } as { year: number; month?: number; day?: number }) : undefined;
          if (date && month !== undefined) date.month = month;
          if (date && day !== undefined) date.day = day;

          const publication: LinkedInPublication = {
            name,
            publisher,
            date,
            description,
            url,
          };
          const result = await this.linkedInClient.addPublication(publication);
          return {
            content: [{ type: 'text', text: `Successfully added publication: ${name} (ID: ${result.id})` }],
          };
        } catch (error) {
          this.logger.error('Error in add_linkedin_publication:', error);
          throw error;
        }
      }
    );

    this.server.tool(
      'delete_linkedin_publication',
      'Delete a publication from your LinkedIn profile',
      {
        publicationId: z.string().describe('The ID of the publication to delete'),
      },
      async ({ publicationId }): Promise<ToolResult> => {
        this.logger.info('Tool called: delete_linkedin_publication');
        try {
          if (!publicationId) {
            throw new Error('Publication ID is required');
          }
          await this.linkedInClient.deletePublication(publicationId);
          return {
            content: [{ type: 'text', text: `Successfully deleted publication: ${publicationId}` }],
          };
        } catch (error) {
          this.logger.error('Error in delete_linkedin_publication:', error);
          throw error;
        }
      }
    );

    // Profile Management Tools - Languages

    this.server.tool(
      'add_linkedin_language',
      'Add a language to your LinkedIn profile',
      {
        name: z.string().describe('Language name'),
        proficiency: z.enum(['ELEMENTARY', 'LIMITED_WORKING', 'PROFESSIONAL_WORKING', 'FULL_PROFESSIONAL', 'NATIVE_OR_BILINGUAL'])
          .optional()
          .describe('Proficiency level'),
      },
      async ({ name, proficiency }): Promise<ToolResult> => {
        this.logger.info('Tool called: add_linkedin_language');
        try {
          if (!name) {
            throw new Error('Language name is required');
          }
          const language: LinkedInLanguage = { name, proficiency };
          const result = await this.linkedInClient.addLanguage(language);
          return {
            content: [{ type: 'text', text: `Successfully added language: ${name} (ID: ${result.id})` }],
          };
        } catch (error) {
          this.logger.error('Error in add_linkedin_language:', error);
          throw error;
        }
      }
    );

    this.server.tool(
      'delete_linkedin_language',
      'Delete a language from your LinkedIn profile',
      {
        languageId: z.string().describe('The ID of the language to delete'),
      },
      async ({ languageId }): Promise<ToolResult> => {
        this.logger.info('Tool called: delete_linkedin_language');
        try {
          if (!languageId) {
            throw new Error('Language ID is required');
          }
          await this.linkedInClient.deleteLanguage(languageId);
          return {
            content: [{ type: 'text', text: `Successfully deleted language: ${languageId}` }],
          };
        } catch (error) {
          this.logger.error('Error in delete_linkedin_language:', error);
          throw error;
        }
      }
    );
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
