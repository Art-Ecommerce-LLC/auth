'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  roles: string[];
  selectedRole: string;
  onRoleChange: (role: string) => void;
  search: string;
  onSearchChange: (q: string) => void;
}

export default function FilterPanel({ roles, selectedRole, onRoleChange, search, onSearchChange }: Props) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-xs">
      <Input
        placeholder="Search description..."
        value={search}
        onChange={e => onSearchChange(e.target.value)}
      />

      <Select onValueChange={onRoleChange} value={selectedRole}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Filter by Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          {roles.map(r => (
            <SelectItem key={r} value={r}>{r}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
