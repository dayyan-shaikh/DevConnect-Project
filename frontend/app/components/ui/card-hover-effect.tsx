"use client";

import { cn } from "~/lib/utils";
import { motion } from "framer-motion";

export const CardHoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string;
    description: string;
  }[];
  className?: string;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, idx) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
          className={cn(
            "p-6 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300",
            className
          )}
        >
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
            {item.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {item.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
};
