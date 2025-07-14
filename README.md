# TodoForMe 🍎

맥용 귀여운 데스크탑 투두 앱

## ✨ 주요 기능

### 📅 일자별 할 일 관리
- 달력 인터페이스로 날짜별 할 일 관리
- 직관적인 날짜 네비게이션

### 🌳 계층형 할 일 구조  
- 2단계 이상 계층 구조 지원
- 부모-자식 할 일 관계
- 트리 토글로 확장/축소

### ⏱️ 상태 관리 및 타이머
- **상태**: 대기 🕒, 진행 중 🔥, 중지됨 ⏸, 완료됨 ✅
- 진행 중 상태에서 실시간 타이머 작동
- 동시에 하나의 할 일만 타이머 실행 가능
- 자동 시간 기록 및 누적

### 📊 통계 및 분석
- **완수율**: 일간/주간/월간 완료 비율
- **집중 시간**: 총 소요 시간 추적
- **컨텍스트 스위칭**: 작업 전환 횟수 분석
- **카테고리 분석**: 주요 작업 유형 통계

### 🎨 디자인 특징
- **색상**: Soft Pastel 팔레트 (살구빛, 하늘빛, 크림, 연한 초록)
- **이모지**: 할 일별 이모지 지원 및 자동 추천
- **애니메이션**: Framer Motion으로 부드러운 전환
- **반응형**: 다양한 화면 크기 지원

## 🛠 기술 스택

- **Frontend**: React 18 + TypeScript
- **Desktop**: Electron
- **상태 관리**: Zustand
- **UI**: Tailwind CSS + Framer Motion
- **데이터**: localStorage (electron-store)
- **날짜**: date-fns
- **아이콘**: Lucide React

## 🚀 설치 및 실행

### 개발 환경 설정
```bash
# 저장소 클론
git clone [repository-url]
cd todoforme

# 의존성 설치
npm install

# 개발 모드 실행
npm run dev

# 다른 터미널에서 Electron 실행
npm start
```

### 빌드
```bash
# 프로덕션 빌드
npm run build

# 앱 패키지 생성
npm run pack

# 배포용 빌드
npm run dist
```

## 📁 프로젝트 구조

```
src/
├── main/              # Electron 메인 프로세스
│   ├── main.ts        # 앱 진입점
│   └── preload.ts     # 보안 컨텍스트
├── renderer/          # React 앱
│   ├── components/    # UI 컴포넌트
│   ├── pages/         # 페이지 컴포넌트
│   ├── stores/        # Zustand 스토어
│   ├── types/         # 타입 정의
│   └── utils/         # 유틸리티
└── shared/           # 공통 타입/인터페이스
```

## 🎯 사용 방법

### 1. 할 일 추가
- "할 일 추가" 버튼 클릭
- 제목, 이모지, 설명, 카테고리 입력
- 하위 할 일은 부모 할 일의 "+" 버튼으로 추가

### 2. 타이머 사용
- ▶️ 버튼으로 작업 시작
- ⏸️ 버튼으로 일시 정지  
- ⏹️ 버튼으로 완료 처리
- 실시간 경과 시간 표시

### 3. 통계 확인
- 통계 탭에서 일간/주간/월간 데이터 확인
- 완수율, 집중 시간, 컨텍스트 스위칭 분석
- 카테고리별 작업 분포 확인

## 🔧 개발 가이드

### 스토어 구조
- `todoStore`: 할 일 데이터 관리
- `timerStore`: 타이머 상태 관리  
- `statsStore`: 통계 계산 로직

### 컴포넌트 구조
- `App`: 메인 레이아웃 및 네비게이션
- `TodoView`: 할 일 목록 페이지
- `TodoList`: 할 일 목록 컴포넌트
- `TodoItem`: 개별 할 일 아이템
- `StatsView`: 통계 페이지

### 데이터 모델
```typescript
interface Todo {
  id: string
  title: string
  emoji?: string
  status: 'waiting' | 'in_progress' | 'paused' | 'completed'
  dateCreated: string
  totalTime: number  // 분 단위
  parentId?: string
  children: string[]
}
```

## 📝 향후 개선 사항

- [ ] 데이터 백업/복원 기능
- [ ] 키보드 단축키 지원
- [ ] 더 다양한 테마 옵션
- [ ] 알림 및 리마인더
- [ ] 데이터 내보내기 (CSV, JSON)
- [ ] 드래그 앤 드롭으로 순서 변경

## 🐛 알려진 이슈

- 현재 통계 기능은 기본 구현 상태
- 일부 edge case에서 타이머 동기화 이슈 가능

## 📄 라이선스

MIT License

---

Made with ❤️ for productive Mac users