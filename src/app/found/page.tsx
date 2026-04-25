'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, MapPin, Clock, Phone } from 'lucide-react';
import PhoneFrame from '@/components/PhoneFrame';
import Header from '@/components/Header';
import NavMenu from '@/components/NavMenu';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LostItem } from '@/lib/types';
import { getLostItems } from '@/lib/data';

export default function FoundPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);
  const router = useRouter();

  useEffect(() => {
    setLostItems(getLostItems());
  }, []);

  const filteredItems = lostItems.filter(item => 
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedItem) {
    return (
      <ProtectedRoute>
        <PhoneFrame>
          <Header 
            title="Изгубен предмет" 
            showBack 
          />
          
          <div className="p-4 space-y-4">
            {selectedItem.photoUrl && (
              <img 
                src={selectedItem.photoUrl} 
                alt={selectedItem.itemName}
                className="w-full h-48 object-cover rounded-xl"
              />
            )}
            
            <div className="bg-white dark:bg-slate-700 rounded-xl p-4 space-y-3">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {selectedItem.itemName}
              </h2>
              
              <p className="text-slate-600 dark:text-slate-300">
                {selectedItem.description}
              </p>
              
              <div className="pt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedItem.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{selectedItem.date} в {selectedItem.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{selectedItem.reporterPhone}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <p className="text-sm text-green-600 dark:text-green-300">
                <strong>Автобус {selectedItem.busLine}</strong> - {selectedItem.busRegistration}
              </p>
            </div>
            
            <button
              onClick={() => window.location.href = `tel:${selectedItem.reporterPhone}`}
              className="w-full py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
            >
              Обади се
            </button>
          </div>
        </PhoneFrame>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PhoneFrame>
        <Header 
          title="Намерено" 
          onMenuClick={() => setMenuOpen(true)}
        />
        
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Търси предмети..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              Изгубени предмети ({filteredItems.length})
            </div>
            
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="w-full text-left p-4 bg-white dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600 hover:border-green-500 transition-all"
              >
                <div className="flex gap-3">
                  {item.photoUrl ? (
                    <img 
                      src={item.photoUrl} 
                      alt={item.itemName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                      {item.itemName}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {item.description}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {item.date} • Автобус {item.busLine}
                    </p>
                  </div>
                </div>
              </button>
            ))}
            
            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <p className="text-4xl mb-2">🔍</p>
                <p>Все още няма изгубени предмети</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white dark:from-slate-800 to-transparent pt-8">
          <button
            onClick={() => router.push('/found/create')}
            className="w-full py-4 bg-green-500 text-white font-semibold rounded-xl shadow-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Създай сигнал
          </button>
        </div>
        
        <NavMenu 
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          onSettingsClick={() => setMenuOpen(false)}
        />
      </PhoneFrame>
    </ProtectedRoute>
  );
}