'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Camera, CheckCircle } from 'lucide-react';
import PhoneFrame from '@/components/PhoneFrame';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { BUS_LINES_PLOVDIV } from '@/lib/types';
import { createFoundItem } from '@/lib/data';
import { FoundItem } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

function ReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const busLineParam = searchParams.get('line') || '';
  const busLineInfo = BUS_LINES_PLOVDIV.find(l => l.line === busLineParam);

  const [itemName, setItemName] = useState('');
  const [busRegistration, setBusRegistration] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [finderName, setFinderName] = useState(user?.firstName + ' ' + user?.lastName || '');
  const [finderPhone, setFinderPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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

    if (!itemName || !date || !location || !finderPhone) {
      setError('Моля, попълнете задължителните полета');
      return;
    }

    setIsSubmitting(true);

    const item: FoundItem = {
      id: uuidv4(),
      userId: user?.id || '',
      itemName,
      busLine: busLineParam || 'N/A',
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

    setTimeout(() => {
      createFoundItem(item);
      setSuccess(true);
      setIsSubmitting(false);
      
      setTimeout(() => {
        router.push('/found');
      }, 2000);
    }, 1000);
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
            Сигналът е изпратен!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-8">
            Благодарим ви! Ще се свържем с вас, ако собственикът потърси предмета.
          </p>
          <div className="w-full space-y-3">
            <button
              onClick={() => router.push('/home')}
              className="w-full py-4 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
            >
              Към начална страница
            </button>
            <button
              onClick={() => router.push('/reports')}
              className="w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Моите сигнали
            </button>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <Header title="Създай сигнал" showBack />
      
      <form onSubmit={handleSubmit} className="flex-1 p-4 overflow-y-auto pb-20 space-y-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
          <p className="text-sm text-green-700 dark:text-green-300">
            <strong>Автобус {busLineParam}</strong> {busLineInfo ? `- ${busLineInfo.route}` : ''}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Намерен предмет *
          </label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Опишете предмета"
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
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Снимка
          </label>
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
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
                <Camera className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs text-slate-500">Прикачете снимка</span>
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

        <div className="border-t border-slate-200 dark:border-slate-600 pt-4 space-y-4">
          <h3 className="font-medium text-slate-700 dark:text-slate-300">Ваши данни за контакт</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Име *
            </label>
            <input
              type="text"
              value={finderName}
              onChange={(e) => setFinderName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Телефонен номер *
            </label>
            <input
              type="tel"
              value={finderPhone}
              onChange={(e) => setFinderPhone(e.target.value)}
              placeholder="0888 123 456"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>
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
            'Изпрати'
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
          <Header title="Създай сигнал" showBack />
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </PhoneFrame>
      }>
        <ReportForm />
      </Suspense>
    </ProtectedRoute>
  );
}