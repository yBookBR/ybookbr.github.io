const app = document.getElementById("app")

fetch("./front/page.html")
  .then(response => response.text())
  .then(html => {
    app.innerHTML = html

    const DISCORD_ID = "1054629497904836681"
    const SNOW_COUNT = 140
    const DISCORD_REFRESH_MS = 1000
    const SKIP_SECONDS = 5

    const icons = {
      play: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 5.75v12.5c0 .63.7 1 1.23.66l9.55-6.25a.78.78 0 0 0 0-1.32L9.23 5.09A.79.79 0 0 0 8 5.75Z"/>
        </svg>
      `,
      pause: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8.25 5.5h1.9c.55 0 1 .45 1 1v11c0 .55-.45 1-1 1h-1.9c-.55 0-1-.45-1-1v-11c0-.55.45-1 1-1Zm5.6 0h1.9c.55 0 1 .45 1 1v11c0 .55-.45 1-1 1h-1.9c-.55 0-1-.45-1-1v-11c0-.55.45-1 1-1Z"/>
        </svg>
      `,
      previous: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5.5 6.75c0-.41.34-.75.75-.75S7 6.34 7 6.75v10.5c0 .41-.34.75-.75.75s-.75-.34-.75-.75V6.75Z"/>
          <path d="M18.25 6.68v10.64c0 .6-.67.95-1.16.62L8.93 12.62a.75.75 0 0 1 0-1.24l8.16-5.32c.5-.33 1.16.03 1.16.62Z"/>
        </svg>
      `,
      next: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17 6.75c0-.41.34-.75.75-.75s.75.34.75.75v10.5c0 .41-.34.75-.75.75s-.75-.34-.75-.75V6.75Z"/>
          <path d="M5.75 6.68v10.64c0 .6.67.95 1.16.62l8.16-5.32a.75.75 0 0 0 0-1.24L6.91 6.06c-.5-.33-1.16.03-1.16.62Z"/>
        </svg>
      `,
      muted: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 10v4c0 1.66 1.34 3 3 3h1.2l4.64 3.1A1.4 1.4 0 0 0 14 18.94V5.06a1.4 1.4 0 0 0-2.16-1.16L7.2 7H6c-1.66 0-3 1.34-3 3Z"/>
          <path d="m18.2 9.8 3.1 3.1m0-3.1-3.1 3.1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"/>
        </svg>
      `,
      low: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 10v4c0 1.66 1.34 3 3 3h1.2l4.64 3.1A1.4 1.4 0 0 0 14 18.94V5.06a1.4 1.4 0 0 0-2.16-1.16L7.2 7H6c-1.66 0-3 1.34-3 3Z"/>
          <path d="M17.25 9.35a4.4 4.4 0 0 1 0 5.3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"/>
        </svg>
      `,
      max: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 10v4c0 1.66 1.34 3 3 3h1.2l4.64 3.1A1.4 1.4 0 0 0 14 18.94V5.06a1.4 1.4 0 0 0-2.16-1.16L7.2 7H6c-1.66 0-3 1.34-3 3Z"/>
          <path d="M17.1 8.7a5.4 5.4 0 0 1 0 6.6M19.7 6.1a9.2 9.2 0 0 1 0 11.8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"/>
        </svg>
      `
    }

    const elements = {
      music: document.getElementById("music"),
      clickSound: document.getElementById("click-sound"),
      playBtn: document.getElementById("play-btn"),
      prevBtn: document.getElementById("prev-btn"),
      nextBtn: document.getElementById("next-btn"),
      progress: document.getElementById("progress"),
      timeline: document.getElementById("timeline"),
      currentTime: document.getElementById("current-time"),
      durationTime: document.getElementById("duration-time"),
      musicMessage: document.getElementById("music-message"),
      volumeBtn: document.getElementById("volume-btn"),
      volumeSlider: document.getElementById("volume-slider"),
      discordBox: document.querySelector(".discord-box"),
      canvas: document.getElementById("snow")
    }

    let firstInteraction = false
    let lastVolume = 1

    function setIcon(button, icon) {
      button.innerHTML = icon
    }

    function formatTime(seconds) {
      if (!Number.isFinite(seconds)) return "0:00"

      const minutes = Math.floor(seconds / 60)
      const secondsLeft = Math.floor(seconds % 60).toString().padStart(2, "0")

      return `${minutes}:${secondsLeft}`
    }

    function updatePlayButton(isPlaying) {
      setIcon(elements.playBtn, isPlaying ? icons.pause : icons.play)
      elements.playBtn.classList.toggle("is-playing", isPlaying)
      elements.playBtn.setAttribute("aria-label", isPlaying ? "Pausar música" : "Reproduzir música")
    }

    function updateVolumeIcon() {
      const value = Number(elements.volumeSlider.value)

      if (elements.music.muted || value === 0) {
        setIcon(elements.volumeBtn, icons.muted)
        return
      }

      setIcon(elements.volumeBtn, value < 0.55 ? icons.low : icons.max)
    }

    function playMusic() {
      return elements.music.play()
        .then(() => {
          updatePlayButton(true)
          elements.musicMessage.classList.add("hidden")
        })
        .catch(() => {})
    }

    function pauseMusic() {
      elements.music.pause()
      updatePlayButton(false)
    }

    function toggleMusic() {
      elements.music.paused ? playMusic() : pauseMusic()
    }

    function seekMusic(seconds) {
      if (!elements.music.duration) return

      elements.music.currentTime = Math.min(
        elements.music.duration,
        Math.max(0, elements.music.currentTime + seconds)
      )
    }

    function playClick() {
      if (!elements.clickSound) return

      elements.clickSound.currentTime = 0
      elements.clickSound.volume = 0.35
      elements.clickSound.play().catch(() => {})
    }

    function createRipple(x, y) {
      const ripple = document.createElement("div")

      ripple.className = "ripple"
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`

      document.body.appendChild(ripple)
      setTimeout(() => ripple.remove(), 600)
    }

    function bindMusicPlayer() {
      setIcon(elements.prevBtn, icons.previous)
      setIcon(elements.nextBtn, icons.next)
      updatePlayButton(false)

      elements.music.loop = true
      elements.music.volume = 1
      elements.volumeSlider.value = 1
      updateVolumeIcon()

      elements.playBtn.addEventListener("click", event => {
        event.stopPropagation()
        firstInteraction = true
        toggleMusic()
      })

      elements.prevBtn.addEventListener("click", event => {
        event.stopPropagation()
        seekMusic(-SKIP_SECONDS)
      })

      elements.nextBtn.addEventListener("click", event => {
        event.stopPropagation()
        seekMusic(SKIP_SECONDS)
      })

      elements.timeline.addEventListener("click", event => {
        event.stopPropagation()
        if (!elements.music.duration) return

        const rect = elements.timeline.getBoundingClientRect()
        const percentage = (event.clientX - rect.left) / rect.width

        elements.music.currentTime = percentage * elements.music.duration
      })

      elements.music.addEventListener("loadedmetadata", () => {
        elements.durationTime.textContent = formatTime(elements.music.duration)
      })

      elements.music.addEventListener("timeupdate", () => {
        const percentage = (elements.music.currentTime / elements.music.duration) * 100 || 0

        elements.progress.style.width = `${percentage}%`
        elements.currentTime.textContent = formatTime(elements.music.currentTime)
      })

      elements.music.addEventListener("ended", () => {
        elements.music.currentTime = 0
        playMusic()
      })

      elements.volumeSlider.addEventListener("click", event => event.stopPropagation())

      elements.volumeSlider.addEventListener("input", () => {
        const value = Number(elements.volumeSlider.value)

        elements.music.volume = value
        elements.music.muted = value === 0

        if (value > 0) lastVolume = value

        updateVolumeIcon()
      })

      elements.volumeBtn.addEventListener("click", event => {
        event.stopPropagation()

        if (elements.music.muted || Number(elements.volumeSlider.value) === 0) {
          elements.music.muted = false
          elements.music.volume = lastVolume
          elements.volumeSlider.value = lastVolume
        } else {
          elements.music.muted = true
          elements.volumeSlider.value = 0
        }

        updateVolumeIcon()
      })
    }

    function bindPageEffects() {
      document.addEventListener("click", event => {
        playClick()
        createRipple(event.clientX, event.clientY)

        if (!firstInteraction) {
          firstInteraction = true
          playMusic()
        }
      })

      document.addEventListener("contextmenu", event => {
        event.preventDefault()
      })
    }

    function loadDiscord() {
      fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`)
        .then(response => response.json())
        .then(data => {
          const d = data.data
          const user = d.discord_user

          const avatar = user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
            : "https://cdn.discordapp.com/embed/avatars/0.png"

          const username = user.global_name || user.username

          const statusIcons = {
            online: "./assets/icons/online.png",
            idle: "./assets/icons/idle.png",
            dnd: "./assets/icons/donotdisturb.png",
            offline: "./assets/icons/offline.png"
          }

          const statusIcon = statusIcons[d.discord_status] || statusIcons.offline

          let activityName = "Sem atividade"
          let activitySub = "..."
          let activityIcon = ""

          if (d.listening_to_spotify) {
            activityName = d.spotify.song
            activitySub = d.spotify.artist.replace(/;/g, ", ")
            activityIcon = d.spotify.album_art_url
          } else if (d.activities && d.activities.length > 0) {
            const activity = d.activities.find(item => item.type !== 4) || d.activities[0]

            activityName = activity.name || "Atividade"
            activitySub = activity.details || activity.state || "Online"

            if (activity.assets && activity.assets.large_image && activity.application_id) {
              activityIcon = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`
            }
          }

          document.getElementById("discord-name").textContent = username

          elements.discordBox.innerHTML = `
            <div class="dc-row">
              <div class="dc-left">
                <div class="dc-avatar-wrapper">
                  <img src="${avatar}" class="dc-avatar" alt="Avatar do Discord">
                  <img src="${statusIcon}" class="dc-status" alt="Status do Discord">
                </div>

                <div class="dc-text">
                  <div class="dc-name">${username}</div>
                  <div class="dc-activity-text">${activityName}</div>
                  <div class="dc-sub">${activitySub}</div>
                </div>
              </div>

              ${activityIcon ? `<img src="${activityIcon}" class="dc-big-icon" alt="Atividade">` : ""}
            </div>
          `
        })
        .catch(() => {
          elements.discordBox.innerHTML = "<p>Discord indisponível</p>"
        })
    }

    function startSnow() {
      const canvas = elements.canvas
      const ctx = canvas.getContext("2d")
      const snowflakes = []

      function resizeSnow() {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }

      class Snowflake {
        constructor() {
          this.reset()
        }

        reset() {
          this.x = Math.random() * canvas.width
          this.y = Math.random() * canvas.height
          this.size = Math.random() * 2.6 + 0.7
          this.speedY = Math.random() * 0.8 + 0.35
          this.speedX = Math.random() * 0.5 - 0.25
          this.opacity = Math.random() * 0.45 + 0.18
        }

        update() {
          this.y += this.speedY
          this.x += this.speedX

          if (this.y > canvas.height) {
            this.reset()
            this.y = -6
          }
        }

        draw() {
          ctx.fillStyle = `rgba(255,255,255,${this.opacity})`
          ctx.beginPath()
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      function animateSnow() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        snowflakes.forEach(flake => {
          flake.update()
          flake.draw()
        })

        requestAnimationFrame(animateSnow)
      }

      resizeSnow()
      window.addEventListener("resize", resizeSnow)

      for (let i = 0; i < SNOW_COUNT; i++) {
        snowflakes.push(new Snowflake())
      }

      animateSnow()
    }

    bindMusicPlayer()
    bindPageEffects()
    loadDiscord()
    startSnow()

    setInterval(loadDiscord, DISCORD_REFRESH_MS)
  })
