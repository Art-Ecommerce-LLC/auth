
export type Subscription = {
  id: number;
  match_type: 'role' | 'permit_type' | 'address';
  match_value: string;
  role: string;
};
