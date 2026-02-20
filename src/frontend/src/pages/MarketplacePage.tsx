import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserTransactions, useCreateTransaction } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ShoppingBag, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function MarketplacePage() {
  const { identity } = useInternetIdentity();
  const { data: transactions = [], isLoading } = useGetUserTransactions();
  const createTransaction = useCreateTransaction();
  const [searchTerm, setSearchTerm] = useState('');

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-purple-300 text-xl">Please login to access the marketplace</p>
      </div>
    );
  }

  const mockListings = [
    { id: '1', item: 'Legendary Sword', price: 1000, seller: 'Hero123' },
    { id: '2', item: 'Magic Staff', price: 800, seller: 'Wizard456' },
    { id: '3', item: 'Dragon Scale Armor', price: 1500, seller: 'Knight789' },
  ];

  const handlePurchase = async (listing: (typeof mockListings)[0]) => {
    try {
      await createTransaction.mutateAsync({
        item: listing.item,
        price: BigInt(listing.price),
      });
      toast.success(`Purchased ${listing.item}!`);
    } catch (error) {
      toast.error('Failed to complete purchase');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8 text-purple-200 flex items-center justify-center gap-3">
        <ShoppingBag className="w-10 h-10" />
        Marketplace
      </h1>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items..."
            className="pl-10 bg-slate-900/50 border-purple-700/50 text-purple-100"
          />
        </div>

        {/* Listings */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-purple-200">Available Items</h2>
          {mockListings.map((listing) => (
            <Card key={listing.id} className="bg-slate-900/50 border-purple-800/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-purple-200">{listing.item}</h3>
                    <p className="text-sm text-purple-400">Seller: {listing.seller}</p>
                    <p className="text-lg text-purple-300 mt-2">{listing.price} Gold</p>
                  </div>
                  <Button
                    onClick={() => handlePurchase(listing)}
                    disabled={createTransaction.isPending}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Purchase
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Transaction History */}
        <Card className="bg-slate-900/50 border-purple-800/30">
          <CardHeader>
            <CardTitle className="text-purple-200">Your Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-purple-300">Loading transactions...</p>
            ) : transactions.length === 0 ? (
              <p className="text-purple-400">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div key={tx.id.toString()} className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-purple-200">{tx.item}</p>
                    <p className="text-sm text-purple-400">{tx.price.toString()} Gold</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
