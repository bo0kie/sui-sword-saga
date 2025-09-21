import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        swordPackageId: "0x3631beea388033194e412f4279cf4954998ea27a7cafd4a4a760baf7c2e7f220",
      },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: {
        swordPackageId: "0xTODO", // TODO: mainnet 배포 후 실제 패키지 ID로 변경
      },
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
