export type PracticeLanguage = "ko" | "en";
export type PracticeMode = "short" | "long";
export type LongPracticeText = {
  id: string;
  title: string;
  source: string;
  text: string;
};

export const SHORT_SESSION_SENTENCE_COUNT = 5;

const koSubjects = [
  "아침 햇살",
  "작은 책상",
  "푸른 강물",
  "조용한 골목",
  "따뜻한 차",
  "낡은 편지",
  "맑은 종소리",
  "가벼운 발걸음",
  "하얀 구름",
  "깊은 숨"
];

const koActions = [
  "천천히 하루를 열어 줍니다.",
  "오늘의 마음을 단정하게 합니다.",
  "먼 길의 생각을 가까이 데려옵니다.",
  "흩어진 문장을 차분히 모읍니다.",
  "손끝의 리듬을 고르게 만듭니다.",
  "새로운 연습을 시작하게 합니다.",
  "오래 남은 기억을 환하게 비춥니다.",
  "작은 실수를 다시 고치게 합니다.",
  "조용한 집중을 오래 붙잡아 둡니다.",
  "다음 문장을 향해 나아가게 합니다."
];

const enSubjects = [
  "The morning light",
  "A quiet desk",
  "The blue river",
  "A narrow street",
  "A warm cup",
  "The old letter",
  "A clear bell",
  "A steady step",
  "The white cloud",
  "A deep breath"
];

const enActions = [
  "opens the day with patient focus.",
  "keeps every thought in careful order.",
  "brings distant ideas close to the page.",
  "gathers scattered words into one line.",
  "makes the rhythm of typing feel even.",
  "starts another round of useful practice.",
  "brightens a memory that stayed behind.",
  "helps a small mistake become clear.",
  "holds attention without rushing ahead.",
  "moves calmly toward the next sentence."
];

function buildSentences(subjects: string[], actions: string[]) {
  return subjects.flatMap((subject) => actions.map((action) => `${subject} ${action}`));
}

export const practiceTexts: Record<PracticeLanguage, string[]> = {
  ko: buildSentences(koSubjects, koActions),
  en: buildSentences(enSubjects, enActions)
};

export function getRandomPracticeSet(texts: string[], count = SHORT_SESSION_SENTENCE_COUNT, random = Math.random) {
  const targetCount = Math.min(count, texts.length);
  const selectedIndexes = new Set<number>();
  let attempts = 0;

  while (selectedIndexes.size < targetCount && attempts < texts.length * 10) {
    selectedIndexes.add(Math.floor(random() * texts.length));
    attempts += 1;
  }

  for (let index = 0; selectedIndexes.size < targetCount && index < texts.length; index += 1) {
    selectedIndexes.add(index);
  }

  return Array.from(selectedIndexes).map((index) => texts[index]);
}

export const longPracticeTexts: Record<PracticeLanguage, LongPracticeText[]> = {
  ko: [
    {
      id: "moon-road",
      title: "달빛 아래의 길",
      source: "고전 소설풍 산문",
      text:
        "달빛이 낮게 내려앉은 마을 길 위로 오래된 나무 그림자가 천천히 흔들렸다. 길을 걷던 사람은 하루 동안 말하지 못한 생각들을 마음속에서 하나씩 꺼내 보았고, 멀리 물레방아 소리가 들릴 때마다 다시 걸음을 고르게 맞추었다."
    },
    {
      id: "winter-window",
      title: "겨울 창가의 편지",
      source: "서정 산문",
      text:
        "겨울 창가에 앉은 이는 아직 마르지 않은 잉크를 바라보며 편지의 마지막 문장을 망설였다. 차가운 바람은 문틈으로 들어와 촛불을 살짝 흔들었지만, 종이 위에 남은 다정한 말들은 오래 기다린 봄처럼 조용히 빛났다."
    },
    {
      id: "river-song",
      title: "강가의 노래",
      source: "고전 시풍 문단",
      text:
        "강가에는 저녁빛이 길게 누웠고 물결은 낮은 노래처럼 돌 사이를 흘렀다. 떠나는 배를 바라보던 마음은 서운함보다 고요함에 가까웠으며, 하늘의 첫 별이 떠오르자 오늘의 슬픔도 한 줄의 시처럼 멀어졌다."
    },
    {
      id: "old-library",
      title: "오래된 서가",
      source: "고전 수필풍 산문",
      text:
        "오래된 서가 앞에 서면 먼지 앉은 책등마다 지나간 계절의 손길이 남아 있는 듯했다. 창밖에서는 비가 가늘게 내렸고, 책장을 넘기는 소리는 작았지만 방 안의 적막을 깨우기에는 충분했다."
    },
    {
      id: "dawn-market",
      title: "새벽 장터",
      source: "생활 산문",
      text:
        "새벽 장터에는 아직 해가 다 오르지 않았는데도 사람들의 목소리가 먼저 하루를 밝혔다. 바구니에 담긴 푸른 채소와 막 피어난 김 사이로 부지런한 발걸음이 오갔고, 어린 시절의 기억은 그 냄새 속에서 조용히 되살아났다."
    }
  ],
  en: [
    {
      id: "garden-gate",
      title: "The Garden Gate",
      source: "Classic novel-style prose",
      text:
        "Beyond the garden gate, the road bent gently toward the hill, and the evening air carried the scent of rain from distant fields. Clara paused before stepping forward, not because she feared the journey, but because the quiet house behind her seemed to hold every word she had not yet spoken."
    },
    {
      id: "harbor-lamp",
      title: "The Harbor Lamp",
      source: "Literary prose",
      text:
        "The harbor lamp burned steadily above the black water while the ships moved like shadows against the tide. Each bell from the quay sounded patient and old, and the boy who watched from the stones imagined that every departing sail carried a secret written only for the wind."
    },
    {
      id: "autumn-room",
      title: "The Autumn Room",
      source: "Poetic paragraph",
      text:
        "In the autumn room, books leaned together as if sharing memories of warmer days. A thin gold leaf rested on the windowsill, and the afternoon light crossed the floor so slowly that even the clock seemed willing to wait before naming the next hour."
    },
    {
      id: "midnight-train",
      title: "The Midnight Train",
      source: "Classic travel prose",
      text:
        "The midnight train moved through the valley with a low and steady sound, passing farms where no lamp remained awake. Inside the carriage, an old traveler folded his newspaper and watched the dark glass, as though the window might return a forgotten face from years before."
    },
    {
      id: "silver-orchard",
      title: "The Silver Orchard",
      source: "Pastoral prose",
      text:
        "At the edge of the silver orchard, the grass was cool with morning and every branch held a bead of light. Marian walked slowly between the trees, listening to the quiet fall of leaves and wondering how a place so still could feel so full of arrival."
    }
  ]
};
