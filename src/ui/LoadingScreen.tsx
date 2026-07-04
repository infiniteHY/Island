import { motion } from "motion/react";

type LoadingScreenProps = {
  progress: number;
};

export function LoadingScreen({ progress }: LoadingScreenProps) {
  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="loading-mark" />
      <p>世界加载中</p>
      <div className="loading-track">
        <span style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </motion.div>
  );
}
