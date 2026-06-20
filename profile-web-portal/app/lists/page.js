import React from 'react';
import { ShieldAlert } from 'lucide-react';
import ListViewer from './ui/ListViewer';

export default function App() {
 return (
    <div className="min-h-screen bg-[#09141f] text-neutral-100 font-sans flex flex-col">
      
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto w-full max-w-7xl mx-auto">
        <ListViewer />
      </main>
    </div>
  );
}


