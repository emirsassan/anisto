import { createEffect, onMount } from "solid-js";
import {
  simplePositions,
  findSpecialPosition,
  findRandomNumbers,
} from "../../utils/helpers";
import FontFaceObserver from "fontfaceobserver";

const ImageCanvas = (props: {
  portrait: string;
  name: string;
  text: string;
  font: string;
  char: keyof typeof simplePositions | "None";
  emote: string;
  costume: string;
  box: string;
  setBox: (box: string) => void;
  setBoxSize: (size: string) => void;
  boxType: string;
}) => {
  const loadedFont = new FontFaceObserver(`${props.font}`);

  const findTextCoords: Record<string, number[]> = {
    starlight: [200, 163, 189, 209],
    normal_no_portrait: [220, 160, 180, 200],
    strikers: [250, 165, 185, 205],
    normal_small: [250, 163, 189, 209],
  };

  let portraitCanvas: HTMLCanvasElement;
  let boxCanvas: HTMLCanvasElement;
  let tileCanvas: HTMLCanvasElement;
  let nameCanvas: HTMLCanvasElement;
  let textCanvas: HTMLCanvasElement;
  let character: HTMLImageElement;
  let dialogueBox: HTMLImageElement;

  let random: number;
  let secondRandom: number;
  let thirdRandom: number;
  let textX: number;
  let textY: number;
  let pCtx: CanvasRenderingContext2D;
  let bCtx: CanvasRenderingContext2D;
  let tileCtx: CanvasRenderingContext2D;
  let nCtx: CanvasRenderingContext2D;
  let tCtx: CanvasRenderingContext2D;
  let textObj: any;
  let nameObj: any;
  let boxX: number;
  let secondBoxX: number;
  let thirdBoxX: number;

  onMount(() => {
    tileCtx = tileCanvas.getContext("2d")!;
    tileCtx.rotate((-14.65 * Math.PI) / 180);

    nCtx = nameCanvas.getContext("2d")!;
    nCtx.textAlign = "left";
    nCtx.rotate((-14.65 * Math.PI) / 180);
  });

  createEffect(() => {
    nCtx = nameCanvas.getContext("2d")!;
    tileCtx = tileCanvas.getContext("2d")!;
    tileCtx.clearRect(0, 0, 769, 250);
    nCtx.clearRect(0, 0, 769, 250);

    nCtx.setTransform(1, 0, 0, 1, 0, 0);
    tileCtx.setTransform(1, 0, 0, 1, 0, 0);

    switch (props.boxType) {
      case "normal_small":
        nCtx.rotate((-15 * Math.PI) / 180);
        tileCtx.rotate((-15 * Math.PI) / 180);
        break;
      case "starlight":
        nCtx.rotate(0);
        tileCtx.rotate(0);
        break;
      case "normal_no_portrait":
        nCtx.rotate((-20 * Math.PI) / 180);
        tileCtx.rotate((-20 * Math.PI) / 180);
        break;
      case "strikers":
        nCtx.fillStyle = "#000000";
        nCtx.rotate((-5.8 * Math.PI) / 180);
        tileCtx.rotate((3.4 * Math.PI) / 180);
        break;
      default:
        nCtx.textAlign = "left";
        nCtx.rotate((-14.65 * Math.PI) / 180);
        tileCtx.rotate((-14.65 * Math.PI) / 180);
        break;
    }
  });

  createEffect(() => {
    nCtx = nameCanvas.getContext("2d")!;
    nCtx.font = `14pt ${props.font}`;
    nCtx.clearRect(0, 0, 769, 250);
    
    // clear canvas
    tileCtx = tileCanvas.getContext("2d")!;
    tileCtx.clearRect(0, 0, 769, 250);

    nameObj = nCtx.measureText(props.name);

    switch (props.boxType) {
      case "normal_small":
      case "normal_no_portrait": {
        nCtx.textAlign = "left";
        props.boxType === "normal_small" ? (textX = 418) : (textX = 392);
        props.boxType === "normal_small" ? (textY = 190) : (textY = 425);

        // p5r box size
        if (props.boxType === "normal_small") {

          if (nameObj.width <= 195) {
            props.setBoxSize("small");
            props.setBox("normal_small");
            textX = 218;
          } else if (nameObj.width > 195 && nameObj.width <= 275) {
            props.setBoxSize("medium");
            props.setBox("normal_medium");
            textX = 456;
          } else {
            props.setBoxSize("large");
            props.setBox("normal_large");
            textX = 495;
          }
        } else {
          props.setBox("normal_no_portrait");
          textX = 200;
          textY = 185;
        }

        const randomNumbers = findRandomNumbers(props.name);
        random = randomNumbers[0] || 0;
        secondRandom = randomNumbers[1] || 0;
        thirdRandom = randomNumbers[2] || 0;

        let beforeBox: string = props.name.substring(0, random);
        let behindBox: string = props.name.substring(random, random + 1);
        let afterBox: string = props.name.substring(random + 1);

        let secondBehindBox: string;
        let secondAfterBox: string;
        let thirdBehindBox: string;
        let thirdAfterBox: string;

        if (props.name.length >= 8) {
          afterBox = props.name.substring(random + 1, secondRandom);
          secondBehindBox = props.name.substring(
            secondRandom,
            secondRandom + 1
          );
          secondAfterBox = props.name.substring(secondRandom + 1);

          if (props.name.length >= 16) {
            secondAfterBox = props.name.substring(
              secondRandom + 1,
              thirdRandom
            );
            thirdBehindBox = props.name.substring(thirdRandom, thirdRandom + 1);
            thirdAfterBox = props.name.substring(thirdRandom + 1);
          }
        }

        loadedFont.load().then(() => {
          // clear tile canvas
          tileCtx.clearRect(0, 0, 769, 250);
          
          boxX = textX - nameObj.width / 2;
          secondBoxX = boxX;
          thirdBoxX = secondBoxX;

          // edge case: No black boxes for single character names or whitespace-only names
          if (props.name.length > 1 && props.name.trim()) {
            // loop through name to find where we should
            // start drawing the box behind the randomly chosen character
            for (let i = 0; i < random; i++) {
              textObj = nCtx.measureText(props.name[i]);
              boxX += textObj.width;
            }

            textObj = nCtx.measureText(props.name[random]);

            tileCtx.fillRect(
              boxX,
              textY - textObj.fontBoundingBoxAscent,
              textObj.width,
              textObj.fontBoundingBoxAscent + textObj.fontBoundingBoxDescent + 2
            );

            if (props.name.length >= 8) {
              secondBoxX = boxX;

              for (let i = random; i < secondRandom; i++) {
                textObj = nCtx.measureText(props.name[i]);
                secondBoxX += textObj.width;
              }

              textObj = nCtx.measureText(props.name[secondRandom]);

              tileCtx.fillRect(
                secondBoxX,
                textY - textObj.fontBoundingBoxAscent - 2,
                textObj.width,
                textObj.fontBoundingBoxAscent +
                  textObj.fontBoundingBoxDescent +
                  2
              );

              if (props.name.length >= 16) {
                thirdBoxX = secondBoxX;

                for (let i = secondRandom; i < thirdRandom; i++) {
                  textObj = nCtx.measureText(props.name[i]);
                  thirdBoxX += textObj.width;
                }

                textObj = nCtx.measureText(props.name[thirdRandom]);

                tileCtx.fillRect(
                  thirdBoxX,
                  textY - textObj.fontBoundingBoxAscent - 2,
                  textObj.width,
                  textObj.fontBoundingBoxAscent +
                    textObj.fontBoundingBoxDescent +
                    2
                );
              }
            }
          } else if (props.name.length === 1) {
            nCtx.fillStyle = "#000000";
            nCtx.fillText(props.name, textX, textY);
            return;
          }

          nCtx.fillStyle = "#000000";
          nCtx.fillText(beforeBox, textX - nameObj.width / 2, textY);
          nCtx.fillStyle = "#FFFFFF";
          textObj = nCtx.measureText(beforeBox);
          nCtx.fillText(behindBox, boxX, textY);
          nCtx.fillStyle = "#000000";
          textObj = nCtx.measureText(props.name[random]);
          nCtx.fillText(afterBox, boxX + textObj.width, textY);

          if (props.name.length >= 8) {
            nCtx.fillStyle = "#FFFFFF";
            nCtx.fillText(secondBehindBox, secondBoxX, textY);
            nCtx.fillStyle = "#000000";
            textObj = nCtx.measureText(props.name[secondRandom]);
            nCtx.fillText(secondAfterBox, secondBoxX + textObj.width, textY);

            if (props.name.length >= 16) {
              nCtx.fillStyle = "#FFFFFF";
              nCtx.fillText(thirdBehindBox, thirdBoxX, textY);
              nCtx.fillStyle = "#000000";
              textObj = nCtx.measureText(props.name[thirdRandom]);
              nCtx.fillText(thirdAfterBox, thirdBoxX + textObj.width, textY);
            }
          }
        });
        break;
      }

      case "starlight": {
        nCtx.textAlign = "center";
        nCtx.fillStyle = "#FFFFFF";
        nCtx.fillText(props.name, 355, 140);
        props.setBox("starlight");
        break;
      }

      case "strikers": {
        nCtx.textAlign = "center";
        nCtx.fillStyle = "#OOOOOO";
        nCtx.font = `12.5pt ${props.font}`;
        nCtx.fillText(props.name, 285, 152);
        props.setBox("strikers");
        break;
      }
    }
  });

  // Text effect
  createEffect(() => {
    tCtx = textCanvas.getContext("2d")!;
    tCtx.fillStyle = "#FFFFFF";
    props.boxType === "strikers"
      ? (tCtx.font = `13pt ${props.font}`)
      : (tCtx.font = `13pt ${props.font}`);
    tCtx.clearRect(0, 0, 769, 250);

    const coords = findTextCoords[props.boxType] || findTextCoords.normal_small;
    const processedText = props.text.replace(/\[n\]/g, '\n');
    const rows = processedText.split("\n");

    const lineHeight = 20;
    
    rows.forEach((row, index) => {
      if (row) {
        tCtx.fillText(row, coords[0], coords[1] + (lineHeight * index));
      }
    });
  });

  // Portrait effect
  createEffect(() => {
    if (props.char === "None" || !props.char) {
      pCtx = portraitCanvas.getContext("2d")!;
      pCtx.clearRect(0, 0, 769, 250);
    }
  });

  const drawPortrait = (
    charImage: CanvasImageSource,
    portraitXY: number[],
    w: number,
    h: number
  ) => {
    // Initialize portrait canvas and clear current portrait
    pCtx = portraitCanvas.getContext("2d")!;
    pCtx.clearRect(0, 0, 1275 / 2, 500 / 2);

    // Look up draw position for requested portrait and draw new portrait
    let x;
    let y;
    if (props.char !== "None" && props.char in simplePositions) {
      x = portraitXY[0];
      y = portraitXY[1];
    } else {
      const specialPosition = findSpecialPosition(
        props.char,
        props.emote,
        props.costume
      );
      x = specialPosition[0];
      y = specialPosition[1];
    }

    pCtx.drawImage(charImage, x, y, w, h);
    return;
  };

  const drawBox = (boxImage: CanvasImageSource) => {
    bCtx = boxCanvas.getContext("2d")!;
    bCtx.clearRect(0, 0, 769, 250);

    const img = boxImage as HTMLImageElement;
    const width = img.width / 1.5;
    const height = img.height / 1.5;

    switch (props.boxType) {
      case "normal_small": {
        bCtx.drawImage(boxImage, 136, 123 - (height - 125), width, height);
        break;
      }
      case "normal_no_portrait": {
        bCtx.drawImage(boxImage, 130, 40, width, height);
        break;
      }
      case "starlight": {
        bCtx.drawImage(boxImage, 140, 100, width, height);
        break;
      }
      case "strikers": {
        bCtx.drawImage(boxImage, 160, 75, width, height);
        break;
      }
    }
    return;
  };

  return (
    <main class="relative">
      <canvas
        ref={portraitCanvas!}
        id="portraitCanvas"
        width="769"
        height="250"
      />
      <canvas ref={boxCanvas!} id="boxCanvas" width="769" height="250" />
      <canvas ref={tileCanvas!} id="tileCanvas" width="769" height="250" />
      <canvas ref={nameCanvas!} id="nameCanvas" width="769" height="250" />
      <canvas ref={textCanvas!} id="textCanvas" width="769" height="250" />
      <img
        alt="Portrait"
        ref={character!}
        id="portrait"
        class="hidden"
        src={props.portrait}
        crossOrigin="anonymous"
        onLoad={() =>
          props.char !== "None" &&
          props.char in simplePositions &&
          drawPortrait(character, simplePositions[props.char], 250, 250)
        }
      />
      <img
        alt="Dialogue box"
        ref={dialogueBox!}
        id="box"
        class="hidden"
        src={props.box}
        crossOrigin="anonymous"
        onLoad={() => drawBox(dialogueBox)}
      />
    </main>
  );
};

export default ImageCanvas;
