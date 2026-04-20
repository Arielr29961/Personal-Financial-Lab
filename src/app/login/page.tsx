import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-sm px-4">
        {/* Logo / Title */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-3">💰</div>
          <h1 className="text-2xl font-bold text-slate-50">מעבדה פיננסית</h1>
          <p className="text-slate-400 mt-1 text-sm">אריאל וענבר</p>
        </div>
        <Suspense fallback={<div className="bg-slate-800 rounded-2xl p-8 border border-slate-700" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
