"use client"

import { useEffect, useState } from "react"

// Custom hook to detect mobile devices
export function useMobileDetect() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile)

    // Clean up
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

// Function to get appropriate dimensions based on screen size
export function getResponsiveDimensions() {
  if (typeof window === "undefined") {
    return { width: 400, height: 200 } // Default for SSR
  }

  const width = window.innerWidth

  if (width < 480) {
    return { width: width - 40, height: 180 }
  } else if (width < 768) {
    return { width: width - 60, height: 200 }
  } else {
    return { width: 400, height: 200 }
  }
}

// Function to get appropriate PDF height based on screen size
export function getPdfHeight() {
  if (typeof window === "undefined") {
    return "800px" // Default for SSR
  }

  const width = window.innerWidth

  if (width < 480) {
    return "400px"
  } else if (width < 768) {
    return "500px"
  } else {
    return "800px"
  }
}
