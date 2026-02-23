import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useTheme } from '../context/ThemeContext'

export default function ThreeHero() {
  const mountRef = useRef(null)
  const { theme } = useTheme()

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / 200, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mount.clientWidth, 200)
    mount.appendChild(renderer.domElement)

    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16)
    // Dark mode: Cyan/Blue (0x00aaff), Light mode: Indigo (0x4f46e5)
    const color = theme === 'dark' ? 0x00aaff : 0x4f46e5
    const material = new THREE.MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.4 })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const light = new THREE.PointLight(0xffffff, 1)
    light.position.set(20, 20, 20)
    scene.add(light)

    camera.position.z = 50
    let frameId
    const animate = () => {
      mesh.rotation.x += 0.005
      mesh.rotation.y += 0.007
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [theme])

  return (
    <div className="flex justify-center items-center h-[220px]">
      <div ref={mountRef} className="w-full" />
    </div>
  )
}
