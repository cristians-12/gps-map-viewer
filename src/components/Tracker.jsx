// Tracker.jsx
import { useEffect } from "react"
import { supabase } from "../supabase/supabaseClient"

export function Tracker() {
  useEffect(() => {
    let lat = 40.4168
    let lng = -3.7038

    const channel = supabase.channel("vehicle:demo")

    const tick = () => {
      const nextLat = lat + (Math.random() - 0.5) * 0.001
      const nextLng = lng + (Math.random() - 0.5) * 0.001
      lat = nextLat
      lng = nextLng

      channel.send({
        type: "broadcast",
        event: "position_updated",
        payload: {
          vehicle_id: "demo",
          ts: new Date().toISOString(),
          lat,
          lng,
        },
      })
    }

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        tick()
        const id = setInterval(tick, 20000)
        return () => clearInterval(id)
      }
    })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return null
}