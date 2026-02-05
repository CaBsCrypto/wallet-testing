#![no_std]
use soroban_sdk::{contract, contractimpl, Env, String, Address, Symbol, Vec};

mod types;
mod admin;
mod pet;
mod stats;
mod battle;
mod shop;
mod academy;

use types::{Pet, PetStats};

#[contract]
pub struct PetRegistry;

#[contractimpl]
impl PetRegistry {
    // --- Admin ---
    pub fn initialize(env: Env, admin: Address) {
        admin::initialize(&env, admin);
    }

    pub fn set_paused(env: Env, paused: bool) {
        admin::set_paused(&env, paused);
    }

    pub fn is_paused(env: Env) -> bool {
        admin::is_paused(&env)
    }

    // --- Pet ---
    pub fn mint_pet(env: Env, owner: Address, name: String) -> u64 {
        pet::mint_pet(&env, owner, name)
    }

    pub fn get_pet(env: Env, owner: Address) -> Option<Pet> {
        pet::get_pet(&env, owner)
    }

    pub fn add_xp(env: Env, owner: Address, amount: u64) {
        pet::add_xp(&env, owner, amount);
    }

    pub fn change_design(env: Env, owner: Address, new_design: String) {
        pet::change_design(&env, owner, new_design);
    }

    pub fn release_pet(env: Env, owner: Address) {
        pet::release_pet(&env, owner);
    }

    // --- Stats ---
    pub fn get_stats(env: Env, owner: Address) -> PetStats {
        stats::get_stats(&env, owner)
    }

    pub fn train_stat(env: Env, owner: Address, stat: Symbol) {
        stats::train_stat(&env, owner, stat);
    }

    // --- Shop ---
    pub fn buy_potion(env: Env, owner: Address) {
        shop::buy_potion(&env, owner);
    }

    pub fn buy_small_potion(env: Env, owner: Address) {
        shop::buy_small_potion(&env, owner);
    }

    // --- Battle & Games ---
    pub fn battle(env: Env, owner: Address, move_choice: Symbol) -> Symbol {
        battle::battle(&env, owner, move_choice)
    }

    pub fn play_hunt(env: Env, owner: Address, moves: Vec<u32>) -> Vec<Symbol> {
        battle::play_hunt(&env, owner, moves)
    }

    pub fn submit_game_score(env: Env, owner: Address, score: u32, game_id: Symbol) -> Vec<Symbol> {
        battle::submit_game_score(&env, owner, score, game_id)
    }

    pub fn submit_pool_score(env: Env, owner: Address, score: u32) -> Vec<Symbol> {
        battle::submit_pool_score(&env, owner, score)
    }

    // --- Academy ---
    pub fn claim_badge(env: Env, owner: Address, badge_id: Symbol) -> Vec<Symbol> {
        academy::claim_badge(&env, owner, badge_id)
    }

    pub fn get_badges(env: Env, owner: Address) -> Vec<Symbol> {
        academy::get_badges(&env, owner)
    }
}
