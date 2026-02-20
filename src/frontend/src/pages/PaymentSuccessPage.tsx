import { useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-md mx-auto text-center space-y-6">
        <CheckCircle className="w-20 h-20 text-green-400 mx-auto" />
        <h1 className="text-4xl font-bold text-purple-200">Payment Successful!</h1>
        <p className="text-purple-300">Thank you for your purchase. Your items have been added to your account.</p>
        <Button
          onClick={() => navigate({ to: '/game' })}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          Return to Game
        </Button>
      </div>
    </div>
  );
}
