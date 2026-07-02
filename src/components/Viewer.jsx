import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { supabase } from "../supabase/supabaseClient"

export function Viewer() {
  const [pos, setPos] = useState(null)

  useEffect(() => {
    const channel = supabase.channel("vehicle:demo")

    channel
      .on(
        "broadcast",
        { event: "position_updated" },
        ({ payload }) => setPos(payload)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const position = pos ? [pos.lat, pos.lng] : [51.505, -0.09]

  return (
    <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pos && (
        <Marker position={position}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      )}
    </MapContainer>
  )
}
