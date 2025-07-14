'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPermits } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useToast } from "./hooks/use-toast"


interface Props {
  currentRole: string;
}

export default function ChangeRoleWidget({ currentRole }: Props) {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { data: permits = [] } = useQuery({
    queryKey: ['permits'],
    queryFn: fetchPermits,
  });

  const availableRoles = useMemo(
    () =>
      Array.from(new Set(permits.flatMap(p => p.recommendedRoles || [])))
        .filter((role): role is string | number => typeof role === 'string' || typeof role === 'number'),
    [permits]
  );

  const updateRole = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!res.ok) throw new Error('Failed to update role');

      toast({ title: 'Role updated successfully!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Could not update role', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Select defaultValue={currentRole} onValueChange={setSelectedRole}>
        <SelectTrigger>
          <SelectValue placeholder="Select Role" />
        </SelectTrigger>
        <SelectContent>
          {availableRoles.map((role) => (
            <SelectItem key={role} value={String(role)}>
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button disabled={loading || selectedRole === currentRole} onClick={updateRole}>
        {loading ? 'Updating...' : 'Update Role'}
      </Button>
    </div>
  );
}
