'use client';

import { useState, useMemo, useEffect, useTransition } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { fetchPermits } from '@/lib/api';
import SummaryCards from './SummaryCards';
import PermitTable from './PermitTable';
import PermitMap from './PermitMap';
import { DashboardLoadingShimmer } from './DashboardLoadingShimmer';
import RoleSelector from '@/components/RoleSelector';

export default function DashboardClient() {
  const router = useRouter();

  // 1) Data fetching
  const {
    data: permits = [],
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['permits'],
    queryFn: fetchPermits,
  });

  // 2) Auth redirect
  useEffect(() => {
    if (error) {
      if (error.message === 'UNAUTHORIZED') router.push('/login');
      if (error.message === 'FORBIDDEN') router.push('/select-plan');
    }
  }, [error, router]);

  // 3) UI state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);


  // 4b) role list memoization
  const allRoles = useMemo(
    () =>
      Array.from(new Set(permits.flatMap(p => p.recommendedRoles || []))).filter(
        (role): role is string => typeof role === 'string'
      ),
    [permits]
  );

  // 4c) filtered permits
  const filtered = useMemo(() => {
    return permits
      .filter(p =>
        (roleFilter === 'all' ||
          (Array.isArray(p.recommendedRoles) && p.recommendedRoles.includes(roleFilter))) &&
        p.description?.toLowerCase().includes(search.toLowerCase())
      );
  }, [permits, roleFilter, search]);

  // 4d) marker data
  const markerData = useMemo(
    () => filtered.map(p => ({ id: p.permitNumber, lat: p.latitude, lon: p.longitude })),
    [filtered]
  );

  // 5) Conditional UI
  if (isLoading) {
    return <DashboardLoadingShimmer />;
  }
  if (error && error.message === 'NETWORK_ERROR') {
    return (
      <div>
        <p>Failed to load permits.</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  // 6) Render
  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r p-6 overflow-auto h-full">
        <RoleSelector
          roles={allRoles}
          selectedRole={roleFilter}
          onChange={(role: string) => setRoleFilter(role)}
        />
      </aside>

      {/* Main content: split into "left (cards+table)" and "right (map)" */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left region: summary cards on top, table below */}
        <div className="flex-1 flex flex-col">
          {/* Summary cards only above table */}
          <div className="p-6 border-b">
            <SummaryCards permits={filtered} />
          </div>

          {/* Table takes all remaining left-space */}
          <div className="flex-1 overflow-auto p-6 bg-white shadow-lg">
            <PermitTable
              permits={filtered}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </div>

        {/* Right region: map fills its column top-to-bottom */}
        <div className="w-1/3 overflow-auto p-6 bg-white shadow-lg">
          <PermitMap
            permits={markerData}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>
    </div>
  );
}