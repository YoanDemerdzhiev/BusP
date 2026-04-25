'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, Camera, CheckCircle } from 'lucide-react';
import PhoneFrame from '@/components/PhoneFrame';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { createProblem } from '@/lib/data';
import { Problem } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

function ReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const busLine = searchParams.get('line') || '';
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [busRegistration, setBusRegistration] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
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

    if (!title || !date || !location) {
      setError('Моля, попълнете задължителните полета');
      return;
    }

    setIsSubmitting(true);

    const problem: Problem = {
      id: uuidv4(),
      userId: isAnonymous ? null : user?.id || null,
      title,
      busLine,
      busRegistration,
      date,
      time,
      location,
      description,
      photoUrl: photo,
      isAnonymous,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      createProblem(problem);
      setSuccess(true);
      setIsSubmitting(false);
      
      setTimeout(() => {
        router.push('/home');
      }, 2000);
    }, 1000);
  };

  if (success) {
    return (
      <PhoneFrame>
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Сигналът е изпратен!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-center">
            Благодарим ви за сигнала. Ще се свържем с вас скоро.
          </p>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <Header title={`Проблем - ${busLine}`} showBack />
      
      <form onSubmit={handleSubmit} className="flex-1 p-4 overflow-y-auto pb-20 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Какво се случи *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Кратко описание на проблема"
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
            placeholder="Къде се случи?"
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

        <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-slate-700 dark:text-slate-300">Анонимно подаване</span>
        </label>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Изпращане...
            </span>
          ) : (
            'Изпрати сигнал'
          )}
        </button>
      </form>
    </PhoneFrame>
  );
}

export default function ProblemReportPage() {
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