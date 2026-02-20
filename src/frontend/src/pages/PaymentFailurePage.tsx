import { useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-md mx-auto text-center space-y-6">
        <XCircle className="w-20 h-20 text-red-400 mx-auto" />
        <h1 className="text-4xl font-bold text-purple-200">Payment Failed</h1>
        <p className="text-purple-300">Your payment could not be processed. Please try again or contact support.</p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => navigate({ to: '/store' })}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Try Again
          </Button>
          <Button onClick={() => navigate({ to: '/' })} variant="outline" className="border-purple-500 text-purple-300">
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
