import React, { useState, useEffect } from "react";
import {
  ConnectButton,
  useCurrentAccount,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading, Text, Card, Button } from "@radix-ui/themes";
import { useNetworkVariable } from "./networkConfig";
import { useSuiClient } from "@mysten/dapp-kit";

// 우리가 만든 컴포넌트들을 가져옵니다.
import { MintSword } from "./MintSword";
import { SwordCard } from "./SwordCard";
import SwordCollection from "./SwordCollection";

// SwordData 타입 정의
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

function App() {
  const currentAccount = useCurrentAccount();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // 지갑 연결 상태 모니터링
  useEffect(() => {
    if (currentAccount) {
      setConnectionError(null);
      setIsConnecting(false);
    }
  }, [currentAccount]);
  const swordPackageId = useNetworkVariable("swordPackageId");
  const suiClient = useSuiClient();

  // useOwnedObjects 대신 useSuiClientQuery를 사용하도록 이 부분을 수정합니다.
  const { data: ownedSwords, isLoading, refetch } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: currentAccount?.address || "",
      filter: {
        StructType: `${swordPackageId}::sword::HeroSword`,
      },
      options: {
        showContent: true,
      },
    },
    {
      enabled: !!currentAccount?.address,
    },
  );

  // 찾은 객체 중 첫 번째 객체를 사용합니다.
  const swordObject = ownedSwords?.data?.[0];

  const getSwordFields = (sword: any) => {
    if (!sword || sword.data?.content?.dataType !== "moveObject") return null;
    return sword.data.content.fields;
  };

  // 테스트 모드에서 검 데이터를 저장할 상태
  const [testSwordData, setTestSwordData] = React.useState<SwordData>({
    id: "test-sword-001",
    name: "a piece of iron",
    level: "1",
    kills: "0",
    image_url: "/images/swords/1단계.png",
    sword_type: "0",
    attack_power: "10",
    magic_power: "5",
    enhancement_count: "0",
    rarity: "0",
    success_rate: "90",
    value: "100"
  });

  // 저장된 검들 (로컬 스토리지에서 불러오기)
  const [savedSwords, setSavedSwords] = React.useState<SwordData[]>([]);

  // 로컬 스토리지에서 저장된 검들 불러오기
  React.useEffect(() => {
    const saved = localStorage.getItem('hero-sword-saved-swords');
    if (saved) {
      try {
        setSavedSwords(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse saved swords:', error);
      }
    }
  }, []);

  // 검 저장 함수
  const saveSword = (sword: SwordData) => {
    // 파괴된 검인 경우 저장된 검 목록에서 제거
    if ('destroyed' in sword && sword.destroyed) {
      const newSavedSwords = savedSwords.filter(s => s.id !== sword.id);
      setSavedSwords(newSavedSwords);
      localStorage.setItem('hero-sword-saved-swords', JSON.stringify(newSavedSwords));
      return;
    }
    
    // 새로운 검 저장
    const newSavedSwords = [...savedSwords, sword];
    setSavedSwords(newSavedSwords);
    localStorage.setItem('hero-sword-saved-swords', JSON.stringify(newSavedSwords));
  };

  // 검 컬렉션 상태
  const [swordCollection, setSwordCollection] = React.useState<SwordData[]>([]);
  
  // SUI 코인 잔액 상태
  const [suiBalance, setSuiBalance] = React.useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = React.useState(false);
  
  // 모드 선택 상태 (null: 선택 안함, 'test': 테스트 모드, 'wallet': 지갑 모드)
  const [gameMode, setGameMode] = React.useState<'test' | 'wallet' | null>(null);
  
  // 컬렉션 페이지 상태
  const [showCollection, setShowCollection] = React.useState(false);

  // 테스트 모드에서 SUI 잔액 초기화
  React.useEffect(() => {
    if (gameMode === 'test') {
      setSuiBalance(1000000000000); // 1000 SUI
    }
  }, [gameMode]);

  // SUI 코인 잔액 가져오기
  const fetchSuiBalance = React.useCallback(async () => {
    if (!currentAccount?.address) return;
    
    setIsLoadingBalance(true);
    try {
      const coins = await suiClient.getCoins({
        owner: currentAccount.address,
        coinType: "0x2::sui::SUI",
      });
      
      const totalBalance = coins.data.reduce((sum, coin) => {
        return sum + parseInt(coin.balance);
      }, 0);
      
      setSuiBalance(totalBalance);
    } catch (error) {
      console.error("Failed to fetch SUI balance:", error);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [currentAccount?.address, suiClient]);

  // 계정이 연결되고 지갑 모드일 때 SUI 잔액 가져오기
  React.useEffect(() => {
    if (currentAccount?.address && gameMode === 'wallet') {
      fetchSuiBalance();
    }
  }, [currentAccount?.address, fetchSuiBalance, gameMode]);

  // 강화 비용 계산 함수 (MIST 단위)
  const getEnhancementCost = (count: number) => {
    if (count < 10) return 1000000; // 0.001 SUI (1,000,000 MIST)
    if (count < 50) return 2000000; // 0.002 SUI (2,000,000 MIST)
    if (count < 100) return 5000000; // 0.005 SUI (5,000,000 MIST)
    if (count < 200) return 10000000; // 0.01 SUI (10,000,000 MIST)
    return 20000000; // 0.02 SUI (20,000,000 MIST)
  };

  const swordData = swordObject
    ? { 
        id: swordObject.data?.objectId || "",
        ...getSwordFields(swordObject),
        sword_type: getSwordFields(swordObject)?.sword_type || "0",
        attack_power: getSwordFields(swordObject)?.attack_power || "10",
        magic_power: getSwordFields(swordObject)?.magic_power || "5",
        enhancement_count: getSwordFields(swordObject)?.enhancement_count || "0",
        rarity: getSwordFields(swordObject)?.rarity || "0",
        success_rate: getSwordFields(swordObject)?.success_rate || "90",
        value: getSwordFields(swordObject)?.value || "100"
      }
    : gameMode === 'test' ? testSwordData : null;

  // 컬렉션 페이지 표시
  if (showCollection) {
    return (
      <SwordCollection
        ownedSwords={swordCollection}
        savedSwords={savedSwords}
        onBack={() => setShowCollection(false)}
        onLoadSword={(_sword) => {
          setShowCollection(false);
          // 검을 게임으로 로드하는 로직 (필요시 구현)
        }}
      />
    );
  }

  return (
    <Box style={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      position: "relative"
    }}>
      {/* 배경 장식 */}
      <Box style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)
        `,
        pointerEvents: "none"
      }} />

      <Flex
        position="sticky"
        px="4"
        py="3"
        justify="between"
        align="center"
        style={{ 
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          zIndex: 10
        }}
      >
        <Box style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Button
            onClick={() => setGameMode(null)}
            size="2"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "white",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            🏠 Home
          </Button>
          <Heading 
            size="6" 
            style={{ 
              color: "white",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            ⚔️ Hero's Sword dApp
          </Heading>
        </Box>
        <Box style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Text size="3" weight="bold" style={{ color: "white" }}>
            💰 {gameMode === 'test' ? 
              `${(suiBalance / 1000000000).toFixed(2)} SUI (테스트)` : 
              (isLoadingBalance ? "로딩중..." : `${(suiBalance / 1000000000).toFixed(2)} SUI`)
            }
          </Text>
        <Text 
          size="2" 
          style={{ 
            color: "rgba(255,255,255,0.8)",
            cursor: "pointer",
            textDecoration: "underline",
            transition: "color 0.3s ease"
          }}
          onClick={() => setShowCollection(true)}
          onMouseEnter={(e) => e.currentTarget.style.color = "#4ecdc4"}
          onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.8)"}
        >
          검 {swordCollection.length + savedSwords.length}개 보유
        </Text>
          {gameMode === 'test' && (
            <Text size="2" style={{ color: "#FFD700", fontWeight: "bold" }}>
              🎮 테스트 모드
            </Text>
          )}
          {gameMode === 'wallet' && (
            <Text size="2" style={{ color: "#00D4AA", fontWeight: "bold" }}>
              🔗 지갑 모드
            </Text>
          )}
        </Box>
        <Box style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {gameMode && (
            <Button
              onClick={() => setGameMode(null)}
              size="2"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
                borderRadius: "8px"
              }}
            >
              🔄 모드 변경
            </Button>
          )}
          <ConnectButton />
        </Box>
      </Flex>

      <Container style={{ position: "relative", zIndex: 1 }}>
        <Flex align="center" justify="center" style={{ minHeight: "80vh", padding: "20px 0" }}>
          {!currentAccount ? (
            <Card style={{
              maxWidth: 400,
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "16px",
              padding: "32px",
              textAlign: "center"
            }}>
              <Heading size="6" style={{ color: "white", marginBottom: "16px" }}>
                🔗 지갑을 연결해주세요
              </Heading>
              <Text size="3" style={{ color: "rgba(255, 255, 255, 0.8)", marginBottom: "16px" }}>
                Sui 지갑을 연결하여 검 강화 게임을 시작하세요!
              </Text>
              {connectionError && (
                <Text size="2" style={{ color: "#ff6b6b", marginTop: "8px" }}>
                  ⚠️ {connectionError}
                </Text>
              )}
              {isConnecting && (
                <Text size="2" style={{ color: "#ffd93d", marginTop: "8px" }}>
                  🔄 지갑 연결 중...
                </Text>
              )}
              <Text size="2" style={{ color: "rgba(255, 255, 255, 0.6)", marginTop: "16px" }}>
                💡 현재 Testnet에 연결됩니다. Sui Wallet이나 Suiet 지갑을 사용하세요.
              </Text>
            </Card>
          ) : !gameMode ? (
            <Card style={{
              maxWidth: 500,
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "16px",
              padding: "32px",
              textAlign: "center"
            }}>
              <Heading size="6" style={{ color: "white", marginBottom: "24px" }}>
                🎮 게임 모드를 선택하세요
              </Heading>
              <Text size="3" style={{ color: "rgba(255, 255, 255, 0.8)", marginBottom: "32px" }}>
                어떤 방식으로 게임을 플레이하시겠습니까?
              </Text>

              {/* 저장된 검들 전시 */}
              {savedSwords.length > 0 && (
                <Box style={{ 
                  width: "100%", 
                  marginBottom: "24px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "12px",
                  padding: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.1)"
                }}>
                  <Text size="2" weight="bold" style={{ color: "white", marginBottom: "12px" }}>
                    🗡️ 저장된 검들 ({savedSwords.length}개)
                  </Text>
                  <Flex gap="2" wrap="wrap" style={{ maxHeight: "120px", overflowY: "auto" }}>
                    {savedSwords.slice(0, 6).map((sword) => (
                      <Box
                        key={sword.id}
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "8px",
                          padding: "8px",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          minWidth: "80px",
                          textAlign: "center"
                        }}
                      >
                        <Text size="1" weight="bold" style={{ color: "white" }}>
                          {sword.name}
                        </Text>
                        <Text size="1" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                          Lv.{sword.level}
                        </Text>
                        <Text size="1" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                          +{sword.enhancement_count}
                        </Text>
                      </Box>
                    ))}
                    {savedSwords.length > 6 && (
                      <Box
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "8px",
                          padding: "8px",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          minWidth: "80px",
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Text size="1" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                          +{savedSwords.length - 6}개 더
                        </Text>
                      </Box>
                    )}
                  </Flex>
                </Box>
              )}
              
              <Flex direction="column" gap="3" style={{ width: "100%" }}>
                <Button
                  onClick={() => setGameMode('test')}
                  size="4"
                  style={{
                    width: "100%",
                    background: "linear-gradient(45deg, #FFD700, #FFA500)",
                    border: "none",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "12px",
                    padding: "16px",
                    boxShadow: "0 4px 16px #FFD70040"
                  }}
                >
                  🎮 테스트 모드
                  <Text size="2" style={{ display: "block", marginTop: "4px", opacity: 0.9 }}>
                    가상의 1000 SUI로 무료 플레이
                  </Text>
                </Button>
                
                <Button
                  onClick={() => setGameMode('wallet')}
                  size="4"
                  style={{
                    width: "100%",
                    background: "linear-gradient(45deg, #00D4AA, #00A8CC)",
                    border: "none",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "12px",
                    padding: "16px",
                    boxShadow: "0 4px 16px #00D4AA40"
                  }}
                >
                  🔗 지갑 모드
                  <Text size="2" style={{ display: "block", marginTop: "4px", opacity: 0.9 }}>
                    실제 SUI 코인으로 플레이
                  </Text>
                </Button>
              </Flex>
            </Card>
          ) : isLoading ? (
            <Card style={{
              maxWidth: 300,
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "16px",
              padding: "32px",
              textAlign: "center"
            }}>
              <Text size="4" style={{ color: "white" }}>
                🔍 내 검을 찾는 중...
              </Text>
            </Card>
          ) : swordData ? (
            // 검이 있으면 SwordCard를 보여줍니다.
            <SwordCard 
              sword={swordData} 
              onSlayed={() => refetch()} 
              onEnhance={(newData) => setTestSwordData(newData)}
              onSaveSword={saveSword}
              onSell={(swordId) => {
                // 검 판매 시 SUI 추가 (테스트 모드)
                if (gameMode === 'test') {
                  const swordValue = parseInt(testSwordData.value);
                  setSuiBalance(prev => prev + swordValue);
                }
                
                setSwordCollection(prev => prev.filter(s => s.id !== swordId));
                setTestSwordData({
                  id: "test-sword-001",
                  name: "a piece of iron",
                  level: "1",
                  kills: "0",
                  image_url: "/images/swords/1단계.png",
                  sword_type: "0",
                  attack_power: "10",
                  magic_power: "5",
                  enhancement_count: "0",
                  rarity: "0",
                  success_rate: "90",
                  value: "100"
                });
              }}
              suiBalance={suiBalance}
              onBalanceChange={() => {
                if (gameMode === 'test') {
                  // 테스트 모드에서는 SUI 잔액을 차감
                  const enhancementCost = getEnhancementCost(parseInt(testSwordData.enhancement_count));
                  setSuiBalance(prev => Math.max(0, prev - enhancementCost));
                } else {
                  // 지갑 모드에서는 지갑에서 잔액을 가져옴
                  fetchSuiBalance();
                }
              }}
            />
          ) : (
            // 검이 없으면 MintSword를 보여줍니다.
            <MintSword onMinted={() => {
              if (gameMode === 'test') {
                // 테스트 모드에서는 검 데이터를 리셋
                setTestSwordData({
                  id: "test-sword-001",
                  name: "a piece of iron",
                  level: "1",
                  kills: "0",
                  image_url: "/images/swords/1단계.png",
                  sword_type: "0",
                  attack_power: "10",
                  magic_power: "5",
                  enhancement_count: "0",
                  rarity: "0",
                  success_rate: "90",
                  value: "100"
                });
              } else {
                refetch();
              }
            }} />
          )}
        </Flex>
      </Container>
    </Box>
  );
}

export default App;