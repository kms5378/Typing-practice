export type PokemonProfile = {
  id: number;
  nameKo: string;
  nameEn: string;
  imageUrl: string;
  accentColor: string;
};

const sprite = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

export const pokemonProfiles: PokemonProfile[] = [
  { id: 25, nameKo: "피카츄", nameEn: "Pikachu", imageUrl: sprite(25), accentColor: "#f2c94c" },
  { id: 1, nameKo: "이상해씨", nameEn: "Bulbasaur", imageUrl: sprite(1), accentColor: "#27ae60" },
  { id: 4, nameKo: "파이리", nameEn: "Charmander", imageUrl: sprite(4), accentColor: "#eb5757" },
  { id: 7, nameKo: "꼬부기", nameEn: "Squirtle", imageUrl: sprite(7), accentColor: "#2f80ed" },
  { id: 39, nameKo: "푸린", nameEn: "Jigglypuff", imageUrl: sprite(39), accentColor: "#f299c1" },
  { id: 52, nameKo: "나옹", nameEn: "Meowth", imageUrl: sprite(52), accentColor: "#d6a45d" },
  { id: 54, nameKo: "고라파덕", nameEn: "Psyduck", imageUrl: sprite(54), accentColor: "#f2c94c" },
  { id: 133, nameKo: "이브이", nameEn: "Eevee", imageUrl: sprite(133), accentColor: "#a97142" },
  { id: 143, nameKo: "잠만보", nameEn: "Snorlax", imageUrl: sprite(143), accentColor: "#486581" },
  { id: 152, nameKo: "치코리타", nameEn: "Chikorita", imageUrl: sprite(152), accentColor: "#6fcf97" },
  { id: 155, nameKo: "브케인", nameEn: "Cyndaquil", imageUrl: sprite(155), accentColor: "#f2994a" },
  { id: 158, nameKo: "리아코", nameEn: "Totodile", imageUrl: sprite(158), accentColor: "#56ccf2" }
];

export function findPokemonProfile(id: number) {
  return pokemonProfiles.find((profile) => profile.id === id);
}
