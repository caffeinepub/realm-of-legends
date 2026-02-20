import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface Guild {
    id: bigint;
    members: Array<Principal>;
    name: string;
    leader: Principal;
}
export interface Character {
    id: bigint;
    characterClass: Variant_warrior_mage_ranger;
    owner: Principal;
    appearance: {
        equipment: string;
        hair: string;
        skinTone: string;
    };
    ultimateCharged: boolean;
    name: string;
    race: Variant_elf_human_dwarf;
    stats: {
        strength: bigint;
        agility: bigint;
        intelligence: bigint;
    };
    skillPoints: bigint;
    abilities: Array<string>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Transaction {
    id: bigint;
    item: string;
    seller: Principal;
    timestamp: Time;
    buyer: Principal;
    price: bigint;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Quest {
    id: bigint;
    completedBy: Array<Principal>;
    reward: {
        exp: bigint;
        gold: bigint;
    };
    title: string;
    isMainQuest: boolean;
    description: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    name: string;
    createdAt: Time;
    email?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_elf_human_dwarf {
    elf = "elf",
    human = "human",
    dwarf = "dwarf"
}
export enum Variant_warrior_mage_ranger {
    warrior = "warrior",
    mage = "mage",
    ranger = "ranger"
}
export enum WeatherState {
    clear = "clear",
    rain = "rain",
    storm = "storm"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeQuest(characterId: bigint, questId: bigint): Promise<void>;
    createCharacter(name: string, race: Variant_elf_human_dwarf, characterClass: Variant_warrior_mage_ranger, appearance: {
        equipment: string;
        hair: string;
        skinTone: string;
    }): Promise<bigint>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createGuild(name: string): Promise<bigint>;
    createQuest(title: string, description: string, reward: {
        exp: bigint;
        gold: bigint;
    }, isMainQuest: boolean): Promise<bigint>;
    createTransaction(seller: Principal, item: string, price: bigint): Promise<bigint>;
    getAllCharacters(): Promise<Array<Character>>;
    getAllGuilds(): Promise<Array<Guild>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCharacter(id: bigint): Promise<Character>;
    getGuild(id: bigint): Promise<Guild>;
    getQuest(id: bigint): Promise<Quest>;
    getQuests(isMain: boolean): Promise<Array<Quest>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTransaction(id: bigint): Promise<Transaction>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserTransactions(): Promise<Array<Transaction>>;
    getWeather(): Promise<WeatherState>;
    get_world_state(): Promise<{
        timestamp: Time;
        weather: WeatherState;
    }>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    joinGuild(guildId: bigint): Promise<void>;
    leaveGuild(guildId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    setWeather(state: WeatherState): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateCharacterSkills(characterId: bigint, skillPoints: bigint, abilities: Array<string>): Promise<void>;
    updateCharacterUltimate(characterId: bigint, charged: boolean): Promise<void>;
}
