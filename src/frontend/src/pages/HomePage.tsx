import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '../components/ui/button';
import { Sword, Users, Scroll, Sparkles } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="relative">
      {/* Hero Section */}
      <div
        className="relative h-screen flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: 'url(/assets/generated/forest-bg.dim_1920x1080.png)',
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-purple-950/60 to-slate-950/90" />

        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
            Realm of Legends
          </h1>
          <p className="text-xl md:text-2xl text-purple-200 mb-8 max-w-2xl mx-auto">
            Embark on an epic journey through a mystical world filled with magic, mythical creatures, and ancient
            prophecies. Your legend begins now.
          </p>

          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate({ to: '/character-creation' })}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg px-8 py-6"
              >
                <Sword className="w-5 h-5 mr-2" />
                Create Character
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate({ to: '/game' })}
                className="border-purple-500 text-purple-300 hover:bg-purple-900/30 font-bold text-lg px-8 py-6"
              >
                Enter World
              </Button>
            </div>
          ) : (
            <p className="text-purple-300 text-lg">Please login to begin your adventure</p>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-purple-200">Epic Features Await</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Sword className="w-12 h-12 text-purple-400" />}
              title="Real-Time Combat"
              description="Master fast-paced combat with combos, special abilities, and ultimate skills"
            />
            <FeatureCard
              icon={<Scroll className="w-12 h-12 text-purple-400" />}
              title="Epic Quests"
              description="Explore a rich storyline with choices that shape your destiny"
            />
            <FeatureCard
              icon={<Users className="w-12 h-12 text-purple-400" />}
              title="Multiplayer"
              description="Join guilds, trade with players, and conquer bosses together"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-slate-900/50 border border-purple-800/30 rounded-lg p-6 hover:border-purple-600/50 transition-colors">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-purple-200 mb-2">{title}</h3>
      <p className="text-purple-300/70">{description}</p>
    </div>
  );
}
