
use soroban_sdk::{Env, Address, Symbol, Vec, symbol_short};
use crate::types::{DataKey, Pet, PetStats};
use crate::admin::check_paused;
use crate::stats::{get_stats, update_stats};

pub fn battle(env: &Env, owner: Address, move_choice: Symbol) -> Symbol {
    check_paused(env);
    owner.require_auth();

    if move_choice != symbol_short!("Fire") && 
       move_choice != symbol_short!("Water") && 
       move_choice != symbol_short!("Grass") {
        panic!("Invalid move");
    }

    let mut stats = get_stats(env, owner.clone());
    let stats_key = DataKey::Stats(owner.clone());
    
    if stats.energy < 20 {
        panic!("Not enough energy");
    }
    stats.energy -= 20;

    let key = DataKey::Pet(owner.clone());
    if let Some(mut pet) = env.storage().persistent().get::<DataKey, Pet>(&key) {
        
        let time = env.ledger().timestamp();
        let rand = time % 3;
        let cpu_move = match rand {
            0 => symbol_short!("Fire"),
            1 => symbol_short!("Water"),
            _ => symbol_short!("Grass"),
        };

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

        let xp_gain = match outcome {
            0 => { // Draw
                stats.gold += 5; 
                10 
            },
            1 => { // Win
                stats.wins += 1;
                stats.gold += 25; 
                30 + (stats.intelligence as u64)
            },
            _ => { // Loss
                stats.losses += 1;
                stats.gold += 1;
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

        env.events().publish((symbol_short!("battle"), owner), (move_choice, cpu_move, result_symbol.clone()));
        
        result_symbol
    } else {
        panic!("No pet found");
    }
}

pub fn play_hunt(env: &Env, owner: Address, moves: Vec<u32>) -> Vec<Symbol> {
    check_paused(env);
    owner.require_auth();

    if moves.len() > 9 {
            panic!("Too many moves");
    }
    if moves.len() == 0 {
            panic!("No moves provided");
    }

    let mut stats = get_stats(env, owner.clone());
    let stats_key = DataKey::Stats(owner.clone());
    
    let cost = 5 * moves.len() as u32;
    if stats.energy < cost {
            panic!("Not enough energy");
    }
    stats.energy -= cost;

    let mut results = Vec::new(env);
    let time = env.ledger().timestamp();
    let seq = env.ledger().sequence();
    
    for move_idx in moves.iter() {
            let entropy = time.wrapping_add(seq as u64).wrapping_add(move_idx as u64)
            .wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
            let rand = entropy % 100;

            let outcome = if rand < 10 {
            symbol_short!("trap")
        } else if rand < 90 {
            symbol_short!("gem")
        } else {
            symbol_short!("dust")
        };
        
        if outcome == symbol_short!("trap") {
            // No Reward
        } else if outcome == symbol_short!("gem") {
            stats.gold += 1000; 
            env.events().publish((symbol_short!("dbg_gold"), owner.clone()), stats.gold);
        } else { 
            let key = DataKey::Pet(owner.clone());
            if let Some(mut pet) = env.storage().persistent().get::<DataKey, Pet>(&key) {
                pet.xp += 100; 
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

pub fn submit_game_score(env: &Env, owner: Address, score: u32, game_id: Symbol) -> Vec<Symbol> {
    owner.require_auth();
    let stats_key = DataKey::Stats(owner.clone());
    let mut stats = env.storage().persistent().get::<DataKey, PetStats>(&stats_key).expect("No stats found");

    if stats.energy < 20 {
        panic!("Not enough energy");
    }
    stats.energy -= 20;

    let mut gold_reward = score / 100;
    let xp_reward = (score / 50) as u64;

    if game_id == symbol_short!("2048") && score >= 2048 {
            gold_reward += 500;
    }

    stats.gold += gold_reward;
    
    let key = DataKey::Pet(owner.clone());
    if let Some(mut pet) = env.storage().persistent().get::<DataKey, Pet>(&key) {
        pet.xp += xp_reward;
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
    
    let mut result = Vec::new(env);
    result.push_back(symbol_short!("success"));
    result
}

pub fn submit_pool_score(env: &Env, owner: Address, score: u32) -> Vec<Symbol> {
    owner.require_auth();

    let stats_key = DataKey::Stats(owner.clone());
    let mut stats = env.storage().persistent().get::<DataKey, PetStats>(&stats_key).expect("No stats found");
    let current_time = env.ledger().timestamp();

    if stats.energy < 5 {
            panic!("Not enough energy");
    }
    stats.energy -= 5;

    let gold_reward = score * 2;
    stats.gold += gold_reward;
    
    let xp_reward = (score * 5) as u64;

    stats.last_update = current_time;
    env.storage().persistent().set(&stats_key, &stats);
    
    let pet_key = DataKey::Pet(owner.clone());
    if let Some(mut pet) = env.storage().persistent().get::<DataKey, Pet>(&pet_key) {
            pet.xp += xp_reward;
        let xp_needed = pet.level as u64 * 100;
        if pet.xp >= xp_needed {
            pet.level += 1;
            pet.xp = pet.xp - xp_needed;
            env.events().publish((symbol_short!("level_up"), owner.clone()), pet.level);
        }
        env.storage().persistent().set(&pet_key, &pet);
    }

    let mut result = Vec::new(env);
    result.push_back(symbol_short!("success"));
    result
}
