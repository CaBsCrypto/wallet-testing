
use soroban_sdk::{Env, Address, symbol_short};
use crate::types::{DataKey, PetStats};
use crate::admin::check_paused;
use crate::stats::update_stats;

pub fn buy_potion(env: &Env, owner: Address) {
    check_paused(env);
    owner.require_auth();

    let key = DataKey::Stats(owner.clone());
    if let Some(mut stats) = env.storage().persistent().get::<DataKey, PetStats>(&key) {
            update_stats(env, &mut stats);
            
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

pub fn buy_small_potion(env: &Env, owner: Address) {
    check_paused(env);
    owner.require_auth();

    let key = DataKey::Stats(owner.clone());
    if let Some(mut stats) = env.storage().persistent().get::<DataKey, PetStats>(&key) {
            update_stats(env, &mut stats);
            
            if stats.gold < 10 {
                panic!("Not enough gold");
            }

            stats.gold -= 10;
            stats.energy = (stats.energy + 20).min(100); 
            
            env.storage().persistent().set(&key, &stats);
            env.events().publish((symbol_short!("shop"), owner), symbol_short!("s_potion"));
    } else {
        panic!("No stats found");
    }
}
