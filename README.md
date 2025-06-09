# 삼국지 Lite

## 프로젝트 소개
삼국지 Lite는 조조, 유비, 손권, 원소 네 세력 중 하나를 선택하여 천하를 통일하는 것을 목표로 하는 텍스트 및 차트 기반 전략 게임입니다. 지역을 개발하고 자원을 관리하여 세력을 확장하세요.

실행 주소 : https://dev-canvas-pi.vercel.app/

## 기능
- 4개의 플레이 가능한 세력 (조조, 유비, 손권, 원소)
- 지역 개발 및 건물 건설
- 외교 시스템 (동맹, 전쟁, 선물)
- 전투 시뮬레이션
- 자원 관리 (돈, 식량, 군대)
- 턴 기반 게임플레이
- 게임 진행 상황 차트
- 저장 및 불러오기 기능

## 설치 및 실행 방법

### 필요 조건
- Node.js (최신 버전 권장)
- npm 또는 yarn

### 설치
프로젝트 디렉토리에서 다음 명령어를 실행하세요:

```bash
npm install
```

또는

```bash
yarn
```

### 개발 서버 실행

```bash
npm run dev
```

또는

```bash
yarn dev
```

### 빌드

```bash
npm run build
```

또는

```bash
yarn build
```

## 주요 구성 요소
- **App.tsx**: 게임의 주요 로직과 상태 관리
- **components/**: UI 컴포넌트
  - FactionSelectionScreen: 세력 선택 화면
  - RegionGrid: 지역 그리드 표시
  - RegionInfoModal: 지역 정보 모달
  - DiplomacyModal: 외교 행동 모달
  - CombatReportModal: 전투 결과 보고서
  - ChartsPanel: 게임 통계 차트
- **constants.ts**: 게임 상수 및 설정
- **types.ts**: TypeScript 타입 정의

## 기술 스택
- React 19
- TypeScript
- Vite
- Recharts (차트 라이브러리) 
