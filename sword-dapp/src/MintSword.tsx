import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useNetworkVariable } from "./networkConfig";
import { Button, Card, Flex, Box, Text, Heading } from "@radix-ui/themes";

// 부모 컴포넌트로부터 refetch 함수를 받습니다.
export function MintSword({ onMinted }: { onMinted: () => void }) {
  const swordPackageId = useNetworkVariable("swordPackageId");
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();

  const mint = () => {
    // 테스트 모드인 경우
    if (swordPackageId === "0xTODO") {
      alert("🎉 영웅의 검이 생성되었습니다! (테스트 모드)");
      onMinted();
      return;
    }

    const tx = new Transaction();

    // mint_sword 함수를 호출하는 트랜잭션을 만듭니다.
    tx.moveCall({
      target: `${swordPackageId}::sword::mint_sword`,
      arguments: [],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => {
          alert("🎉 영웅의 검이 생성되었습니다! 이제 모험을 시작하세요!");
          // 성공하면 onMinted 함수를 호출하여 부모 컴포넌트의 데이터를 새로고침합니다.
          onMinted();
        },
        onError: (error) => {
          console.error("Transaction failed:", error);
          alert(`트랜잭션 실패: ${error.message || error}`);
        },
      },
    );
  };

  return (
    <Card 
      style={{ 
        maxWidth: 400,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        border: "2px solid #667eea",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
        overflow: "hidden"
      }}
    >
      <Flex direction="column" gap="4" align="center" style={{ padding: "32px" }}>
        {/* 검 아이콘 */}
        <Box style={{ 
          fontSize: "64px",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
        }}>
          ⚔️
        </Box>

        {/* 제목 */}
        <Heading as="h2" size="6" style={{ 
          color: "white",
          textAlign: "center",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)"
        }}>
          영웅의 검 만들기
        </Heading>

        {/* 설명 */}
        <Text 
          size="3" 
          style={{ 
            color: "rgba(255,255,255,0.9)",
            textAlign: "center",
            lineHeight: 1.5
          }}
        >
          첫 번째 검을 만들어 모험을 시작하세요!<br/>
          몬스터를 처치하여 검을 강화하고<br/>
          더 강력한 무기로 성장시켜보세요.
        </Text>

        {/* 검 정보 미리보기 */}
        <Box style={{
          background: "rgba(255,255,255,0.1)",
          borderRadius: "12px",
          padding: "16px",
          width: "100%",
          border: "1px solid rgba(255,255,255,0.2)"
        }}>
          <Text size="2" weight="bold" style={{ color: "white", marginBottom: "8px" }}>
            초기 검 정보:
          </Text>
          <Flex justify="between" style={{ marginBottom: "4px" }}>
            <Text size="2" style={{ color: "rgba(255,255,255,0.8)" }}>레벨:</Text>
            <Text size="2" weight="bold" style={{ color: "white" }}>1</Text>
          </Flex>
          <Flex justify="between" style={{ marginBottom: "4px" }}>
            <Text size="2" style={{ color: "rgba(255,255,255,0.8)" }}>공격력:</Text>
            <Text size="2" weight="bold" style={{ color: "white" }}>10</Text>
          </Flex>
          <Flex justify="between">
            <Text size="2" style={{ color: "rgba(255,255,255,0.8)" }}>마법력:</Text>
            <Text size="2" weight="bold" style={{ color: "white" }}>5</Text>
          </Flex>
        </Box>

        {/* 생성 버튼 */}
        <Button 
          onClick={mint} 
          disabled={isPending}
          size="3"
          style={{
            width: "100%",
            background: "linear-gradient(45deg, #ff6b6b, #ff8e8e)",
            border: "none",
            color: "white",
            fontWeight: "bold",
            borderRadius: "8px",
            boxShadow: "0 4px 16px rgba(255, 107, 107, 0.4)",
            transition: "all 0.3s ease"
          }}
        >
          {isPending ? "⚔️ 생성 중..." : "⚔️ 영웅의 검 만들기"}
        </Button>
      </Flex>
    </Card>
  );
}
