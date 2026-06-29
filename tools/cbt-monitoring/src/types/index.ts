// CBT Monitoring types

export interface CbtCommunity {
  id: string;
  community: string;
  region: string;
  contactPerson?: string;
  contactInfo?: string;
  responsibleStaff: string;
  lastUpdate: string | null; // ISO date string
  daysSinceUpdate: number;
  status: 'green' | 'yellow' | 'red';
  engagementCount: number; // last 30 days
  contentCount: number; // last 30 days
  nextVisit: string | null; // ISO date string
  updatedAt?: string | Date;
  createdAt?: string | Date;
}

export interface CbtStats {
  total: number;
  green: number;
  yellow: number;
  red: number;
}

// CBT Form submission types
export interface CbtUpdateFormData {
  staffName: string;
  community: string;
  dateOfInteraction: string; // ISO date string
  engagementType: string[]; // ['Visit', 'Phone', 'WhatsApp', 'Email', 'No contact']
  updateSummary: string;
  contentProduced: string[]; // ['Instagram Post', 'Facebook Post', 'Story', 'Video', 'Blog Post', 'Other']
  supportNeeded?: string;
  nextPlannedVisit?: string; // ISO date string
}

export interface CbtFormSubmissionResponse {
  success: boolean;
  message?: string;
  id?: string;
}

