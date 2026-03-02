# 📞 Call Summary

특허법률사무소를 위한 통화 내용 자동 요약 도구입니다. 음성 인식으로 통화를 실시간 전사하고, Claude AI가 구조화된 요약을 생성합니다.

## 주요 기능

- **실시간 음성 전사** — Chrome Web Speech API로 한국어 음성을 텍스트로 변환
- **AI 통화 요약** — Claude API로 통화 요약, 논의사항, 결정사항, 후속조치 자동 정리
- **통화 이력 관리** — IndexedDB에 저장, 검색, JSON 내보내기/가져오기
- **복사 기능** — 요약 복사, 이메일 형식 복사, 전사 전문 복사

## 사용법

### GitHub Pages 배포 버전

1. [https://your-username.github.io/call-summary-assistant/](https://your-username.github.io/call-summary-assistant/) 접속
2. Anthropic API 키 입력 (세션 스토리지에만 저장, 탭 닫으면 삭제)
3. 고객명 입력 후 녹음 버튼 클릭
4. 통화 종료 시 자동으로 AI 요약 생성 및 저장

### 브라우저 요구사항

Chrome 브라우저 필수 (Web Speech API 지원)

## 기술 스택

- **React 19** + **Vite 7**
- **Tailwind CSS 4**
- **Claude API** (claude-sonnet-4-5-20250929)
- **IndexedDB** (idb 라이브러리)
- **Web Speech API** (webkitSpeechRecognition)

## 로컬 개발

```bash
git clone https://github.com/your-username/call-summary-assistant.git
cd call-summary-assistant
npm install
npm run dev
```

브라우저에서 `http://localhost:5173/call-summary-assistant/` 접속

## 배포

```bash
npm run deploy
```

GitHub Pages의 `gh-pages` 브랜치에 자동 배포됩니다.
