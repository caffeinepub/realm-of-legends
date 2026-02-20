import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllGuilds, useCreateGuild, useJoinGuild } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Users, Crown } from 'lucide-react';
import { toast } from 'sonner';

export default function GuildsPage() {
  const { identity } = useInternetIdentity();
  const { data: guilds = [], isLoading } = useGetAllGuilds();
  const createGuild = useCreateGuild();
  const joinGuild = useJoinGuild();
  const [newGuildName, setNewGuildName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-purple-300 text-xl">Please login to view guilds</p>
      </div>
    );
  }

  const handleCreateGuild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuildName.trim()) {
      toast.error('Please enter a guild name');
      return;
    }

    try {
      await createGuild.mutateAsync(newGuildName.trim());
      toast.success('Guild created successfully!');
      setNewGuildName('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast.error('Failed to create guild');
      console.error(error);
    }
  };

  const handleJoinGuild = async (guildId: bigint) => {
    try {
      await joinGuild.mutateAsync(guildId);
      toast.success('Joined guild successfully!');
    } catch (error) {
      toast.error('Failed to join guild');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-purple-200 flex items-center gap-3">
          <Users className="w-10 h-10" />
          Guilds
        </h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Create Guild
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-purple-800/50">
            <DialogHeader>
              <DialogTitle className="text-purple-200">Create New Guild</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateGuild} className="space-y-4">
              <Input
                value={newGuildName}
                onChange={(e) => setNewGuildName(e.target.value)}
                placeholder="Enter guild name"
                className="bg-slate-900/50 border-purple-700/50 text-purple-100"
              />
              <Button
                type="submit"
                disabled={createGuild.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {createGuild.isPending ? 'Creating...' : 'Create Guild'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-purple-300 text-center">Loading guilds...</p>
      ) : guilds.length === 0 ? (
        <p className="text-purple-300 text-center">No guilds available. Create the first one!</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guilds.map((guild) => {
            const isMember = guild.members.some((m) => m.toString() === identity.getPrincipal().toString());
            const isLeader = guild.leader.toString() === identity.getPrincipal().toString();

            return (
              <Card key={guild.id.toString()} className="bg-slate-900/50 border-purple-800/30">
                <CardHeader>
                  <CardTitle className="text-purple-200 flex items-center gap-2">
                    {guild.name}
                    {isLeader && <Crown className="w-5 h-5 text-yellow-400" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-purple-300 text-sm">
                    <p>Members: {guild.members.length}</p>
                    <p className="text-xs text-purple-400 mt-1">Leader: {guild.leader.toString().slice(0, 10)}...</p>
                  </div>
                  {!isMember && (
                    <Button
                      onClick={() => handleJoinGuild(guild.id)}
                      disabled={joinGuild.isPending}
                      className="w-full bg-purple-700 hover:bg-purple-600"
                    >
                      Join Guild
                    </Button>
                  )}
                  {isMember && <p className="text-green-400 text-sm text-center">Member</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
