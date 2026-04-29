'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, Camera, CheckCircle, PackageOpen } from 'lucide-react';
import PhoneFrame from '@/components/PhoneFrame';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { createFoundItem } from '@/lib/db-supabase';
import { getLostItemById } from '@/lib/db-supabase';
import { LostItem, FoundItem } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

function ReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lostItemId = searchParams.get('lostItemId');
  const { user } = useAuth();

  const [lostItem, setLostItem] = useState<LostItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [busLine, setBusLine] = useState('');
  const [busRegistration, setBusRegistration] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [finderName, setFinderName] = useState('');
  const [finderPhone, setFinderPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (lostItemId) {
      loadLostItem(lostItemId);
    }
  }, [lostItemId]);

  const loadLostItem = async (id: string) => {
    try {
      const item = await getLostItemById(id);
      if (item) {
        setLostItem(item);
        setItemName(item.itemName || '');
        setBusLine(item.busLine || '');
        setBusRegistration(item.busRegistration || '');
        setLocation(item.location || '');
        setDescription(item.description || '');
      }
    } catch (err) {
      console.error('Failed to load lost item:', err);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!itemName || !date || !location) {
      setError('Моля, попълнете задължителните полета');
      return;
    }

    setIsSubmitting(true);

    const foundItem: FoundItem = {
      id: uuidv4(),
      userId: user?.id || '',
      itemName,
      busLine,
      busRegistration,
      date,
      time,
      location,
      description,
      photoUrl: photo,
      finderName,
      finderPhone,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    try {
      await createFoundItem(foundItem);
      setSuccess(true);
      setIsSubmitting(false);
      
      setTimeout(() => {
        router.push('/found');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Възникна грешка');
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <PhoneFrame>
        <Header title="Успех" showBack />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Предметът е намерен!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-8">
            Благодарим ви! Собственикът ще бъде уведомен.
          </p>
          <div className="w-full space-y-3">
            <button
              onClick={() => router.push('/found')}
              className="w-full py-4 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
            >
              Към намерени предмети
            </button>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <Header title={lostItem ? "Намери предмет" : "Намери предмет"} showBack />
      
      <form onSubmit={handleSubmit} className="flex-1 p-4 overflow-y-auto pb-20 space-y-4">
        {lostItem && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Отбелязване на загубен предмет: {lostItem.itemName}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Име на предмета *
          </label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Какво намерихте?"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Автобус (ако е известен)
          </label>
          <input
            type="text"
            value={busLine}
            onChange={(e) => setBusLine(e.target.value)}
            placeholder="Номер на линия"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Рег. номер на автобуса
          </label>
          <input
            type="text"
            value={busRegistration}
            onChange={(e) => setBusRegistration(e.target.value)}
            placeholder="Напр. PB 1234 AB"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Дата *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Час
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Локация *
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Къде намерихте предмета?"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Описание
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Подробно описание..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Качи снимка
          </label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
            {photo ? (
              <div className="relative w-full h-full">
                <img src={photo} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <Camera className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-500">Натиснете за да качите снимка</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={finderName}
            onChange={(e) => setFinderName(e.target.value)}
            placeholder="Вашето име (по избор)"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
          />
          <input
            type="tel"
            value={finderPhone}
            onChange={(e) => setFinderPhone(e.target.value)}
            placeholder="Вашият телефон (по избор)"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Изпращане...
            </span>
          ) : (
            'Потвърди намирането'
          )}
        </button>
      </form>
    </PhoneFrame>
  );
}

export default function FoundReportPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <PhoneFrame>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </PhoneFrame>
      }>
        <ReportForm />
      </Suspense>
    </ProtectedRoute>
  );
}
