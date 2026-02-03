#![no_std]
use soroban_sdk::{contract, contracttype, contractimpl, symbol_short, Env, String, Address, Symbol};

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
            design: String::from_str(&env, "egg"), // Default starting design
        };

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

    pub fn battle(env: Env, owner: Address) -> Symbol {
        if Self::is_paused(env.clone()) {
            panic!("Contract is paused");
        }

        owner.require_auth();

        let mut stats = Self::get_stats(env.clone(), owner.clone()); // This gets updated view
        // Need to re-read to get mutable access only if we didn't just return it, 
        // actually get_stats returns a value, we can use it but we need to fetch 'real' storage to save?
        // Let's just do the fetch pattern again to be safe and simple.
        
        let stats_key = DataKey::Stats(owner.clone());
        // Reload raw to be sure (or just trust get_stats logic which constructs default)
        // Optimization: Just use the 'stats' variable we got and save it at the end.
        
        if stats.energy < 20 {
            panic!("Not enough energy");
        }
        stats.energy -= 20;

        let key = DataKey::Pet(owner.clone());
        if let Some(mut pet) = env.storage().persistent().get::<DataKey, Pet>(&key) {
            // Battle Logic with Stats
            // Base win chance 40% + (Strength * 5)%
            // Capped at 90%
            let win_chance = 40 + (stats.strength as u64 * 5);
            let win_chance = win_chance.min(90);

            let time = env.ledger().timestamp();
            let rand = time % 100; // 0-99
            
            let is_win = rand < win_chance;

            let xp_gain = if is_win { 
                stats.wins += 1;
                stats.gold += 15; // Win Reward
                20 + (stats.intelligence as u64) // Int bonus to XP
            } else { 
                stats.losses += 1;
                stats.gold += 1; // Pity Reward
                5 
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

            if is_win {
                env.events().publish((symbol_short!("battle"), owner), symbol_short!("win"));
                symbol_short!("win")
            } else {
                 env.events().publish((symbol_short!("battle"), owner), symbol_short!("loss"));
                 symbol_short!("loss")
            }
        } else {
            panic!("No pet found");
        }
    }
}
