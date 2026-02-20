import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Hammer, Sword, Shield, Droplet } from 'lucide-react';
import { toast } from 'sonner';

type InventoryType = {
  wood: number;
  iron: number;
  leather: number;
  herbs: number;
};

type RecipeMaterials = {
  [K in keyof InventoryType]?: number;
};

export default function CraftingPage() {
  const { identity } = useInternetIdentity();
  const [inventory, setInventory] = useState<InventoryType>({
    wood: 10,
    iron: 5,
    leather: 8,
    herbs: 15,
  });

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-purple-300 text-xl">Please login to access crafting</p>
      </div>
    );
  }

  const recipes = [
    {
      id: 'iron-sword',
      name: 'Iron Sword',
      icon: Sword,
      materials: { iron: 3, wood: 2 } as RecipeMaterials,
      description: 'A sturdy blade for warriors',
    },
    {
      id: 'wooden-shield',
      name: 'Wooden Shield',
      icon: Shield,
      materials: { wood: 5, leather: 2 } as RecipeMaterials,
      description: 'Basic protection in combat',
    },
    {
      id: 'health-potion',
      name: 'Health Potion',
      icon: Droplet,
      materials: { herbs: 5 } as RecipeMaterials,
      description: 'Restores health in battle',
    },
  ];

  const canCraft = (materials: RecipeMaterials) => {
    return Object.entries(materials).every(([material, amount]) => {
      const key = material as keyof InventoryType;
      return amount !== undefined && inventory[key] >= amount;
    });
  };

  const handleCraft = (recipe: (typeof recipes)[0]) => {
    if (!canCraft(recipe.materials)) {
      toast.error('Not enough materials');
      return;
    }

    const newInventory = { ...inventory };
    Object.entries(recipe.materials).forEach(([material, amount]) => {
      const key = material as keyof InventoryType;
      if (amount !== undefined) {
        newInventory[key] -= amount;
      }
    });
    setInventory(newInventory);
    toast.success(`Crafted ${recipe.name}!`);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8 text-purple-200 flex items-center justify-center gap-3">
        <Hammer className="w-10 h-10" />
        Crafting Station
      </h1>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Inventory */}
        <Card className="bg-slate-900/50 border-purple-800/30">
          <CardHeader>
            <CardTitle className="text-purple-200">Your Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(inventory).map(([material, amount]) => (
                <div key={material} className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-purple-300 capitalize">{material}</p>
                  <p className="text-2xl font-bold text-purple-100">{amount}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recipes */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-purple-200">Available Recipes</h2>
          {recipes.map((recipe) => {
            const Icon = recipe.icon;
            const craftable = canCraft(recipe.materials);

            return (
              <Card key={recipe.id} className="bg-slate-900/50 border-purple-800/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Icon className="w-12 h-12 text-purple-400" />
                      <div>
                        <h3 className="text-xl font-bold text-purple-200">{recipe.name}</h3>
                        <p className="text-sm text-purple-400">{recipe.description}</p>
                        <div className="flex gap-3 mt-2">
                          {Object.entries(recipe.materials).map(([material, amount]) => (
                            <span key={material} className="text-xs text-purple-300">
                              {material}: {amount}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCraft(recipe)}
                      disabled={!craftable}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                    >
                      Craft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
