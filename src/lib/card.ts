export type Card = {
  CardNumber: number;
  Name: string;
  Grade: string;
  Clan: string;
  Type: string;
  Rarity: string;
  Power: string;
  Shield: string;
  Critical: string;
  Effect: string;
  Flavor: string;
  Race: string;
  Special: string;
  Regulation: string;
  SetNumber: string;
  Illustrator: string;
  Group: string;
  ImageURL: string;
  Gift: string;
};

export const filterFields = [
  "Race",
  "Group",
  "Power",
  "Shield",
  "Critical",
  "Type",
  "Rarity",
  "Grade",
  "Clan",
  "Special",
  "SetNumber",
  "Gift",
] as const;

export type BuilderFilterFields = typeof filterFields[number];

export function getLocalPath(cardNumber: number): string {
  return `/cards/${cardNumber}.webp`;
}

export function handleImageError(event: Event, fallbackUrl: string) {
  const img = event.currentTarget as HTMLImageElement;
  if (img.src === img.dataset.src) {
    img.src = fallbackUrl;
    img.onerror = (e) => handlePlaceholderFallback(e as Event, img);
  }
}

function handlePlaceholderFallback(event: Event, img: HTMLImageElement) {
  img.onerror = null;
  img.src = "/assets/placeholder_card.jpg";
}