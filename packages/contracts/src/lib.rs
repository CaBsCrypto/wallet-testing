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
pub enum DataKey {
    Pet(Address), // Mapping Owner -> Pet
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
}
