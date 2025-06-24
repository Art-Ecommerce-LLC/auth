export type Permit = {
  id: string;
  urgency: string;
  permit_number: string;
  address: string;
  permit_type: string;
  issue_date: string;
  lead_price: number;
  hotness: number;
  project_value: number;
  description: string;
  reasoning_summary: string;
  latitude: number;
  longitude: number;
  recommended_roles?: string[];
};