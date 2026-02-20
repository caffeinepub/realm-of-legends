import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsStripeConfigured, useCreateCheckoutSession } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Store, Crown, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import PaymentSetup from '../components/PaymentSetup';
import type { ShoppingItem } from '../backend';

export default function StorePage() {
  const { identity } = useInternetIdentity();
  const { data: isConfigured, isLoading: configLoading } = useIsStripeConfigured();
  const createCheckout = useCreateCheckoutSession();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-purple-300 text-xl">Please login to access the store</p>
      </div>
    );
  }

  if (configLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-purple-300">Loading store...</p>
      </div>
    );
  }

  if (!isConfigured) {
    return <PaymentSetup />;
  }

  const storeItems = [
    {
      id: 'cosmetic-1',
      name: 'Mystic Wings',
      description: 'Ethereal wings that shimmer with magic',
      price: 999,
      image: '✨',
    },
    {
      id: 'cosmetic-2',
      name: 'Dragon Pet',
      description: 'A loyal dragon companion',
      price: 1499,
      image: '🐉',
    },
    {
      id: 'battle-pass',
      name: 'Season Battle Pass',
      description: 'Unlock exclusive rewards and challenges',
      price: 999,
      image: '🎯',
    },
    {
      id: 'premium',
      name: 'Premium Membership',
      description: '30 days of enhanced rewards and benefits',
      price: 1999,
      image: '👑',
    },
  ];

  const handlePurchase = async (item: (typeof storeItems)[0]) => {
    try {
      const shoppingItem: ShoppingItem = {
        productName: item.name,
        productDescription: item.description,
        priceInCents: BigInt(item.price),
        currency: 'usd',
        quantity: BigInt(1),
      };

      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const session = await createCheckout.mutateAsync({
        items: [shoppingItem],
        successUrl: `${baseUrl}/payment-success`,
        cancelUrl: `${baseUrl}/payment-failure`,
      });

      const parsedSession = JSON.parse(session);
      if (!parsedSession?.url) {
        throw new Error('Stripe session missing url');
      }

      window.location.href = parsedSession.url;
    } catch (error) {
      toast.error('Failed to initiate purchase');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8 text-purple-200 flex items-center justify-center gap-3">
        <Store className="w-10 h-10" />
        Premium Store
      </h1>

      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {storeItems.map((item) => (
            <Card key={item.id} className="bg-slate-900/50 border-purple-800/30 hover:border-purple-600/50 transition-colors">
              <CardHeader>
                <div className="text-6xl text-center mb-4">{item.image}</div>
                <CardTitle className="text-purple-200 text-center">{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-purple-300 text-sm text-center">{item.description}</p>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-100">${(item.price / 100).toFixed(2)}</p>
                </div>
                <Button
                  onClick={() => handlePurchase(item)}
                  disabled={createCheckout.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {createCheckout.isPending ? 'Processing...' : 'Purchase'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
