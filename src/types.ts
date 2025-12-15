import { z } from 'zod';

// LinkedIn API types
export const LinkedInProfileSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  headline: z.string().optional(),
  profilePictureUrl: z.string().optional(),
  vanityName: z.string().optional(),
});

export type LinkedInProfile = z.infer<typeof LinkedInProfileSchema>;

export const LinkedInPostSchema = z.object({
  id: z.string(),
  author: z.string(),
  text: z.string(),
  createdAt: z.string(),
  likeCount: z.number().optional(),
  commentCount: z.number().optional(),
  shareCount: z.number().optional(),
});

export type LinkedInPost = z.infer<typeof LinkedInPostSchema>;

export const LinkedInConnectionSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  headline: z.string().optional(),
  connectedAt: z.string().optional(),
});

export type LinkedInConnection = z.infer<typeof LinkedInConnectionSchema>;

// Profile Edit types
export const LinkedInSkillSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
});

export type LinkedInSkill = z.infer<typeof LinkedInSkillSchema>;

export const LinkedInPositionSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  company: z.string(),
  description: z.string().optional(),
  startDate: z.object({
    year: z.number(),
    month: z.number().optional(),
  }),
  endDate: z.object({
    year: z.number(),
    month: z.number().optional(),
  }).optional(),
  current: z.boolean().optional(),
});

export type LinkedInPosition = z.infer<typeof LinkedInPositionSchema>;

export const LinkedInEducationSchema = z.object({
  id: z.string().optional(),
  schoolName: z.string(),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startDate: z.object({
    year: z.number(),
    month: z.number().optional(),
  }).optional(),
  endDate: z.object({
    year: z.number(),
    month: z.number().optional(),
  }).optional(),
  grade: z.string().optional(),
  activities: z.string().optional(),
});

export type LinkedInEducation = z.infer<typeof LinkedInEducationSchema>;

export const LinkedInCertificationSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  authority: z.string(),
  licenseNumber: z.string().optional(),
  startDate: z.object({
    year: z.number(),
    month: z.number().optional(),
  }).optional(),
  endDate: z.object({
    year: z.number(),
    month: z.number().optional(),
  }).optional(),
  url: z.string().optional(),
});

export type LinkedInCertification = z.infer<typeof LinkedInCertificationSchema>;

export const LinkedInPublicationSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  publisher: z.string().optional(),
  date: z.object({
    year: z.number(),
    month: z.number().optional(),
    day: z.number().optional(),
  }).optional(),
  description: z.string().optional(),
  url: z.string().optional(),
});

export type LinkedInPublication = z.infer<typeof LinkedInPublicationSchema>;

export const LinkedInLanguageSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  proficiency: z.enum(['ELEMENTARY', 'LIMITED_WORKING', 'PROFESSIONAL_WORKING', 'FULL_PROFESSIONAL', 'NATIVE_OR_BILINGUAL']).optional(),
});

export type LinkedInLanguage = z.infer<typeof LinkedInLanguageSchema>;

// Configuration types
export interface ServerConfig {
  linkedInAccessToken?: string;
  linkedInClientId?: string;
  linkedInClientSecret?: string;
  linkedInRedirectUri?: string;
  port?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

// MCP Tool types
export interface ToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

export interface ToolArguments {
  [key: string]: unknown;
}

