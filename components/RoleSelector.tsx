'use client';

import { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import Fuse from 'fuse.js';

interface RoleSelectorProps {
  roles: string[];
  selectedRole: string;
  onChange: (role: string) => void;
}

export default function RoleSelector({ roles, selectedRole, onChange }: RoleSelectorProps) {
  const [query, setQuery] = useState('');

  // Fuzzy search setup
  const fuse = useMemo(() => new Fuse(roles, { threshold: 0.3, keys: [] }), [roles]);
  const filteredRoles = useMemo(() => {
    if (!query.trim()) return roles;
    return fuse.search(query).map(r => r.item);
  }, [roles, fuse, query]);

  return (
    <div className="flex flex-col space-y-2 ">
      <input
        type="text"
        placeholder="Filter roles…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full border rounded-md px-2 py-1"
      />
      <div className="space-y-1">
        <label className="flex items-center space-x-2">
          <Checkbox
            checked={selectedRole === 'all'}
            onCheckedChange={checked => checked ? onChange('all') : null}
          />
          <span>All Roles</span>
        </label>
        {filteredRoles.map(role => (
          <label key={role} className="flex items-center space-x-2">
            <Checkbox
              checked={selectedRole === role}
              onCheckedChange={checked => checked ? onChange(role) : onChange('all')}
            />
            <span>{role}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
