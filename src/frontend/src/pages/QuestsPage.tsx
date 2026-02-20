import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetQuests, useCompleteQuest } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Scroll, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function QuestsPage() {
  const { identity } = useInternetIdentity();
  const { data: mainQuests = [], isLoading: mainLoading } = useGetQuests(true);
  const { data: sideQuests = [], isLoading: sideLoading } = useGetQuests(false);
  const completeQuest = useCompleteQuest();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-purple-300 text-xl">Please login to view quests</p>
      </div>
    );
  }

  const handleCompleteQuest = async (questId: bigint) => {
    try {
      await completeQuest.mutateAsync({ questId });
      toast.success('Quest completed!');
    } catch (error) {
      toast.error('Failed to complete quest');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8 text-purple-200 flex items-center justify-center gap-3">
        <Scroll className="w-10 h-10" />
        Quest Log
      </h1>

      <Tabs defaultValue="main" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border border-purple-800/30">
          <TabsTrigger value="main" className="data-[state=active]:bg-purple-900/50">
            Main Quests
          </TabsTrigger>
          <TabsTrigger value="side" className="data-[state=active]:bg-purple-900/50">
            Side Quests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="main" className="space-y-4 mt-6">
          {mainLoading ? (
            <p className="text-purple-300 text-center">Loading quests...</p>
          ) : mainQuests.length === 0 ? (
            <p className="text-purple-300 text-center">No main quests available</p>
          ) : (
            mainQuests.map((quest) => (
              <QuestCard key={quest.id.toString()} quest={quest} onComplete={handleCompleteQuest} />
            ))
          )}
        </TabsContent>

        <TabsContent value="side" className="space-y-4 mt-6">
          {sideLoading ? (
            <p className="text-purple-300 text-center">Loading quests...</p>
          ) : sideQuests.length === 0 ? (
            <p className="text-purple-300 text-center">No side quests available</p>
          ) : (
            sideQuests.map((quest) => (
              <QuestCard key={quest.id.toString()} quest={quest} onComplete={handleCompleteQuest} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function QuestCard({ quest, onComplete }: { quest: any; onComplete: (id: bigint) => void }) {
  const { identity } = useInternetIdentity();
  const isCompleted = identity && quest.completedBy.some((p: any) => p.toString() === identity.getPrincipal().toString());

  return (
    <Card className="bg-slate-900/50 border-purple-800/30">
      <CardHeader>
        <CardTitle className="text-purple-200 flex items-center justify-between">
          <span>{quest.title}</span>
          {isCompleted && <CheckCircle className="w-5 h-5 text-green-400" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-purple-300">{quest.description}</p>
        <div className="flex items-center justify-between">
          <div className="text-sm text-purple-400">
            <p>Rewards: {quest.reward.exp.toString()} EXP, {quest.reward.gold.toString()} Gold</p>
          </div>
          {!isCompleted && (
            <Button
              onClick={() => onComplete(quest.id)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Complete Quest
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
