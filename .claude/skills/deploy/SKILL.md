---
name: deploy
description: 변경사항 커밋 후 빌드, 패키징하여 /Applications에 설치합니다.
allowed-tools: Bash
---

# Deploy - 커밋 + 빌드 + macOS 앱 배포

변경사항을 커밋하고, 빌드 후 패키징하여 /Applications에 설치합니다.

## 절차

1. git status/diff 확인
2. 변경사항이 있으면 커밋 (변경 내용 기반으로 커밋 메시지 자동 생성)
3. 전체 빌드 실행
4. electron-builder로 macOS .app 패키징
5. 실행 중인 TodoForMe 종료
6. /Applications/TodoForMe.app 교체
7. 앱 실행

## 커밋 규칙

- git status와 git diff로 변경사항 확인
- 변경이 없으면 커밋 건너뛰고 빌드로 진행
- 커밋 메시지는 변경 내용을 분석하여 자동 생성 (한국어 또는 영어, 기존 커밋 스타일 따름)
- .env, credentials 등 민감 파일은 커밋하지 않음
- Co-Authored-By 태그 포함

## 빌드 및 배포 명령어

```bash
# 1. 빌드
npm run build

# 2. 패키징 (코드 서명 없이 로컬용)
npx electron-builder --mac --dir

# 3. 종료 → 교체 → 실행
pkill -f "TodoForMe" 2>/dev/null
sleep 2
rm -rf /Applications/TodoForMe.app
cp -R release/mac-arm64/TodoForMe.app /Applications/
open /Applications/TodoForMe.app
```

## 주의사항

- `pkill` 전에 저장되지 않은 데이터가 없는지 확인 (electron-store는 자동 저장이므로 보통 안전)
- 코드 서명 경고는 로컬 사용 시 무시해도 됨
- 아이콘 변경 시 Dock 캐시가 남아있을 수 있음 → `killall Dock`으로 새로고침
