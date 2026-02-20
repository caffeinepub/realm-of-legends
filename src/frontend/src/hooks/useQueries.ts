import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Character, Quest, Guild, Transaction, ShoppingItem, StripeConfiguration, Variant_elf_human_dwarf, Variant_warrior_mage_ranger } from '../backend';
import { Principal } from '@dfinity/principal';

// User Profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Characters
export function useCreateCharacter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      race: Variant_elf_human_dwarf;
      characterClass: Variant_warrior_mage_ranger;
      appearance: { hair: string; skinTone: string; equipment: string };
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCharacter(params.name, params.race, params.characterClass, params.appearance);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    },
  });
}

export function useGetAllCharacters() {
  const { actor, isFetching } = useActor();

  return useQuery<Character[]>({
    queryKey: ['characters'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCharacters();
    },
    enabled: !!actor && !isFetching,
  });
}

// Quests
export function useGetQuests(isMain: boolean) {
  const { actor, isFetching } = useActor();

  return useQuery<Quest[]>({
    queryKey: ['quests', isMain],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getQuests(isMain);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCompleteQuest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { questId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      const characters = await actor.getAllCharacters();
      if (characters.length === 0) throw new Error('No character found');
      return actor.completeQuest(characters[0].id, params.questId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
    },
  });
}

// Guilds
export function useGetAllGuilds() {
  const { actor, isFetching } = useActor();

  return useQuery<Guild[]>({
    queryKey: ['guilds'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllGuilds();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateGuild() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createGuild(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guilds'] });
    },
  });
}

export function useJoinGuild() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guildId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.joinGuild(guildId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guilds'] });
    },
  });
}

// Transactions
export function useGetUserTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { item: string; price: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTransaction(Principal.anonymous(), params.item, params.price);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

// Stripe
export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: { items: ShoppingItem[]; successUrl: string; cancelUrl: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCheckoutSession(params.items, params.successUrl, params.cancelUrl);
    },
  });
}

// Admin
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
