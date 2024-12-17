export const confidantPointCalculator = (confidantId: number, pointsGained: number, modelId: number) => {
  return `[f 5 13 ${confidantId} ${pointsGained} ${modelId}]`;
}

export const simplePositions = {
  Alice: [20, 0],
  Caroline: [-35, 0],
  Chihaya: [0, 0],
  Chouno: [40, 10],
  Director: [85, 10],
  Hifumi: [35, 10],
  Hiraguchi: [45, 10],
  Hiruta: [0, 10],
  Igor: [35, 15],
  Inui: [55, 10],
  Iwai: [60, 10],
  Joker: [65, 30],
  Jose: [45, 10],
  Justine: [0, 0],
  Kaburagi: [30, 0],
  Kaneshiro: [45, 10],
  Konoe: [50, 0],
  Kawakami: [0, 0],
  Lavenza: [35, 10],
  Makoto: [35, 10],
  Mika: [0, 30],
  Mishima: [35, 5],
  Nakanohara: [0, 0],
  Ohya: [35, 10],
  Owada: [50, 0],
  Principal: [-10, 20],
  Rumi: [40, 10],
  Shibusawa: [0, 0],
  Shido: [0, 0],
  Shinichi: [35, 20],
  Shinya: [0, 0],
  Sojiro: [75, 10],
  Sugimura: [0, 0],
  Sumire: [45, 10],
  Takemi: [0, 0],
  Tanaka: [45, 10],
  Usami: [50, 0],
  Ushimaru: [0, 0],
  Wakaba: [35, 10],
  Yoshida: [50, 3],
  Yusuke: [0, 0],
};

export const findSpecialPosition = (char: string, emote: string, costume: string) => {
  switch (char) {
    case 'Akechi': {
      if (emote.includes('Royal')) return [-30, 10]
      if (costume.includes('Defeated')) return [30, 10];
      if (emote === 'Furious' || emote === 'Smirking' || 
        emote === 'Staring' || emote === 'Upset') return [85, 0];
      if (costume.includes('Cognitive')) return [85, 0];
      return [-30, 0];
    }
    case 'Natsume': {
      if (emote === 'Miscellaneous') return [30, 0];
      return [0, 0];
    }
    case 'Ann': {
      if (emote === 'Excited (Royal)' || emote === 'Shocked (Royal)') return [0, 35];
      if (emote.includes('Royal')) return [50, 35];
      return [50, 45];
    }
    case 'Futaba': {
      if (costume.includes('Mask')) return [0, 0];
      return [-35, 0];
    }
    case 'Haru': {
      if (costume.includes('Noir')) return [0, 0];
      if (costume === 'Swimsuit (Okinawa)' || costume == 'Road Trip (Hat)') return [0, 10];
      return [35, 10];
    }
    case 'Kamoshida': {
      if (costume.includes('Shadow')) return [35, 10];
      return [-30, 15];
    }
    case 'Madarame': {
      if (costume.includes('Shadow')) return [-75, 10];
      return [55, 10];
    }
    case 'Mariko': {
      if (emote !== 'Miscellaneous') return [20, 0];
      return [0, 0];
    }
    case 'Maruki': {
      if (costume.includes('Metaverse')) return [80, 5];
      return [30, 35];
    }
    case 'Morgana': {
      if (costume === 'Human') return [35, 10];
      if (costume === '(Not a) Cat') return [-75, 65];
      if (emote.includes('Royal')) return [-30, 10];
      return [0, 25];
    }
    case 'Okumura': {
      if (costume.includes('Shadow')) return [0, 10];
      return [-35, 0];
    }
    case 'Ryuji': {
      if (emote.includes('Royal')) return [-45, 25];
      return [-70, 25];
    }
    case 'Sae': {
      if (costume.includes('Shadow')) return [10, 30];
      return [35, 10];
    }
    case 'Shiho': {
      if (costume.includes('Cognitive')) return [0, 0];
      return [55, 25];
    }
    case 'Zenkichi': {
      if (costume === 'Wolf' || emote === 'Miscellaneous') return [50, 0];
    }
    default: return [0, 0];
  }
}

export const findRandomNumbers = (name: string) => {
  let random;
  let secondRandom;
  let thirdRandom;

  // Edge case: If name is just whitespace, we won't enter the loop so it doesn't run infinitely
  if (name.trim()) {
    // Choose a random character from the name.
    // If the character chosen is a blank space, choose again
    do {
      random = Math.floor(Math.random() * name.length);
    } while (name[random] === ' ');


    if (name.length >= 8) {
      // Pick a new random number to make sure it's on the left side of the name
      // That way we can ensure there's a nice balance to where the boxes are
      // and make sure the first random number comes before the second random number
      if (random > Math.floor(name.length / 2)) {
        while (name[random] === ' ' || random > Math.floor(name.length / 2)) {
          random = Math.floor(Math.random() * name.length);
        }
      }

      // Likewise, ensure the second random number is on the right half of the name
      // and at least a few numbers away from the first random number
      do {
        secondRandom = Math.floor(Math.random() * name.length);
      } while (name[secondRandom] === ' ' || secondRandom < Math.floor(name.length / 2) || Math.abs(secondRandom - random) <= 2);

      if (name.length >= 16) {
          if (random > (Math.floor((name.length / 3) - 1))) {
            while (name[random] === ' ' || random > Math.floor(name.length / 3)) {
              random = Math.floor(Math.random() * name.length);
            }
          }
          
          if (secondRandom > (2 * (Math.floor((name.length / 3) - 1)))) {
            while (name[secondRandom] === ' ' || secondRandom < Math.floor(name.length / 3) || secondRandom > (2 * (Math.floor(name.length / 3))) || Math.abs(secondRandom - random) <= 2) {
              secondRandom = Math.floor(Math.random() * name.length);
            }
          }
    
          do {
            thirdRandom = Math.floor(Math.random() * name.length);
          } while (name[thirdRandom] === ' ' || thirdRandom < (2 * Math.floor(name.length / 3)) || Math.abs(thirdRandom - secondRandom) <= 2);
        }
    } 

    return [random, secondRandom, thirdRandom];
  } else { 
    return [null, null, null]; 
  }
};
