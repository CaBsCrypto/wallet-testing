
use soroban_sdk::{Env, Address, Symbol, symbol_short};
use crate::types::{DataKey, PetStats, Pet};
use crate::admin::check_paused;

// Helper to update energy based on time
pub fn update_stats(env: &Env, stats: &mut PetStats) {
    let now = env.ledger().timestamp();
    // Prevent underflow if time is somehow weird, though unlikely on chain
    let elapsed = now.saturating_sub(stats.last_update);
    
    // Regen 1 energy every 30 seconds
    let regen_amount = (elapsed / 30) as u32;
    
    if regen_amount > 0 {
            stats.energy = (stats.energy + regen_amount).min(100);
            stats.last_update = now; 
    }
}

pub fn get_stats(env: &Env, owner: Address) -> PetStats {
    let key = DataKey::Stats(owner.clone());
    if let Some(mut stats) = env.storage().persistent().get::<DataKey, PetStats>(&key) {
        update_stats(env, &mut stats);
        stats
    } else {
        PetStats {
            strength: 1,
            agility: 1,
            intelligence: 1,
            energy: 100,
            last_update: env.ledger().timestamp(),
            wins: 0,
            losses: 0,
            gold: 10,
        }
    }
}

pub fn train_stat(env: &Env, owner: Address, stat: Symbol) {
    check_paused(env);
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
            gold: 10,
    });

    update_stats(env, &mut stats);

    if stats.energy < 10 {
        panic!("Not enough energy");
    }

    stats.energy -= 10;
    
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
    
    // XP Grant logic
    let pet_key = DataKey::Pet(owner.clone());
    if let Some(mut pet) = env.storage().persistent().get::<DataKey, Pet>(&pet_key) {
        pet.xp += 10; 
            let xp_needed = pet.level as u64 * 100;
            if pet.xp >= xp_needed {
                pet.level += 1;
                pet.xp = pet.xp - xp_needed;
                env.events().publish((symbol_short!("level_up"), owner.clone()), pet.level);
            }
            env.storage().persistent().set(&pet_key, &pet);
    }
}
