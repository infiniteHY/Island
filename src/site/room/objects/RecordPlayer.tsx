import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CanvasTextPlane } from "../CanvasTextPlane";
import { useRoomStore } from "../roomStore";
import { RoomObjectLabel } from "../RoomObjectLabel";

/** 网易云外链直出音频：Mila J - Kickin' Back（id 474484015） */
const SONG_URL = "https://music.163.com/song/media/outer/url?id=3370310523.mp3";

/**
 * 黑胶唱机：木纹底座、缓冲脚垫、转盘（黑胶纹路/标签/中轴）、
 * 可摆动唱臂（配重/弯头/唱头）、START / STOP 两个按钮。
 * START 后经由网易云外链真实播放歌曲，与唱臂落下/唱片起转同步。
 * 放在长边柜台面（y≈0.73）上。
 */
export function RecordPlayer({ reducedMotion }: { reducedMotion: boolean }) {
  const labelTexture = useTexture("/textures/music.jpg");
  labelTexture.colorSpace = THREE.SRGBColorSpace;
  labelTexture.anisotropy = 8;
  const discRef = useRef<THREE.Group>(null);
  const armRef = useRef<THREE.Group>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const setFocus = useRoomStore((state) => state.setFocus);
  const setHovered = useRoomStore((state) => state.setHovered);
  const [playing, setPlaying] = useState(false);
  /** 处于按下状态的按钮（做按压下沉动画） */
  const [pressed, setPressed] = useState<"start" | "stop" | null>(null);

  // 歌曲播放与 playing 同步：START 起播（延迟到唱臂落下的时长），STOP 暂停。
  // 音频元素在首次 START 时创建（此时已有用户手势，能通过自动播放限制）。
  useEffect(() => {
    if (playing) {
      if (!audioRef.current) {
        const audio = new Audio(SONG_URL);
        audio.loop = true;
        audio.volume = 0.55;
        audioRef.current = audio;
      }
      // 唱臂摆到唱片上方大约需要 1s，音乐随唱针落下响起
      const delay = reducedMotion ? 0 : 1000;
      const timer = window.setTimeout(() => {
        audioRef.current?.play().catch(() => {
          /* 外链偶发 403/网络失败时静默降级，只保留动画 */
        });
      }, delay);
      return () => window.clearTimeout(timer);
    }
    audioRef.current?.pause();
    return undefined;
  }, [playing, reducedMotion]);

  // 卸载时停止并释放音频
  useEffect(
    () => () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    },
    []
  );

  const ARM_REST = -0.2;
  const ARM_PLAY = -0.55;
  /** 唱片当前转速（rad/s），起转/停转都做平滑过渡 */
  const spinSpeedRef = useRef(0);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    if (armRef.current) {
      // 唱臂先摆：播放时匀速摆向唱片，停止时摆回臂架
      const want = playing ? ARM_PLAY : ARM_REST;
      armRef.current.rotation.y += (want - armRef.current.rotation.y) * Math.min(1, delta * 2.4);
    }
    // 唱头落到唱片上方（接近播放角）之后，唱片才开始起转
    const armDown = armRef.current ? Math.abs(armRef.current.rotation.y - ARM_PLAY) < 0.045 : false;
    const targetSpeed = playing && armDown ? 2.2 : 0;
    spinSpeedRef.current += (targetSpeed - spinSpeedRef.current) * Math.min(1, delta * 3);
    if (discRef.current && spinSpeedRef.current > 0.01) {
      discRef.current.rotation.y += delta * spinSpeedRef.current;
    }
  });

  const pressButton = (id: "start" | "stop") => {
    setPressed(id);
    window.setTimeout(() => setPressed(null), 140);
    setPlaying(id === "start");
  };

  return (
    <group
      position={[2.18, 0.73, -1.98]}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHovered("vinyl");
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();
        setHovered(null);
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        event.stopPropagation();
        setFocus("vinyl");
      }}
    >
      {/* 木质底座 + 上沿倒角 + 四个缓冲脚 */}
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.92, 0.1, 0.68]} />
        <meshStandardMaterial color="#7a5136" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.115, 0]}>
        <boxGeometry args={[0.94, 0.012, 0.7]} />
        <meshStandardMaterial color="#8a5f3d" roughness={0.45} />
      </mesh>
      {[
        [-0.4, -0.28],
        [0.4, -0.28],
        [-0.4, 0.28],
        [0.4, 0.28]
      ].map(([x, z]) => (
        <mesh key={`${x},${z}`} position={[x, 0.005, z]}>
          <cylinderGeometry args={[0.03, 0.035, 0.02, 12]} />
          <meshStandardMaterial color="#241f1a" roughness={0.6} />
        </mesh>
      ))}

      {/* 转盘组：金属盘 + 黑胶 + 纹路 + 标签 + 中轴 */}
      <group position={[-0.16, 0.13, 0]}>
        <mesh>
          <cylinderGeometry args={[0.27, 0.27, 0.02, 40]} />
          <meshStandardMaterial color="#5c5c60" metalness={0.6} roughness={0.35} />
        </mesh>
        <group ref={discRef} position={[0, 0.02, 0]}>
          <mesh>
            <cylinderGeometry args={[0.25, 0.25, 0.012, 48]} />
            <meshStandardMaterial color="#0e0e10" roughness={0.32} />
          </mesh>
          {/* 唱片沟槽（细环） */}
          {[0.22, 0.19, 0.16, 0.13].map((r) => (
            <mesh key={r} position={[0, 0.007, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[r - 0.002, r, 48]} />
              <meshStandardMaterial color="#26262a" roughness={0.4} side={2} />
            </mesh>
          ))}
          {/* 中心标签：music.jpg 圆形裁切，随唱片一起旋转 */}
          <mesh position={[0, 0.008, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.004, 40]} />
            <meshStandardMaterial color="#050506" roughness={0.42} />
          </mesh>
          <mesh position={[0, 0.011, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.098, 48]} />
            <meshBasicMaterial map={labelTexture} toneMapped={false} />
          </mesh>
          {/* 盘面高光反条（非对称扇形，随盘扫过更显转动） */}
          <mesh position={[0, 0.0075, 0]} rotation={[-Math.PI / 2, 0, 0.9]}>
            <ringGeometry args={[0.1, 0.24, 24, 1, 0, 0.5]} />
            <meshBasicMaterial color="#3a3a42" transparent opacity={0.5} side={2} />
          </mesh>
          <mesh position={[0, 0.012, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.02, 10]} />
            <meshStandardMaterial color="#c9c2b2" metalness={0.7} roughness={0.25} />
          </mesh>
        </group>
      </group>

      {/* 唱臂组：轴座 + 配重 + 臂杆 + 弯头唱头（播放时摆到唱片上方） */}
      <group ref={armRef} position={[0.3, 0.14, -0.2]} rotation={[0, -0.2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.045, 0.05, 0.06, 16]} />
          <meshStandardMaterial color="#3b3b3e" metalness={0.5} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.02, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.028, 0.028, 0.06, 12]} />
          <meshStandardMaterial color="#22221f" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.035, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.36, 10]} />
          <meshStandardMaterial color="#d7d1bd" metalness={0.6} roughness={0.25} />
        </mesh>
        <mesh position={[-0.02, 0.02, 0.36]} rotation={[0.3, 0.4, 0]}>
          <boxGeometry args={[0.035, 0.03, 0.07]} />
          <meshStandardMaterial color="#1d1b18" roughness={0.5} />
        </mesh>
      </group>

      {/* START / STOP 两个按钮 */}
      {(
        [
          { id: "start" as const, x: 0.24, color: "#3d5540", lit: playing },
          { id: "stop" as const, x: 0.4, color: "#6b3030", lit: !playing }
        ]
      ).map(({ id, x, color, lit }) => {
        const down = pressed === id;
        return (
          <group key={id} position={[x, down ? 0.118 : 0.128, 0.24]}>
            <mesh
              onPointerEnter={(event) => {
                event.stopPropagation();
                document.body.style.cursor = "pointer";
              }}
              onPointerLeave={(event) => {
                event.stopPropagation();
                document.body.style.cursor = "";
              }}
              onClick={(event) => {
                event.stopPropagation();
                pressButton(id);
              }}
              castShadow
            >
              <boxGeometry args={[0.11, 0.025, 0.06]} />
              <meshStandardMaterial
                color={color}
                roughness={0.45}
                emissive={color}
                emissiveIntensity={lit ? 0.35 : 0}
              />
            </mesh>
            <CanvasTextPlane
              text={id.toUpperCase()}
              position={[0, 0.014, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              width={0.095}
              height={0.024}
              fontSize={78}
              fontWeight={700}
              color="#efe7d2"
              padding={4}
              maxLines={1}
            />
          </group>
        );
      })}

      <RoomObjectLabel id="vinyl" position={[0, 0.55, 0]} />
    </group>
  );
}
