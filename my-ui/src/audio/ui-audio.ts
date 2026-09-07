/**
 * Procedural Web Audio UI Synthesizer & Living Interaction Engine
 * Generates tactile, zero-dependency, low-latency audio effects for the Sun City UI.
 */

class UiAudioManager {
  private ctx: AudioContext | null = null
  private lastHoverTime = 0
  private isMuted = false

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx()
        } catch {
          // AudioContext not permitted or supported
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted
    return this.isMuted
  }

  public get muted(): boolean {
    return this.isMuted
  }

  /**
   * Subtle, pleasant high-tech chirp on element hover
   */
  public playHover() {
    if (this.isMuted) return
    const now = performance.now()
    if (now - this.lastHoverTime < 35) return // rate-limit rapid mouse sweeps
    this.lastHoverTime = now

    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const t = ctx.currentTime

      osc.type = 'sine'
      osc.frequency.setValueAtTime(860, t)
      osc.frequency.exponentialRampToValueAtTime(1180, t + 0.024)

      gain.gain.setValueAtTime(0.028, t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.026)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(t)
      osc.stop(t + 0.028)
    } catch {
      // Audio execution failed gracefully
    }
  }

  /**
   * Punchy, tactile digital click for activations
   */
  public playClick() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const t = ctx.currentTime

      // Punchy transient oscillator
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(620, t)
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.038)

      gain.gain.setValueAtTime(0.065, t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(t)
      osc.stop(t + 0.042)

      // Sub-pop for tactile body
      const sub = ctx.createOscillator()
      const subGain = ctx.createGain()
      sub.type = 'sine'
      sub.frequency.setValueAtTime(160, t)
      sub.frequency.exponentialRampToValueAtTime(60, t + 0.03)
      subGain.gain.setValueAtTime(0.04, t)
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03)

      sub.connect(subGain)
      subGain.connect(ctx.destination)

      sub.start(t)
      sub.stop(t + 0.032)
    } catch {
      // Audio execution failed gracefully
    }
  }

  /**
   * Harmonious metallic lock-in sound for equipping items or selecting quick slots
   */
  public playEquip() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const t = ctx.currentTime
      const freqs = [659.25, 987.77] // E5, B5 harmonious chime

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, t + i * 0.015)
        osc.frequency.exponentialRampToValueAtTime(freq * 1.08, t + 0.06 + i * 0.015)

        gain.gain.setValueAtTime(0.035, t + i * 0.015)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.065 + i * 0.015)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(t + i * 0.015)
        osc.stop(t + 0.07 + i * 0.015)
      })
    } catch {
      // Audio execution failed gracefully
    }
  }

  /**
   * Smooth futuristic modal swoosh on open
   */
  public playModalOpen() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(260, t)
      osc.frequency.exponentialRampToValueAtTime(740, t + 0.09)

      gain.gain.setValueAtTime(0.001, t)
      gain.gain.linearRampToValueAtTime(0.045, t + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(t)
      osc.stop(t + 0.11)
    } catch {
      // Audio execution failed gracefully
    }
  }

  /**
   * Subtle descending close sound
   */
  public playModalClose() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(680, t)
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.08)

      gain.gain.setValueAtTime(0.04, t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.085)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(t)
      osc.stop(t + 0.09)
    } catch {
      // Audio execution failed gracefully
    }
  }

  /**
   * Low drop/move thud
   */
  /**
   * Crisp high checkmark click
   */
  public playCheck() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return
    try {
      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(1100, t)
      osc.frequency.exponentialRampToValueAtTime(1600, t + 0.04)
      gain.gain.setValueAtTime(0.045, t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.055)
    } catch {
      // Audio execution failed gracefully
    }
  }

  /**
   * Triumphant reward chime
   */
  public playReward() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return
    try {
      const t = ctx.currentTime
      const freqs = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6 arpeggio
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        const noteStart = t + idx * 0.045
        osc.frequency.setValueAtTime(freq, noteStart)
        gain.gain.setValueAtTime(0.04, noteStart)
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.12)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(noteStart)
        osc.stop(noteStart + 0.14)
      })
    } catch {
      // Audio execution failed gracefully
    }
  }

  public playTick() {
    this.playClick()
  }

  public playDrop() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(150, t)
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.07)

      gain.gain.setValueAtTime(0.05, t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.075)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(t)
      osc.stop(t + 0.08)
    } catch {
      // Audio execution failed gracefully
    }
  }
}

export const uiAudio = new UiAudioManager()

/**
 * Creates visual ripple shockwave and triggers click sound on pointer interaction
 */
export function spawnClickRipple(event: MouseEvent | PointerEvent | React.MouseEvent) {
  const x = event.clientX
  const y = event.clientY

  // Spawn visual radiant pulse element
  const ripple = document.createElement('div')
  ripple.className = 'ui-click-ripple'
  ripple.style.left = `${x}px`
  ripple.style.top = `${y}px`
  document.body.appendChild(ripple)

  setTimeout(() => {
    ripple.remove()
  }, 450)

  // Trigger tactile click sound
  uiAudio.playClick()
}

/**
 * Attaches global delegation listeners for interactive buttons and cards
 */
export function setupLivingUiListeners(): () => void {
  if (typeof window === 'undefined') return () => {}

  function isInteractive(el: Element | null): boolean {
    if (!el) return false
    return Boolean(
      el.tagName === 'BUTTON' ||
      el.getAttribute('role') === 'button' ||
      el.closest('button') ||
      el.closest('[role="button"]') ||
      el.closest('.city-item-slot') ||
      el.closest('.city-equipment-slot') ||
      el.closest('.city-quick-slot') ||
      el.closest('[data-roblox-class="TextButton"]') ||
      el.closest('[data-roblox-class="ImageButton"]') ||
      el.closest('.city-tabs button') ||
      el.closest('.city-viewport-btn')
    )
  }

  const handlePointerOver = (e: PointerEvent) => {
    const target = e.target as Element | null
    if (isInteractive(target)) {
      uiAudio.playHover()
    }
  }

  const handleClick = (e: MouseEvent) => {
    if (e.button !== 0) return
    const target = e.target as Element | null
    if (isInteractive(target)) {
      spawnClickRipple(e)
    }
  }

  window.addEventListener('pointerover', handlePointerOver, { passive: true })
  window.addEventListener('click', handleClick, { passive: true })

  return () => {
    window.removeEventListener('pointerover', handlePointerOver)
    window.removeEventListener('click', handleClick)
  }
}
