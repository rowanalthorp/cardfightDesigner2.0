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
  img.onerror = null;
  img.src = fallbackUrl;
}

let imgRef;
let loaded = false;
export const load = (element: HTMLImageElement) => {
  const actualSrc = element.dataset.src ?? "";
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      if (actualSrc) element.src = actualSrc;
      observer.disconnect();
    }
  });
  observer.observe(element);
  return {
    destroy() {
      observer.disconnect();
    }
  };
}
