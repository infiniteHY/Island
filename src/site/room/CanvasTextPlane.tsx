import { useEffect, useMemo } from "react";
import * as THREE from "three";

type CanvasTextPlaneProps = {
  text: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  width: number;
  height: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: "normal" | "italic";
  fontSize?: number;
  lineHeight?: number;
  align?: CanvasTextAlign;
  verticalAlign?: "top" | "middle";
  padding?: number;
  maxLines?: number;
  wrap?: boolean;
};

const BASE_CANVAS_WIDTH = 512;
const TEXTURE_SCALE = 2;
const CANVAS_WIDTH = BASE_CANVAS_WIDTH * TEXTURE_SCALE;

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (!paragraph) {
      lines.push("");
      continue;
    }

    let line = "";
    for (const character of Array.from(paragraph)) {
      const next = line + character;
      if (line && context.measureText(next).width > maxWidth) {
        lines.push(line.trimEnd());
        line = character.trimStart();
      } else {
        line = next;
      }
    }
    if (line) lines.push(line.trimEnd());
  }
  return lines;
}

/**
 * 使用浏览器本机字体绘制 3D 标签，不发起任何远程字体请求。
 * 适用于中英文书名、设备铭牌和用户输入文字。
 */
export function CanvasTextPlane({
  text,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width,
  height,
  color = "#ffffff",
  fontFamily = '"Inspire Mono", "PingFang SC", "Microsoft YaHei", sans-serif',
  fontWeight = 600,
  fontStyle = "normal",
  fontSize = 54,
  lineHeight = 1.18,
  align = "center",
  verticalAlign = "middle",
  padding = 18,
  maxLines,
  wrap = true
}: CanvasTextPlaneProps) {
  const texture = useMemo(() => {
    const aspect = Math.max(0.2, width / height);
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = Math.max(128, Math.min(2048, Math.round(CANVAS_WIDTH / aspect)));

    const context = canvas.getContext("2d");
    if (!context) return null;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.fillStyle = color;
    context.textAlign = align;
    context.textBaseline = "middle";
    const scaledFontSize = fontSize * TEXTURE_SCALE;
    const scaledPadding = padding * TEXTURE_SCALE;
    context.font = `${fontStyle} ${fontWeight} ${scaledFontSize}px ${fontFamily}`;

    const wrapped = wrap ? wrapText(context, text, canvas.width - scaledPadding * 2) : text.split("\n");
    const visibleLines = maxLines ? wrapped.slice(0, maxLines) : wrapped;
    const linePixels = scaledFontSize * lineHeight;
    const blockHeight = visibleLines.length * linePixels;
    const startY = verticalAlign === "top" ? scaledPadding + linePixels / 2 : (canvas.height - blockHeight) / 2 + linePixels / 2;
    const x = align === "left" ? scaledPadding : align === "right" ? canvas.width - scaledPadding : canvas.width / 2;

    visibleLines.forEach((line, index) => {
      context.fillText(line, x, startY + index * linePixels);
    });

    const nextTexture = new THREE.CanvasTexture(canvas);
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.minFilter = THREE.LinearMipmapLinearFilter;
    nextTexture.magFilter = THREE.LinearFilter;
    nextTexture.generateMipmaps = true;
    nextTexture.anisotropy = 8;
    return nextTexture;
  }, [align, color, fontFamily, fontSize, fontStyle, fontWeight, height, lineHeight, maxLines, padding, text, verticalAlign, width, wrap]);

  useEffect(() => () => texture?.dispose(), [texture]);

  if (!texture) return null;

  return (
    <mesh position={position} rotation={rotation} renderOrder={4}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.025} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}
