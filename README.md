# 🗡️ 히어로즈 소드 - Sui 블록체인 검 강화 게임

한국의 인기 클리커/아이들 게임에서 영감을 받아 Sui 블록체인에 구축된 탈중앙화 검 강화 게임입니다. 플레이어는 게임플레이를 통해 진화하는 동적 속성을 가진 고유한 검 NFT를 민팅, 강화, 수집할 수 있습니다.

## 🚀 프로젝트 실행 방법

### 전제 조건
- Node.js 18+ 
- npm 또는 pnpm
- Sui CLI (스마트 컨트랙트 배포용)
- Sui 지갑 (Sui Wallet, Suiet 등)

### 설치 및 실행

1. **의존성 설치**
```bash
cd sword-dapp
npm install
```

2. **개발 서버 시작**
```bash
npm run dev
```

3. **브라우저에서 접속**
```
http://localhost:5173
```

## 🎮 게임 기능

이 게임은 Sui 블록체인 기반의 검 강화 게임으로, 다음과 같은 기능을 제공합니다:

1. **검 민팅**: 새로운 검 NFT 생성
2. **검 강화**: SUI 코인을 사용하여 검의 능력치 향상
3. **검 수집**: 강화된 검들을 컬렉션으로 관리
4. **검 판매**: 강화된 검을 SUI 코인으로 판매
5. **NFT 저장**: 검을 영구적인 NFT로 저장

## 🛠️ 기술 스택

- **프론트엔드**: React 18 + TypeScript + Vite
- **블록체인**: Sui Network
- **스마트 컨트랙트**: Move 언어
- **UI 라이브러리**: Radix UI

## 🎯 게임 모드

### 테스트 모드
- **가상 SUI**: 1000개의 가상 SUI 코인으로 시작
- **Local Storage**: Swords saved to browser storage
- **No Gas Fees**: Free to test all features
- **Instant Transactions**: No blockchain delays

### Wallet Mode
- **Real SUI**: Use actual SUI coins from your wallet
- **Blockchain Storage**: Swords stored as NFTs on Sui
- **Gas Fees**: Pay network fees for transactions
- **Real Trading**: Trade with other players

## 🗡️ Sword Enhancement System

### Enhancement Mechanics
- **Cost Formula**: `base_cost * (enhancement_count + 1)`
- **Success Rate**: Starts at 90%, decreases by 2% per enhancement
- **Minimum Success Rate**: 5% (never goes below)
- **Evolution Trigger**: After 3 successful enhancements

### Sword Tiers
1. A Piece of Iron
2. Knife
3. Sui Sword
4. Steel Blade
5. Silver Edge
6. Golden Sword
7. Platinum Blade
8. Diamond Sword
9. Legendary Blade
10. Mythic Sword
11. Divine Blade
12. Eternal Sword
13. Celestial Blade
14. Void Sword
15. Cosmic Blade
16. Stellar Sword
17. Galactic Blade
18. Universal Sword
19. Omnipotent Blade
20. Dragon Slayer Rift Vanquisher

## 🎨 UI/UX Features

### Collection Management
- **Sword Gallery**: Visual collection of all owned swords
- **Filter & Sort**: Organize swords by tier, rarity, or type
- **Quick Actions**: Enhance, sell, or save swords directly from collection
- **Statistics**: View detailed sword properties and enhancement history

### Visual Feedback
- **Success Effects**: Golden flash with fire sparkles
- **Failure Effects**: Red flash to indicate destruction
- **Progress Bars**: Visual enhancement progress tracking
- **Hover Effects**: Interactive feedback for all clickable elements

## 🔧 Development

### Project Structure
```
sword-dapp/
├── src/
│   ├── components/
│   │   ├── App.tsx           # Main application component
│   │   ├── SwordCard.tsx     # Sword display and interaction
│   │   ├── MintSword.tsx     # Sword minting interface
│   │   └── SwordCollection.tsx # Collection management
│   ├── networkConfig.ts      # Blockchain configuration
│   └── main.tsx             # Application entry point
├── move/
│   └── sources/
│       └── sword.move        # Smart contract
└── package.json
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

### Smart Contract Functions
- `mint_sword()` - Create new sword NFT
- `enhance_sword()` - Enhance sword with SUI payment
- `sell_sword()` - Sell sword for SUI coins
- `save_sword_as_nft()` - Save sword as permanent NFT

## 🌐 Network Configuration

### Supported Networks
- **Devnet**: For development and testing
- **Testnet**: For public testing
- **Mainnet**: For production deployment

### Network Settings
```typescript
const networkConfig = {
  swordPackageId: "0x...", // Deployed package ID
  network: "devnet", // Target network
  // ... other settings
};
```

## 🎯 문제 진술

### 게임 산업의 현재 문제점
- **중앙화된 통제**: 전통적인 게임은 단일 기업에 의해 통제되어 플레이어의 소유권을 제한합니다
- **진정한 소유권 부재**: 플레이어는 시간과 돈을 투자하지만 게임 내 자산을 진정으로 소유하지 못합니다
- **제한된 상호 운용성**: 게임 자산이 특정 플랫폼에 갇혀 있습니다
- **투명성 부족**: 게임 메커니즘과 경제가 플레이어에게 불투명합니다
- **실제 가치 부재**: 게임 내 성과와 아이템이 실제 세계의 가치를 가지지 못합니다
- **수익화 문제**: 플레이어는 엔터테인먼트를 위해 지불하지만 실질적인 수익을 받지 못합니다

### 강화 게임의 특정 문제점
- **페이투윈 메커니즘**: 플레이어는 진행을 위해 지속적으로 돈을 지불해야 합니다
- **자산 보안 부재**: 서버 문제나 계정 정지로 인해 강화된 아이템을 잃을 수 있습니다
- **제한된 거래**: 플레이어는 강화된 아이템을 자유롭게 거래할 수 없습니다
- **인위적 희소성**: 게임 개발자가 아이템의 가용성과 가치를 통제합니다
- **장기적 가치 부재**: 게임에 투자한 시간과 돈이 지속적인 혜택을 제공하지 않습니다

## 💡 우리의 솔루션

### 블록체인 기반 게임
- **진정한 소유권**: 플레이어가 블록체인에서 검 NFT를 소유합니다
- **탈중앙화 통제**: 단일 기업이 게임을 통제하거나 조작할 수 없습니다
- **투명한 경제**: 모든 게임 메커니즘과 거래가 공개적으로 검증 가능합니다
- **실제 가치**: 강화된 검은 실제 화폐 가치를 가지며 거래할 수 있습니다
- **상호 운용성**: 자산이 잠재적으로 다른 플랫폼에서 사용될 수 있습니다

### 혁신적인 게임 메커니즘
- **리스크 vs 리워드**: 플레이어는 더 높은 보상을 위해 검을 잃을 위험을 감수합니다
- **동적 NFT**: 검의 속성이 플레이어의 행동에 따라 변경됩니다
- **경제적 인센티브**: 성공적인 강화가 검의 가치를 증가시킵니다
- **커뮤니티 주도**: 플레이어가 게임 경제를 생성하고 유지합니다
- **공정한 분배**: 페이투윈 메커니즘 없이 기술과 운만 필요합니다

### 기술적 혁신
- **Sui 블록체인**: 낮은 수수료로 고성능 블록체인
- **Move 언어**: 형식적 검증을 통한 안전한 스마트 컨트랙트
- **동적 속성**: 게임플레이를 통해 진화하는 NFT
- **가스 최적화**: 더 나은 사용자 경험을 위한 효율적인 거래

## 🌟 임팩트 및 혜택

### 플레이어를 위한 혜택
- **진정한 자산 소유권**: 플레이어가 강화된 검을 진정으로 소유합니다
- **실제 경제적 가치**: 투자한 시간과 노력이 실제 화폐 수익으로 환산됩니다
- **투명한 게임플레이**: 모든 메커니즘이 공개되고 검증 가능합니다
- **커뮤니티 혜택**: 플레이어가 게임의 성공으로부터 혜택을 받습니다
- **크로스 플랫폼 잠재력**: 자산이 미래 애플리케이션에서 사용될 수 있습니다

### 게임 산업을 위한 혜택
- **새로운 비즈니스 모델**: 게임이 자산 거래를 통해 수익을 창출할 수 있습니다
- **플레이어 유지**: 진정한 소유권이 장기적 참여를 증가시킵니다
- **혁신 촉진제**: 블록체인 게임의 새로운 가능성을 시연합니다
- **커뮤니티 구축**: 플레이어가 게임 성공의 이해관계자가 됩니다
- **기술적 발전**: 게임에서 가능한 것의 경계를 넓힙니다

### 블록체인 생태계를 위한 혜택
- **실제 유틸리티**: 블록체인 기술의 실용적 사용 사례를 시연합니다
- **사용자 채택**: 게임을 통해 블록체인에 새로운 사용자를 유치합니다
- **기술적 혁신**: 동적 NFT와 게임의 상태를 발전시킵니다
- **경제적 활동**: 새로운 경제적 기회와 가치 흐름을 생성합니다
- **생태계 성장**: Sui 생태계의 전반적인 건강에 기여합니다

## 🔄 NFT 저장 과정 시각화

검의 정보가 NFT로 저장되는 과정을 다이어그램으로 설명합니다.

> 📊 **상세한 플로우 다이어그램과 단계별 설명은 [NFT 저장 과정 문서](./docs/nft-save-process.md)를 참조하세요.**

### 주요 단계 요약

1. **게임플레이**: 플레이어가 검을 강화 시도
2. **데이터 수집**: 강화 성공 시 검의 모든 속성 수집
3. **사용자 액션**: "Save as NFT" 버튼 클릭
4. **블록체인 처리**: SUI 지갑 서명 및 스마트 컨트랙트 실행
5. **NFT 생성**: 블록체인에 영구 저장 및 지갑으로 전송
6. **완료**: 컬렉션 페이지에 표시

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Sui Foundation** for the amazing blockchain platform
- **Move Language** for secure smart contract development
- **React Community** for the excellent frontend framework
- **Radix UI** for accessible component library

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the documentation
- Join our community Discord

---

**Happy Sword Enhancing!** ⚔️✨
