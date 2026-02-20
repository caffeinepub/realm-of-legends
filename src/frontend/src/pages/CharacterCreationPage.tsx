import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreateCharacter } from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Variant_elf_human_dwarf, Variant_warrior_mage_ranger } from '../backend';

export default function CharacterCreationPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const createCharacter = useCreateCharacter();

  const [name, setName] = useState('');
  const [race, setRace] = useState<Variant_elf_human_dwarf>(Variant_elf_human_dwarf.human);
  const [characterClass, setCharacterClass] = useState<Variant_warrior_mage_ranger>(
    Variant_warrior_mage_ranger.warrior
  );
  const [appearance, setAppearance] = useState({
    hair: 'short',
    skinTone: 'fair',
    equipment: 'basic',
  });

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-purple-300 text-xl">Please login to create a character</p>
      </div>
    );
  }

  const races = [
    {
      value: Variant_elf_human_dwarf.human,
      label: 'Human',
      image: '/assets/generated/race-human.dim_400x400.png',
      description: 'Balanced and versatile',
    },
    {
      value: Variant_elf_human_dwarf.elf,
      label: 'Elf',
      image: '/assets/generated/race-elf.dim_400x400.png',
      description: 'Agile and intelligent',
    },
    {
      value: Variant_elf_human_dwarf.dwarf,
      label: 'Dwarf',
      image: '/assets/generated/race-dwarf.dim_400x400.png',
      description: 'Strong and resilient',
    },
  ];

  const classes = [
    {
      value: Variant_warrior_mage_ranger.warrior,
      label: 'Warrior',
      image: '/assets/generated/class-warrior.dim_256x256.png',
      description: 'Master of melee combat',
    },
    {
      value: Variant_warrior_mage_ranger.mage,
      label: 'Mage',
      image: '/assets/generated/class-mage.dim_256x256.png',
      description: 'Wielder of arcane magic',
    },
    {
      value: Variant_warrior_mage_ranger.ranger,
      label: 'Ranger',
      image: '/assets/generated/class-ranger.dim_256x256.png',
      description: 'Expert archer and tracker',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a character name');
      return;
    }

    try {
      await createCharacter.mutateAsync({
        name: name.trim(),
        race,
        characterClass,
        appearance,
      });
      toast.success('Character created successfully!');
      navigate({ to: '/game' });
    } catch (error) {
      toast.error('Failed to create character');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-purple-200">Create Your Hero</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Character Name */}
          <Card className="bg-slate-900/50 border-purple-800/30">
            <CardHeader>
              <CardTitle className="text-purple-200">Character Name</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your hero's name"
                className="bg-slate-900/50 border-purple-700/50 text-purple-100"
              />
            </CardContent>
          </Card>

          {/* Race Selection */}
          <Card className="bg-slate-900/50 border-purple-800/30">
            <CardHeader>
              <CardTitle className="text-purple-200">Choose Your Race</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {races.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRace(r.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      race === r.value
                        ? 'border-purple-500 bg-purple-900/30'
                        : 'border-purple-800/30 hover:border-purple-700/50'
                    }`}
                  >
                    <img src={r.image} alt={r.label} className="w-full h-32 object-cover rounded mb-2" />
                    <h3 className="text-lg font-bold text-purple-200">{r.label}</h3>
                    <p className="text-sm text-purple-400">{r.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Class Selection */}
          <Card className="bg-slate-900/50 border-purple-800/30">
            <CardHeader>
              <CardTitle className="text-purple-200">Choose Your Class</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {classes.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCharacterClass(c.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      characterClass === c.value
                        ? 'border-purple-500 bg-purple-900/30'
                        : 'border-purple-800/30 hover:border-purple-700/50'
                    }`}
                  >
                    <img src={c.image} alt={c.label} className="w-full h-32 object-contain rounded mb-2" />
                    <h3 className="text-lg font-bold text-purple-200">{c.label}</h3>
                    <p className="text-sm text-purple-400">{c.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="bg-slate-900/50 border-purple-800/30">
            <CardHeader>
              <CardTitle className="text-purple-200">Customize Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-purple-300">Hair Style</Label>
                <select
                  value={appearance.hair}
                  onChange={(e) => setAppearance({ ...appearance, hair: e.target.value })}
                  className="w-full mt-1 bg-slate-900/50 border-purple-700/50 text-purple-100 rounded px-3 py-2"
                >
                  <option value="short">Short</option>
                  <option value="long">Long</option>
                  <option value="bald">Bald</option>
                </select>
              </div>
              <div>
                <Label className="text-purple-300">Skin Tone</Label>
                <select
                  value={appearance.skinTone}
                  onChange={(e) => setAppearance({ ...appearance, skinTone: e.target.value })}
                  className="w-full mt-1 bg-slate-900/50 border-purple-700/50 text-purple-100 rounded px-3 py-2"
                >
                  <option value="fair">Fair</option>
                  <option value="tan">Tan</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={createCharacter.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg py-6"
          >
            {createCharacter.isPending ? 'Creating Character...' : 'Create Character'}
          </Button>
        </form>
      </div>
    </div>
  );
}
