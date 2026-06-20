"use client";

import React, { useState } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, X, UploadCloud, CheckCircle2 } from 'lucide-react';

const MOCK_DATA = [
  { id: 1, list_category: 'sanction', list_name: 'OFAC SDN List', entity_type: 'person', name: 'Abebe Bekele', country: 'USA', reason: 'Terrorism financing', date_added: new Date().toISOString() },
  { id: 2, list_category: 'watchlist', list_name: 'Interpol Red Notice', entity_type: 'person', name: 'Biniyam Alemu', country: 'UK', reason: 'Fraud', date_added: new Date().toISOString() },
  { id: 3, list_category: 'sanction', list_name: 'EU Sanctions', entity_type: 'organization', name: 'Abenezer Tamirat', country: 'Russia', reason: 'Sanctions evasion', date_added: new Date().toISOString() },
  { id: 4, list_category: 'watchlist', list_name: 'Fedral Police Most Wanted', entity_type: 'person', name: 'Mekdes Alemu', country: 'Mexico', reason: 'Organized Crime', date_added: new Date().toISOString() },
];

export default function ListViewer() {
  const [entities, setEntities] = useState(MOCK_DATA);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [listCategory, setListCategory] = useState('sanction');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [formData, setFormData] = useState({
    list_category: 'sanction',
    list_name: '',
    entity_type: 'person',
    name: '',
    country: '',
    reason: ''
  });

  // Upload State
  const [uploadData, setUploadData] = useState({
    list_name: '',
    list_category: 'sanction',
    entity_type: 'person'
  });
  const [file, setFile] = useState(null);

  const filteredEntities = entities.filter(e => {
    if (listCategory && e.list_category !== listCategory) return false;
    if (filterType && e.entity_type !== filterType) return false;
    if (searchQuery && !e.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleDelete = (id) => {
    if (!confirm('Are you sure you want to delete this entity?')) return;
    setEntities(entities.filter(e => e.id !== id));
  };

  const openAddModal = () => {
    setEditingEntity(null);
    setFormData({
      list_category: listCategory,
      list_name: '',
      entity_type: 'person',
      name: '',
      country: '',
      reason: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (entity) => {
    setEditingEntity(entity);
    setFormData({
      list_category: entity.list_category || 'watchlist',
      list_name: entity.list_name,
      entity_type: entity.entity_type,
      name: entity.name,
      country: entity.country || '',
      reason: entity.reason || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingEntity) {
      setEntities(entities.map(en => en.id === editingEntity.id ? { ...en, ...formData } : en));
    } else {
      const newEntity = {
        ...formData,
        id: Date.now(),
        country: formData.country || null,
        reason: formData.reason || null,
        date_added: new Date().toISOString()
      };
      setEntities([newEntity, ...entities]);
    }
    setIsModalOpen(false);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file || !uploadData.list_name) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim() !== '');
      if (lines.length < 2) throw new Error('File has no data rows');
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const nameIndex = headers.findIndex(h => h.includes('name'));
      const countryIndex = headers.findIndex(h => h.includes('country'));
      const reasonIndex = headers.findIndex(h => h.includes('reason'));

      if (nameIndex === -1) throw new Error('CSV must have a "name" column');

      const parsed = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
        const name = row[nameIndex];
        if (!name) continue;

        parsed.push({
          id: Date.now() + i,
          list_category: uploadData.list_category,
          list_name: uploadData.list_name,
          entity_type: uploadData.entity_type,
          name: name,
          country: countryIndex !== -1 ? row[countryIndex] : null,
          reason: reasonIndex !== -1 ? row[reasonIndex] : null,
          date_added: new Date().toISOString()
        });
      }

      setEntities([...parsed, ...entities]);
      setIsUploadModalOpen(false);
      setFile(null);
      setUploadData({ list_name: '', list_category: 'sanction', entity_type: 'person' });
      alert(`Successfully uploaded ${parsed.length} records.`);
    } catch (err) {
      alert('Failed to parse CSV: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen p-4 md:p-8 bg-[#09141f]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">
            {listCategory === 'sanction' ? 'Sanction List' : 'Watchlist List'}
          </h2>
          <p className="text-white">Search and filter across all ingested {listCategory === 'sanction' ? 'sanction' : 'watch'} lists.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-800 border border-neutral-800 rounded-xl p-1 inline-flex text-sm shadow-sm">
            <button
              onClick={() => setListCategory('sanction')}
              className={`px-3 py-1.5 rounded-lg transition-all ${listCategory === 'sanction' ? 'bg-blue-800 text-white font-semibold shadow-inner' : 'text-white hover:text-neutral-300'}`}
            >
              Sanction Lists
            </button>
            <button
              onClick={() => setListCategory('watchlist')}
              className={`px-3 py-1.5 rounded-lg transition-all ${listCategory === 'watchlist' ? 'bg-blue-800 text-white font-semibold shadow-inner' : 'text-white hover:text-neutral-300'}`}
            >
              Watch Lists
            </button>
          </div>
          
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center space-x-2 bg-slate-800 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 px-4 py-2.5 rounded-xl transition-colors font-medium text-sm shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Bulk Upload</span>
          </button>

          <button 
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl transition-colors font-medium text-sm shadow-md shadow-rose-900/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entity</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-white" />
          </div>
          <input
            type="text"
            placeholder="Search organizations or individuals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 bg-slate-800 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
          />
        </div>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-white" />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 bg-slate-800 border border-neutral-800 rounded-xl text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 appearance-none transition-all shadow-sm"
          >
            <option value="">All Entity Types</option>
            <option value="person">Person</option>
            <option value="organization">Organization</option>
            <option value="crypto">Crypto Address</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-800 border border-neutral-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-800">
            <thead className="bg-neutral-950/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">List & Type</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Country</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Reason</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 bg-slate-800">
              {filteredEntities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white">
                    No entities found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredEntities.map((entity) => (
                  <tr key={entity.id} className="hover:bg-neutral-800/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="text-sm font-semibold text-white">{entity.name}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded flex w-fit">{entity.list_name}</span>
                        <span className="text-xs text-white uppercase tracking-wide">{entity.entity_type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-sm text-white">
                        {entity.country || <span className="text-white">-</span>}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-white line-clamp-2 max-w-xs xl:max-w-md">
                        {entity.reason || <span className="text-white italic text-xs">No reason provided</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(entity)} className="p-1 text-white hover:text-white transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(entity.id)} className="p-1 text-white hover:text-rose-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
          <div className="bg-slate-800 border border-neutral-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{editingEntity ? 'Edit Entity' : 'Add Entity'}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-white hover:text-neutral-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white">Category</label>
                  <select
                    value={formData.list_category}
                    onChange={e => setFormData({...formData, list_category: e.target.value})}
                    className="w-full bg-blue-700 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  >
                    <option value="sanction">Sanction List</option>
                    <option value="watchlist">Watch List</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white">List Name</label>
                  <input
                    required
                    value={formData.list_name}
                    onChange={e => setFormData({...formData, list_name: e.target.value})}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 placeholder-neutral-600"
                    placeholder="e.g. Federal Police Notice"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white">Entity Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 placeholder-neutral-600"
                  placeholder="Abebe Bekele"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white">Type</label>
                  <select
                    value={formData.entity_type}
                    onChange={e => setFormData({...formData, entity_type: e.target.value})}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  >
                    <option value="person">Person</option>
                    <option value="organization">Organization</option>
                    <option value="crypto">Crypto Address</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white">Country</label>
                  <input
                    value={formData.country}
                    onChange={e => setFormData({...formData, country: e.target.value})}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 placeholder-neutral-600"
                    placeholder="e.g. ETH"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 min-h-[80px]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-white hover:text-neutral-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-xl transition-colors font-semibold shadow-md shadow-rose-900/20"
                >
                  {editingEntity ? 'Save Changes' : 'Add Entity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
          <div className="bg-slate-800 border border-neutral-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Bulk Upload Entities</h3>
              <button type="button" onClick={() => setIsUploadModalOpen(false)} className="text-white hover:text-neutral-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white">Target Category</label>
                  <select
                    value={uploadData.list_category}
                    onChange={e => setUploadData({...uploadData, list_category: e.target.value})}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  >
                    <option value="sanction">Sanction List</option>
                    <option value="watchlist">Watch List</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white">Target Entity Type</label>
                  <select
                    value={uploadData.entity_type}
                    onChange={e => setUploadData({...uploadData, entity_type: e.target.value})}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  >
                    <option value="person">Person</option>
                    <option value="organization">Organization</option>
                    <option value="vessel">Vessel</option>
                    <option value="aircraft">Aircraft</option>
                    <option value="crypto">Crypto Address</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white">List Name</label>
                <input
                  required
                  value={uploadData.list_name}
                  onChange={e => setUploadData({...uploadData, list_name: e.target.value})}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 placeholder-neutral-600"
                  placeholder="e.g. UN Security Council"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white">CSV File</label>
                <div className="mt-2 flex justify-center rounded-2xl border-2 border-dashed border-neutral-800 bg-neutral-950/50 hover:bg-neutral-950 hover:border-rose-500/50 transition-all duration-200 px-6 py-10 relative">
                  <div className="text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-neutral-700 mb-4" />
                    <div className="mt-4 flex text-sm leading-6 text-white justify-center">
                      <label className="relative cursor-pointer rounded-md font-semibold text-rose-500 focus-within:outline-none hover:text-rose-400">
                        <span>Upload a CSV file</span>
                        <input  
                          type="file" 
                          accept=".csv"
                          className="sr-only" 
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                    <p className="text-xs leading-5 text-white mt-2">Required column: "name"</p>
                  </div>
                  {file && (
                    <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center rounded-2xl">
                      <div className="bg-emerald-500/10 p-4 rounded-full mb-3 text-emerald-500">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <p className="text-white font-semibold">{file.name}</p>
                      <button 
                        type="button"
                        onClick={() => setFile(null)}
                        className="mt-4 text-xs text-rose-500 font-bold hover:text-rose-400 underline"
                      >
                        Remove file
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-white hover:text-neutral-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!file || !uploadData.list_name}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-xl transition-colors font-semibold shadow-md shadow-rose-900/20 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Upload Records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}