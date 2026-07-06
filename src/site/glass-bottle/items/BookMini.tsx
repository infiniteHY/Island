import type { MiniProps } from "./BassMini";

const pageLines = [-0.115, -0.085, -0.055, -0.025, 0.005, 0.035, 0.065, 0.095];

export function BookMini({ item, active }: MiniProps) {
  return (
    <group rotation={[0.2, -0.38, 0.18]} position={[0, 0, 0]}>
      <mesh position={[0.012, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.36, 0.092]} />
        <meshStandardMaterial color="#f1e7d2" roughness={0.76} />
      </mesh>

      <mesh position={[0, 0, 0.054]} castShadow>
        <boxGeometry args={[0.525, 0.382, 0.026]} />
        <meshStandardMaterial
          color={item.body}
          roughness={0.54}
          emissive={active ? item.accent : "#000000"}
          emissiveIntensity={active ? 0.08 : 0}
        />
      </mesh>

      <mesh position={[0, 0, -0.054]} receiveShadow>
        <boxGeometry args={[0.512, 0.372, 0.016]} />
        <meshStandardMaterial color="#4f2328" roughness={0.62} />
      </mesh>

      <mesh position={[-0.274, 0, 0.008]} castShadow>
        <boxGeometry args={[0.052, 0.392, 0.136]} />
        <meshStandardMaterial color="#3f1b22" roughness={0.58} />
      </mesh>

      <mesh position={[-0.246, 0, 0.074]} castShadow>
        <boxGeometry args={[0.018, 0.36, 0.025]} />
        <meshStandardMaterial color="#241116" roughness={0.64} />
      </mesh>

      <mesh position={[0.286, 0, 0.004]}>
        <boxGeometry args={[0.024, 0.322, 0.086]} />
        <meshStandardMaterial color="#e7d9bf" roughness={0.8} />
      </mesh>

      {pageLines.map((y) => (
        <mesh key={y} position={[0.3, y, 0.052]}>
          <boxGeometry args={[0.004, 0.012, 0.0028]} />
          <meshStandardMaterial color="#bba98d" roughness={0.78} />
        </mesh>
      ))}

      <mesh position={[0.015, 0.192, 0.001]}>
        <boxGeometry args={[0.455, 0.016, 0.078]} />
        <meshStandardMaterial color="#e7d9bf" roughness={0.8} />
      </mesh>

      <mesh position={[0.015, -0.192, 0.001]}>
        <boxGeometry args={[0.455, 0.016, 0.078]} />
        <meshStandardMaterial color="#e7d9bf" roughness={0.8} />
      </mesh>

      <mesh position={[0.05, 0, 0.071]}>
        <boxGeometry args={[0.22, 0.012, 0.006]} />
        <meshStandardMaterial color={item.accent} roughness={0.52} />
      </mesh>

      <mesh position={[0.13, -0.06, 0.073]}>
        <boxGeometry args={[0.07, 0.11, 0.005]} />
        <meshStandardMaterial color="#2f151a" roughness={0.6} />
      </mesh>

      <mesh position={[0.12, 0.01, 0.077]}>
        <boxGeometry args={[0.018, 0.24, 0.004]} />
        <meshStandardMaterial color="#c43737" roughness={0.46} />
      </mesh>
    </group>
  );
}
