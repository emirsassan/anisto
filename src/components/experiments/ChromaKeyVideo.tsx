import { Component, createEffect, onCleanup, onMount } from "solid-js";

interface ChromaKeyVideoProps {
  src: string;
  colorToRemove?: string; // Hex color code, defaults to green
  similarity?: number; // How similar colors need to be to be removed (0-1)
  smoothness?: number; // Edge smoothness (0-1)
  class?: string;
}

const ChromaKeyVideo: Component<ChromaKeyVideoProps> = (props) => {
  let videoRef: HTMLVideoElement | undefined;
  let canvasRef: HTMLCanvasElement | undefined;
  let animationFrameId: number;

  const processFrame = () => {
    if (!videoRef || !canvasRef) return;

    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    canvasRef.width = videoRef.videoWidth;
    canvasRef.height = videoRef.videoHeight;

    ctx.drawImage(videoRef, 0, 0, canvasRef.width, canvasRef.height);

    const imageData = ctx.getImageData(0, 0, canvasRef.width, canvasRef.height);
    const data = imageData.data;

    const colorToRemove = props.colorToRemove || "#00FF00";
    const r = parseInt(colorToRemove.slice(1, 3), 16);
    const g = parseInt(colorToRemove.slice(3, 5), 16);
    const b = parseInt(colorToRemove.slice(5, 7), 16);

    const similarity = props.similarity || 0.4;
    const smoothness = props.smoothness || 0.1;

    for (let i = 0; i < data.length; i += 4) {
      const pixelR = data[i];
      const pixelG = data[i + 1];
      const pixelB = data[i + 2];

      const diff = Math.sqrt(
        Math.pow((pixelR - r) / 255, 2) +
        Math.pow((pixelG - g) / 255, 2) +
        Math.pow((pixelB - b) / 255, 2)
      );

      let alpha = 1;
      if (diff < similarity) {
        alpha = 0;
      } else if (diff < similarity + smoothness) {
        alpha = (diff - similarity) / smoothness;
      }

      data[i + 3] = Math.round(alpha * 255);
    }

    ctx.putImageData(imageData, 0, 0);

    animationFrameId = requestAnimationFrame(processFrame);
  };

  onMount(() => {
    if (!videoRef) return;

    videoRef.addEventListener('play', () => {
      processFrame();
    });
  });

  createEffect(() => {
    if (videoRef?.played) {
      processFrame();
    }
  });

  onCleanup(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });

  return (
    <div class={props.class}>
      <video
        ref={videoRef}
        src={props.src}
        autoplay
        loop
        muted
        style={{ display: 'none' }}
      />

      <canvas
        ref={canvasRef}
        class="w-full h-full"
      />
    </div>
  );
};

export default ChromaKeyVideo;
