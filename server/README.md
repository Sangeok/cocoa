# 코코아(COCOA), 해외 거래소를 쓰는 코인러들을 위한 서비스

이름의 어원: '코'인'코'인코리'아' => 코코아

1. 해외 거래소와 한국 거래소 사이에 프리미엄 격차를 보여주는 편의성이 있는 서비스

- 바이낸스 USDT 기준 가격
- 업비트 원화 기준 가격
- 현재 환율을 가져와야 하는 상황: 구글 환율 페이지
- 단순 크롤링해서 매번 실시간 연산(10초 간격)

2. 거래소별 고정 수수료를 계산해서 최적화해주는 곳이 없음

- 구체적인 최적의 송금 과정 계산 방식
  - 예: 바이낸스 100테더 > 업비트 원화로 바꾸고 싶어
  - 경우의 수가 여러 개:
    1. 테더 송금
    2. 다른 걸로 교환해서 송금
    3. 각 코인별 프리미엄이 얼마가 발생하고 있는지 + 고정 수수료
    4. 각 코인의 현재 가격은 redis에 저장되어 있음
    5. 또한 환율 역시 redis에 저장되어 있음(krw-usd-rate)
    6. 코인별 수수료시 발생하는 최소 송금 코인 수수료 개수는 데이터베이스에 저장되어 있음
       (동시에 1일마다 redis에 저장해두자)
    7. 어떤 코인을 사용해서 송금하면 손실이 제일 적은지 계산해서 알려주기

3. 왜 급등했는지 알려주기

- AI 도구를 사용해서 웹 검색 + 뉴스 자동으로 생성하도록 할 것
- 한국에는 의견을 남기는 곳이 별로 없음, 그러나 외국에는 많다
- 엑스 + 스톡트윗 + 레딧 + 해외발 뉴스
- 뉴스 정보는 브라우저의 로컬 스토리지에 json string으로 변경해서 저장

## 개발 환경

- 프론트엔드: Next.js
- 백엔드: Main API server Nest.js + 추가적으로 데이터를 수집 생성 서버
- 데이터베이스: PostgreSQL
- 프론트 호스팅: Vercel
- 백엔드 호스팅: GCP(Docker 환경에서 운영)
- ORM: Drizzle

## DTO

- Zod: object creation
- 서버사이드와 프론트사이드에서 설령 공용으로 사용되더라도 각자 만들어서 쓸 것

## 상태 관리

- 대부분은 로컬 스테이트면 충분히 다뤄질듯 함
- 리팩터링 과정에서 잘 잡아주는게 더 나을거 같기도 함
- 그냥 무지성 zustand 쓰는게 좋을 수도 있음

## 디자인

- AI가 알아서 해줄 것
- UI 라이브러리: Headless UI + Tailwind CSS + (Styled Components)

## 스플라이스 이미지

- 토큰 이미지들을 모두 모아서 스플라이스 이미지로 합쳐서 background position

## 명령어

### 도커 설정

```bash
# 개발 환경 실행
docker-compose up --build

# 특정 서비스만 실행
docker-compose up --build api
docker-compose up --build collector

# 백그라운드 실행
docker-compose up -d

# 환경 종료
docker-compose down

# 볼륨 포함 완전 제거
docker-compose down -v
```

### 프로덕션 환경 실행

```bash
# 빌드 후 실행
docker-compose -f docker-compose.prod.yml up -d --build

# 캐시 없이 빌드
docker-compose -f docker-compose.prod.yml build --no-cache api

# 프로덕션 환경 실행
docker-compose -f docker-compose.prod.yml up -d
```

### 프로덕션 환경 종료

```bash
docker-compose -f docker-compose.prod.yml down

# 미사용 컨테이너 제거
docker system prune -a

# 미사용 이미지 제거
docker image prune -a

# 미사용 볼륨 제거
docker volume prune

# 미사용 네트워크 제거
docker network prune
```

### 서버 실행

```bash
docker exec -it cocoa-api /bin/sh
```

### 서버 종료

```bash
docker exec -it cocoa-api /bin/sh
```

# Server

Nest.js backend application

### 참고사항

각 서비스 수수료는 해당 페이지에 매번 파싱하는 방식이 아닌 고정 json 파일을 config 디렉터리 안에 배치하여 제공합니다.
