# 🎁 우리 쿠폰북

아내에게 선물하는 디지털 쿠폰북. Vue 3 + JavaScript, 백엔드 코드 없음.

- QR 코드로 접속 → 쿠폰 리스트
- 사용하기 → **"정말 사용할까요?"** 확인 후 사용 처리
- 실수로 눌렀으면 사용 내역에서 **되돌리기**
- **두 대의 스마트폰이 같은 상태를 봄** (Supabase 동기화, 실시간)
- Supabase 설정을 안 해도 localStorage만으로 바로 동작 (단, 기기 간 동기화 없음)

## 실행

```bash
npm install
npm run dev
```

## 쿠폰 내용 바꾸기

[`src/data/coupons.js`](src/data/coupons.js) 하나만 고치면 됩니다.

> ⚠️ `id`는 절대 바꾸지 마세요. 사용 기록이 `id`로 저장되기 때문에, id를 바꾸면
> 이미 사용한 쿠폰이 미사용 상태로 되돌아갑니다. 새 쿠폰은 새 `id`로 추가하세요.

## 두 폰 동기화 (Supabase — 무료)

localStorage는 기기마다 따로 저장되므로 폰 두 대를 맞출 수 없습니다.
Supabase 무료 티어의 테이블 하나를 빌려 쓰면 서버 코드 없이 해결됩니다.

1. [supabase.com](https://supabase.com) 가입 → New project (무료)
2. SQL Editor에 [`supabase/schema.sql`](supabase/schema.sql) 내용을 붙여넣고 실행
3. Settings → API 에서 **Project URL**과 **anon public key** 복사
4. 로컬: `.env.example`을 `.env`로 복사하고 값 채우기
5. 배포: GitHub 저장소 → Settings → Secrets and variables → Actions → **Variables** 탭에
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 추가

anon key는 브라우저에 노출되는 공개 키라서 프론트에 들어가도 괜찮습니다.
이 쿠폰북은 주소를 아는 사람만 접근하는 비공개 링크이고, 민감 정보를 담지 않으므로
RLS는 전체 허용으로 두었습니다.

### 동기화가 동작하는 방식

- 사용 기록은 **고유 id를 가진 이벤트**로 저장됩니다 → 두 폰의 기록을 합칠 때 충돌이 없습니다.
- 오프라인이어도 로컬에 먼저 저장되고, 온라인이 되면 자동으로 올라갑니다.
- 상대 폰에서 사용처리하면 **실시간 구독**으로 내 화면이 즉시 갱신됩니다.

## 배포 (GitHub Pages)

`main` 브랜치에 push하면 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)이
자동으로 빌드·배포합니다.

최초 1회만: 저장소 → Settings → Pages → **Source: GitHub Actions** 로 설정하세요.

배포 주소는 `https://<사용자명>.github.io/<저장소명>/` 입니다.
해시 라우터(`#/`)와 상대 경로 base를 쓰기 때문에 Netlify, Vercel, Cloudflare Pages에
그대로 올려도 동작합니다.

## QR 코드

배포 후 앱의 **QR 탭**에 들어가면 현재 주소의 QR이 자동 생성됩니다.
`QR 이미지 저장`으로 PNG를 받아 카드에 인쇄하세요.
