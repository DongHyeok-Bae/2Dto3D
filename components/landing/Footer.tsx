'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { MiniLaurel } from './LaurelFrame'
import { ConstellationField } from './ParticleField'

// Animated link with expanding underline
function AnimatedLink({
  href,
  children,
  external = false,
}: {
  href: string
  children: React.ReactNode
  external?: boolean
}) {
  const LinkComponent = external ? 'a' : Link

  return (
    <LinkComponent
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="relative group text-white/60 hover:text-primary-gold transition-colors text-sm flex items-center gap-2"
    >
      {/* Animated bullet */}
      <motion.span
        className="w-1.5 h-1.5 bg-primary-gold rounded-full"
        whileHover={{ scale: 1.5 }}
        transition={{ type: 'spring', stiffness: 300 }}
      />

      {/* Text with underline effect */}
      <span className="relative">
        {children}
        <motion.span
          className="absolute bottom-0 left-0 h-px bg-primary-gold origin-left"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
          style={{ width: '100%' }}
        />
      </span>

      {/* External link indicator */}
      {external && (
        <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )}
    </LinkComponent>
  )
}

// Animated corner marker
function CornerMarker({
  position,
}: {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}) {
  const positionClasses = {
    'top-left': 'left-4 md:left-8 top-0 border-t border-l',
    'top-right': 'right-4 md:right-8 top-0 border-t border-r',
    'bottom-left': 'left-4 md:left-8 bottom-0 border-b border-l',
    'bottom-right': 'right-4 md:right-8 bottom-0 border-b border-r',
  }

  return (
    <motion.div
      className={`absolute w-4 h-4 border-primary-gold/50 ${positionClasses[position]}`}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Pulsing dot */}
      <motion.div
        className={`absolute w-1.5 h-1.5 bg-primary-gold rounded-full ${
          position.includes('top') ? '-top-0.5' : '-bottom-0.5'
        } ${position.includes('left') ? '-left-0.5' : '-right-0.5'}`}
        animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  )
}

// Tech badge component
function TechBadge({ name, icon }: { name: string; icon?: React.ReactNode }) {
  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
      whileHover={{ scale: 1.05, borderColor: 'rgba(197, 160, 89, 0.3)' }}
    >
      {icon}
      <span className="text-xs text-white/60">{name}</span>
    </motion.div>
  )
}

// Social link button
function SocialButton({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="relative w-10 h-10 rounded-full border border-primary-gold/30 flex items-center justify-center
                 text-primary-gold/60 overflow-hidden group"
      whileHover={{ scale: 1.1, borderColor: 'rgba(197, 160, 89, 0.6)' }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Background fill on hover */}
      <motion.div
        className="absolute inset-0 bg-primary-gold/10"
        initial={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Icon */}
      <span className="relative z-10 group-hover:text-primary-gold transition-colors">
        {icon}
      </span>
    </motion.a>
  )
}

export default function Footer() {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end end'],
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['20%', '0%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])

  return (
    <footer ref={containerRef} className="relative bg-gradient-to-b from-primary-navy to-primary-navy-dark overflow-hidden">
      {/* Multi-layer background */}
      <div className="absolute inset-0">
        {/* Animated Blueprint Grid */}
        <motion.div
          className="absolute inset-0 blueprint-grid opacity-5"
          style={{ y: backgroundY }}
          animate={{
            backgroundPosition: ['0px 0px', '40px 40px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Laurel pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 10 C40 20, 30 30, 30 50 C30 30, 20 20, 10 30 M50 10 C60 20, 70 30, 70 50 C70 30, 80 20, 90 30' stroke='%23C5A059' fill='none' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px',
          }}
        />

        {/* Constellation particles */}
        <ConstellationField nodeCount={12} className="opacity-20" />

        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary-navy to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-primary-crimson/5 to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-gold/5 to-transparent" />
      </div>

      {/* Top Border - Enhanced Blueprint Style */}
      <motion.div
        className="relative h-16 border-t border-primary-gold/30"
        style={{ opacity }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-2/3 h-px bg-gradient-to-r from-transparent via-primary-gold/50 to-transparent"
          />
        </div>

        {/* Center laurel decoration */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <MiniLaurel size={16} color="#C5A059" className="rotate-180" />
          <div className="w-2 h-2 rounded-full bg-primary-gold/30" />
          <MiniLaurel size={16} color="#C5A059" />
        </motion.div>

        {/* Corner Markers */}
        <CornerMarker position="top-left" />
        <CornerMarker position="top-right" />
      </motion.div>

      {/* Blueprint Info Block */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Block - Enhanced Blueprint Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative border border-primary-gold/20 rounded-xl overflow-hidden mb-12 backdrop-blur-sm"
        >
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary-gold/40 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary-gold/40 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary-gold/40 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary-gold/40 rounded-br-xl" />

          {/* Header Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-primary-gold/20">
            {[
              { label: 'Project', value: '2Dto3D' },
              { label: 'Version', value: 'v3.0' },
              { label: 'Date', value: '2024' },
              { label: 'Scale', value: '1:1' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className={`p-4 ${i < 3 ? 'border-r border-primary-gold/20' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-xs text-primary-gold/60 uppercase tracking-wider mb-1 font-medium">
                  {item.label}
                </div>
                <div className="text-white font-semibold">{item.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Description Row */}
          <div className="p-6 text-center bg-primary-gold/5">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MiniLaurel size={14} color="#C5A059" className="rotate-180 opacity-60" />
              <span className="text-xs text-primary-gold/60 uppercase tracking-widest">Description</span>
              <MiniLaurel size={14} color="#C5A059" className="opacity-60" />
            </div>
            <motion.div
              className="text-white/80 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              AI-Powered 2D Floor Plan to 3D BIM Model Conversion Service
            </motion.div>
          </div>
        </motion.div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Logo & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {/* Logo with laurel frame */}
            <div className="relative inline-block mb-6">
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
              >
                <MiniLaurel size={28} color="#C5A059" className="rotate-180 opacity-60" />
                <Image
                  src="/logo.png"
                  alt="2Dto3D Logo"
                  width={120}
                  height={60}
                  className="opacity-90"
                />
                <MiniLaurel size={28} color="#C5A059" className="opacity-60" />
              </motion.div>
            </div>

            <p className="text-white/60 text-sm leading-relaxed mb-6">
              경희대학교 건축공학과와 함께하는<br />
              지능형 BIM 변환 서비스
            </p>

            {/* Tech Stack */}
            <div className="space-y-3">
              <span className="text-xs text-primary-gold/60 uppercase tracking-wider">Powered by</span>
              <div className="flex flex-wrap gap-2">
                <TechBadge
                  name="Google Gemini"
                  icon={<span className="text-[10px]">AI</span>}
                />
                <TechBadge
                  name="Three.js"
                  icon={<span className="text-[10px]">3D</span>}
                />
                <TechBadge
                  name="Vercel"
                  icon={<span className="text-[10px]">V</span>}
                />
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <MiniLaurel size={14} color="#C5A059" className="rotate-180" />
              <h4 className="text-primary-gold text-sm font-semibold uppercase tracking-wider">
                Quick Links
              </h4>
            </div>
            <ul className="space-y-4">
              <li>
                <AnimatedLink href="/upload">시작하기</AnimatedLink>
              </li>
              <li>
                <AnimatedLink href="/admin/prompts">관리자 페이지</AnimatedLink>
              </li>
              <li>
                <AnimatedLink href="https://github.com" external>
                  GitHub
                </AnimatedLink>
              </li>
              <li>
                <AnimatedLink href="#">문서</AnimatedLink>
              </li>
            </ul>
          </motion.div>

          {/* Contact / University */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <MiniLaurel size={14} color="#C5A059" className="rotate-180" />
              <h4 className="text-primary-gold text-sm font-semibold uppercase tracking-wider">
                Institution
              </h4>
            </div>
            <div className="text-white/60 text-sm space-y-2 mb-6">
              <p className="font-medium text-white/80">경희대학교 건축공학과</p>
              <p>Kyung Hee University</p>
              <p>Department of Architectural Engineering</p>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <SocialButton
                href="https://github.com"
                label="GitHub"
                icon={
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                }
              />
              <SocialButton
                href="https://linkedin.com"
                label="LinkedIn"
                icon={
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                }
              />
              <SocialButton
                href="mailto:contact@khu.edu"
                label="Email"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-primary-gold/20">
        {/* Animated gradient line */}
        <motion.div
          className="absolute top-0 left-0 w-full h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(197, 160, 89, 0.5), transparent)',
          }}
          animate={{
            backgroundPosition: ['200% 0', '-200% 0'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.p
              className="text-white/40 text-sm flex items-center gap-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <span>© 2024 2Dto3D. All rights reserved.</span>
              <MiniLaurel size={12} color="#C5A059" className="opacity-40" />
            </motion.p>

            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <span className="text-white/40 text-sm">Powered by</span>
              <div className="flex items-center gap-2">
                <motion.span
                  className="text-primary-gold text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  Google Gemini AI
                </motion.span>
                <span className="text-white/20">&</span>
                <motion.span
                  className="text-primary-gold text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  Vercel
                </motion.span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Corner Markers */}
        <CornerMarker position="bottom-left" />
        <CornerMarker position="bottom-right" />
      </div>

      {/* Decorative bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-gold/30 to-transparent" />
    </footer>
  )
}
