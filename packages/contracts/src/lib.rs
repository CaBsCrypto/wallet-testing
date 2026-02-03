#![no_std]
use soroban_sdk::{contract, contracttype, contractimpl, Env, String, Address};

#[contracttype]
#[derive(Clone)]
pub struct Pet {
    pub name: String,
    pub owner: Address,
    pub birth_date: u64,
    pub level: u32,
    pub xp: u64,
}

#[contracttype]
pub enum DataKey {
    Pet(Address), // Mapping Owner -> Pet
}

#[contract]
pub struct PetRegistry;

#[contractimpl]
impl PetRegistry {
    // Initialize/Mint a pet
    pub fn mint_pet(env: Env, owner: Address, name: String) -> u64 {
        owner.require_auth();
        
        let key = DataKey::Pet(owner.clone());
        
        // Check if user already has a pet (limit 1 per user for MVP)
        if env.storage().persistent().has(&key) {
           panic!("User already has a pet");
        }

        let pet = Pet {
            name,
            owner: owner.clone(),
            birth_date: env.ledger().timestamp(),
            level: 1,
            xp: 0,
        };

        env.storage().persistent().set(&key, &pet);
        
        // Return 1 as success ID
        1
    }

    pub fn get_pet(env: Env, owner: Address) -> Option<Pet> {
        let key = DataKey::Pet(owner);
        env.storage().persistent().get(&key)
    }
    
    // Function to add XP
    pub fn add_xp(env: Env, owner: Address, amount: u64) {
         // In MVP, we allow owner to call this for testing, but in prod this should be gated
         owner.require_auth(); 
         
         let key = DataKey::Pet(owner.clone());
         if let Some(mut pet) = env.storage().persistent().get::<DataKey, Pet>(&key) {
             pet.xp += amount;
             // Simple level up: Level * 100 XP
             if pet.xp >= (pet.level as u64 * 100) {
                 pet.level += 1;
                 pet.xp = 0; 
             }
             env.storage().persistent().set(&key, &pet);
         }
    }
}
