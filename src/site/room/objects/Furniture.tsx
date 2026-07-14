import { Html } from "@react-three/drei";
import { useState } from "react";
import { useSiteStore } from "../../siteStore";
import { CanvasTextPlane } from "../CanvasTextPlane";
import { useRoomStore } from "../roomStore";
import { BOOK_NOTES } from "../bookNotes";
import { RoomObjectLabel } from "../RoomObjectLabel";
import { Orchid } from "./Orchid";
import { PothosPlant } from "./PothosPlant";

/**
 * 家具组：实木书桌（抽屉柜/圆柱腿/横撑）、人体工学椅（软垫/扶手/五星脚滚轮）、
 * 开放书柜（可点击，错落书脊/垂蔓植物）、长边柜（柜门/把手/锥形腿）、
 * 落地灯（底座按钮可开关）、蝴蝶兰、黑板。
 * 台面高度与 DeskComputer / Typewriter / RecordPlayer 的锚点保持一致。
 */

/** 落地灯：底座带圆形开关按钮，点击切换灯光与灯泡亮灭 */
function FloorLamp({ position }: { position: [number, number, number] }) {
  const [on, setOn] = useState(true);
  const [pressed, setPressed] = useState(false);

  const toggle = () => {
    setPressed(true);
    window.setTimeout(() => setPressed(false), 140);
    setOn((v) => !v);
  };

  return (
    <group position={position}>
      {/* 底座整体可点（按钮本身太小，远景不好点中），点击即按下开关 */}
      <group
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
          toggle();
        }}
      >
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.18, 0.04, 20]} />
          <meshStandardMaterial color="#2e2c28" roughness={0.5} />
        </mesh>
        {/* 底座开关按钮：朝房间一侧，亮微光提示可点 */}
        <group position={[0.135, pressed ? 0.042 : 0.052, 0.035]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.034, 0.018, 14]} />
            <meshStandardMaterial color="#454138" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.011, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.012, 14]} />
            <meshStandardMaterial
              color={on ? "#e8a84c" : "#6b6357"}
              emissive={on ? "#e8a84c" : "#000000"}
              emissiveIntensity={on ? 0.6 : 0}
              roughness={0.4}
            />
          </mesh>
        </group>
      </group>
      <mesh position={[0, 0.78, 0]} castShadow>
        <cylinderGeometry args={[0.016, 0.016, 1.5, 10]} />
        <meshStandardMaterial color="#3a3630" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.62, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.19, 0.3, 20, 1, true]} />
        <meshStandardMaterial color="#e8d8b8" roughness={0.65} side={2} />
      </mesh>
      <mesh position={[0, 1.56, 0]}>
        <sphereGeometry args={[0.06, 12, 10]} />
        <meshStandardMaterial
          color={on ? "#ffe1ae" : "#b9ac93"}
          emissive={on ? "#ffe1ae" : "#000000"}
          emissiveIntensity={on ? 1 : 0}
          roughness={0.5}
        />
      </mesh>
      {on ? (
        <>
          <pointLight position={[0, 1.55, 0]} intensity={2.2} color="#ffce8f" distance={5.5} decay={1.6} />
          {/* 灯罩上下溢光 */}
          <pointLight position={[0, 1.95, 0]} intensity={0.6} color="#ffd9a0" distance={2.4} />
        </>
      ) : null}
    </group>
  );
}

export function Furniture() {
  const [hoveredBookKey, setHoveredBookKey] = useState<string | null>(null);
  const dark = useSiteStore((state) => state.theme === "dark");
  const setFocus = useRoomStore((state) => state.setFocus);
  const setHovered = useRoomStore((state) => state.setHovered);
  const openBook = useRoomStore((state) => state.openBook);
  const selectedBookId = useRoomStore((state) => state.selectedBookId);
  const wood = dark ? "#a97e52" : "#b98a5a";
  const woodLight = dark ? "#c09a6b" : "#d0a874";
  const woodDark = dark ? "#5e4a36" : "#6c5640";
  const cabinet = dark ? "#b9a887" : "#cdbb97";
  const cabinetShade = dark ? "#a4936f" : "#bba97f";
  const metal = "#8f8a80";
  const fabric = dark ? "#3c4148" : "#495058";
  const fabricDark = dark ? "#2e3238" : "#3a4046";

  return (
    <group>
      {/* ── 左侧实木书桌（桌面顶 y≈0.88） ── */}
      <group position={[-1.65, 0, -2.18]}>
        <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.45, 0.06, 0.78]} />
          <meshStandardMaterial color={woodLight} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.805, 0.38]} castShadow>
          <boxGeometry args={[2.45, 0.035, 0.03]} />
          <meshStandardMaterial color={wood} roughness={0.5} />
        </mesh>
        {[
          [-1.12, -0.3],
          [1.12, -0.3],
          [-1.12, 0.3],
          [1.12, 0.3]
        ].map(([x, z]) => (
          <mesh key={`${x},${z}`} position={[x, 0.41, z]} castShadow>
            <cylinderGeometry args={[0.032, 0.042, 0.82, 12]} />
            <meshStandardMaterial color={woodDark} roughness={0.55} />
          </mesh>
        ))}
        <mesh position={[0, 0.16, -0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 2.2, 10]} />
          <meshStandardMaterial color={woodDark} roughness={0.55} />
        </mesh>
        {/* 抽屉柜（三层抽屉 + 金属拉手） */}
        <group position={[0.86, 0.4, 0.06]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.52, 0.76, 0.6]} />
            <meshStandardMaterial color={cabinet} roughness={0.6} />
          </mesh>
          {[0.22, 0, -0.22].map((y) => (
            <group key={y} position={[0, y, 0.305]}>
              <mesh>
                <boxGeometry args={[0.46, 0.185, 0.014]} />
                <meshStandardMaterial color={cabinetShade} roughness={0.62} />
              </mesh>
              <mesh position={[0, 0, 0.018]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.008, 0.008, 0.14, 8]} />
                <meshStandardMaterial color={metal} metalness={0.7} roughness={0.3} />
              </mesh>
            </group>
          ))}
        </group>
        {/* 桌面小物：拿铁马克杯（双色釉杯身/圆唇口/咖啡液面拉花/竖直杯耳/圈足）+ 笔记本 + 铅笔 */}
        <group position={[-0.95, 0.94, 0.2]} rotation={[0, -0.5, 0]}>
          {/* 杯身：上宽下收的赭釉 */}
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.042, 0.105, 20]} />
            <meshStandardMaterial color="#c75b39" roughness={0.32} />
          </mesh>
          {/* 下半截浅色挂釉 */}
          <mesh position={[0, -0.026, 0]}>
            <cylinderGeometry args={[0.047, 0.0428, 0.052, 20]} />
            <meshStandardMaterial color="#e9d3b8" roughness={0.5} />
          </mesh>
          {/* 杯口圆唇 */}
          <mesh position={[0, 0.0525, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.0475, 0.0045, 8, 24]} />
            <meshStandardMaterial color="#d46a45" roughness={0.3} />
          </mesh>
          {/* 咖啡液面 + 奶泡拉花心 */}
          <mesh position={[0, 0.049, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.0435, 20]} />
            <meshStandardMaterial color="#3a2418" roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.0495, 0.008]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.7, 1, 1]}>
            <circleGeometry args={[0.016, 14]} />
            <meshStandardMaterial color="#d9b48a" roughness={0.45} />
          </mesh>
          {/* 竖直杯耳（半环开口朝杯身） */}
          <mesh position={[0.054, 0.004, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
            <torusGeometry args={[0.03, 0.0075, 10, 18, Math.PI]} />
            <meshStandardMaterial color="#c75b39" roughness={0.32} />
          </mesh>
          {/* 圈足 */}
          <mesh position={[0, -0.0545, 0]}>
            <cylinderGeometry args={[0.035, 0.037, 0.009, 18]} />
            <meshStandardMaterial color="#a8462b" roughness={0.55} />
          </mesh>
        </group>
        <mesh position={[-0.5, 0.887, 0.26]} rotation={[Math.PI / 2, 0, 0.7]}>
          <cylinderGeometry args={[0.006, 0.006, 0.14, 6]} />
          <meshStandardMaterial color="#d8a13a" roughness={0.55} />
        </mesh>
      </group>

      {/* ── 人体工学椅（转向书桌，离开桌沿避免穿模、错开显示器视线） ── */}
      <group position={[-1.02, 0.5, -1.16]} rotation={[0, Math.PI + 0.3, 0]}>
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.27, 0.29, 0.11, 22]} />
          <meshStandardMaterial color={fabric} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.5, -0.24]} rotation={[-0.14, 0, 0]} castShadow>
          <boxGeometry args={[0.5, 0.66, 0.07]} />
          <meshStandardMaterial color={fabric} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.52, -0.2]} rotation={[-0.14, 0, 0]}>
          <boxGeometry args={[0.4, 0.5, 0.03]} />
          <meshStandardMaterial color={fabricDark} roughness={0.92} />
        </mesh>
        <mesh position={[0, 0.94, -0.3]} rotation={[-0.22, 0, 0]} castShadow>
          <boxGeometry args={[0.34, 0.16, 0.07]} />
          <meshStandardMaterial color={fabricDark} roughness={0.9} />
        </mesh>
        {[-0.29, 0.29].map((x) => (
          <group key={x} position={[x, 0.18, 0]}>
            <mesh position={[0, 0.06, 0]} castShadow>
              <boxGeometry args={[0.06, 0.03, 0.3]} />
              <meshStandardMaterial color="#26282c" roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.05, 0.08]}>
              <boxGeometry args={[0.035, 0.2, 0.035]} />
              <meshStandardMaterial color="#26282c" roughness={0.7} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, -0.22, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.045, 0.44, 14]} />
          <meshStandardMaterial color="#3a3a3c" metalness={0.6} roughness={0.35} />
        </mesh>
        {[0, 72, 144, 216, 288].map((deg) => (
          <group key={deg} rotation={[0, (deg * Math.PI) / 180, 0]}>
            <mesh position={[0.21, -0.42, 0]} rotation={[0, 0, -0.12]} castShadow>
              <boxGeometry args={[0.4, 0.035, 0.05]} />
              <meshStandardMaterial color="#2c2c2e" metalness={0.4} roughness={0.5} />
            </mesh>
            <mesh position={[0.4, -0.46, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 0.03, 14]} />
              <meshStandardMaterial color="#161616" roughness={0.45} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── 左墙开放书柜（可点击；沿墙前移避开书桌左角穿模） ── */}
      <group
        position={[-2.98, 0.95, -0.7]}
        onPointerEnter={(event) => {
          event.stopPropagation();
          setHovered("bookshelf");
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={(event) => {
          event.stopPropagation();
          setHovered(null);
          document.body.style.cursor = "";
        }}
        onClick={(event) => {
          event.stopPropagation();
          setFocus("bookshelf");
        }}
      >
        {/* 背板 */}
        <mesh position={[-0.05, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.04, 1.9, 1.3]} />
          <meshStandardMaterial color={woodDark} roughness={0.65} />
        </mesh>
        {/* 顶板 / 底板 */}
        {[0.935, -0.935].map((y) => (
          <mesh key={y} position={[0.11, y, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.36, 0.04, 1.3]} />
            <meshStandardMaterial color={wood} roughness={0.55} />
          </mesh>
        ))}
        {/* 两侧立板 */}
        {[-0.63, 0.63].map((z) => (
          <mesh key={z} position={[0.11, 0, z]} castShadow receiveShadow>
            <boxGeometry args={[0.36, 1.9, 0.04]} />
            <meshStandardMaterial color={wood} roughness={0.55} />
          </mesh>
        ))}
        {/* 四块隔板（顶层加一层，层高均匀） */}
        {[-0.62, -0.2, 0.22, 0.6].map((y) => (
          <mesh key={y} position={[0.11, y, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.34, 0.032, 1.22]} />
            <meshStandardMaterial color={woodLight} roughness={0.55} />
          </mesh>
        ))}
        {/* 五层书：高低错落、末本倾斜；顶层与底层也排满不留空 */}
        {[
          { y: -0.933, books: [["#405a6e", 0.25], ["#7a5230", 0.22], ["#8a8467", 0.26], ["#4a3550", 0.23], ["#2f4858", 0.25], ["#96552e", 0.21], ["#37503f", 0.24]] as [string, number][], step: 0.15 },
          { y: -0.62, books: [["#8a3b3b", 0.3], ["#2c4a63", 0.34], ["#c8b98f", 0.27], ["#3d5540", 0.32], ["#7a5230", 0.29], ["#333333", 0.33]] as [string, number][] },
          { y: -0.2, books: [["#5c4a72", 0.31], ["#a06636", 0.29], ["#274052", 0.34], ["#8f8467", 0.3], ["#6b3030", 0.32], ["#3d604c", 0.28]] },
          { y: 0.22, books: [["#37503f", 0.3], ["#96552e", 0.33], ["#42394f", 0.28], ["#b3a075", 0.31]] },
          {
            y: 0.6,
            step: 0.135,
            books: [["#7a4a3a", 0.24], ["#2f4858", 0.27], ["#9c8a5f", 0.22], ["#553a4f", 0.26], ["#3f5a44", 0.23], ["#8a3b3b", 0.25], ["#31506b", 0.27], ["#b3a075", 0.24]]
          }
        ].map(({ y, books, step = 0.155 }, shelf) => (
          <group key={shelf} position={[0.13, y + 0.018, 0]}>
            {books.map(([color, h], i) => {
              const note = shelf === 2 ? BOOK_NOTES[i] : undefined;
              const selected = Boolean(note && selectedBookId === note.id);
              const bookKey = `${shelf}-${i}`;
              const glowing = Boolean(note && (selected || hoveredBookKey === bookKey));
              return (
                <group
                  key={i}
                  position={[selected ? 0.08 : 0, (h as number) / 2, -0.46 + i * step]}
                  rotation={[i === books.length - 1 ? 0.16 : (i * 7) % 3 === 0 ? 0.03 : -0.02, 0, 0]}
                  onPointerEnter={note ? (event) => {
                    event.stopPropagation();
                    setHoveredBookKey(bookKey);
                    setHovered("bookshelf");
                    document.body.style.cursor = "pointer";
                  } : undefined}
                  onPointerLeave={note ? (event) => {
                    event.stopPropagation();
                    setHoveredBookKey((current) => current === bookKey ? null : current);
                    setHovered(null);
                    document.body.style.cursor = "";
                  } : undefined}
                  onClick={note ? (event) => {
                    event.stopPropagation();
                    openBook(note.id);
                  } : undefined}
                >
                  <mesh castShadow>
                    <boxGeometry args={[0.16, h as number, 0.085]} />
                    <meshStandardMaterial
                      color={color as string}
                      roughness={0.75}
                      emissive={glowing ? "#dfff8b" : "#000000"}
                      emissiveIntensity={glowing ? 0.58 : 0}
                    />
                  </mesh>
                  {note ? (
                    <>
                      <CanvasTextPlane
                        text={note.title}
                        position={[0.081, 0.025, 0]}
                        rotation={[0, Math.PI / 2, 0]}
                        width={0.074}
                        height={Math.max(0.075, (h as number) * 0.46)}
                        fontSize={160}
                        lineHeight={0.96}
                        color={glowing ? "#f2ffd0" : "#efe4c7"}
                        padding={2}
                        maxLines={4}
                      />
                      <CanvasTextPlane
                        text={note.date.slice(2, 7).replace(".", "/")}
                        position={[0.0815, -(h as number) / 2 + 0.032, 0]}
                        rotation={[0, Math.PI / 2, 0]}
                        width={0.068}
                        height={0.022}
                        fontSize={78}
                        color={glowing ? "#f2ffd0" : "#d8c9a8"}
                        padding={5}
                        maxLines={1}
                      />
                      {hoveredBookKey === bookKey ? (
                        <Html
                          position={[0.24, (h as number) / 2 + 0.11, 0]}
                          center
                          distanceFactor={5}
                          className="book-hover-label-wrap"
                        >
                          <div className="bottle-label book-hover-label">
                            <strong>{note.title}</strong>
                            <span>{note.author}</span>
                          </div>
                        </Html>
                      ) : null}
                    </>
                  ) : null}
                </group>
              );
            })}
          </group>
        ))}
        {/* 顶板上：垂蔓绿萝 */}
        <PothosPlant position={[0.11, 0.955, 0.3]} />
        <RoomObjectLabel id="bookshelf" position={[0.35, 1.15, 0]} />
      </group>

      {/* ── 右侧长边柜（台面顶 y≈0.73） ── */}
      <group position={[1.45, 0.42, -2.05]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.85, 0.56, 0.72]} />
          <meshStandardMaterial color={cabinet} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.295, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.92, 0.035, 0.78]} />
          <meshStandardMaterial color={woodLight} roughness={0.45} />
        </mesh>
        {/* 三扇柜门 + 竖木条纹理 + 圆把手 */}
        {[-0.93, 0, 0.93].map((x) => (
          <group key={x} position={[x, -0.01, 0.365]}>
            <mesh>
              <boxGeometry args={[0.86, 0.46, 0.018]} />
              <meshStandardMaterial color={cabinetShade} roughness={0.62} />
            </mesh>
            {[-0.3, -0.15, 0, 0.15, 0.3].map((lx) => (
              <mesh key={lx} position={[lx, 0, 0.012]}>
                <boxGeometry args={[0.012, 0.42, 0.008]} />
                <meshStandardMaterial color={dark ? "#96865f" : "#ab9a70"} roughness={0.68} />
              </mesh>
            ))}
            <mesh position={[0.36, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.02, 14]} />
              <meshStandardMaterial color={metal} metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        ))}
        {[
          [-1.3, -0.32],
          [1.3, -0.32],
          [-1.3, 0.32],
          [1.3, 0.32]
        ].map(([x, z]) => (
          <mesh key={`${x},${z}`} position={[x, -0.36, z]} castShadow>
            <cylinderGeometry args={[0.018, 0.03, 0.16, 10]} />
            <meshStandardMaterial color={woodDark} roughness={0.5} />
          </mesh>
        ))}
        {/* 台面上：相框 + 一摞书 */}
        <group position={[-0.85, 0.42, -0.1]} rotation={[0, 0.3, -0.06]}>
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.17, 0.015]} />
            <meshStandardMaterial color={woodDark} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.009]}>
            <planeGeometry args={[0.18, 0.13]} />
            <meshStandardMaterial color="#dce4ea" roughness={0.4} />
          </mesh>
        </group>
        {["#6b3030", "#2c4a63", "#c8b98f"].map((color, i) => (
          <mesh key={i} position={[-0.42, 0.335 + i * 0.038, 0.05]} rotation={[0, i * 0.14 - 0.1, 0]} castShadow>
            <boxGeometry args={[0.24, 0.036, 0.17]} />
            <meshStandardMaterial color={color} roughness={0.75} />
          </mesh>
        ))}
      </group>

      {/* ── 右前角：蝴蝶兰盆栽（收进画面内） ── */}
      <Orchid position={[2.3, 0, 0.3]} />

      {/* ── 左前角：落地灯（底座按钮开关暖光） ── */}
      <FloorLamp position={[-2.75, 0, 1.9]} />

      {/* ── 左墙黑板（未来的愿景板，可点击放大细看；随书柜一起沿墙前移） ── */}
      <group
        position={[-3.17, 2.1, 1.0]}
        rotation={[0, Math.PI / 2, 0]}
        onPointerEnter={(event) => {
          event.stopPropagation();
          setHovered("blackboard");
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={(event) => {
          event.stopPropagation();
          setHovered(null);
          document.body.style.cursor = "";
        }}
        onClick={(event) => {
          event.stopPropagation();
          setFocus("blackboard");
        }}
      >
        {/* 木框 */}
        <mesh castShadow>
          <boxGeometry args={[1.34, 0.94, 0.04]} />
          <meshStandardMaterial color={wood} roughness={0.55} />
        </mesh>
        {/* 板面：墨绿磨砂 */}
        <mesh position={[0, 0.015, 0.023]}>
          <planeGeometry args={[1.2, 0.78]} />
          <meshStandardMaterial color={dark ? "#25352d" : "#2b3d33"} roughness={0.95} />
        </mesh>
        {/* 板面粉笔痕迹：淡淡的擦痕 + 一行小字位 */}
        {[[-0.32, 0.2, 0.5, 0.03], [0.18, 0.05, 0.34, 0.025], [-0.1, -0.18, 0.42, 0.028]].map(([x, y, w, h], i) => (
          <mesh key={i} position={[x, y + 0.015, 0.027]} rotation={[0, 0, i === 1 ? -0.04 : 0.02]}>
            <planeGeometry args={[w, h]} />
            <meshBasicMaterial color="#dfe5dc" transparent opacity={0.16} />
          </mesh>
        ))}
        {/* 底部粉笔槽 + 两支粉笔 + 板擦 */}
        <mesh position={[0, -0.485, 0.05]} castShadow>
          <boxGeometry args={[1.0, 0.03, 0.07]} />
          <meshStandardMaterial color={woodDark} roughness={0.6} />
        </mesh>
        {[
          { x: -0.22, color: "#f2efe6" },
          { x: -0.1, color: "#e8b7b0" }
        ].map(({ x, color }) => (
          <mesh key={x} position={[x, -0.462, 0.05]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 0.07, 8]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
        ))}
        <mesh position={[0.28, -0.452, 0.05]} castShadow>
          <boxGeometry args={[0.11, 0.028, 0.05]} />
          <meshStandardMaterial color="#494540" roughness={0.85} />
        </mesh>
        <RoomObjectLabel id="blackboard" position={[0, -0.75, 0.3]} />
      </group>
    </group>
  );
}
