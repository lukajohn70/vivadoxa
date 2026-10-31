import { useState, useEffect } from "react"

export interface NetworkStatus {
  isSlow: boolean
  saveData: boolean
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g"
  downlink?: number
  rtt?: number
}

function getNetworkInfo(): NetworkStatus {
  if (typeof navigator === "undefined") {
    return { isSlow: false, saveData: false }
  }

  const conn =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection

  if (!conn) {
    return { isSlow: false, saveData: false }
  }

  const effectiveType = conn.effectiveType as
    | "slow-2g"
    | "2g"
    | "3g"
    | "4g"
    | undefined
  const saveData = Boolean(conn.saveData)
  const downlink = typeof conn.downlink === "number" ? conn.downlink : undefined
  const rtt = typeof conn.rtt === "number" ? conn.rtt : undefined

  // Treat slow-2g, 2g, 3g or high RTT (> 600ms) or saveData as slow connection
  const isSlow =
    saveData ||
    effectiveType === "slow-2g" ||
    effectiveType === "2g" ||
    effectiveType === "3g" ||
    (typeof downlink === "number" && downlink < 1.0) ||
    (typeof rtt === "number" && rtt > 650)

  return {
    isSlow,
    saveData,
    effectiveType,
    downlink,
    rtt,
  }
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(getNetworkInfo)

  useEffect(() => {
    if (typeof navigator === "undefined") return
    const conn =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection

    if (!conn) return

    const updateStatus = () => {
      setStatus(getNetworkInfo())
    }

    conn.addEventListener?.("change", updateStatus)
    return () => {
      conn.removeEventListener?.("change", updateStatus)
    }
  }, [])

  return status
}
