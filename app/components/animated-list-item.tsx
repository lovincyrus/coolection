import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedListItemProps {
  children: ReactNode;
}

const transition = {
  type: "spring" as const,
  duration: 0.25,
  bounce: 0,
  opacity: { duration: 0.15 },
};

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children,
}) => {
  return (
    <motion.div
      className="relative"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
};
