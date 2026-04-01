import { motion } from "motion/react";

export default function MinimalLoader() {
  return (
    <motion.div
      className="flex items-center justify-center h-screen bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="w-10 h-10 border-4 border-black border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 0.9
        }}
      />
    </motion.div>
  );
}