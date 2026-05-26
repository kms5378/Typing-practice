# Typing Practice

한글과 영어 문장 세트를 입력하고, 포켓몬 프로필과 함께 Vercel KV 공용 랭킹에 기록하는 타자 연습 웹앱입니다.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Tests

```bash
npm test
npm run build
npm run e2e
```

## Vercel Deployment

1. Push this repository to `https://github.com/kms5378/Typing-practice.git`.
2. Import the repository from Vercel.
3. Create a Vercel KV or Vercel Marketplace Redis store.
4. Connect the store to the Vercel project so the `KV_*` environment variables are injected.
5. Deploy the `main` branch.

## Adding Pokemon Profiles

Edit `src/lib/pokemonProfiles.ts` and append a new object to `pokemonProfiles`.

```ts
{ id: 10, nameKo: "캐터피", nameEn: "Caterpie", imageUrl: sprite(10), accentColor: "#6fcf97" }
```
