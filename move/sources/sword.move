module hero_quest::sword {

// 필요한 Sui 프레임워크 기능들을 가져옵니다.
use sui::object::{Self, UID};
use sui::transfer;
use sui::tx_context::{Self, TxContext};
use sui::coin::{Self, Coin};
use sui::sui::SUI;
use std::string::{Self, String};

/// 우리의 동적 NFT, 영웅의 검입니다.
public struct HeroSword has key, store {
    id: UID,
    name: String,
    level: u64,
    kills: u64,
    // 나중에 이 URL을 바꿔서 이미지를 변경할 겁니다.
    image_url: String,
    // 검의 타입 (일반, 화염, 얼음, 번개, 어둠)
    sword_type: u8,
    // 공격력
    attack_power: u64,
    // 마법력
    magic_power: u64,
    // 강화 횟수 (클릭 횟수)
    enhancement_count: u64,
    // 희귀도 (0: 일반, 1: 고급, 2: 희귀, 3: 전설, 4: 신화)
    rarity: u8,
    // 강화 성공률 (0-100)
    success_rate: u8,
    // 검의 가치 (판매 시 받는 코인)
    value: u64,
}

/// 플레이어의 코인 잔액
public struct PlayerCoin has key, store {
    id: UID,
    amount: u64,
}

/// 플레이어의 검 컬렉션
public struct SwordCollection has key, store {
    id: UID,
    swords: vector<ID>,
}

// === Public Functions ===

/// 새로운 '초심자의 검'을 발행하여 함수를 호출한 유저에게 전송합니다.
public entry fun mint_sword(ctx: &mut TxContext) {
    let sword = HeroSword {
        id: object::new(ctx),
        name: string::utf8(b"a piece of iron"), // a piece of iron
        level: 1,
        kills: 0,
        image_url: string::utf8(b"/images/swords/1단계.png"), // 레벨 1 이미지
        sword_type: 0, // 일반 검
        attack_power: 10,
        magic_power: 5,
        enhancement_count: 0,
        rarity: 0, // 일반
        success_rate: 90, // 90% 성공률
        value: 100, // 초기 가치 100 코인
    };
    // 검을 트랜잭션을 보낸 사람(플레이어)에게 전송합니다.
    transfer::public_transfer(sword, tx_context::sender(ctx));
}

/// 플레이어의 초기 코인을 생성합니다.
public entry fun init_player_coin(ctx: &mut TxContext) {
    let coin = PlayerCoin {
        id: object::new(ctx),
        amount: 1000, // 초기 코인 1000개
    };
    transfer::public_transfer(coin, tx_context::sender(ctx));
}

/// 플레이어의 검 컬렉션을 생성합니다.
public entry fun init_sword_collection(ctx: &mut TxContext) {
    let collection = SwordCollection {
        id: object::new(ctx),
        swords: vector::empty<ID>(),
    };
    transfer::public_transfer(collection, tx_context::sender(ctx));
}

/// 몬스터를 처치했을 때 호출되는 함수입니다.
public entry fun slay_monster(sword: &mut HeroSword, ctx: &mut TxContext) {
    sword.kills = sword.kills + 1;

    // 레벨에 따라 필요한 킬 수가 달라집니다.
    let required_kills = get_required_kills_for_level(sword.level);
    if (sword.kills >= required_kills) {
        level_up(sword);
    }
}

/// 무한 클릭 강화 함수 - SUI 코인을 사용하여 강화
public entry fun enhance_sword(sword: &mut HeroSword, payment: &mut Coin<SUI>, ctx: &mut TxContext) {
    // 강화 비용 계산 (SUI 단위로 변경)
    let cost = get_enhancement_cost_sui(sword.enhancement_count);
    
    // SUI 코인 잔액 확인
    assert!(coin::value(payment) >= cost, 0); // SUI 부족
    
    // SUI 코인 차감
    let _ = coin::split(payment, cost, ctx);
    
    sword.enhancement_count = sword.enhancement_count + 1;
    
    // 강화 성공 여부 결정 (실제 확률 계산)
    let success = is_enhancement_successful(sword.success_rate);
    
    if (success) {
        // 강화 성공: 공격력 +1, 마법력 +1
        sword.attack_power = sword.attack_power + 1;
        sword.magic_power = sword.magic_power + 1;
        
        // 검의 가치 증가 (SUI 단위로 변경)
        sword.value = sword.value + cost / 2;
        
        // 희귀도 업그레이드 체크
        check_rarity_upgrade(sword);
        
        // 강화 성공률 감소 (최소 5%까지)
        if (sword.success_rate > 5) {
            sword.success_rate = sword.success_rate - 2;
        }
    } else {
        // 강화 실패: 검 파괴 (이 함수에서 검을 소각)
        // 검을 소각하여 완전히 제거
        let HeroSword {
            id,
            name: _,
            level: _,
            kills: _,
            image_url: _,
            sword_type: _,
            attack_power: _,
            magic_power: _,
            enhancement_count: _,
            rarity: _,
            success_rate: _,
            value: _,
        } = *sword;
        object::delete(id);
    }
}

/// 검을 판매하여 SUI 코인을 받는 함수
public entry fun sell_sword(sword: HeroSword, payment: &mut Coin<SUI>, ctx: &mut TxContext) {
    // 검의 가치만큼 SUI 코인 추가
    let value_in_sui = sword.value;
    let new_coin = coin::split(payment, value_in_sui, ctx);
    transfer::public_transfer(new_coin, tx_context::sender(ctx));
    
    // 검을 소각
    let HeroSword {
        id,
        name: _,
        level: _,
        kills: _,
        image_url: _,
        sword_type: _,
        attack_power: _,
        magic_power: _,
        enhancement_count: _,
        rarity: _,
        success_rate: _,
        value: _,
    } = sword;
    object::delete(id);
}

/// 검을 NFT로 저장하는 함수 (언제든지 호출 가능)
public entry fun save_sword_as_nft(sword: HeroSword, ctx: &mut TxContext) {
    // 검을 현재 소유자에게 다시 전송 (NFT로 저장)
    transfer::public_transfer(sword, tx_context::sender(ctx));
}

// === Private Helper Functions ===

/// 레벨에 따라 필요한 킬 수를 계산하는 함수입니다.
fun get_required_kills_for_level(level: u64): u64 {
    if (level == 1) {
        5
    } else if (level == 2) {
        15
    } else if (level == 3) {
        30
    } else if (level == 4) {
        50
    } else if (level == 5) {
        75
    } else if (level == 6) {
        105
    } else if (level == 7) {
        140
    } else if (level == 8) {
        180
    } else if (level == 9) {
        225
    } else if (level == 10) {
        275
    } else {
        // 10레벨 이후는 50킬씩 증가
        (level - 10) * 50 + 275
    }
}

/// 검을 레벨업시키는 내부 함수입니다.
fun level_up(sword: &mut HeroSword) {
    sword.level = sword.level + 1;
    
    // 능력치 증가
    sword.attack_power = sword.attack_power + sword.level * 5;
    sword.magic_power = sword.magic_power + sword.level * 3;

    // 레벨에 따라 이름과 이미지를 변경합니다.
    if (sword.level == 2) {
        sword.name = string::utf8(b"knife");
        sword.image_url = string::utf8(b"/images/swords/2단계.png");
    } else if (sword.level == 3) {
        sword.name = string::utf8(b"short sword");
        sword.image_url = string::utf8(b"/images/swords/3단계.png");
    } else if (sword.level == 4) {
        sword.name = string::utf8(b"longsword");
        sword.image_url = string::utf8(b"/images/swords/4단계.png");
    } else if (sword.level == 5) {
        sword.name = string::utf8(b"steel blade");
        sword.image_url = string::utf8(b"/images/swords/5단계.png");
        sword.sword_type = 1; // steel blade
    } else if (sword.level == 6) {
        sword.name = string::utf8(b"greatsword");
        sword.image_url = string::utf8(b"/images/swords/6단계.png");
        sword.sword_type = 2; // greatsword
    } else if (sword.level == 7) {
        sword.name = string::utf8(b"claymore");
        sword.image_url = string::utf8(b"/images/swords/7단계.png");
        sword.sword_type = 3; // claymore
    } else if (sword.level == 8) {
        sword.name = string::utf8(b"rune blade");
        sword.image_url = string::utf8(b"/images/swords/8단계.png");
        sword.sword_type = 4; // rune blade
    } else if (sword.level == 9) {
        sword.name = string::utf8(b"dragon fang");
        sword.image_url = string::utf8(b"/images/swords/9단계.png");
        sword.sword_type = 5; // dragon fang
    } else if (sword.level == 10) {
        sword.name = string::utf8(b"sui sword");
        sword.image_url = string::utf8(b"/images/swords/10단계.png");
        sword.sword_type = 6; // sui sword
    } else if (sword.level == 11) {
        sword.name = string::utf8(b"mystic saber");
        sword.image_url = string::utf8(b"/images/swords/11단계.png");
        sword.sword_type = 7; // mystic saber
    } else if (sword.level == 12) {
        sword.name = string::utf8(b"phantom edge");
        sword.image_url = string::utf8(b"/images/swords/12단계.png");
        sword.sword_type = 8; // phantom edge
    } else if (sword.level == 13) {
        sword.name = string::utf8(b"celestial blade");
        sword.image_url = string::utf8(b"/images/swords/13단계.png");
        sword.sword_type = 9; // celestial blade
    } else if (sword.level == 14) {
        sword.name = string::utf8(b"void cutter");
        sword.image_url = string::utf8(b"/images/swords/14단계.png");
        sword.sword_type = 10; // void cutter
    } else if (sword.level == 15) {
        sword.name = string::utf8(b"eternal scimitar");
        sword.image_url = string::utf8(b"/images/swords/15단계.png");
        sword.sword_type = 11; // eternal scimitar
    } else if (sword.level == 16) {
        sword.name = string::utf8(b"chaos breaker");
        sword.image_url = string::utf8(b"/images/swords/16단계.png");
        sword.sword_type = 12; // chaos breaker
    } else if (sword.level == 17) {
        sword.name = string::utf8(b"spirit katana");
        sword.image_url = string::utf8(b"/images/swords/17단계.png");
        sword.sword_type = 13; // spirit katana
    } else if (sword.level == 18) {
        sword.name = string::utf8(b"astral fang");
        sword.image_url = string::utf8(b"/images/swords/18단계.png");
        sword.sword_type = 14; // astral fang
    } else if (sword.level == 19) {
        sword.name = string::utf8(b"infinity edge");
        sword.image_url = string::utf8(b"/images/swords/19단계.png");
        sword.sword_type = 15; // infinity edge
    } else if (sword.level == 20) {
        sword.name = string::utf8(b"Dragon Slayer Rift Vanquisher");
        sword.image_url = string::utf8(b"/images/swords/20단계.png");
        sword.sword_type = 16; // Dragon Slayer Rift Vanquisher
    } else if (sword.level >= 21) {
        sword.name = string::utf8(b"Dragon Slayer Rift Vanquisher");
        sword.image_url = string::utf8(b"/images/swords/20단계.png");
        sword.sword_type = 17; // Dragon Slayer Rift Vanquisher
    }
}

/// 강화 비용 계산 함수 (SUI 단위)
fun get_enhancement_cost_sui(enhancement_count: u64): u64 {
    if (enhancement_count < 10) {
        1000000 // 0.001 SUI (1,000,000 MIST)
    } else if (enhancement_count < 50) {
        2000000 // 0.002 SUI (2,000,000 MIST)
    } else if (enhancement_count < 100) {
        5000000 // 0.005 SUI (5,000,000 MIST)
    } else if (enhancement_count < 200) {
        10000000 // 0.01 SUI (10,000,000 MIST)
    } else {
        20000000 // 0.02 SUI (20,000,000 MIST)
    }
}

/// 강화 성공 여부 결정 함수
fun is_enhancement_successful(success_rate: u8): bool {
    // 실제 구현에서는 랜덤 함수를 사용해야 하지만, 
    // 여기서는 간단히 성공률에 따라 결정
    success_rate > 50 // 임시로 50% 기준
}

/// 희귀도 업그레이드 체크 함수
fun check_rarity_upgrade(sword: &mut HeroSword) {
    if (sword.enhancement_count >= 100 && sword.rarity < 4) {
        sword.rarity = sword.rarity + 1;
        
        // 희귀도에 따른 이름과 색상 변경
        if (sword.rarity == 1) {
            sword.name = string::utf8(b"고급 검");
        } else if (sword.rarity == 2) {
            sword.name = string::utf8(b"희귀 검");
        } else if (sword.rarity == 3) {
            sword.name = string::utf8(b"전설의 검");
        } else if (sword.rarity == 4) {
            sword.name = string::utf8(b"신화의 검");
        }
    }
}
}
