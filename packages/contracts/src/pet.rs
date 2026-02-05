
use soroban_sdk::{Env, Address, String, symbol_short};
use crate::types::{DataKey, Pet, PetStats};
use crate::admin::check_paused;

pub fn mint_pet(env: &Env, owner: Address, name: String) -> u64 {
    check_paused(env);
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
        design: String::from_str(env, "egg"),
    };

    // Initialize Stats defaults
    let stats = PetStats {
        strength: 1,
        agility: 1,
        intelligence: 1,
        energy: 100, 
        last_update: env.ledger().timestamp(),
        wins: 0,
        losses: 0,
        gold: 0,
    };
    let stats_key = DataKey::Stats(owner.clone());
    env.storage().persistent().set(&stats_key, &stats);

    env.storage().persistent().set(&key, &pet);
    
    env.events().publish((symbol_short!("mint"), owner.clone()), 1u64);
    
    1
}

pub fn get_pet(env: &Env, owner: Address) -> Option<Pet> {
    let key = DataKey::Pet(owner);
    env.storage().persistent().get(&key)
}

pub fn add_xp(env: &Env, owner: Address, amount: u64) {
    check_paused(env);
    owner.require_auth(); 
    
    let key = DataKey::Pet(owner.clone());
    if let Some(mut pet) = env.storage().persistent().get::<DataKey, Pet>(&key) {
        pet.xp += amount;
        
        let xp_needed = pet.level as u64 * 100;
        
        if pet.xp >= xp_needed {
            pet.level += 1;
            pet.xp = pet.xp - xp_needed; 
            
            env.events().publish((symbol_short!("level_up"), owner.clone()), pet.level);
        }
        
        env.storage().persistent().set(&key, &pet);
    }
}

pub fn change_design(env: &Env, owner: Address, new_design: String) {
    check_paused(env);
    owner.require_auth();
    
    let key = DataKey::Pet(owner.clone());
    if let Some(mut pet) = env.storage().persistent().get::<DataKey, Pet>(&key) {
            pet.design = new_design;
            env.storage().persistent().set(&key, &pet);
            env.events().publish((symbol_short!("design_ch"), owner), pet.design);
    }
}

pub fn release_pet(env: &Env, owner: Address) {
    check_paused(env);
    owner.require_auth();
    
    let key = DataKey::Pet(owner.clone());
    if env.storage().persistent().has(&key) {
        env.storage().persistent().remove(&key);
    }
}
