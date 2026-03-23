import { useState } from 'react';
import SpecificationCard from '@/features/specifications/SpecificationCard';
import SpecificationModal from '@/features/specifications/SpecificationModal';
import SpecificationForm from '@/features/specifications/SpecificationForm';
import { useGetSpecificationsQuery } from '@/features/specifications/specificationsApi';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function CommunitySpecsPage() {
  const { data, isLoading } = useGetSpecificationsQuery();
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editSpec, setEditSpec] = useState(null);

  const specs = data?.results || [];

  const handleEdit = (spec) => {
    setSelectedSpec(null);
    setEditSpec(spec);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Community Specifications</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" /> New Specification
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {specs.length === 0 && !isLoading && (
          <p className="text-muted-foreground italic">No specifications available.</p>
        )}
        {specs.map((spec) => (
          <SpecificationCard key={spec.id} spec={spec} onClick={setSelectedSpec} />
        ))}
      </div>

      <SpecificationModal
        spec={selectedSpec}
        onClose={() => setSelectedSpec(null)}
        onEdit={handleEdit}
      />

      <SpecificationForm
        open={showForm || !!editSpec}
        onClose={() => { setShowForm(false); setEditSpec(null); }}
        initial={editSpec}
      />
    </div>
  );
}
