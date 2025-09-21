import { Card, Flex, Box, Text, Heading, Badge, Button } from "@radix-ui/themes";

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

interface SwordCollectionProps {
  ownedSwords: SwordData[];
  savedSwords: SwordData[];
  onBack: () => void;
  onLoadSword: (sword: SwordData) => void;
}

export default function SwordCollection({ 
  ownedSwords, 
  savedSwords, 
  onBack, 
  onLoadSword 
}: SwordCollectionProps) {
  const allSwords = [...ownedSwords, ...savedSwords];

  // 검 타입 정보
  const getSwordTypeInfo = (swordType: string) => {
    const types: { [key: string]: { name: string; icon: string; color: string } } = {
      "iron": { name: "Iron", icon: "⚔️", color: "gray" },
      "steel": { name: "Steel", icon: "🗡️", color: "blue" },
      "silver": { name: "Silver", icon: "✨", color: "yellow" },
      "gold": { name: "Gold", icon: "👑", color: "orange" },
      "platinum": { name: "Platinum", icon: "💎", color: "purple" },
      "diamond": { name: "Diamond", icon: "💠", color: "violet" },
      "legendary": { name: "Legendary", icon: "🌟", color: "red" },
      "mythic": { name: "Mythic", icon: "🔥", color: "red" },
      "divine": { name: "Divine", icon: "⚡", color: "yellow" },
      "eternal": { name: "Eternal", icon: "∞", color: "purple" }
    };
    return types[swordType] || { name: "Unknown", icon: "❓", color: "gray" };
  };

  // 희귀도 정보
  const getRarityInfo = (rarity: string) => {
    const rarities: { [key: string]: { name: string; color: string; icon: string } } = {
      "common": { name: "Common", color: "gray", icon: "⚪" },
      "uncommon": { name: "Uncommon", color: "green", icon: "🟢" },
      "rare": { name: "Rare", color: "blue", icon: "🔵" },
      "epic": { name: "Epic", color: "purple", icon: "🟣" },
      "legendary": { name: "Legendary", color: "orange", icon: "🟠" },
      "mythic": { name: "Mythic", color: "red", icon: "🔴" }
    };
    return rarities[rarity] || { name: "Unknown", color: "gray", icon: "❓" };
  };

  return (
    <Box style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* 헤더 */}
      <Flex justify="between" align="center" style={{ marginBottom: "30px" }}>
        <Heading size="8" style={{ color: "#fff", textShadow: "0 0 20px #4ecdc4" }}>
          🗡️ Sword Collection
        </Heading>
        <Button 
          onClick={onBack}
          size="3"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "12px 24px",
            fontWeight: "bold",
            boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
            cursor: "pointer"
          }}
        >
          ← Back to Game
        </Button>
      </Flex>

      {/* 검 개수 표시 */}
      <Box style={{ marginBottom: "30px", textAlign: "center" }}>
        <Text size="5" style={{ color: "#4ecdc4", fontWeight: "bold" }}>
          Total Swords: {allSwords.length}
        </Text>
        <Text size="3" style={{ color: "rgba(255,255,255,0.7)", marginTop: "8px" }}>
          Owned: {ownedSwords.length} | Saved: {savedSwords.length}
        </Text>
      </Box>

      {/* 검 목록 */}
      {allSwords.length === 0 ? (
        <Card style={{ 
          background: "linear-gradient(135deg, #667eea20, #764ba240)",
          border: "2px solid #4ecdc4",
          borderRadius: "16px",
          padding: "40px",
          textAlign: "center"
        }}>
          <Text size="4" style={{ color: "rgba(255,255,255,0.8)" }}>
            No swords in your collection yet!
          </Text>
          <Text size="3" style={{ color: "rgba(255,255,255,0.6)", marginTop: "8px" }}>
            Start by minting and enhancing swords in the game.
          </Text>
        </Card>
      ) : (
        <Flex wrap="wrap" gap="4" justify="start">
          {allSwords.map((sword, index) => {
            const swordTypeInfo = getSwordTypeInfo(sword.sword_type);
            const rarityInfo = getRarityInfo(sword.rarity);
            const isOwned = ownedSwords.some(owned => owned.id === sword.id);
            const isSaved = savedSwords.some(saved => saved.id === sword.id);

            return (
              <Card
                key={`${sword.id}-${index}`}
                style={{
                  background: `linear-gradient(135deg, ${
                    swordTypeInfo.color === 'red' ? '#ff6b6b' : 
                    swordTypeInfo.color === 'blue' ? '#4ecdc4' :
                    swordTypeInfo.color === 'yellow' ? '#ffe66d' :
                    swordTypeInfo.color === 'purple' ? '#a8e6cf' :
                    swordTypeInfo.color === 'green' ? '#88d8c0' :
                    swordTypeInfo.color === 'orange' ? '#ffd93d' :
                    swordTypeInfo.color === 'violet' ? '#b19cd9' :
                    '#d0d0d0'
                  }20, ${
                    swordTypeInfo.color === 'red' ? '#ff8e8e' : 
                    swordTypeInfo.color === 'blue' ? '#6dd5ed' :
                    swordTypeInfo.color === 'yellow' ? '#fff176' :
                    swordTypeInfo.color === 'purple' ? '#c8e6c9' :
                    swordTypeInfo.color === 'green' ? '#a8e6cf' :
                    swordTypeInfo.color === 'orange' ? '#ffed4e' :
                    swordTypeInfo.color === 'violet' ? '#d1c4e9' :
                    '#e0e0e0'
                  }40)`,
                  border: `2px solid ${
                    swordTypeInfo.color === 'red' ? '#ff6b6b' : 
                    swordTypeInfo.color === 'blue' ? '#4ecdc4' :
                    swordTypeInfo.color === 'yellow' ? '#ffe66d' :
                    swordTypeInfo.color === 'purple' ? '#a8e6cf' :
                    swordTypeInfo.color === 'green' ? '#88d8c0' :
                    swordTypeInfo.color === 'orange' ? '#ffd93d' :
                    swordTypeInfo.color === 'violet' ? '#b19cd9' :
                    '#d0d0d0'
                  }`,
                  borderRadius: "16px",
                  padding: "20px",
                  minWidth: "300px",
                  maxWidth: "350px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: `0 8px 32px ${
                    swordTypeInfo.color === 'red' ? '#ff6b6b' : 
                    swordTypeInfo.color === 'blue' ? '#4ecdc4' :
                    swordTypeInfo.color === 'yellow' ? '#ffe66d' :
                    swordTypeInfo.color === 'purple' ? '#a8e6cf' :
                    swordTypeInfo.color === 'green' ? '#88d8c0' :
                    swordTypeInfo.color === 'orange' ? '#ffd93d' :
                    swordTypeInfo.color === 'violet' ? '#b19cd9' :
                    '#d0d0d0'
                  }40`
                }}
                onClick={() => onLoadSword(sword)}
              >
                {/* 검 이미지 */}
                <Box style={{ textAlign: "center", marginBottom: "16px" }}>
                  <img
                    src={sword.image_url}
                    alt={sword.name}
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "contain",
                      borderRadius: "12px",
                      border: `3px solid ${
                        swordTypeInfo.color === 'red' ? '#ff6b6b' : 
                        swordTypeInfo.color === 'blue' ? '#4ecdc4' :
                        swordTypeInfo.color === 'yellow' ? '#ffe66d' :
                        swordTypeInfo.color === 'purple' ? '#a8e6cf' :
                        swordTypeInfo.color === 'green' ? '#88d8c0' :
                        swordTypeInfo.color === 'orange' ? '#ffd93d' :
                        swordTypeInfo.color === 'violet' ? '#b19cd9' :
                        '#d0d0d0'
                      }`,
                      boxShadow: `0 4px 16px ${
                        swordTypeInfo.color === 'red' ? '#ff6b6b' : 
                        swordTypeInfo.color === 'blue' ? '#4ecdc4' :
                        swordTypeInfo.color === 'yellow' ? '#ffe66d' :
                        swordTypeInfo.color === 'purple' ? '#a8e6cf' :
                        swordTypeInfo.color === 'green' ? '#88d8c0' :
                        swordTypeInfo.color === 'orange' ? '#ffd93d' :
                        swordTypeInfo.color === 'violet' ? '#b19cd9' :
                        '#d0d0d0'
                      }40`
                    }}
                  />
                  <Badge 
                    size="2"
                    style={{ 
                      marginTop: "8px",
                      background: `${
                        swordTypeInfo.color === 'red' ? '#ff6b6b' : 
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
                    Lv.{sword.level}
                  </Badge>
                </Box>

                {/* 검 정보 */}
                <Box>
                  <Heading size="4" style={{ color: "#fff", marginBottom: "12px", textAlign: "center" }}>
                    {sword.name}
                  </Heading>

                  {/* 스탯 */}
                  <Flex gap="3" justify="center" style={{ marginBottom: "12px" }}>
                    <Box style={{ textAlign: "center" }}>
                      <Text size="2" style={{ color: "#e74c3c", fontWeight: "bold" }}>⚔️ Attack</Text>
                      <Text size="3" style={{ color: "#fff", fontWeight: "bold" }}>{sword.attack_power}</Text>
                    </Box>
                    <Box style={{ textAlign: "center" }}>
                      <Text size="2" style={{ color: "#9b59b6", fontWeight: "bold" }}>✨ Magic</Text>
                      <Text size="3" style={{ color: "#fff", fontWeight: "bold" }}>{sword.magic_power}</Text>
                    </Box>
                    <Box style={{ textAlign: "center" }}>
                      <Text size="2" style={{ color: "#f39c12", fontWeight: "bold" }}>🔥 Enhance</Text>
                      <Text size="3" style={{ color: "#fff", fontWeight: "bold" }}>{sword.enhancement_count}</Text>
                    </Box>
                  </Flex>

                  {/* 희귀도와 타입 */}
                  <Flex gap="2" justify="center" style={{ marginBottom: "12px" }}>
                    <Badge color={rarityInfo.color as any} size="2">
                      {rarityInfo.icon} {rarityInfo.name}
                    </Badge>
                    <Badge color={swordTypeInfo.color as any} size="2">
                      {swordTypeInfo.icon} {swordTypeInfo.name}
                    </Badge>
                  </Flex>

                  {/* 상태 표시 */}
                  <Box style={{ textAlign: "center" }}>
                    {isOwned && (
                      <Badge color="green" size="2" style={{ marginRight: "8px" }}>
                        🎮 In Game
                      </Badge>
                    )}
                    {isSaved && (
                      <Badge color="blue" size="2">
                        💾 Saved
                      </Badge>
                    )}
                  </Box>

                  {/* 가치 */}
                  <Box style={{ textAlign: "center", marginTop: "12px" }}>
                    <Text size="2" style={{ color: "rgba(255,255,255,0.7)" }}>
                      Value: {(parseInt(sword.value) / 1000000000).toFixed(4)} SUI
                    </Text>
                  </Box>
                </Box>
              </Card>
            );
          })}
        </Flex>
      )}
    </Box>
  );
}
