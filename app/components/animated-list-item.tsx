import { motion } from "framer-motion";
import { nanoid } from "nanoid";
import { ReactNode } from "react";

const base = 1;
const timeMultiplier = (duration: number) => duration * base;

interface AnimatedListItemProps {
  children: ReactNode;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children,
}) => {
  return (
    <motion.div
      key={nanoid()}
      className="relative"
      initial={{ height: 0, opacity: 0 }}
      animate={{
        height: "auto",
        opacity: 1,
        transition: {
          type: "spring",
          bounce: 0.3,
          opacity: { delay: timeMultiplier(0.025) },
        },
      }}
      exit={{ height: 0, opacity: 0 }}
      transition={{
        duration: timeMultiplier(0.15),
        type: "spring",
        bounce: 0,
        opacity: { duration: timeMultiplier(0.03) },
      }}
    >
      {children}
    </motion.div>
  );
};
