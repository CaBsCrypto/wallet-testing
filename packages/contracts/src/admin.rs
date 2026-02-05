
use soroban_sdk::{Env, Address};
use crate::types::DataKey;

pub fn initialize(env: &Env, admin: Address) {
    if env.storage().instance().has(&DataKey::Admin) {
        panic!("Already initialized");
    }
    env.storage().instance().set(&DataKey::Admin, &admin);
}

pub fn set_paused(env: &Env, paused: bool) {
    let admin: Address = env.storage().instance().get(&DataKey::Admin).expect("Not initialized");
    admin.require_auth();
    env.storage().instance().set(&DataKey::Paused, &paused);
}

pub fn is_paused(env: &Env) -> bool {
    env.storage().instance().get(&DataKey::Paused).unwrap_or(false)
}

pub fn check_paused(env: &Env) {
    if is_paused(env) {
        panic!("Contract is paused");
    }
}
