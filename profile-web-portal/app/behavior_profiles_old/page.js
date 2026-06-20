"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {ProfileTable} from './ui/ProfileTable.js';
import {DetailModal} from './ui/DetailModal';



export default function ProfilesTab (){
  const [selectedEntity, setSelectedEntity] = useState(null);

  return (
    <div className="min-h-screen text-black">
   
      <ProfileTable 
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
