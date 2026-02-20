import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type UserProfile = {
    name : Text;
    email : ?Text;
    createdAt : Time.Time;
  };

  public type Character = {
    id : Nat;
    owner : Principal;
    name : Text;
    race : { #human; #elf; #dwarf };
    characterClass : { #warrior; #mage; #ranger };
    appearance : {
      hair : Text;
      skinTone : Text;
      equipment : Text;
    };
    stats : {
      strength : Nat;
      agility : Nat;
      intelligence : Nat;
    };
    skillPoints : Nat;
    abilities : [Text];
    ultimateCharged : Bool;
  };

  public type Quest = {
    id : Nat;
    title : Text;
    description : Text;
    reward : { exp : Nat; gold : Nat };
    isMainQuest : Bool;
    completedBy : [Principal];
  };

  public type Guild = {
    id : Nat;
    name : Text;
    members : [Principal];
    leader : Principal;
  };

  public type WeatherState = {
    #clear;
    #rain;
    #storm;
  };

  public type Transaction = {
    id : Nat;
    seller : Principal;
    buyer : Principal;
    item : Text;
    price : Nat;
    timestamp : Time.Time;
  };

  // State
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextCharacterId = 0;
  let characters = Map.empty<Nat, Character>();

  var nextQuestId = 0;
  let quests = Map.empty<Nat, Quest>();

  var nextGuildId = 0;
  let guilds = Map.empty<Nat, Guild>();

  var nextTransactionId = 0;
  let transactions = Map.empty<Nat, Transaction>();

  var currentWeather : WeatherState = #clear;

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Character Management
  public shared ({ caller }) func createCharacter(name : Text, race : { #human; #elf; #dwarf }, characterClass : { #warrior; #mage; #ranger }, appearance : { hair : Text; skinTone : Text; equipment : Text }) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create characters");
    };

    let id = nextCharacterId;
    nextCharacterId += 1;

    let stats = switch (race, characterClass) {
      case (#human, #warrior) { { strength = 10; agility = 8; intelligence = 6 } };
      case (#human, #mage) { { strength = 6; agility = 8; intelligence = 10 } };
      case (#human, #ranger) { { strength = 8; agility = 10; intelligence = 6 } };
      case (#elf, #warrior) { { strength = 8; agility = 11; intelligence = 7 } };
      case (#elf, #mage) { { strength = 5; agility = 9; intelligence = 12 } };
      case (#elf, #ranger) { { strength = 7; agility = 13; intelligence = 6 } };
      case (#dwarf, #warrior) { { strength = 13; agility = 6; intelligence = 6 } };
      case (#dwarf, #mage) { { strength = 8; agility = 6; intelligence = 11 } };
      case (#dwarf, #ranger) { { strength = 10; agility = 8; intelligence = 7 } };
    };

    let character : Character = {
      id;
      owner = caller;
      name;
      race;
      characterClass;
      appearance;
      stats;
      skillPoints = 0;
      abilities = [];
      ultimateCharged = false;
    };

    characters.add(id, character);
    id;
  };

  public query ({ caller }) func getCharacter(id : Nat) : async Character {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view characters");
    };

    switch (characters.get(id)) {
      case (?character) { character };
      case (null) { Runtime.trap("Character not found") };
    };
  };

  public query ({ caller }) func getAllCharacters() : async [Character] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view characters");
    };
    characters.values().toArray();
  };

  public shared ({ caller }) func updateCharacterSkills(characterId : Nat, skillPoints : Nat, abilities : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update characters");
    };

    let character = switch (characters.get(characterId)) {
      case (?c) {
        if (c.owner != caller) {
          Runtime.trap("Unauthorized: You do not own this character");
        };
        c;
      };
      case (null) { Runtime.trap("Character not found") };
    };

    let updatedCharacter = {
      character with
      skillPoints = skillPoints;
      abilities = abilities;
    };

    characters.add(characterId, updatedCharacter);
  };

  public shared ({ caller }) func updateCharacterUltimate(characterId : Nat, charged : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update characters");
    };

    let character = switch (characters.get(characterId)) {
      case (?c) {
        if (c.owner != caller) {
          Runtime.trap("Unauthorized: You do not own this character");
        };
        c;
      };
      case (null) { Runtime.trap("Character not found") };
    };

    let updatedCharacter = {
      character with
      ultimateCharged = charged;
    };

    characters.add(characterId, updatedCharacter);
  };

  // Quest Management
  public shared ({ caller }) func createQuest(title : Text, description : Text, reward : { exp : Nat; gold : Nat }, isMainQuest : Bool) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create quests");
    };

    let id = nextQuestId;
    nextQuestId += 1;

    let quest : Quest = {
      id;
      title;
      description;
      reward;
      isMainQuest;
      completedBy = [];
    };

    quests.add(id, quest);
    id;
  };

  public shared ({ caller }) func completeQuest(characterId : Nat, questId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete quests");
    };

    let character = switch (characters.get(characterId)) {
      case (?c) {
        if (c.owner != caller) {
          Runtime.trap("Unauthorized: You do not own this character");
        };
        c;
      };
      case (null) { Runtime.trap("Character not found") };
    };

    let quest = switch (quests.get(questId)) {
      case (?q) { q };
      case (null) { Runtime.trap("Quest not found") };
    };

    let updatedQuest = {
      quest with
      completedBy = quest.completedBy.concat([caller]);
    };

    quests.add(questId, updatedQuest);
  };

  public query ({ caller }) func getQuests(isMain : Bool) : async [Quest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view quests");
    };

    let allQuests = quests.values().toArray();
    allQuests.filter<Quest>(func(q) { q.isMainQuest == isMain });
  };

  public query ({ caller }) func getQuest(id : Nat) : async Quest {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view quests");
    };

    switch (quests.get(id)) {
      case (?quest) { quest };
      case (null) { Runtime.trap("Quest not found") };
    };
  };

  // Guild Management
  public shared ({ caller }) func createGuild(name : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create guilds");
    };

    let id = nextGuildId;
    nextGuildId += 1;

    let guild : Guild = {
      id;
      name;
      members = [caller];
      leader = caller;
    };

    guilds.add(id, guild);
    id;
  };

  public shared ({ caller }) func joinGuild(guildId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join guilds");
    };

    let guild = switch (guilds.get(guildId)) {
      case (?g) {
        let isMember = g.members.find(func(m) { m == caller });
        switch (isMember) {
          case (?_) { Runtime.trap("Already a member of this guild") };
          case (null) { g };
        };
      };
      case (null) { Runtime.trap("Guild not found") };
    };

    let updatedGuild = {
      guild with
      members = guild.members.concat([caller]);
    };

    guilds.add(guildId, updatedGuild);
  };

  public shared ({ caller }) func leaveGuild(guildId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can leave guilds");
    };

    let guild = switch (guilds.get(guildId)) {
      case (?g) { g };
      case (null) { Runtime.trap("Guild not found") };
    };

    if (guild.leader == caller) {
      Runtime.trap("Guild leader cannot leave. Transfer leadership first");
    };

    let updatedMembers = guild.members.filter(func(m) { m != caller });

    let updatedGuild = {
      guild with
      members = updatedMembers;
    };

    guilds.add(guildId, updatedGuild);
  };

  public query ({ caller }) func getGuild(id : Nat) : async Guild {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view guilds");
    };

    switch (guilds.get(id)) {
      case (?guild) { guild };
      case (null) { Runtime.trap("Guild not found") };
    };
  };

  public query ({ caller }) func getAllGuilds() : async [Guild] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view guilds");
    };
    guilds.values().toArray();
  };

  // Weather System
  public shared ({ caller }) func setWeather(state : WeatherState) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set weather");
    };
    currentWeather := state;
  };

  public query ({ caller }) func getWeather() : async WeatherState {
    // Weather is public information, no auth required
    currentWeather;
  };

  public query ({ caller }) func get_world_state() : async { weather : WeatherState; timestamp : Time.Time } {
    // World state is public information, no auth required
    {
      weather = currentWeather;
      timestamp = Time.now();
    };
  };

  // Trading System
  public shared ({ caller }) func createTransaction(seller : Principal, item : Text, price : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create transactions");
    };

    let id = nextTransactionId;
    nextTransactionId += 1;

    let transaction : Transaction = {
      id;
      seller;
      buyer = caller;
      item;
      price;
      timestamp = Time.now();
    };

    transactions.add(id, transaction);
    id;
  };

  public query ({ caller }) func getTransaction(id : Nat) : async Transaction {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };

    switch (transactions.get(id)) {
      case (?transaction) {
        // Users can only view their own transactions unless admin
        if (transaction.seller != caller and transaction.buyer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own transactions");
        };
        transaction;
      };
      case (null) { Runtime.trap("Transaction not found") };
    };
  };

  public query ({ caller }) func getUserTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };

    let allTransactions = transactions.values().toArray();
    allTransactions.filter<Transaction>(func(t) { t.seller == caller or t.buyer == caller });
  };

  // Stripe Integration
  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can perform this action");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    // Session status check can be public for verification purposes
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
