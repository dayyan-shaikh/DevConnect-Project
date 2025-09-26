"use client";
import { cn } from "../../lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { SparklesCore } from "./sparkles";

// Animated Background Component
export const AnimatedBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [180, 360, 180],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// Sparkles Background Component
export const SparklesBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sparkles */}
      <div className="absolute inset-0">
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>
      
      {/* Gradients */}
      <div className="absolute inset-0">
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-1/4" />
      </div>
      
      {/* Radial Gradient to prevent sharp edges */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
      
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// Floating Card Component
export const FloatingCard = ({ 
  children, 
  className,
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      className={cn("bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20", className)}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{
        y: -5,
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
    >
      {children}
    </motion.div>
  );
};

// Modal Components
export const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  className = "" 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode;
  className?: string;
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-transparent backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <motion.div
        className={`relative backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-md w-full ${className}`}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export const ModalHeader = ({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`p-6 border-b border-gray-200/20 ${className}`}>
      {children}
    </div>
  );
};

export const ModalBody = ({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};

export const ModalFooter = ({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`p-6 border-t border-gray-200/20 flex gap-3 justify-end ${className}`}>
      {children}
    </div>
  );
};

// Updated Animated Input Component for dark backgrounds
export const AnimatedInput = ({ 
  label, 
  icon: Icon, 
  ...props 
}: { 
  label: string; 
  icon?: React.ComponentType<{ className?: string }>;
} & React.InputHTMLAttributes<HTMLInputElement>) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  return (
    <div className="relative">
      <motion.div
        className="relative"
        initial={false}
        animate={{ scale: isFocused ? 1.02 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          {...props}
          className={cn(
            "w-full px-4 py-3 border-2 rounded-xl transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
            "bg-white/10 backdrop-blur-sm text-white placeholder-gray-400",
            "border-gray-600/50 focus:border-blue-500",
            Icon ? "pl-10" : "",
            isFocused ? "border-blue-500" : "",
            hasValue ? "border-blue-400" : "",
            props.className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => {
            setHasValue(e.target.value.length > 0);
            props.onChange?.(e);
          }}
        />
      </motion.div>
      <motion.label
        className={cn(
          "absolute left-3 top-3 text-sm transition-all duration-200 pointer-events-none",
          Icon ? "left-10" : "",
          isFocused || hasValue ? "text-blue-400 scale-75 -translate-y-2" : "text-gray-400"
        )}
        initial={false}
        animate={{
          y: isFocused || hasValue ? -8 : 0,
          scale: isFocused || hasValue ? 0.75 : 1,
        }}
      >
        {label}
      </motion.label>
    </div>
  );
};

// Animated Button Component
export const AnimatedButton = ({ 
  children, 
  className, 
  variant = "default",
  onClick,
  disabled,
  type,
  ...props 
}: { 
  children: React.ReactNode; 
  className?: string;
  variant?: "default" | "secondary" | "ghost";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) => {
  const baseClasses = "px-6 py-3 rounded-xl font-medium transition-all duration-200 transform";
  
  const variants = {
    default: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600",
    ghost: "bg-transparent hover:bg-white/20 text-gray-600 hover:text-gray-900"
  };

  return (
    <motion.button
      className={cn(baseClasses, variants[variant], className)}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </motion.button>
  );
};

// Animated Todo Item Component
export const AnimatedTodoItem = ({ 
  todo, 
  onToggle, 
  onDelete, 
  onEdit, 
  isEditing, 
  editValue, 
  onEditChange, 
  onSaveEdit, 
  onCancelEdit, 
  textClassName 
}: {
  todo: any;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  isEditing: boolean;
  editValue: string;
  onEditChange: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  textClassName?: string;
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-4 hover:bg-white/50 rounded-xl transition-colors duration-200"
    >
      {isEditing ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSaveEdit()}
            className="flex-1 px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <AnimatedButton onClick={onSaveEdit} className="px-3 py-2">
            Save
          </AnimatedButton>
          <AnimatedButton variant="secondary" onClick={onCancelEdit} className="px-3 py-2">
            Cancel
          </AnimatedButton>
        </motion.div>
      ) : (
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            className="flex-shrink-0"
          >
            {todo.is_done ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            ) : (
              <div className="w-6 h-6 border-2 border-gray-300 rounded-full hover:border-blue-500 transition-colors" />
            )}
          </motion.button>
          
          <motion.span
            className={cn(
              "flex-1",
              todo.is_done ? "line-through" : undefined,
              textClassName ? textClassName : (todo.is_done ? "text-gray-500" : "text-gray-900")
            )}
            initial={false}
            animate={{ opacity: todo.is_done ? 0.6 : 1 }}
          >
            {todo.title}
          </motion.span>
          
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onEdit}
              className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDelete}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Loading Spinner Component
export const LoadingSpinner = () => {
  return (
    <motion.div
      className="flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
};

// Animated Icon Component
export const AnimatedIcon = ({ 
  icon: Icon, 
  className,
  delay = 0 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      className="flex items-center justify-center"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay,
      }}
    >
      <Icon className={className} />
    </motion.div>
  );
};
