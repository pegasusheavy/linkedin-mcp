import axios, { AxiosInstance } from 'axios';
import {
  LinkedInProfile,
  LinkedInPost,
  LinkedInConnection,
  LinkedInProfileSchema,
  LinkedInPostSchema,
  LinkedInConnectionSchema,
  LinkedInSkill,
  LinkedInPosition,
  LinkedInEducation,
  LinkedInCertification,
  LinkedInPublication,
  LinkedInLanguage,
} from './types.js';
import { Logger } from './logger.js';

export class LinkedInClient {
  private client: AxiosInstance;
  private logger: Logger;

  constructor(accessToken: string, logger: Logger = new Logger()) {
    this.logger = logger;
    this.client = axios.create({
      baseURL: 'https://api.linkedin.com/v2',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });
  }

  async getProfile(): Promise<LinkedInProfile> {
    try {
      this.logger.debug('Fetching LinkedIn profile');
      // Try OpenID Connect userinfo endpoint first (works with openid+profile scopes)
      try {
        const userinfoResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
          headers: {
            Authorization: this.client.defaults.headers.Authorization,
          },
        });
        const profile = LinkedInProfileSchema.parse({
          id: userinfoResponse.data.sub,
          firstName: userinfoResponse.data.given_name || '',
          lastName: userinfoResponse.data.family_name || '',
          headline: userinfoResponse.data.headline || '',
          profilePictureUrl: userinfoResponse.data.picture || '',
          vanityName: userinfoResponse.data.vanityName || '',
        });
        this.logger.info('Successfully fetched LinkedIn profile via userinfo');
        return profile;
      } catch (userinfoError) {
        this.logger.debug('userinfo endpoint failed, trying /me endpoint');
        // Fall back to legacy /me endpoint (requires r_liteprofile scope)
        const response = await this.client.get('/me');
        const profile = LinkedInProfileSchema.parse({
          id: response.data.id,
          firstName: response.data.localizedFirstName || response.data.firstName?.localized?.en_US || '',
          lastName: response.data.localizedLastName || response.data.lastName?.localized?.en_US || '',
          headline: response.data.headline,
          profilePictureUrl: response.data.profilePicture,
          vanityName: response.data.vanityName,
        });
        this.logger.info('Successfully fetched LinkedIn profile via /me');
        return profile;
      }
    } catch (error) {
      this.logger.error('Error fetching LinkedIn profile', error);
      throw new Error(`Failed to fetch LinkedIn profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPosts(limit: number = 10): Promise<LinkedInPost[]> {
    try {
      this.logger.debug(`Fetching LinkedIn posts (limit: ${limit})`);
      const response = await this.client.get('/ugcPosts', {
        params: {
          q: 'authors',
          authors: 'urn:li:person:me',
          count: limit,
        },
      });

      const posts = response.data.elements?.map((post: any) => {
        return LinkedInPostSchema.parse({
          id: post.id,
          author: post.author,
          text: post.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text || '',
          createdAt: new Date(post.created?.time || Date.now()).toISOString(),
          likeCount: post.likesSummary?.totalLikes || 0,
          commentCount: post.commentsSummary?.totalComments || 0,
          shareCount: post.sharesSummary?.totalShares || 0,
        });
      }) || [];

      this.logger.info(`Successfully fetched ${posts.length} LinkedIn posts`);
      return posts;
    } catch (error) {
      this.logger.error('Error fetching LinkedIn posts', error);
      throw new Error(`Failed to fetch LinkedIn posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getConnections(limit: number = 50): Promise<LinkedInConnection[]> {
    try {
      this.logger.debug(`Fetching LinkedIn connections (limit: ${limit})`);
      const response = await this.client.get('/connections', {
        params: {
          q: 'viewer',
          start: 0,
          count: limit,
        },
      });

      const connections = response.data.elements?.map((conn: any) => {
        return LinkedInConnectionSchema.parse({
          id: conn.to || conn.id || '',
          firstName: conn.firstName?.localized?.en_US || '',
          lastName: conn.lastName?.localized?.en_US || '',
          headline: conn.headline,
          connectedAt: conn.createdAt ? new Date(conn.createdAt).toISOString() : undefined,
        });
      }) || [];

      this.logger.info(`Successfully fetched ${connections.length} LinkedIn connections`);
      return connections;
    } catch (error) {
      this.logger.error('Error fetching LinkedIn connections', error);
      throw new Error(`Failed to fetch LinkedIn connections: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async sharePost(text: string): Promise<{ id: string; url: string }> {
    try {
      this.logger.debug('Creating LinkedIn post');
      const profile = await this.getProfile();
      const response = await this.client.post('/ugcPosts', {
        author: `urn:li:person:${profile.id}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text,
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      });

      const postId = response.data.id;
      const postUrl = `https://www.linkedin.com/feed/update/${postId}`;

      this.logger.info(`Successfully created LinkedIn post: ${postId}`);
      return { id: postId, url: postUrl };
    } catch (error) {
      this.logger.error('Error creating LinkedIn post', error);
      throw new Error(`Failed to create LinkedIn post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async searchPeople(keywords: string, limit: number = 10): Promise<LinkedInConnection[]> {
    try {
      this.logger.debug(`Searching LinkedIn people with keywords: ${keywords}`);
      const response = await this.client.get('/search', {
        params: {
          q: 'people',
          keywords,
          count: limit,
        },
      });

      const people = response.data.elements?.map((person: any) => {
        return LinkedInConnectionSchema.parse({
          id: person.id || '',
          firstName: person.firstName?.localized?.en_US || '',
          lastName: person.lastName?.localized?.en_US || '',
          headline: person.headline,
        });
      }) || [];

      this.logger.info(`Successfully found ${people.length} people matching: ${keywords}`);
      return people;
    } catch (error) {
      this.logger.error('Error searching LinkedIn people', error);
      throw new Error(`Failed to search LinkedIn people: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Profile Management Methods

  async addSkill(skill: LinkedInSkill): Promise<{ id: string }> {
    try {
      this.logger.debug(`Adding skill: ${skill.name}`);
      const profile = await this.getProfile();
      const response = await this.client.post(`/people/(id:${profile.id})/skills`, {
        name: {
          locale: { language: 'en', country: 'US' },
          value: skill.name,
        },
      });

      const skillId = response.headers['x-linkedin-id'] || response.data.id;
      this.logger.info(`Successfully added skill: ${skill.name} (${skillId})`);
      return { id: skillId };
    } catch (error) {
      this.logger.error('Error adding skill', error);
      throw new Error(`Failed to add skill: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteSkill(skillId: string): Promise<void> {
    try {
      this.logger.debug(`Deleting skill: ${skillId}`);
      const profile = await this.getProfile();
      await this.client.delete(`/people/(id:${profile.id})/skills/${skillId}`);
      this.logger.info(`Successfully deleted skill: ${skillId}`);
    } catch (error) {
      this.logger.error('Error deleting skill', error);
      throw new Error(`Failed to delete skill: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addPosition(position: LinkedInPosition): Promise<{ id: string }> {
    try {
      this.logger.debug(`Adding position: ${position.title} at ${position.company}`);
      const profile = await this.getProfile();

      const payload: any = {
        title: {
          locale: { language: 'en', country: 'US' },
          value: position.title,
        },
        company: {
          locale: { language: 'en', country: 'US' },
          value: position.company,
        },
        timePeriod: {
          startDate: {
            year: position.startDate.year,
            ...(position.startDate.month && { month: position.startDate.month }),
          },
        },
      };

      if (position.description) {
        payload.description = {
          locale: { language: 'en', country: 'US' },
          value: position.description,
        };
      }

      if (position.endDate && !position.current) {
        payload.timePeriod.endDate = {
          year: position.endDate.year,
          ...(position.endDate.month && { month: position.endDate.month }),
        };
      }

      const response = await this.client.post(`/people/(id:${profile.id})/positions`, payload);

      const positionId = response.headers['x-linkedin-id'] || response.data.id;
      this.logger.info(`Successfully added position: ${position.title} (${positionId})`);
      return { id: positionId };
    } catch (error) {
      this.logger.error('Error adding position', error);
      throw new Error(`Failed to add position: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updatePosition(positionId: string, position: Partial<LinkedInPosition>): Promise<void> {
    try {
      this.logger.debug(`Updating position: ${positionId}`);
      const profile = await this.getProfile();

      const payload: any = {};

      if (position.title) {
        payload.title = {
          locale: { language: 'en', country: 'US' },
          value: position.title,
        };
      }

      if (position.company) {
        payload.company = {
          locale: { language: 'en', country: 'US' },
          value: position.company,
        };
      }

      if (position.description) {
        payload.description = {
          locale: { language: 'en', country: 'US' },
          value: position.description,
        };
      }

      if (position.startDate || position.endDate) {
        payload.timePeriod = {};
        if (position.startDate) {
          payload.timePeriod.startDate = {
            year: position.startDate.year,
            ...(position.startDate.month && { month: position.startDate.month }),
          };
        }
        if (position.endDate && !position.current) {
          payload.timePeriod.endDate = {
            year: position.endDate.year,
            ...(position.endDate.month && { month: position.endDate.month }),
          };
        }
      }

      await this.client.put(`/people/(id:${profile.id})/positions/${positionId}`, payload);
      this.logger.info(`Successfully updated position: ${positionId}`);
    } catch (error) {
      this.logger.error('Error updating position', error);
      throw new Error(`Failed to update position: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deletePosition(positionId: string): Promise<void> {
    try {
      this.logger.debug(`Deleting position: ${positionId}`);
      const profile = await this.getProfile();
      await this.client.delete(`/people/(id:${profile.id})/positions/${positionId}`);
      this.logger.info(`Successfully deleted position: ${positionId}`);
    } catch (error) {
      this.logger.error('Error deleting position', error);
      throw new Error(`Failed to delete position: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addEducation(education: LinkedInEducation): Promise<{ id: string }> {
    try {
      this.logger.debug(`Adding education: ${education.schoolName}`);
      const profile = await this.getProfile();

      const payload: any = {
        schoolName: {
          locale: { language: 'en', country: 'US' },
          value: education.schoolName,
        },
      };

      if (education.degree) {
        payload.degreeName = {
          locale: { language: 'en', country: 'US' },
          value: education.degree,
        };
      }

      if (education.fieldOfStudy) {
        payload.fieldOfStudy = {
          locale: { language: 'en', country: 'US' },
          value: education.fieldOfStudy,
        };
      }

      if (education.startDate || education.endDate) {
        payload.timePeriod = {};
        if (education.startDate) {
          payload.timePeriod.startDate = {
            year: education.startDate.year,
            ...(education.startDate.month && { month: education.startDate.month }),
          };
        }
        if (education.endDate) {
          payload.timePeriod.endDate = {
            year: education.endDate.year,
            ...(education.endDate.month && { month: education.endDate.month }),
          };
        }
      }

      if (education.grade) {
        payload.grade = {
          locale: { language: 'en', country: 'US' },
          value: education.grade,
        };
      }

      if (education.activities) {
        payload.activities = {
          locale: { language: 'en', country: 'US' },
          value: education.activities,
        };
      }

      const response = await this.client.post(`/people/(id:${profile.id})/educations`, payload);

      const educationId = response.headers['x-linkedin-id'] || response.data.id;
      this.logger.info(`Successfully added education: ${education.schoolName} (${educationId})`);
      return { id: educationId };
    } catch (error) {
      this.logger.error('Error adding education', error);
      throw new Error(`Failed to add education: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteEducation(educationId: string): Promise<void> {
    try {
      this.logger.debug(`Deleting education: ${educationId}`);
      const profile = await this.getProfile();
      await this.client.delete(`/people/(id:${profile.id})/educations/${educationId}`);
      this.logger.info(`Successfully deleted education: ${educationId}`);
    } catch (error) {
      this.logger.error('Error deleting education', error);
      throw new Error(`Failed to delete education: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addCertification(certification: LinkedInCertification): Promise<{ id: string }> {
    try {
      this.logger.debug(`Adding certification: ${certification.name}`);
      const profile = await this.getProfile();

      const payload: any = {
        name: {
          locale: { language: 'en', country: 'US' },
          value: certification.name,
        },
        authority: {
          locale: { language: 'en', country: 'US' },
          value: certification.authority,
        },
      };

      if (certification.licenseNumber) {
        payload.licenseNumber = {
          locale: { language: 'en', country: 'US' },
          value: certification.licenseNumber,
        };
      }

      if (certification.startDate || certification.endDate) {
        payload.timePeriod = {};
        if (certification.startDate) {
          payload.timePeriod.startDate = {
            year: certification.startDate.year,
            ...(certification.startDate.month && { month: certification.startDate.month }),
          };
        }
        if (certification.endDate) {
          payload.timePeriod.endDate = {
            year: certification.endDate.year,
            ...(certification.endDate.month && { month: certification.endDate.month }),
          };
        }
      }

      if (certification.url) {
        payload.url = certification.url;
      }

      const response = await this.client.post(`/people/(id:${profile.id})/certifications`, payload);

      const certId = response.headers['x-linkedin-id'] || response.data.id;
      this.logger.info(`Successfully added certification: ${certification.name} (${certId})`);
      return { id: certId };
    } catch (error) {
      this.logger.error('Error adding certification', error);
      throw new Error(`Failed to add certification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteCertification(certificationId: string): Promise<void> {
    try {
      this.logger.debug(`Deleting certification: ${certificationId}`);
      const profile = await this.getProfile();
      await this.client.delete(`/people/(id:${profile.id})/certifications/${certificationId}`);
      this.logger.info(`Successfully deleted certification: ${certificationId}`);
    } catch (error) {
      this.logger.error('Error deleting certification', error);
      throw new Error(`Failed to delete certification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addPublication(publication: LinkedInPublication): Promise<{ id: string }> {
    try {
      this.logger.debug(`Adding publication: ${publication.name}`);
      const profile = await this.getProfile();

      const payload: any = {
        name: {
          locale: { language: 'en', country: 'US' },
          value: publication.name,
        },
      };

      if (publication.publisher) {
        payload.publisher = {
          locale: { language: 'en', country: 'US' },
          value: publication.publisher,
        };
      }

      if (publication.description) {
        payload.description = {
          locale: { language: 'en', country: 'US' },
          value: publication.description,
        };
      }

      if (publication.date) {
        payload.date = {
          year: publication.date.year,
          ...(publication.date.month && { month: publication.date.month }),
          ...(publication.date.day && { day: publication.date.day }),
        };
      }

      if (publication.url) {
        payload.url = publication.url;
      }

      const response = await this.client.post(`/people/(id:${profile.id})/publications`, payload);

      const pubId = response.headers['x-linkedin-id'] || response.data.id;
      this.logger.info(`Successfully added publication: ${publication.name} (${pubId})`);
      return { id: pubId };
    } catch (error) {
      this.logger.error('Error adding publication', error);
      throw new Error(`Failed to add publication: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deletePublication(publicationId: string): Promise<void> {
    try {
      this.logger.debug(`Deleting publication: ${publicationId}`);
      const profile = await this.getProfile();
      await this.client.delete(`/people/(id:${profile.id})/publications/${publicationId}`);
      this.logger.info(`Successfully deleted publication: ${publicationId}`);
    } catch (error) {
      this.logger.error('Error deleting publication', error);
      throw new Error(`Failed to delete publication: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addLanguage(language: LinkedInLanguage): Promise<{ id: string }> {
    try {
      this.logger.debug(`Adding language: ${language.name}`);
      const profile = await this.getProfile();

      const payload: any = {
        name: {
          locale: { language: 'en', country: 'US' },
          value: language.name,
        },
      };

      if (language.proficiency) {
        payload.proficiency = language.proficiency;
      }

      const response = await this.client.post(`/people/(id:${profile.id})/languages`, payload);

      const langId = response.headers['x-linkedin-id'] || response.data.id;
      this.logger.info(`Successfully added language: ${language.name} (${langId})`);
      return { id: langId };
    } catch (error) {
      this.logger.error('Error adding language', error);
      throw new Error(`Failed to add language: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteLanguage(languageId: string): Promise<void> {
    try {
      this.logger.debug(`Deleting language: ${languageId}`);
      const profile = await this.getProfile();
      await this.client.delete(`/people/(id:${profile.id})/languages/${languageId}`);
      this.logger.info(`Successfully deleted language: ${languageId}`);
    } catch (error) {
      this.logger.error('Error deleting language', error);
      throw new Error(`Failed to delete language: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

