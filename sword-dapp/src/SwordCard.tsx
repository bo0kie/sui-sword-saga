import React from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useNetworkVariable } from "./networkConfig";
import { Button, Card, Flex, Box, Text, Heading, Badge, Progress } from "@radix-ui/themes";

// CSS 애니메이션 스타일
const enhancementFailFlashStyle = `
  @keyframes enhancement-fail-flash {
    0% { 
      background: linear-gradient(135deg, #ff6b6b20, #ff8e8e40);
      border-color: #ff6b6b;
      box-shadow: 0 8px 32px #ff6b6b40;
    }
    50% { 
      background: linear-gradient(135deg, #ff000040, #ff444460);
      border-color: #ff0000;
      box-shadow: 0 8px 32px #ff000060;
    }
    100% { 
      background: linear-gradient(135deg, #ff6b6b20, #ff8e8e40);
      border-color: #ff6b6b;
      box-shadow: 0 8px 32px #ff6b6b40;
    }
  }
  
  @keyframes enhancement-success-flash {
    0% { 
      background: linear-gradient(135deg, #ffd70020, #ffed4e40);
      border-color: #ffd700;
      box-shadow: 0 8px 32px #ffd70040;
    }
    50% { 
      background: linear-gradient(135deg, #fff17660, #ffd70080);
      border-color: #fff176;
      box-shadow: 0 8px 32px #fff17680;
    }
    100% { 
      background: linear-gradient(135deg, #ffd70020, #ffed4e40);
      border-color: #ffd700;
      box-shadow: 0 8px 32px #ffd70040;
    }
  }
  
  @keyframes fire-sparkle {
    0% { 
      transform: scale(1) rotate(0deg);
      opacity: 0.8;
    }
    25% { 
      transform: scale(1.1) rotate(90deg);
      opacity: 1;
    }
    50% { 
      transform: scale(1.2) rotate(180deg);
      opacity: 0.9;
    }
    75% { 
      transform: scale(1.1) rotate(270deg);
      opacity: 1;
    }
    100% { 
      transform: scale(1) rotate(360deg);
      opacity: 0.8;
    }
  }
`;

// 검 데이터 타입 정의
type SwordData = {
  id: string;
  name: string;
  level: string;
  kills: string;
  image_url: string;
  sword_type: string;
  attack_power: string;
  magic_power: string;
  enhancement_count: string;
  rarity: string;
  success_rate: string;
  value: string;
};

// 부모 컴포넌트로부터 검의 정보와 refetch 함수를 받습니다.
export function SwordCard({ 
  sword, 
  onSlayed, 
  onEnhance, 
  onSell, 
  onSaveSword,
  suiBalance, 
  onBalanceChange 
}: { 
  sword: SwordData; 
  onSlayed: () => void; 
  onEnhance?: (newData: SwordData) => void;
  onSell?: (swordId: string) => void;
  onSaveSword?: (sword: SwordData) => void;
  suiBalance: number;
  onBalanceChange?: () => void;
}) {
  const swordPackageId = useNetworkVariable("swordPackageId");
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const [isEnhancementFailed, setIsEnhancementFailed] = React.useState(false);
  const [isEnhancementSuccess, setIsEnhancementSuccess] = React.useState(false);

  // CSS 애니메이션 스타일을 DOM에 추가
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = enhancementFailFlashStyle;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const currentLevel = parseInt(sword.level);

  // 강화 비용 계산 (MIST 단위)
  const getEnhancementCost = (count: number) => {
    if (count < 10) return 1000000; // 0.001 SUI (1,000,000 MIST)
    if (count < 50) return 2000000; // 0.002 SUI (2,000,000 MIST)
    if (count < 100) return 5000000; // 0.005 SUI (5,000,000 MIST)
    if (count < 200) return 10000000; // 0.01 SUI (10,000,000 MIST)
    return 20000000; // 0.02 SUI (20,000,000 MIST)
  };

  const enhancementCount = parseInt(sword.enhancement_count || "0");
  const enhancementCost = getEnhancementCost(enhancementCount);
  const swordValue = parseInt(sword.value || "100");
  const canAfford = suiBalance >= enhancementCost;
  const successRate = parseInt(sword.success_rate || "90");
  
  // 3단계 강화 시스템: 각 검은 최대 3번까지만 강화 가능
  const maxEnhancements = 3;
  const canEnhance = enhancementCount < maxEnhancements;

  // Sword type information
  const swordTypeInfo = {
    '0': { name: 'Normal', color: 'gray', icon: '⚔️' },
    '1': { name: 'Fire', color: 'red', icon: '🔥' },
    '2': { name: 'Ice', color: 'blue', icon: '❄️' },
    '3': { name: 'Lightning', color: 'yellow', icon: '⚡' },
    '4': { name: 'Dark', color: 'purple', icon: '🌑' },
    '5': { name: 'Holy', color: 'green', icon: '✨' },
    '6': { name: 'Legendary', color: 'orange', icon: '👑' },
    '7': { name: 'Divine', color: 'violet', icon: '🌟' }
  }[sword.sword_type || '0'] || { name: 'Normal', color: 'gray', icon: '⚔️' };

  // Rarity information with enhanced error handling
  const getRarityInfo = (rarity: string) => {
    const rarityMap = {
      '0': { name: 'Common', color: '#9CA3AF', glow: '#D1D5DB' },
      '1': { name: 'Advanced', color: '#10B981', glow: '#34D399' },
      '2': { name: 'Rare', color: '#3B82F6', glow: '#60A5FA' },
      '3': { name: 'Legendary', color: '#8B5CF6', glow: '#A78BFA' },
      '4': { name: 'Mythic', color: '#F59E0B', glow: '#FBBF24' },
      // Fallback for string values
      'common': { name: 'Common', color: '#9CA3AF', glow: '#D1D5DB' },
      'advanced': { name: 'Advanced', color: '#10B981', glow: '#34D399' },
      'rare': { name: 'Rare', color: '#3B82F6', glow: '#60A5FA' },
      'legendary': { name: 'Legendary', color: '#8B5CF6', glow: '#A78BFA' },
      'mythic': { name: 'Mythic', color: '#F59E0B', glow: '#FBBF24' }
    };
    
    return rarityMap[rarity?.toLowerCase() as keyof typeof rarityMap] || rarityMap['0'];
  };
  
  const rarityInfo = getRarityInfo(sword.rarity || '0');
  
  // Debug logging for rarity issues
  React.useEffect(() => {
    if (sword.rarity && sword.rarity !== '0' && sword.rarity !== '1' && sword.rarity !== '2' && sword.rarity !== '3' && sword.rarity !== '4') {
      console.warn('Unexpected rarity value:', sword.rarity, 'for sword:', sword.name);
    }
  }, [sword.rarity, sword.name]);

  // Enhancement function
  const enhance = () => {
    if (!canEnhance) {
      alert(`⚔️ Maximum enhancements reached!\nThis sword has been enhanced ${maxEnhancements} times.\nEnhance to evolve to the next stage!`);
      return;
    }
    
    if (!canAfford) {
      alert(`💰 Insufficient SUI!\nRequired: ${(enhancementCost / 1000000000).toFixed(4)} SUI\nOwned: ${(suiBalance / 1000000000).toFixed(4)} SUI`);
      return;
    }

    if (swordPackageId === "0xTODO") {
      // Update data in test mode
      const currentAttack = parseInt(sword.attack_power || "10");
      const currentMagic = parseInt(sword.magic_power || "5");
      const currentEnhancement = parseInt(sword.enhancement_count || "0");
      const currentSuccessRate = parseInt(sword.success_rate || "90");
      const currentValue = parseInt(sword.value || "100");

      // Determine enhancement success (actual probability calculation)
      const success = Math.random() * 100 < currentSuccessRate;

      // Deduct SUI balance (test mode)
      if (onBalanceChange) {
        onBalanceChange();
      }
      
      if (success) {
        // Enhancement success
        setIsEnhancementSuccess(true);
        setTimeout(() => setIsEnhancementSuccess(false), 2000); // 2초 후 효과 제거
        
        let newData = { ...sword };
        newData.attack_power = (currentAttack + 1).toString();
        newData.magic_power = (currentMagic + 1).toString();
        newData.enhancement_count = (currentEnhancement + 1).toString();
        newData.value = (currentValue + Math.floor(enhancementCost / 2)).toString();
        
        // No level up system - only 3-stage enhancement system
        
        // Evolve to next stage on 3rd successful enhancement
        if (currentEnhancement + 1 === maxEnhancements) {
          // 다음 레벨로 진화
          newData.level = (currentLevel + 1).toString();
          newData.enhancement_count = "0"; // 강화 횟수 리셋
          
          // 레벨에 따른 이름과 이미지 변경
          if (currentLevel + 1 === 2) {
            newData.name = "knife";
            newData.image_url = "/images/swords/2단계.png";
          } else if (currentLevel + 1 === 3) {
            newData.name = "short sword";
            newData.image_url = "/images/swords/3단계.png";
          } else if (currentLevel + 1 === 4) {
            newData.name = "longsword";
            newData.image_url = "/images/swords/4단계.png";
          } else if (currentLevel + 1 === 5) {
            newData.name = "steel blade";
            newData.image_url = "/images/swords/5단계.png";
            newData.sword_type = "1";
          } else if (currentLevel + 1 === 6) {
            newData.name = "greatsword";
            newData.image_url = "/images/swords/6단계.png";
            newData.sword_type = "2";
          } else if (currentLevel + 1 === 7) {
            newData.name = "claymore";
            newData.image_url = "/images/swords/7단계.png";
            newData.sword_type = "3";
          } else if (currentLevel + 1 === 8) {
            newData.name = "rune blade";
            newData.image_url = "/images/swords/8단계.png";
            newData.sword_type = "4";
          } else if (currentLevel + 1 === 9) {
            newData.name = "dragon fang";
            newData.image_url = "/images/swords/9단계.png";
            newData.sword_type = "5";
          } else if (currentLevel + 1 === 10) {
            newData.name = "sui sword";
            newData.image_url = "/images/swords/10단계.png";
            newData.sword_type = "6";
          } else if (currentLevel + 1 === 11) {
            newData.name = "mystic saber";
            newData.image_url = "/images/swords/11단계.png";
            newData.sword_type = "7";
          } else if (currentLevel + 1 === 12) {
            newData.name = "phantom edge";
            newData.image_url = "/images/swords/12단계.png";
            newData.sword_type = "8";
          } else if (currentLevel + 1 === 13) {
            newData.name = "celestial blade";
            newData.image_url = "/images/swords/13단계.png";
            newData.sword_type = "9";
          } else if (currentLevel + 1 === 14) {
            newData.name = "void cutter";
            newData.image_url = "/images/swords/14단계.png";
            newData.sword_type = "10";
          } else if (currentLevel + 1 === 15) {
            newData.name = "eternal scimitar";
            newData.image_url = "/images/swords/15단계.png";
            newData.sword_type = "11";
          } else if (currentLevel + 1 === 16) {
            newData.name = "chaos breaker";
            newData.image_url = "/images/swords/16단계.png";
            newData.sword_type = "12";
          } else if (currentLevel + 1 === 17) {
            newData.name = "spirit katana";
            newData.image_url = "/images/swords/17단계.png";
            newData.sword_type = "13";
          } else if (currentLevel + 1 === 18) {
            newData.name = "astral fang";
            newData.image_url = "/images/swords/18단계.png";
            newData.sword_type = "14";
          } else if (currentLevel + 1 === 19) {
            newData.name = "infinity edge";
            newData.image_url = "/images/swords/19단계.png";
            newData.sword_type = "15";
          } else if (currentLevel + 1 === 20) {
            newData.name = "Dragon Slayer Rift Vanquisher";
            newData.image_url = "/images/swords/20단계.png";
            newData.sword_type = "16";
          } else if (currentLevel + 1 >= 21) {
            newData.name = "Dragon Slayer Rift Vanquisher";
            newData.image_url = "/images/swords/20단계.png";
            newData.sword_type = "17";
          }
          
          // 진화 시 성공률 리셋
          newData.success_rate = "90";
          
          alert(`🌟 Sword Evolution! (Test Mode)\n\n${sword.name} → ${newData.name}\nLevel: ${currentLevel} → ${currentLevel + 1}\nEnhancements: Reset to 0\nSuccess Rate: Reset to 90%`);
        }
        
        // Decrease success rate (minimum 5%)
        if (currentSuccessRate > 5) {
          newData.success_rate = (currentSuccessRate - 2).toString();
        }
        
        alert(`✨ Enhancement Success! (Test Mode)\n\nAttack: ${currentAttack} → ${currentAttack + 1}\nMagic: ${currentMagic} → ${currentMagic + 1}\nEnhancements: ${currentEnhancement + 1}\nCost: ${(enhancementCost / 1000000000).toFixed(4)} SUI`);
        
        // Pass updated data to parent component
        if (onEnhance) {
          onEnhance(newData);
        }
      } else {
        // Enhancement failure - sword destroyed
        setIsEnhancementFailed(true);
        setTimeout(() => setIsEnhancementFailed(false), 2000); // 2초 후 깜빡임 효과 제거
        
        alert(`💥 Enhancement Failed! (Test Mode)\n\nSword lost...\nCost: ${(enhancementCost / 1000000000).toFixed(4)} SUI`);
        
        // Create a new sword to replace the destroyed one
        const newSword = {
          id: `test-sword-${Date.now()}`,
          name: "a piece of iron",
          level: "1",
          kills: "0",
          image_url: "/images/swords/1단계.png",
          sword_type: "0",
          attack_power: "10",
          magic_power: "5",
          enhancement_count: "0",
          rarity: "0", // 숫자 문자열로 통일
          success_rate: "90",
          value: "1000000000", // 1 SUI in MIST
        };
        
        // Pass the new sword to parent component
        if (onEnhance) {
          onEnhance(newSword);
        }
        
        // Also remove from saved swords if it was saved
        if (onSaveSword) {
          // This will trigger the parent to remove from saved swords
          const updatedSword = { ...sword, destroyed: true };
          onSaveSword(updatedSword);
        }
      }
      return;
    }

    const tx = new Transaction();

    // Enhancement transaction using SUI coins
    tx.moveCall({
      target: `${swordPackageId}::sword::enhance_sword`,
      arguments: [
        tx.object(sword.id),
        tx.gas, // Use SUI coin as payment
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => {
          setIsEnhancementSuccess(true);
          setTimeout(() => setIsEnhancementSuccess(false), 2000); // 2초 후 효과 제거
          alert(`✨ Enhancement Success!\n\nCost: ${(enhancementCost / 1000000000).toFixed(4)} SUI`);
          onSlayed();
          if (onBalanceChange) {
            onBalanceChange();
          }
        },
        onError: (error) => {
          console.error("Enhancement failed:", error);
          setIsEnhancementFailed(true);
          setTimeout(() => setIsEnhancementFailed(false), 2000); // 2초 후 깜빡임 효과 제거
          alert(`Enhancement failed: ${error.message || error}`);
        },
      },
    );
  };


  // Sell sword function
  const sellSword = () => {
    if (swordPackageId === "0xTODO") {
      const confirmSell = confirm(`💰 Sell this sword?\n\nPrice: ${swordValue} coins\n\nThis action cannot be undone.`);
      
      if (confirmSell) {
        // Remove sword from collection
        if (onSell) {
          onSell(sword.id);
        }
        
        alert(`💰 Sword sold!\n\nEarned: ${(swordValue / 1000000000).toFixed(4)} SUI`);
      }
      return;
    }

    const tx = new Transaction();

    // Sell sword to receive SUI coins
    tx.moveCall({
      target: `${swordPackageId}::sword::sell_sword`,
      arguments: [
        tx.object(sword.id),
        tx.gas, // Use SUI coin as payment
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => {
          alert(`💰 Sword sold!\n\nEarned: ${(swordValue / 1000000000).toFixed(4)} SUI`);
          onSlayed();
          if (onBalanceChange) {
            onBalanceChange();
          }
        },
        onError: (error) => {
          console.error("Sell failed:", error);
          alert(`Sell failed: ${error.message || error}`);
        },
      },
    );
  };

  return (
    <Card 
      style={{ 
        maxWidth: 800,
        background: `linear-gradient(135deg, 
          ${swordTypeInfo.color === 'red' ? '#ff6b6b' : 
            swordTypeInfo.color === 'blue' ? '#4ecdc4' :
            swordTypeInfo.color === 'yellow' ? '#ffe66d' :
            swordTypeInfo.color === 'purple' ? '#a8e6cf' :
            swordTypeInfo.color === 'green' ? '#88d8c0' :
            swordTypeInfo.color === 'orange' ? '#ffd93d' :
            swordTypeInfo.color === 'violet' ? '#b19cd9' :
            '#e0e0e0'
          }20, 
          ${swordTypeInfo.color === 'red' ? '#ff8e8e' : 
            swordTypeInfo.color === 'blue' ? '#6ed5d0' :
            swordTypeInfo.color === 'yellow' ? '#fff176' :
            swordTypeInfo.color === 'purple' ? '#c8f0d0' :
            swordTypeInfo.color === 'green' ? '#a8e6cf' :
            swordTypeInfo.color === 'orange' ? '#ffe176' :
            swordTypeInfo.color === 'violet' ? '#c7b8e6' :
            '#f0f0f0'
          }40)`,
        border: `2px solid ${swordTypeInfo.color === 'red' ? '#ff6b6b' : 
          swordTypeInfo.color === 'blue' ? '#4ecdc4' :
          swordTypeInfo.color === 'yellow' ? '#ffe66d' :
          swordTypeInfo.color === 'purple' ? '#a8e6cf' :
          swordTypeInfo.color === 'green' ? '#88d8c0' :
          swordTypeInfo.color === 'orange' ? '#ffd93d' :
          swordTypeInfo.color === 'violet' ? '#b19cd9' :
          '#d0d0d0'
        }`,
        boxShadow: `0 8px 32px ${swordTypeInfo.color === 'red' ? '#ff6b6b' : 
          swordTypeInfo.color === 'blue' ? '#4ecdc4' :
          swordTypeInfo.color === 'yellow' ? '#ffe66d' :
          swordTypeInfo.color === 'purple' ? '#a8e6cf' :
          swordTypeInfo.color === 'green' ? '#88d8c0' :
          swordTypeInfo.color === 'orange' ? '#ffd93d' :
          swordTypeInfo.color === 'violet' ? '#b19cd9' :
          '#d0d0d0'
        }40`,
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
        animation: isEnhancementFailed ? "enhancement-fail-flash 0.5s ease-in-out 3" : 
                   isEnhancementSuccess ? "enhancement-success-flash 2s ease-in-out 1" : "none",
        transition: "all 0.3s ease"
      }}
    >
      {/* 검 타입 배지 */}
      <Box style={{ position: "absolute", top: "12px", right: "12px", zIndex: 1 }}>
        <Badge 
          color={swordTypeInfo.color as any}
          size="2"
          style={{ 
            background: `${swordTypeInfo.color === 'red' ? '#ff6b6b' : 
              swordTypeInfo.color === 'blue' ? '#4ecdc4' :
              swordTypeInfo.color === 'yellow' ? '#ffe66d' :
              swordTypeInfo.color === 'purple' ? '#a8e6cf' :
              swordTypeInfo.color === 'green' ? '#88d8c0' :
              swordTypeInfo.color === 'orange' ? '#ffd93d' :
              swordTypeInfo.color === 'violet' ? '#b19cd9' :
              '#d0d0d0'
            }`,
            color: "white",
            fontWeight: "bold"
          }}
        >
          {swordTypeInfo.icon} {swordTypeInfo.name}
        </Badge>
      </Box>

      {/* 강화 성공 시 불꽃 효과 */}
      {isEnhancementSuccess && (
        <Box style={{ 
          position: "absolute", 
          top: "50%", 
          left: "50%", 
          transform: "translate(-50%, -50%)",
          zIndex: 2,
          pointerEvents: "none"
        }}>
          <Text size="8" style={{ 
            animation: "fire-sparkle 2s ease-in-out 1",
            color: "#ffd700",
            textShadow: "0 0 20px #ffd700, 0 0 40px #ffd700, 0 0 60px #ffd700"
          }}>
            ✨🔥✨
          </Text>
        </Box>
      )}

      <Flex direction="column" gap="6" align="center" style={{ padding: "20px" }}>
        {/* 검 이미지와 이름 - 상단에 표시 */}
        <Box style={{ textAlign: "center" }}>
          {/* 검 이미지 */}
          <Box style={{ position: "relative", display: "inline-block" }}>
            <img
              src={sword.image_url}
              alt={sword.name}
              style={{ 
                width: "300px", 
                height: "300px", 
                borderRadius: "16px",
                objectFit: "cover",
                border: `4px solid ${swordTypeInfo.color === 'red' ? '#ff6b6b' : 
                  swordTypeInfo.color === 'blue' ? '#4ecdc4' :
                  swordTypeInfo.color === 'yellow' ? '#ffe66d' :
                  swordTypeInfo.color === 'purple' ? '#a8e6cf' :
                  swordTypeInfo.color === 'green' ? '#88d8c0' :
                  swordTypeInfo.color === 'orange' ? '#ffd93d' :
                  swordTypeInfo.color === 'violet' ? '#b19cd9' :
                  '#d0d0d0'
                }`,
                boxShadow: `0 8px 24px ${swordTypeInfo.color === 'red' ? '#ff6b6b' : 
                  swordTypeInfo.color === 'blue' ? '#4ecdc4' :
                  swordTypeInfo.color === 'yellow' ? '#ffe66d' :
                  swordTypeInfo.color === 'purple' ? '#a8e6cf' :
                  swordTypeInfo.color === 'green' ? '#88d8c0' :
                  swordTypeInfo.color === 'orange' ? '#ffd93d' :
                  swordTypeInfo.color === 'violet' ? '#b19cd9' :
                  '#d0d0d0'
                }60`
              }}
            />
            {/* 레벨 배지 */}
            <Box style={{ 
              position: "absolute", 
              bottom: "-12px", 
              left: "50%", 
              transform: "translateX(-50%)",
              background: "linear-gradient(45deg, #ffd700, #ffed4e)",
              borderRadius: "24px",
              padding: "6px 16px",
              border: "3px solid #fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
            }}>
              <Text size="3" weight="bold" style={{ color: "#333" }}>
                Lv.{sword.level}
              </Text>
            </Box>
          </Box>

          {/* 검 이름 - 이미지 아래에 표시 */}
          <Box style={{ 
            marginTop: "20px",
            marginBottom: "16px"
          }}>
            <Heading as="h4" size="5" style={{ 
              background: `linear-gradient(45deg, ${swordTypeInfo.color === 'red' ? '#ff6b6b' : 
                swordTypeInfo.color === 'blue' ? '#4ecdc4' :
                swordTypeInfo.color === 'yellow' ? '#ffe66d' :
                swordTypeInfo.color === 'purple' ? '#a8e6cf' :
                swordTypeInfo.color === 'green' ? '#88d8c0' :
                swordTypeInfo.color === 'orange' ? '#ffd93d' :
                swordTypeInfo.color === 'violet' ? '#b19cd9' :
                '#d0d0d0'
              }, ${swordTypeInfo.color === 'red' ? '#ff8e8e' : 
                swordTypeInfo.color === 'blue' ? '#6dd5ed' :
                swordTypeInfo.color === 'yellow' ? '#fff176' :
                swordTypeInfo.color === 'purple' ? '#c8e6c9' :
                swordTypeInfo.color === 'green' ? '#a8e6cf' :
                swordTypeInfo.color === 'orange' ? '#ffed4e' :
                swordTypeInfo.color === 'violet' ? '#d1c4e9' :
                '#e0e0e0'
              })`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              fontWeight: "bold"
            }}>
              {sword.name}
            </Heading>
          </Box>
        </Box>

        {/* 검 정보 - 하단에 표시 */}
        <Box style={{ width: "100%", maxWidth: "600px" }}>
          
          {/* Stats display - single row */}
          <Flex gap="4" justify="start" align="center" style={{ marginBottom: "20px", flexWrap: "wrap" }}>
            <Box style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: "100px" }}>
              <Text size="2" weight="bold" style={{ color: "#e74c3c" }}>⚔️ Attack:</Text>
              <Text size="3" weight="bold">{sword.attack_power || "10"}</Text>
            </Box>
            <Box style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: "100px" }}>
              <Text size="2" weight="bold" style={{ color: "#9b59b6" }}>✨ Magic:</Text>
              <Text size="3" weight="bold">{sword.magic_power || "5"}</Text>
            </Box>
            <Box style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: "100px" }}>
              <Text size="2" weight="bold" style={{ color: "#f39c12" }}>🔥 Enhance:</Text>
              <Text size="3" weight="bold">{enhancementCount}</Text>
            </Box>
            <Box style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: "100px" }}>
              <Text size="2" weight="bold" style={{ color: successRate > 50 ? "#10B981" : "#EF4444" }}>🎯 Success:</Text>
              <Text size="3" weight="bold">{successRate}%</Text>
            </Box>
            <Box style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: "100px" }}>
              <Text size="2" weight="bold" style={{ color: canEnhance ? "#10B981" : "#EF4444" }}>⚡ Progress:</Text>
              <Text size="3" weight="bold">{enhancementCount}/{maxEnhancements}</Text>
            </Box>
          </Flex>

          {/* Enhancement progress */}
          <Box style={{ marginBottom: "16px" }}>
            <Flex justify="between" align="center" style={{ marginBottom: "4px" }}>
              <Text size="2" weight="bold">Enhancement Progress</Text>
              <Text size="2" style={{ color: "#666" }}>
                {enhancementCount} / {maxEnhancements}
              </Text>
            </Flex>
            <Progress 
              value={(enhancementCount / maxEnhancements) * 100} 
              max={100}
              style={{ 
                height: "8px",
                background: "rgba(0,0,0,0.1)",
                borderRadius: "4px"
              }}
            />
          </Box>

          {/* Sword value and cost information */}
          <Flex gap="4" justify="start" style={{ marginBottom: "20px" }}>
            <Box style={{ textAlign: "center", minWidth: "120px" }}>
              <Text size="2" weight="bold" style={{ color: "#F59E0B" }}>💰 Value</Text>
              <Text size="3" weight="bold">{(swordValue / 1000000000).toFixed(4)} SUI</Text>
            </Box>
            <Box style={{ textAlign: "center", minWidth: "120px" }}>
              <Text size="2" weight="bold" style={{ color: canAfford ? "#10B981" : "#EF4444" }}>💎 Cost</Text>
              <Text size="3" weight="bold">{(enhancementCost / 1000000000).toFixed(4)} SUI</Text>
            </Box>
            <Box style={{ textAlign: "center", minWidth: "120px" }}>
              <Text size="2" weight="bold" style={{ color: rarityInfo.color }}>⭐ Rarity</Text>
              <Badge 
                style={{ 
                  background: rarityInfo.color,
                  color: "white",
                  fontWeight: "bold",
                  marginTop: "4px"
                }}
              >
                {rarityInfo.name}
              </Badge>
            </Box>
          </Flex>

          {/* Buttons - horizontal layout */}
          <Flex direction="row" gap="3" wrap="wrap" style={{ width: "100%", marginBottom: "16px" }}>
            {/* Enhancement button */}
            <Button 
              onClick={enhance} 
              disabled={isPending || !canAfford || !canEnhance}
              size="3"
              style={{
                flex: "1",
                minWidth: "200px",
                background: canEnhance && canAfford
                  ? "linear-gradient(45deg, #ff8c00, #ffa500)"
                  : "linear-gradient(45deg, #9CA3AF, #D1D5DB)",
                border: "none",
                color: "white",
                fontWeight: "bold",
                borderRadius: "12px",
                boxShadow: canEnhance && canAfford
                  ? "0 6px 20px #ff8c0040"
                  : "0 6px 20px #9CA3AF40",
                transition: "all 0.3s ease",
                animation: canEnhance && canAfford ? "pulse 2s infinite" : "none",
                padding: "12px 16px"
              }}
            >
              {isPending ? "✨ Enhancing..." : 
               !canEnhance ? `⚡ Max Enhanced` :
               !canAfford ? `💰 Insufficient SUI` :
               `✨ Enhance (${enhancementCount}/${maxEnhancements})`}
            </Button>
          </Flex>

          <Flex direction="row" gap="3" wrap="wrap" style={{ width: "100%" }}>
            {/* Sell sword button */}
            <Button 
              onClick={sellSword} 
              disabled={isPending}
              size="3"
              style={{
                flex: "1",
                minWidth: "150px",
                background: "linear-gradient(45deg, #10B981, #34D399)",
                border: "none",
                color: "white",
                fontWeight: "bold",
                borderRadius: "12px",
                boxShadow: "0 6px 20px #10B98140",
                transition: "all 0.3s ease",
                padding: "12px 16px"
              }}
            >
              {isPending ? "💰 Selling..." : `💰 Sell`}
            </Button>

            {/* Save as NFT button */}
            <Button 
              onClick={() => {
                if (swordPackageId === "0xTODO") {
                  if (onSaveSword) {
                    onSaveSword(sword);
                  }
                  alert("💾 Sword saved as NFT! (Test Mode)");
                  onSlayed();
                  return;
                }

                const tx = new Transaction();
                tx.moveCall({
                  target: `${swordPackageId}::sword::save_sword_as_nft`,
                  arguments: [tx.object(sword.id)],
                });

                signAndExecute(
                  { transaction: tx },
                  {
                    onSuccess: () => {
                      alert("💾 Sword saved as NFT!");
                      onSlayed();
                    },
                    onError: (error) => {
                      console.error("Save failed:", error);
                      alert(`Save failed: ${error.message || error}`);
                    },
                  },
                );
              }} 
              disabled={isPending}
              size="3"
              style={{
                flex: "1",
                minWidth: "150px",
                background: "#7DD3FC",
                border: "none",
                color: "white",
                fontWeight: "bold",
                borderRadius: "12px",
                boxShadow: "0 6px 20px #7DD3FC40",
                transition: "all 0.3s ease",
                padding: "12px 16px"
              }}
            >
              {isPending ? (
                <span style={{ color: "white" }}>💾 Saving...</span>
              ) : (
                <span>💾 Save as <span style={{ color: "white" }}>NFT</span></span>
              )}
        </Button>
          </Flex>

          {/* Third row - Reset button */}
          <Flex direction="row" gap="3" wrap="wrap" style={{ marginTop: "12px" }}>
            <Button 
              onClick={() => {
                // Create a new sword to reset to start
                const newSword = {
                  id: `test-sword-${Date.now()}`,
                  name: "a piece of iron",
                  level: "1",
                  kills: "0",
                  image_url: "/images/swords/1단계.png",
                  sword_type: "0",
                  attack_power: "10",
                  magic_power: "5",
                  enhancement_count: "0",
                  rarity: "0", // 숫자 문자열로 통일
                  success_rate: "90",
                  value: "1000000000", // 1 SUI in MIST
                };
                
                // Pass the new sword to parent component
                if (onEnhance) {
                  onEnhance(newSword);
                }
                
                alert("🔄 Reset to Start!\n\nSword has been reset to initial state.");
              }} 
              disabled={isPending}
              size="3"
              style={{
                flex: "1",
                minWidth: "200px",
                background: "linear-gradient(45deg, #EF4444, #F87171)", // Red gradient
                border: "none",
                color: "white",
                fontWeight: "bold",
                borderRadius: "12px",
                boxShadow: "0 6px 20px #EF444440", // Red shadow
                transition: "all 0.3s ease",
                padding: "12px 16px"
              }}
            >
              🔄 Reset to Start
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Card>
  );
}