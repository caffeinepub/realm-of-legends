import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSetStripeConfiguration, useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { toast } from 'sonner';

export default function PaymentSetup() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const setStripeConfig = useSetStripeConfiguration();
  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB');

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-purple-300 text-xl">Please login to configure payments</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-purple-300 text-xl">Store is not yet configured. Please contact an administrator.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey.trim()) {
      toast.error('Please enter Stripe secret key');
      return;
    }

    try {
      await setStripeConfig.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries: countries.split(',').map((c) => c.trim()),
      });
      toast.success('Stripe configured successfully!');
    } catch (error) {
      toast.error('Failed to configure Stripe');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-900/50 border-purple-800/30">
          <CardHeader>
            <CardTitle className="text-purple-200">Configure Stripe Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-purple-300">Stripe Secret Key</Label>
                <Input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="sk_test_..."
                  className="bg-slate-900/50 border-purple-700/50 text-purple-100"
                />
              </div>
              <div>
                <Label className="text-purple-300">Allowed Countries (comma-separated)</Label>
                <Input
                  value={countries}
                  onChange={(e) => setCountries(e.target.value)}
                  placeholder="US,CA,GB"
                  className="bg-slate-900/50 border-purple-700/50 text-purple-100"
                />
              </div>
              <Button
                type="submit"
                disabled={setStripeConfig.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {setStripeConfig.isPending ? 'Configuring...' : 'Configure Stripe'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
