import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';

export const PurchaseCompletePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 min-h-[calc(100vh-20rem)] bg-white font-sans text-center">
      
      {/* Big Green Circle with Check */}
      <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-100 animate-scale-up mb-8">
        <Check className="w-16 h-16 sm:w-20 sm:h-20 stroke-[3px]" />
      </div>

      {/* Message */}
      <div className="space-y-3 mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Purchase Complete
        </h1>
        {orderId && (
          <p className="text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 inline-block font-mono">
            Order ID: #{orderId}
          </p>
        )}
        <p className="text-slate-500 text-base sm:text-lg font-medium leading-relaxed">
          You will receive a confirmation email soon.
        </p>
      </div>

      {/* Button */}
      <div>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-sm font-bold shadow-md shadow-slate-100 transition-colors"
        >
          Back to home
        </button>
      </div>
    </div>
  );
};

