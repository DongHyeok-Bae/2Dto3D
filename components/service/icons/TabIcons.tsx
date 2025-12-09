'use client'

import { motion } from 'framer-motion'

interface IconProps {
  className?: string
  isActive?: boolean
}

// Blueprint Upload Icon - Grid + Arrow combination
export function BlueprintUploadIcon({ className = '', isActive = false }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Blueprint Grid */}
      <motion.rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray={isActive ? "0" : "3 2"}
        initial={false}
        animate={{ strokeDashoffset: isActive ? 0 : [0, -10] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      {/* Horizontal grid lines */}
      <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <line x1="3" y1="15" x2="21" y2="15" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      {/* Vertical grid lines */}
      <line x1="9" y1="3" x2="9" y2="21" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <line x1="15" y1="3" x2="15" y2="21" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      {/* Upload arrow */}
      <motion.g
        initial={false}
        animate={isActive ? { y: [0, -2, 0] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <path
          d="M12 16V8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8 11L12 7L16 11"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </svg>
  )
}

// Neural Network Icon - Connected nodes
export function NeuralNetworkIcon({ className = '', isActive = false }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Connection lines */}
      <motion.g
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.6"
        initial={false}
        animate={isActive ? { opacity: [0.4, 0.8, 0.4] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {/* Left to center connections */}
        <line x1="5" y1="6" x2="12" y2="9" />
        <line x1="5" y1="12" x2="12" y2="9" />
        <line x1="5" y1="12" x2="12" y2="15" />
        <line x1="5" y1="18" x2="12" y2="15" />
        {/* Center to right connections */}
        <line x1="12" y1="9" x2="19" y2="8" />
        <line x1="12" y1="9" x2="19" y2="12" />
        <line x1="12" y1="15" x2="19" y2="12" />
        <line x1="12" y1="15" x2="19" y2="16" />
      </motion.g>

      {/* Input layer nodes (left) */}
      <motion.circle
        cx="5" cy="6" r="2"
        fill="currentColor"
        initial={false}
        animate={isActive ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
      />
      <motion.circle
        cx="5" cy="12" r="2"
        fill="currentColor"
        initial={false}
        animate={isActive ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity, delay: 0.1 }}
      />
      <motion.circle
        cx="5" cy="18" r="2"
        fill="currentColor"
        initial={false}
        animate={isActive ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
      />

      {/* Hidden layer nodes (center) */}
      <motion.circle
        cx="12" cy="9" r="2.5"
        fill="currentColor"
        initial={false}
        animate={isActive ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
      />
      <motion.circle
        cx="12" cy="15" r="2.5"
        fill="currentColor"
        initial={false}
        animate={isActive ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
      />

      {/* Output layer nodes (right) */}
      <motion.circle
        cx="19" cy="8" r="2"
        fill="currentColor"
        initial={false}
        animate={isActive ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
      />
      <motion.circle
        cx="19" cy="12" r="2"
        fill="currentColor"
        initial={false}
        animate={isActive ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
      />
      <motion.circle
        cx="19" cy="16" r="2"
        fill="currentColor"
        initial={false}
        animate={isActive ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity, delay: 0.7 }}
      />
    </svg>
  )
}

// Data Layers Icon - Stacked layers
export function DataLayersIcon({ className = '', isActive = false }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bottom layer */}
      <motion.path
        d="M3 17L12 21L21 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={isActive ? { y: [0, 1, 0] } : {}}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
      />
      {/* Middle layer */}
      <motion.path
        d="M3 12L12 16L21 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={isActive ? { y: [0, 1, 0] } : {}}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
      />
      {/* Top layer */}
      <motion.path
        d="M3 7L12 11L21 7L12 3L3 7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
        initial={false}
        animate={isActive ? { y: [0, 1, 0] } : {}}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
      />
      {/* Data dots */}
      {isActive && (
        <>
          <motion.circle
            cx="12" cy="7"
            r="1"
            fill="currentColor"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0], y: [0, 4, 8] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
          />
          <motion.circle
            cx="9" cy="8"
            r="0.75"
            fill="currentColor"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0], y: [0, 4, 8] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />
          <motion.circle
            cx="15" cy="8"
            r="0.75"
            fill="currentColor"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0], y: [0, 4, 8] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
          />
        </>
      )}
    </svg>
  )
}

// Isometric Cube Icon - 3D building representation
export function IsometricCubeIcon({ className = '', isActive = false }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.g
        initial={false}
        animate={isActive ? { rotateY: [0, 5, -5, 0] } : {}}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ transformOrigin: 'center' }}
      >
        {/* Main cube - top face */}
        <motion.path
          d="M12 2L21 7L12 12L3 7L12 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity={isActive ? 0.2 : 0.1}
          initial={false}
          animate={isActive ? { fillOpacity: [0.1, 0.3, 0.1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {/* Left face */}
        <path
          d="M3 7L3 17L12 22L12 12L3 7Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.05"
        />
        {/* Right face */}
        <path
          d="M21 7L21 17L12 22L12 12L21 7Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.15"
        />

        {/* Inner structure lines */}
        <motion.g
          stroke="currentColor"
          strokeWidth="0.75"
          opacity="0.5"
          initial={false}
          animate={isActive ? { opacity: [0.3, 0.7, 0.3] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {/* Floor divisions */}
          <line x1="7.5" y1="9.5" x2="7.5" y2="14.5" />
          <line x1="16.5" y1="9.5" x2="16.5" y2="14.5" />
          {/* Window-like details */}
          <rect x="5" y="10" width="2" height="2" fill="currentColor" fillOpacity="0.3" />
          <rect x="17" y="10" width="2" height="2" fill="currentColor" fillOpacity="0.3" />
        </motion.g>
      </motion.g>

      {/* Floating corner markers for 3D effect */}
      {isActive && (
        <>
          <motion.circle
            cx="12" cy="2"
            r="1"
            fill="currentColor"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.circle
            cx="3" cy="7"
            r="0.75"
            fill="currentColor"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />
          <motion.circle
            cx="21" cy="7"
            r="0.75"
            fill="currentColor"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
          />
        </>
      )}
    </svg>
  )
}

// Export all icons as a map for easy access
export const TabIcons = {
  upload: BlueprintUploadIcon,
  pipeline: NeuralNetworkIcon,
  results: DataLayersIcon,
  '3d': IsometricCubeIcon,
} as const

export type TabIconType = keyof typeof TabIcons
