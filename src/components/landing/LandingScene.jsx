import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

function getSize(container) {
  const w = container.clientWidth || window.innerWidth
  const h = container.clientHeight || window.innerHeight
  return { w: Math.max(w, 1), h: Math.max(h, 1) }
}

export default function LandingScene() {
  const containerRef = useRef(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let renderer = null
    let frameId = 0
    let disposed = false
    let removeListeners = () => {}

    const start = () => {
      if (disposed) return

      const { w, h } = getSize(container)
      const isMobile = w < 768

      try {
        const scene = new THREE.Scene()
        scene.fog = new THREE.FogExp2(0x06060b, 0.035)

        const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100)
        camera.position.set(0, 1.2, 9)

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(w, h, false)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setClearColor(0x000000, 0)
        container.appendChild(renderer.domElement)

        scene.add(new THREE.AmbientLight(0x6060cc, 0.6))
        const keyLight = new THREE.PointLight(0x6366f1, 2.5, 30)
        keyLight.position.set(4, 6, 5)
        scene.add(keyLight)
        const fillLight = new THREE.PointLight(0x06b6d4, 1.8, 25)
        fillLight.position.set(-5, -2, 4)
        scene.add(fillLight)

        const world = new THREE.Group()
        scene.add(world)

        const particleCount = isMobile ? 600 : 1800
        const positions = new Float32Array(particleCount * 3)
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 28
          positions[i * 3 + 1] = (Math.random() - 0.5) * 18
          positions[i * 3 + 2] = (Math.random() - 0.5) * 20
        }
        const particleGeo = new THREE.BufferGeometry()
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        const particles = new THREE.Points(
          particleGeo,
          new THREE.PointsMaterial({
            color: 0x818cf8,
            size: isMobile ? 0.05 : 0.07,
            transparent: true,
            opacity: 0.75,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        )
        world.add(particles)

        const nodeMat = new THREE.MeshStandardMaterial({
          color: 0x6366f1,
          emissive: 0x4338ca,
          emissiveIntensity: 0.7,
          metalness: 0.3,
          roughness: 0.35,
        })
        const leafMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x0e7490,
          emissiveIntensity: 0.6,
          metalness: 0.3,
          roughness: 0.35,
        })

        const treeGroup = new THREE.Group()
        const treeLayout = [
          { x: 0, y: 2.2, z: 0, leaf: false },
          { x: -1.4, y: 0.8, z: 0.3, leaf: false },
          { x: 1.4, y: 0.8, z: -0.2, leaf: false },
          { x: -2.2, y: -0.6, z: 0.5, leaf: true },
          { x: -0.6, y: -0.6, z: 0.2, leaf: true },
          { x: 0.8, y: -0.6, z: -0.3, leaf: true },
          { x: 2.0, y: -0.6, z: 0.1, leaf: true },
        ]
        const nodeMeshes = []
        treeLayout.forEach((pos, i) => {
          const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(pos.leaf ? 0.14 : 0.18, 20, 20),
            pos.leaf ? leafMat : nodeMat
          )
          mesh.position.set(pos.x, pos.y, pos.z)
          mesh.userData.baseY = pos.y
          mesh.userData.phase = i * 0.7
          treeGroup.add(mesh)
          nodeMeshes.push(mesh)
        })
        treeGroup.position.set(-2.8, 0.2, 0)
        world.add(treeGroup)

        const barsGroup = new THREE.Group()
        ;[0.6, 1.4, 0.9, 2.0, 1.1, 1.7, 0.8, 1.5].forEach((height, i) => {
          const bar = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, height, 0.35),
            new THREE.MeshStandardMaterial({
              color: [0x6366f1, 0x818cf8, 0x06b6d4, 0x8b5cf6, 0x10b981, 0xec4899, 0xf59e0b, 0x6366f1][i],
              emissive: 0x312e81,
              emissiveIntensity: 0.3,
              metalness: 0.4,
              roughness: 0.4,
            })
          )
          bar.position.set(i * 0.55 - 1.9, height / 2 - 0.8, 0)
          bar.userData.baseH = height
          bar.userData.idx = i
          barsGroup.add(bar)
        })
        barsGroup.position.set(2.5, -0.5, 0.5)
        world.add(barsGroup)

        const mouse = { x: 0, y: 0 }
        const onMouseMove = (e) => {
          mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
          mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
        }
        const onResize = () => {
          if (!renderer || disposed) return
          const { w: nw, h: nh } = getSize(container)
          camera.aspect = nw / nh
          camera.updateProjectionMatrix()
          renderer.setSize(nw, nh, false)
        }
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('resize', onResize)
        removeListeners = () => {
          window.removeEventListener('mousemove', onMouseMove)
          window.removeEventListener('resize', onResize)
        }

        const clock = new THREE.Clock()
        const animate = () => {
          if (disposed) return
          frameId = requestAnimationFrame(animate)
          const t = clock.getElapsedTime()

          world.rotation.y = t * 0.08 + mouse.x * 0.08
          world.rotation.x = mouse.y * 0.04
          particles.rotation.y = t * 0.02

          nodeMeshes.forEach((mesh) => {
            mesh.position.y = mesh.userData.baseY + Math.sin(t * 1.5 + mesh.userData.phase) * 0.08
          })

          barsGroup.children.forEach((bar) => {
            const bh = bar.userData.baseH
            const pulse = Math.sin(t * 2 + bar.userData.idx * 0.5) * 0.12
            bar.scale.y = 1 + pulse
            bar.position.y = (bh * bar.scale.y) / 2 - 0.8
          })

          camera.position.x = mouse.x * 0.4
          camera.position.y = 1.2 + mouse.y * 0.2
          camera.lookAt(0, 0.3, 0)
          renderer.render(scene, camera)
        }
        animate()
      } catch (err) {
        console.error('LandingScene error:', err)
        setFailed(true)
      }
    }

    const boot = requestAnimationFrame(start)

    return () => {
      disposed = true
      cancelAnimationFrame(boot)
      cancelAnimationFrame(frameId)
      removeListeners()
      if (renderer) {
        renderer.dispose()
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement)
        }
      }
    }
  }, [])

  if (failed) {
    return <div className="landing-scene-fallback" aria-hidden="true" />
  }

  return <div ref={containerRef} className="landing-scene" aria-hidden="true" />
}
