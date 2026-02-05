
use soroban_sdk::{contracttype, Address, String, Symbol, Vec};

#[contracttype]
#[derive(Clone)]
pub struct Pet {
    pub name: String,
    pub owner: Address,
    pub birth_date: u64,
    pub level: u32,
    pub xp: u64,
    pub design: String, 
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
#[derive(Clone)]
pub enum DataKey {
    Pet(Address), // Mapping Owner -> Pet
    Stats(Address), // Mapping Owner -> PetStats
    Badges(Address), // Mapping Owner -> Vec<Symbol>
    Admin,        // Admin Address
    Paused,       // Boolean
}
