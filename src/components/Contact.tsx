import { AnimatePresence, motion } from 'motion/react'
import { ArrowUp, ArrowUpRight, Check, Copy, Download, Mail, Phone } from 'lucide-react'
import { useState } from 'react'
import { site } from '../config/site'
import { formatClock, useNow, zoneLabel } from '../hooks/useNow'
import { usePlace } from './live/liveStore'
import { fadeUp, inView, stagger } from '../lib/motion'
import { Github, Linkedin } from './ui/BrandIcons'
import { Magnetic } from './ui/Magnetic'
import { Reveal, SplitText } from './ui/Reveal'

export function Contact() {
  const { email, phone, github, linkedin, resume } = site.contact
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied('ok')
    } catch {
      setCopied('fail')
    }
    window.setTimeout(() => setCopied('idle'), 2200)
  }

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="contact__glow" aria-hidden />
      <div className="container">
        <Reveal>
          <p className="eyebrow">
            <span className="accent mono">07</span>&nbsp;&nbsp;Contact
          </p>
        </Reveal>
        <SplitText as="h2" id="contact-title" className="contact__title" text="Have a problem worth solving?" step={0.06} />
        <Reveal delay={0.15}>
          <p className="contact__lede muted">
            If you’re building a product or need help with a development challenge, I’d be glad to hear about it.
          </p>
        </Reveal>

        <Reveal delay={0.25} className="contact__mail">
          <a href={`mailto:${email}`} className="contact__email" data-cursor="Write">
            <Mail aria-hidden />
            <span>{email}</span>
          </a>
          <button className="contact__copy" onClick={copy} aria-label="Copy email address">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={copied} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.2 }}>
                {copied === 'ok' ? <Check size={16} /> : <Copy size={16} />}
              </motion.span>
            </AnimatePresence>
            <span className="mono">{copied === 'ok' ? 'Copied' : copied === 'fail' ? 'Copy failed' : 'Copy'}</span>
          </button>
          <span className="sr-only" aria-live="polite">
            {copied === 'ok' ? 'Email address copied' : ''}
          </span>
        </Reveal>

        <motion.ul className="contact__links" initial="hidden" whileInView="show" viewport={inView} variants={stagger(0.08, 0.2)}>
          {github && (
            <motion.li variants={fadeUp}>
              <Magnetic>
                <a className="btn btn--ghost" href={github} target="_blank" rel="noreferrer">
                  <Github aria-hidden /> GitHub
                </a>
              </Magnetic>
            </motion.li>
          )}
          {linkedin && (
            <motion.li variants={fadeUp}>
              <Magnetic>
                <a className="btn btn--ghost" href={linkedin} target="_blank" rel="noreferrer">
                  <Linkedin aria-hidden /> LinkedIn
                </a>
              </Magnetic>
            </motion.li>
          )}
          {phone && (
            <motion.li variants={fadeUp}>
              <Magnetic>
                <a className="btn btn--ghost" href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
                  <Phone aria-hidden /> {phone}
                </a>
              </Magnetic>
            </motion.li>
          )}
          {resume && (
            <motion.li variants={fadeUp}>
              <Magnetic>
                <a className="btn btn--primary" href={resume} download>
                  <Download aria-hidden /> Download Résumé
                </a>
              </Magnetic>
            </motion.li>
          )}
        </motion.ul>
      </div>
    </section>
  )
}

export function Footer() {
  const now = useNow(1000)
  const { place } = usePlace()
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p className="footer__copy">
          © {new Date().getFullYear()} {site.name}
        </p>
        <p className="mono muted footer__time">
          {place.city} · {formatClock(now, place.timezone)} {zoneLabel(place.timezone)}
        </p>
        <div className="footer__right">
          <a className="link-arrow" href={site.contact.github} target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight aria-hidden />
          </a>
          <a className="link-arrow" href={site.contact.linkedin} target="_blank" rel="noreferrer">
            LinkedIn <ArrowUpRight aria-hidden />
          </a>
          <a href="#top" className="footer__top" aria-label="Back to top">
            <ArrowUp aria-hidden size={18} />
          </a>
        </div>
      </div>
    </footer>
  )
}
