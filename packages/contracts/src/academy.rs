
use soroban_sdk::{Env, Address, Symbol, Vec, symbol_short};
use crate::types::{DataKey, Pet};

pub fn claim_badge(env: &Env, owner: Address, badge_id: Symbol) -> Vec<Symbol> {
    owner.require_auth();

    let key = DataKey::Badges(owner.clone());
    let mut badges = env.storage().persistent().get::<DataKey, Vec<Symbol>>(&key)
        .unwrap_or(Vec::new(env));

    if badges.contains(badge_id.clone()) {
            return badges;
    }

    badges.push_back(badge_id.clone());
    env.storage().persistent().set(&key, &badges);
    
    let pet_key = DataKey::Pet(owner.clone());
    if let Some(mut pet) = env.storage().persistent().get::<DataKey, Pet>(&pet_key) {
            pet.xp += 50;
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

pub fn get_badges(env: &Env, owner: Address) -> Vec<Symbol> {
        let key = DataKey::Badges(owner.clone());
        env.storage().persistent().get::<DataKey, Vec<Symbol>>(&key)
        .unwrap_or(Vec::new(env))
}
