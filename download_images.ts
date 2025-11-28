import fs from 'fs/promises'
import path from 'path';
import sharp from 'sharp';

export type Card = {
    CardNumber: number;
    ImageURL: string;
};

const JSON_FILE_NAME: string = "cards.json";
const JSON_FILE_PATH: string = path.join(process.cwd(), 'static', 'data', JSON_FILE_NAME);

const TARGET_DIR: string = path.join(process.cwd(), 'static', 'cards');
const IMAGE_EXTENSION: string = '.webp';
const WEBP_QUALITY: number = 80;
const DOWNLOAD_DELAY_MS: number = 2000;


async function downloadFile(url: string, filePath: string): Promise<void> {
    const cardId = path.basename(filePath);
    try {
        console.log(`-> Processing Card ${cardId}: ${url}`);
        const res = await fetch(url, {
             headers: {
                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
             }
         });
        if (!res.ok) { throw new Error(`HTTP error! status: ${res.status} for URL: ${url}`); }

        const buffer = await res.arrayBuffer();

        const webpBuffer = await sharp(Buffer.from(buffer))
            .webp({ quality: WEBP_QUALITY })
            .toBuffer();

        await fs.writeFile(filePath, Buffer.from(webpBuffer));
        console.log(`SUCCESS: Card ${cardId} saved.`);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        
        if (errorMessage.startsWith('HTTP Status')) {
             console.error(`FAILED: Card ${cardId} - ${errorMessage}. (Check URL or server block)`);
        } else if (errorMessage.includes('Invalid or unsupported input')) {
             console.error(`FAILED: Card ${cardId} - Sharp Error. (Input file is corrupted or not an image)`);
        } else {
             console.error(`FAILED: Card ${cardId} - Unexpected Error: ${errorMessage}`);
        }
    }
}

async function syncImages(): Promise<void> {
    await fs.mkdir(TARGET_DIR, { recursive: true });
    let cardData: Card[] = [];
    try {
        const fileContent = await fs.readFile(JSON_FILE_PATH, { encoding: 'utf-8' });
        cardData = JSON.parse(fileContent) as Card[];
    } catch (err) {
        console.error("Failed reading or parsing local card data")
    }

    let existingFiles: string[] = [];
    try {
        existingFiles = await fs.readdir(TARGET_DIR);
    } catch (err) {
        console.log("Could not read existing files");
    }

    const existingCardNumbers: Set<string> = new Set(
        existingFiles
            .filter(file => file.endsWith(IMAGE_EXTENSION))
            .map(file => path.basename(file, IMAGE_EXTENSION))
    );

    let downloadPromises: Promise<void>[] = [];
    let downloadScheduled: number = 0;

    for (const card of cardData) {
        const cardNumberString: string = String(card.CardNumber);

        if(!existingCardNumbers.has(cardNumberString)) {
            const imageURL: string = card.ImageURL;
            const filePath: string = path.join(TARGET_DIR, `${cardNumberString}${IMAGE_EXTENSION}`);
            
            downloadPromises.push(downloadFile(imageURL, filePath));
            downloadScheduled++;
        }
    }
    if (downloadScheduled === 0) console.log("No new images found, Everything is up to datatatatE!!!");
    else {
        console.log(`Scheduling ${downloadScheduled} new image downloads...`);
        for (const promise of downloadPromises) {
            await promise;
            await new Promise(resolve => setTimeout(resolve, DOWNLOAD_DELAY_MS));
        }
        console.log('All downloads complete!');
    }
}

// syncImages();