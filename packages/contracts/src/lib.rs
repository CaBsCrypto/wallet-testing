#![no_std]
use soroban_sdk::{contract, contracttype, contractimpl, symbol_short, Env, String, Address, Symbol, Vec};

#[contracttype]
#[derive(Clone)]
pub struct Pet {
    pub name: String,
    pub owner: Address,
    pub birth_date: u64,
    pub level: u32,
    pub xp: u64,
    pub design: String, // New field for design evolution
}

#[contracttype]
#[derive(Clone)]
pub struct PetStats {
    pub strength: u32,
    pub agility: u32,
    pub intelligence: u32,
    pub energy: u32,
    pub last_update: u64,
    pub wins: u32,
    pub losses: u32,
    pub gold: u32,
}

#[contracttype]
pub enum DataKey {
    Pet(Address), // Mapping Owner -> Pet
    Stats(Address), // Mapping Owner -> PetStats
    Badges(Address), // Mapping Owner -> Vec<Symbol>
    Admin,        // Admin Address
    Paused,       // Boolean
}

#[contract]
pub struct PetRegistry;

#[contractimpl]
impl PetRegistry {
    // --- Admin / Setup ---

    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    pub fn set_paused(env: Env, paused: bool) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).expect("Not initialized");
        admin.require_auth();
        env.storage().instance().set(&DataKey::Paused, &paused);
    }

    pub fn is_paused(env: Env) -> bool {
        env.storage().instance().get(&DataKey::Paused).unwrap_or(false)
    }

    // --- Pet Logic ---

    pub fn mint_pet(env: Env, owner: Address, name: String) -> u64 {
        if Self::is_paused(env.clone()) {
            panic!("Contract is paused");
        }
        
        owner.require_auth();
        
        let key = DataKey::Pet(owner.clone());
        
        if env.storage().persistent().has(&key) {
           panic!("User already has a pet");
        }

        let pet = Pet {
            name,
            owner: owner.clone(),
            birth_date: env.ledger().timestamp(),
            level: 1,
            xp: 0,
            design: String::from_str(&env, "egg"),
        };

        // Initialize Stats
        let stats = PetStats {
            strength: 1,
            agility: 1,
            intelligence: 1,
            energy: 100, // Default Energy
            last_update: env.ledger().timestamp(),
            wins: 0,
            losses: 0,
            gold: 0,
        };
        let stats_key = DataKey::Stats(owner.clone());
        env.storage().persistent().set(&stats_key, &stats);

        env.storage().persistent().set(&key, &pet);
        
        // Emit Mint Event
        env.events().publish((symbol_short!("mint"), owner.clone()), 1u64);
        
        1
    }

    pub fn get_pet(env: Env, owner: Address) -> Option<Pet> {
        let key = DataKey::Pet(owner);
        env.storage().persistent().get(&key)
    }
    
    pub fn add_xp(env: Env, owner: Address, amount: u64) {
         if Self::is_paused(env.clone()) {
            panic!("Contract is paused");
        }
         
         // In MVP, we allow owner to call this for testing
         owner.require_auth(); 
         
         let key = DataKey::Pet(owner.clone());
         if let Some(mut pet) = env.storage().persistent().get::<DataKey, Pet>(&key) {
             pet.xp += amount;
             
             // Simple level up: Level * 100 XP
             // Example: Lvl 1 -> 100 XP needed for Lvl 2
             let xp_needed = pet.level as u64 * 100;
             
             if pet.xp >= xp_needed {
                 pet.level += 1;
                 pet.xp = pet.xp - xp_needed; // Carry over excess XP
                 
                 // Emit LevelUp Event
                 env.events().publish((symbol_short!("level_up"), owner.clone()), pet.level);
             }
             
             env.storage().persistent().set(&key, &pet);
         }
    }
    
    // Allow owner to update design (e.g. after evolution)
    pub fn change_design(env: Env, owner: Address, new_design: String) {
        if Self::is_paused(env.clone()) {
            panic!("Contract is paused");
        }
        
        owner.require_auth();
        
        let key = DataKey::Pet(owner.clone());
        if let Some(mut pet) = env.storage().persistent().get::<DataKey, Pet>(&key) {
             pet.design = new_design;
             env.storage().persistent().set(&key, &pet);
             
             // Emit DesignChange Event
             env.events().publish((symbol_short!("design_ch"), owner), pet.design);
        }
    }

    // Allow owner to release (delete) pet to start over
    pub fn release_pet(env: Env, owner: Address) {
        if Self::is_paused(env.clone()) {
            panic!("Contract is paused");
        }
        
        owner.require_auth();
        
        let key = DataKey::Pet(owner.clone());
        if env.storage().persistent().has(&key) {
            env.storage().persistent().remove(&key);
        }
    }

    // --- Stats & Energy Logic ---

    fn update_stats(env: &Env, stats: &mut PetStats) {
        let now = env.ledger().timestamp();
        let elapsed = now.saturating_sub(stats.last_update);
        
        // Regen 1 energy every 30 seconds
        let regen_amount = (elapsed / 30) as u32;
        
        if regen_amount > 0 {
             stats.energy = (stats.energy + regen_amount).min(100);
             // We update last_update only by the amount consumed to avoid "free" time drift, 
             // but for MVP just set to now if we capped, or subtract remainder.
             // Simpler: Set last_update to now if we added energy.
             stats.last_update = now; 
        }
    }

    pub fn get_stats(env: Env, owner: Address) -> PetStats {
        let key = DataKey::Stats(owner.clone());
        if let Some(mut stats) = env.storage().persistent().get::<DataKey, PetStats>(&key) {
            Self::update_stats(&env, &mut stats);
            // We don't save here to avoid gas cost on pure view, but strictly speaking we should if we want accurate next view.
             // For view-only, we just return the calculated state.
            stats
        } else {
            // Default Stats
            PetStats {
                strength: 1,
                agility: 1,
                intelligence: 1,
                energy: 100,
                last_update: env.ledger().timestamp(),
                wins: 0,
                losses: 0,
                gold: 10, // Default Gold updated to 10
            }
        }
    }

    pub fn train_stat(env: Env, owner: Address, stat: Symbol) {
        if Self::is_paused(env.clone()) {
             panic!("Contract is paused");
        }
        owner.require_auth();
        
        let key = DataKey::Stats(owner.clone());
        let mut stats = env.storage().persistent().get::<DataKey, PetStats>(&key).unwrap_or(PetStats {
                strength: 1,
                agility: 1,
                intelligence: 1,
                energy: 100,
                last_update: env.ledger().timestamp(),
                wins: 0,
                losses: 0,
                gold: 10, // Default Gold updated to 10
        });

        Self::update_stats(&env, &mut stats);

        if stats.energy < 10 {
            panic!("Not enough energy");
        }

        stats.energy -= 10;
        
        // Match symbol using simple ifs as match on Symbol is tricky in some SDK versions or just use equality
        if stat == symbol_short!("str") {
            stats.strength += 1;
        } else if stat == symbol_short!("agi") {
             stats.agility += 1;
        } else if stat == symbol_short!("int") {
             stats.intelligence += 1;
        } else {
            panic!("Invalid stat");
        }
        
        env.storage().persistent().set(&key, &stats);
        
        // Also give some XP to the pet
        // We need to access the Pet data too
        let pet_key = DataKey::Pet(owner.clone());
        if let Some(mut pet) = env.storage().persistent().get::<DataKey, Pet>(&pet_key) {
            pet.xp += 10; // Training gives small XP
             let xp_needed = pet.level as u64 * 100;
             if pet.xp >= xp_needed {
                 pet.level += 1;
                 pet.xp = pet.xp - xp_needed;
                 env.events().publish((symbol_short!("level_up"), owner.clone()), pet.level);
             }
             env.storage().persistent().set(&pet_key, &pet);
        }
    }

    // --- Shop Logic ---
    pub fn buy_potion(env: Env, owner: Address) {
         if Self::is_paused(env.clone()) {
             panic!("Contract is paused");
        }
        owner.require_auth();

        let key = DataKey::Stats(owner.clone());
        if let Some(mut stats) = env.storage().persistent().get::<DataKey, PetStats>(&key) {
             Self::update_stats(&env, &mut stats);
             
             if stats.gold < 50 {
                 panic!("Not enough gold");
             }

             stats.gold -= 50;
             stats.energy = 100; // Restore full energy
             
             env.storage().persistent().set(&key, &stats);
             env.events().publish((symbol_short!("shop"), owner), symbol_short!("potion"));
        } else {
            panic!("No stats found");
        }
    }

    pub fn buy_small_potion(env: Env, owner: Address) {
         if Self::is_paused(env.clone()) {
             panic!("Contract is paused");
        }
        owner.require_auth();

        let key = DataKey::Stats(owner.clone());
        if let Some(mut stats) = env.storage().persistent().get::<DataKey, PetStats>(&key) {
             Self::update_stats(&env, &mut stats);
             
             if stats.gold < 10 {
                 panic!("Not enough gold");
             }

             stats.gold -= 10;
             stats.energy = (stats.energy + 20).min(100); // Restore 20 energy, capped at 100
             
             env.storage().persistent().set(&key, &stats);
             env.events().publish((symbol_short!("shop"), owner), symbol_short!("s_potion"));
        } else {
            panic!("No stats found");
        }
    }

    pub fn battle(env: Env, owner: Address, move_choice: Symbol) -> Symbol {
        if Self::is_paused(env.clone()) {
            panic!("Contract is paused");
        }

        owner.require_auth();

        // Validate Move
        if move_choice != symbol_short!("Fire") && 
           move_choice != symbol_short!("Water") && 
           move_choice != symbol_short!("Grass") {
            panic!("Invalid move");
        }

        let mut stats = Self::get_stats(env.clone(), owner.clone());
        let stats_key = DataKey::Stats(owner.clone());
        
        if stats.energy < 20 {
            panic!("Not enough energy");
        }
        stats.energy -= 20;

        let key = DataKey::Pet(owner.clone());
        if let Some(mut pet) = env.storage().persistent().get::<DataKey, Pet>(&key) {
            
            // CPU Move Logic
            let time = env.ledger().timestamp();
            let rand = time % 3; // 0, 1, 2
            let cpu_move = match rand {
                0 => symbol_short!("Fire"),
                1 => symbol_short!("Water"),
                _ => symbol_short!("Grass"),
            };

            // Determine Outcome
            // 0: Draw, 1: Win, 2: Loss
            let outcome = if move_choice == cpu_move {
                0 
            } else if (move_choice == symbol_short!("Fire") && cpu_move == symbol_short!("Grass")) ||
                      (move_choice == symbol_short!("Grass") && cpu_move == symbol_short!("Water")) ||
                      (move_choice == symbol_short!("Water") && cpu_move == symbol_short!("Fire")) {
                1
            } else {
                2
            };

            let result_symbol = match outcome {
                0 => symbol_short!("Draw"),
                1 => symbol_short!("Win"),
                _ => symbol_short!("Loss"),
            };

            // Rewards
            let xp_gain = match outcome {
                0 => { // Draw
                    stats.gold += 5; // Small gold for draw
                    10 // Small XP
                },
                1 => { // Win
                    stats.wins += 1;
                    stats.gold += 25; // Good gold for win
                    30 + (stats.intelligence as u64) // XP Bonus
                },
                _ => { // Loss
                    stats.losses += 1;
                    stats.gold += 1; // Pity
                    5
                }
            };
            
            pet.xp += xp_gain;

            let xp_needed = pet.level as u64 * 100;
            if pet.xp >= xp_needed {
                pet.level += 1;
                pet.xp = pet.xp - xp_needed;
                env.events().publish((symbol_short!("level_up"), owner.clone()), pet.level);
            }

            env.storage().persistent().set(&key, &pet);
            env.storage().persistent().set(&stats_key, &stats);

            // Publish detailed event: (UserMove, CpuMove, Result)
            env.events().publish((symbol_short!("battle"), owner), (move_choice, cpu_move, result_symbol.clone()));
            
            result_symbol
        } else {
            panic!("No pet found");
        }
    }

    // Batch Hunt: Accepts multiple moves (0-8)
    // Returns a list of results (symbols)
    pub fn play_hunt(env: Env, owner: Address, moves: Vec<u32>) -> Vec<Symbol> {
        if Self::is_paused(env.clone()) {
            panic!("Contract is paused");
        }
        owner.require_auth();

        if moves.len() > 9 {
             panic!("Too many moves");
        }
        if moves.len() == 0 {
             panic!("No moves provided");
        }

        let mut stats = Self::get_stats(env.clone(), owner.clone());
        let stats_key = DataKey::Stats(owner.clone());
        
        let cost = 5 * moves.len() as u32;
        if stats.energy < cost {
             panic!("Not enough energy");
        }
        stats.energy -= cost;

        let mut results = Vec::new(&env);
        let time = env.ledger().timestamp();
        let seq = env.ledger().sequence();
        
        // Iterate moves
        for move_idx in moves.iter() {
             // Unique entropy per move: Time + Seq + MoveIndex
             // Fix: wrapping_mul(100) caused result % 100 to always be 0 (Trap).
             // Using LCG constants for better pseudo-randomness.
             let entropy = time.wrapping_add(seq as u64).wrapping_add(move_idx as u64)
                .wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
             let rand = entropy % 100;

             let outcome = if rand < 10 {
                symbol_short!("trap")
            } else if rand < 90 { // DEBUG: High Gem Chance
                symbol_short!("gem")
            } else {
                symbol_short!("dust")
            };
            
            if outcome == symbol_short!("trap") {
                // No Reward
            } else if outcome == symbol_short!("gem") {
                stats.gold += 1000; // MASSIVE DEBUG REWARD
                env.events().publish((symbol_short!("dbg_gold"), owner.clone()), stats.gold); // Verify new balance
            } else { // dust
                // XP Logic
                let key = DataKey::Pet(owner.clone());
                if let Some(mut pet) = env.storage().persistent().get::<DataKey, Pet>(&key) {
                    pet.xp += 100; // MASSIVE DEBUG XP (Was 2)
                    // Check Level Up
                    let xp_needed = pet.level as u64 * 100;
                    if pet.xp >= xp_needed {
                        pet.level += 1;
                        pet.xp = pet.xp - xp_needed;
                        env.events().publish((symbol_short!("level_up"), owner.clone()), pet.level);
                    }
                    env.storage().persistent().set(&key, &pet);
                }
            }
            results.push_back(outcome);
        }

        env.storage().persistent().set(&stats_key, &stats);
        env.events().publish((symbol_short!("hunt"), owner), results.clone());
        results
    }

    pub fn submit_game_score(env: Env, owner: Address, score: u32, game_id: Symbol) -> Vec<Symbol> {
        owner.require_auth();
        let stats_key = DataKey::Stats(owner.clone());
        let mut stats = env.storage().persistent().get::<DataKey, PetStats>(&stats_key).expect("No stats found");

        if stats.energy < 20 {
            panic!("Not enough energy");
        }
        stats.energy -= 20;

        // Reward Calculation
        // Gold: Score / 100
        let mut gold_reward = score / 100;
        
        // XP: Score / 50
        let xp_reward = (score / 50) as u64; // XP is u64

        // 2048 Bonus
        if game_id == symbol_short!("2048") && score >= 2048 {
             gold_reward += 500;
        }

        stats.gold += gold_reward;
        
        // Update XP (Load Pet main data)
        let key = DataKey::Pet(owner.clone());
        if let Some(mut pet) = env.storage().persistent().get::<DataKey, Pet>(&key) {
            pet.xp += xp_reward;
             // Check Level Up
            let xp_needed = pet.level as u64 * 100;
            if pet.xp >= xp_needed {
                pet.level += 1;
                pet.xp = pet.xp - xp_needed;
                env.events().publish((symbol_short!("level_up"), owner.clone()), pet.level);
            }
            env.storage().persistent().set(&key, &pet);
        }

        env.storage().persistent().set(&stats_key, &stats);
        env.events().publish((symbol_short!("game_end"), owner), (game_id, score, gold_reward));
        
        // Return results as symbols for UI to parse? Or just Vec.
        // Actually void is fine, events handle it. But let's return a simple confirmation.
        let mut result = Vec::new(&env);
        result.push_back(symbol_short!("success"));
        result
    }

    // --------------------------------------------------------------------------------
    // 8-Ball Pool Minigame
    // --------------------------------------------------------------------------------
    pub fn submit_pool_score(env: Env, owner: Address, score: u32) -> Vec<Symbol> {
        owner.require_auth();

        let stats_key = DataKey::Stats(owner.clone());
        let mut stats = env.storage().persistent().get::<DataKey, PetStats>(&stats_key).expect("No stats found");
        let current_time = env.ledger().timestamp();

        // 1. Check Energy (Table Fee: 5 Energy)
        if stats.energy < 5 {
             panic!("Not enough energy");
        }
        stats.energy -= 5;

        // 2. Calculate Rewards
        // 2 Gold per ball potted
        let gold_reward = score * 2;
        stats.gold += gold_reward;
        
        // XP: 5 XP per ball
        let xp_reward = (score * 5) as u64;

        // 3. Save Stats
        stats.last_update = current_time;
        env.storage().persistent().set(&stats_key, &stats);
        
        // 4. Update Pet XP
        let pet_key = DataKey::Pet(owner.clone());
        if let Some(mut pet) = env.storage().persistent().get::<DataKey, Pet>(&pet_key) {
             pet.xp += xp_reward;
              // Check Level Up
            let xp_needed = pet.level as u64 * 100;
            if pet.xp >= xp_needed {
                pet.level += 1;
                pet.xp = pet.xp - xp_needed;
                env.events().publish((symbol_short!("level_up"), owner.clone()), pet.level);
            }
            env.storage().persistent().set(&pet_key, &pet);
        }

        let mut result = Vec::new(&env);
        result.push_back(symbol_short!("success"));
        result
    }

    // --------------------------------------------------------------------------------
    // Academy Badges (Soulbound Tokens)
    // --------------------------------------------------------------------------------
    pub fn claim_badge(env: Env, owner: Address, badge_id: Symbol) -> Vec<Symbol> {
        owner.require_auth();

        let key = DataKey::Badges(owner.clone());
        let mut badges = env.storage().persistent().get::<DataKey, Vec<Symbol>>(&key)
            .unwrap_or(Vec::new(&env));

        // specific check: prevent duplicate
        if badges.contains(badge_id.clone()) {
             // Already has badge, just return current list
             return badges;
        }

        badges.push_back(badge_id.clone());
        env.storage().persistent().set(&key, &badges);
        
        // Award XP for Badge (e.g. 50 XP)
        let pet_key = DataKey::Pet(owner.clone());
        if let Some(mut pet) = env.storage().persistent().get::<DataKey, Pet>(&pet_key) {
             pet.xp += 50;
             // Check Level Up
            let xp_needed = pet.level as u64 * 100;
            if pet.xp >= xp_needed {
                pet.level += 1;
                pet.xp = pet.xp - xp_needed;
                env.events().publish((symbol_short!("level_up"), owner.clone()), pet.level);
            }
            env.storage().persistent().set(&pet_key, &pet);
        }

        env.events().publish((symbol_short!("badge"), owner), badge_id);
        badges
    }

    pub fn get_badges(env: Env, owner: Address) -> Vec<Symbol> {
         let key = DataKey::Badges(owner.clone());
         env.storage().persistent().get::<DataKey, Vec<Symbol>>(&key)
            .unwrap_or(Vec::new(&env))
    }
}
