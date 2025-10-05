// client/src/components/map/simple-map.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Minus, Navigation, MapPin, LocateFixed, Star, Car, Bike, Flag, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import type { ParkingLot } from "@shared/schema";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  ZoomControl,
  Circle,
  Polyline,
} from "react-leaflet";
import { latLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";

type LatLngTuple = [number, number];
type LotWithCoords = ParkingLot & { lat: number; lng: number };

type ApiLot = Partial<ParkingLot> & {
  latitude?: string | number;
  longitude?: string | number;
  lat?: string | number;
  lng?: string | number;
  currentMotorcycleSpots?: number | string;
  currentCarSpots?: number | string;
  rating?: number | string;
};

function num(v: unknown, fallback = 0): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function normalizeLots(arr: any[] | undefined): LotWithCoords[] {
  if (!arr) return [];
  return arr
    .map((it) => {
      const lat = num(it?.lat ?? it?.latitude, NaN);
      const lng = num(it?.lng ?? it?.longitude, NaN);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

      return {
        ...(it as ParkingLot),
        id: it?.id ?? `${it?.name ?? "Unnamed"}-${lat},${lng}`,
        name: it?.name ?? "Unnamed",
        lat,
        lng,
        currentCarSpots: num(it?.currentCarSpots, 0),
        currentMotorcycleSpots: num(it?.currentMotorcycleSpots, 0),
        rating: String(it?.rating ?? "0"),
      } as LotWithCoords;
    })
    .filter(Boolean) as LotWithCoords[];
}

function toLotWithCoords(item: ApiLot): LotWithCoords | null {
  const lat = num(item.lat ?? item.latitude, NaN);
  const lng = num(item.lng ?? item.longitude, NaN);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const base = item as ParkingLot;
  return {
    ...base,
    id: base.id ?? `${item.name}-${lat},${lng}`,
    name: base.name ?? "Unnamed",
    lat,
    lng,
    currentMotorcycleSpots: num(item.currentMotorcycleSpots, 0),
    currentCarSpots: num(item.currentCarSpots, 0),
    rating: typeof item.rating === "number" ? String(item.rating) : String(item.rating ?? "0"),
  };
}

interface SimpleMapProps {
  parkingLots?: LotWithCoords[] | any[];
  apiUrl?: string;
  onParkingLotClick?: (lot: LotWithCoords) => void;
  onMyLocationChange?: (pos: { lat: number; lng: number; accuracy?: number; heading?: number; speed?: number }) => void;
}

function FitToMarkers({ lots }: { lots: LotWithCoords[] }) {
  const map = useMap();
  const bounds = useMemo(() => {
    if (!lots.length) return null;
    const b = latLngBounds([lots[0].lat, lots[0].lng], [lots[0].lat, lots[0].lng]);
    lots.forEach((l) => b.extend([l.lat, l.lng]));
    return b;
  }, [lots]);

  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [40, 40] });
  }, [bounds, map]);

  return null;
}

function ZoomButtons() {
  const map = useMap();
  return (
    <div className="absolute top-4 right-4 flex flex-col space-y-2 z-[1000]" data-testid="map-controls">
      <Button
        size="icon"
        variant="secondary"
        onClick={() => map.setZoom(map.getZoom() + 1)}
        className="bg-white shadow-lg"
        data-testid="zoom-in"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        onClick={() => map.setZoom(map.getZoom() - 1)}
        className="bg-white shadow-lg"
        data-testid="zoom-out"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        onClick={() => {
          if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const { latitude, longitude } = pos.coords;
                map.setView([latitude, longitude], Math.max(map.getZoom(), 15));
              },
              () => {
                map.locate().on("locationfound", (e) => {
                  map.setView(e.latlng, Math.max(map.getZoom(), 15));
                });
              }
            );
          } else {
            map.locate().on("locationfound", (e) => {
              map.setView(e.latlng, Math.max(map.getZoom(), 15));
            });
          }
        }}
        className="bg-white shadow-lg"
        data-testid="center-location"
      >
        <Navigation className="h-4 w-4" />
      </Button>
    </div>
  );
}

function statusColor(lot: LotWithCoords) {
  const hasAvailable = (lot.currentMotorcycleSpots ?? 0) > 0 || (lot.currentCarSpots ?? 0) > 0;
  return hasAvailable
    ? { fill: "#16a34a", stroke: "#065f46" }
    : { fill: "#dc2626", stroke: "#7f1d1d" };
}

function MyLocationLayer({
  enabled,
  follow,
  onChange,
  showTrail = false,
}: {
  enabled: boolean;
  follow: boolean;
  onChange?: (pos: { lat: number; lng: number; accuracy?: number; heading?: number; speed?: number }) => void;
  showTrail?: boolean;
}) {
  const map = useMap();
  const [pos, setPos] = useState<{ lat: number; lng: number; accuracy?: number; heading?: number; speed?: number } | null>(null);
  const [path, setPath] = useState<LatLngTuple[]>([]);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!("geolocation" in navigator)) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) => {
        const next = {
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          accuracy: p.coords.accuracy,
          heading: p.coords.heading ?? undefined,
          speed: p.coords.speed ?? undefined,
        };
        setPos(next);

        if (showTrail) {
          setPath((prev): LatLngTuple[] => {
            const nextPoint: LatLngTuple = [next.lat, next.lng];
            const arr: LatLngTuple[] = [...prev, nextPoint];
            return arr.length > 200 ? arr.slice(arr.length - 200) : arr;
          });
        }

        onChange?.(next);
        if (follow) {
          map.setView([next.lat, next.lng], Math.max(map.getZoom(), 15));
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, follow, showTrail, map, onChange]);

  if (!enabled || !pos) return null;

  return (
    <>
      <Circle
        center={[pos.lat, pos.lng]}
        radius={pos.accuracy ?? 30}
        pathOptions={{ color: "#2563eb", weight: 1, fillOpacity: 0.1 }}
      />
      <CircleMarker
        center={[pos.lat, pos.lng]}
        radius={7}
        pathOptions={{ color: "#1d4ed8", fillColor: "#3b82f6", fillOpacity: 1, weight: 2 }}
      >
        <Popup>
          <div className="text-sm">
            Vị trí của bạn
            {typeof pos.speed === "number" ? (
              <div>Tốc độ: {Math.round((pos.speed ?? 0) * 3.6)} km/h</div>
            ) : null}
          </div>
        </Popup>
      </CircleMarker>

      {showTrail && path.length > 1 ? <Polyline positions={path} /> : null}
    </>
  );
}

// Parking Card Component (Integrated)
function ParkingCardInline({ lot, onClick }: { lot: LotWithCoords; onClick: () => void }) {
  const hasAvailableSpots = lot.currentMotorcycleSpots > 0 || lot.currentCarSpots > 0;

  return (
    <Card className="p-3 hover:bg-gray-50 cursor-pointer" onClick={onClick}>
      <div className="flex items-start space-x-3">
        <div className={`w-10 h-10 ${hasAvailableSpots ? "bg-success" : "bg-danger"} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
          <Car className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium truncate">{lot.name}</h3>
            <span className={`text-xs font-medium ${hasAvailableSpots ? "text-success" : "text-danger"}`}>
              {hasAvailableSpots ? "Còn chỗ" : "Hết chỗ"}
            </span>
          </div>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="truncate">{lot.address}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              {lot.motorcycleCapacity > 0 && (
                <div className="flex items-center space-x-1">
                  <Bike className="h-3 w-3" />
                  <span>{lot.motorcyclePrice.toLocaleString()}</span>
                </div>
              )}
              {lot.carCapacity > 0 && (
                <div className="flex items-center space-x-1">
                  <Car className="h-3 w-3" />
                  <span>{lot.carPrice.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
          {lot.rating && parseFloat(lot.rating) > 0 && (
            <div className="flex items-center mt-1">
              <Star className="h-3 w-3 text-warning fill-current mr-1" />
              <span className="text-xs text-gray-600">
                {parseFloat(lot.rating).toFixed(1)} ({lot.totalReviews})
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Detail Modal Component (Integrated)
function ParkingDetailModalInline({ lot, open, onClose }: { lot: LotWithCoords | null; open: boolean; onClose: () => void }) {
  if (!lot) return null;
  const hasAvailableSpots = lot.currentMotorcycleSpots > 0 || lot.currentCarSpots > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lot.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant={hasAvailableSpots ? "default" : "destructive"} className={hasAvailableSpots ? "bg-success hover:bg-success" : ""}>
              <div className="w-2 h-2 rounded-full bg-current mr-2" />
              {hasAvailableSpots ? "Còn chỗ trống" : "Hết chỗ"}
            </Badge>
            <div className="text-sm text-gray-500">Cập nhật 5 phút trước</div>
          </div>

          <div className="flex items-start space-x-3">
            <MapPin className="text-gray-400 mt-1 h-4 w-4" />
            <div>
              <p className="text-sm font-medium text-gray-900">{lot.address}</p>
              <p className="text-xs text-gray-500">Cách bạn 150m (2 phút đi bộ)</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Giá cả</h3>
            <div className="space-y-2">
              {lot.motorcycleCapacity > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-2">
                    <Bike className="text-gray-400 h-4 w-4" />
                    <span>Xe máy</span>
                  </span>
                  <span className="font-medium">{lot.motorcyclePrice.toLocaleString()} VNĐ/giờ</span>
                </div>
              )}
              {lot.carCapacity > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-2">
                    <Car className="text-gray-400 h-4 w-4" />
                    <span>Ô tô</span>
                  </span>
                  <span className="font-medium">{lot.carPrice.toLocaleString()} VNĐ/giờ</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Sức chứa</span>
            <span className="text-sm font-medium">
              {lot.motorcycleCapacity > 0 && `${lot.motorcycleCapacity} xe máy`}
              {lot.motorcycleCapacity > 0 && lot.carCapacity > 0 && ", "}
              {lot.carCapacity > 0 && `${lot.carCapacity} ô tô`}
            </span>
          </div>

          {lot.rating && parseFloat(lot.rating) > 0 && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= Math.round(parseFloat(lot.rating!)) ? "text-warning fill-current" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {parseFloat(lot.rating).toFixed(1)} ({lot.totalReviews} đánh giá)
              </span>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <Button className="w-full">
              <Navigation className="mr-2 h-4 w-4" />
              Chỉ đường đến bãi xe
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline">
                <Flag className="mr-2 h-4 w-4" />
                Báo cáo
              </Button>
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Chia sẻ
              </Button>
            </div>
          </div>

          {lot.description && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Mô tả</h3>
              <p className="text-sm text-gray-600">{lot.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SimpleMap({
  parkingLots,
  apiUrl,
  onParkingLotClick,
  onMyLocationChange,
}: SimpleMapProps) {
  const controlled = Array.isArray(parkingLots);
  const [fetchedLots, setFetchedLots] = useState<LotWithCoords[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [selectedLot, setSelectedLot] = useState<LotWithCoords | null>(null);

  const API = apiUrl ?? `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000"}/api/parking-lots`;

  useEffect(() => {
    if (controlled) return;
    let ignore = false;
    const ac = new AbortController();
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const r = await fetch(API, { signal: ac.signal });
        if (!r.ok) {
          const txt = await r.text().catch(() => "");
          throw new Error(`HTTP ${r.status} ${r.statusText} ${txt}`.trim());
        }
        const raw = (await r.json()) as ApiLot[];
        if (ignore) return;
        const list = (raw ?? []).map(toLotWithCoords).filter(Boolean) as LotWithCoords[];
        setFetchedLots(list);
      } catch (e: any) {
        if (!ignore && e.name !== "AbortError") setErr(String(e.message ?? e));
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
      ac.abort();
    };
  }, [API, controlled]);

  const lots: LotWithCoords[] = controlled ? normalizeLots(parkingLots as any[]) : fetchedLots;

  const [initialCenter] = useState<LatLngTuple>(() => {
    return lots.length ? [lots[0].lat, lots[0].lng] : [10.776, 106.700];
  });

  const [trackMe, setTrackMe] = useState(false);
  const [followMe, setFollowMe] = useState(true);

  const handleClick = (lot: LotWithCoords) => {
    setSelectedLot(lot);
    onParkingLotClick?.(lot);
  };

  return (
    <div className="relative w-full h-full" data-testid="parking-map">
      {!controlled && loading && (
        <div className="absolute inset-0 z-[1100] grid place-items-center bg-white/70 text-sm">
          Đang tải bãi đỗ xe...
        </div>
      )}
      {!controlled && err && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1100] bg-red-600 text-white text-sm px-3 py-2 rounded shadow">
          Lỗi tải dữ liệu: {err}
        </div>
      )}

      <div className="absolute top-4 left-4 z-[1000] flex flex-col space-y-2">
        <Button
          size="icon"
          variant={trackMe ? "default" : "secondary"}
          onClick={() => setTrackMe((v) => !v)}
          className="bg-white shadow-lg"
          title={trackMe ? "Tắt theo dõi vị trí" : "Bật theo dõi vị trí"}
          data-testid="toggle-track-me"
        >
          <LocateFixed className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={followMe ? "default" : "secondary"}
          onClick={() => setFollowMe((v) => !v)}
          className="bg-white shadow-lg"
          disabled={!trackMe}
          title={followMe ? "Tắt bám theo vị trí" : "Bật bám theo vị trí"}
          data-testid="toggle-follow-me"
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>

      <MapContainer
        center={initialCenter}
        zoom={13}
        zoomControl={false}
        className="w-full h-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
        />

        <FitToMarkers lots={lots} />

        {lots.map((lot) => {
          const { fill, stroke } = statusColor(lot);
          return (
            <CircleMarker
              key={lot.id}
              center={[lot.lat, lot.lng]}
              radius={10}
              pathOptions={{ color: stroke, fillColor: fill, fillOpacity: 0.9, weight: 2 }}
              eventHandlers={{ click: () => handleClick(lot) }}
              data-testid={`marker-${lot.id}`}
            >
              <Popup>
                <div className="w-64">
                  <ParkingCardInline lot={lot} onClick={() => handleClick(lot)} />
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        <MyLocationLayer enabled={trackMe} follow={followMe} onChange={onMyLocationChange} showTrail={false} />

        <ZoomControl position="bottomright" />
        <ZoomButtons />
      </MapContainer>

      <ParkingDetailModalInline lot={selectedLot} open={!!selectedLot} onClose={() => setSelectedLot(null)} />
    </div>
  );
}