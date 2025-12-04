'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative bg-primary-navy overflow-hidden">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 blueprint-grid opacity-10" />

      {/* Top Border - Blueprint Style */}
      <div className="relative h-12 border-t border-primary-gold/30">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            className="w-1/2 h-px bg-gradient-to-r from-transparent via-primary-gold to-transparent"
          />
        </div>

        {/* Corner Markers */}
        <div className="absolute left-8 top-0 w-4 h-full">
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary-gold" />
        </div>
        <div className="absolute right-8 top-0 w-4 h-full">
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary-gold" />
        </div>
      </div>

      {/* Blueprint Info Block */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Block - Blueprint Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border border-primary-gold/30 rounded-lg overflow-hidden mb-12"
        >
          {/* Header Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-primary-gold/30">
            <div className="p-4 border-r border-primary-gold/30">
              <div className="text-xs text-primary-gold/60 uppercase tracking-wider mb-1">Project</div>
              <div className="text-white font-semibold">2Dto3D</div>
            </div>
            <div className="p-4 border-r border-primary-gold/30">
              <div className="text-xs text-primary-gold/60 uppercase tracking-wider mb-1">Version</div>
              <div className="text-white font-semibold">v3.0</div>
            </div>
            <div className="p-4 border-r border-primary-gold/30">
              <div className="text-xs text-primary-gold/60 uppercase tracking-wider mb-1">Date</div>
              <div className="text-white font-semibold">2024</div>
            </div>
            <div className="p-4">
              <div className="text-xs text-primary-gold/60 uppercase tracking-wider mb-1">Scale</div>
              <div className="text-white font-semibold">1:1</div>
            </div>
          </div>

          {/* Description Row */}
          <div className="p-6 text-center">
            <div className="text-xs text-primary-gold/60 uppercase tracking-wider mb-2">Description</div>
            <div className="text-white/80 max-w-2xl mx-auto">
              AI-Powered 2D Floor Plan to 3D BIM Model Conversion Service
            </div>
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
            <div className="flex items-center gap-4 mb-4">
              <Image
                src="/logo.png"
                alt="2Dto3D Logo"
                width={120}
                height={60}
                className="opacity-90"
              />
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              경희대학교 건축공학과와 함께하는<br />
              지능형 BIM 변환 서비스
            </p>

            {/* Tech Stack */}
            <div className="mt-6 flex items-center gap-4">
              <span className="text-xs text-primary-gold/60">Powered by</span>
              <div className="flex items-center gap-3 text-white/40">
                <span className="text-xs">Google Gemini</span>
                <span>•</span>
                <span className="text-xs">Three.js</span>
                <span>•</span>
                <span className="text-xs">Vercel</span>
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
            <h4 className="text-primary-gold text-sm font-semibold uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/upload"
                  className="text-white/60 hover:text-primary-gold transition-colors text-sm flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-primary-gold rounded-full" />
                  시작하기
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/prompts"
                  className="text-white/60 hover:text-primary-gold transition-colors text-sm flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-primary-gold rounded-full" />
                  관리자 페이지
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-primary-gold transition-colors text-sm flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-primary-gold rounded-full" />
                  GitHub
                </a>
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
            <h4 className="text-primary-gold text-sm font-semibold uppercase tracking-wider mb-4">
              Institution
            </h4>
            <div className="text-white/60 text-sm space-y-2">
              <p className="font-medium text-white/80">경희대학교 건축공학과</p>
              <p>Kyung Hee University</p>
              <p>Department of Architectural Engineering</p>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-primary-gold/30 flex items-center justify-center
                           text-primary-gold/60 hover:bg-primary-gold/10 hover:text-primary-gold transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-primary-gold/30 flex items-center justify-center
                           text-primary-gold/60 hover:bg-primary-gold/10 hover:text-primary-gold transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-primary-gold/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm">
              © 2024 2Dto3D. All rights reserved.
            </p>
            <p className="text-white/40 text-sm flex items-center gap-2">
              <span>Powered by</span>
              <span className="text-primary-gold">Google Gemini AI</span>
              <span>&</span>
              <span className="text-primary-gold">Vercel</span>
            </p>
          </div>
        </div>

        {/* Bottom Corner Markers */}
        <div className="absolute left-8 bottom-0 w-4 h-4 border-b border-l border-primary-gold/30" />
        <div className="absolute right-8 bottom-0 w-4 h-4 border-b border-r border-primary-gold/30" />
      </div>
    </footer>
  )
}
