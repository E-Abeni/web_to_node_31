
import React, { useState, useMemo, useEffect } from 'react';
import { EntityData } from '../types';
import EntityTable from './ui/EntityTable';
import DetailModal from './ui/DetailModal';





export const ProfilesTab: React.FC = () => {
  const [selectedEntity, setSelectedEntity] = useState<EntityData | null>(null);


  
  

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      

      {/* Data Presentation */}
      <EntityTable 
        onShowDetails={(entity) => setSelectedEntity(entity)} 
      />
    

      {/* Detail Modal */}
      {selectedEntity && (
        <DetailModal 
          entity={selectedEntity} 
          onClose={() => setSelectedEntity(null)} 
        />
      )}
    </div>
  );
};

