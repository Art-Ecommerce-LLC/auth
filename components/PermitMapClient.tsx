'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import Map, { Source, Layer, Popup } from 'react-map-gl/maplibre';
import { useEffect, useMemo, useState, useRef } from 'react';
import type { FeatureCollection, Feature, Point } from 'geojson';
import type { MapRef } from 'react-map-gl/maplibre';

interface MarkerDatum { id: string; lat: number; lon: number; }
interface MapProps { permits: MarkerDatum[]; selectedId: string | null; onSelect: (id: string) => void; }

export default function PermitMapClient({ permits, selectedId, onSelect }: MapProps) {
  const geojson = useMemo<FeatureCollection<Point>>(
    () => ({
      type: 'FeatureCollection',
      features: permits.map<Feature<Point>>(p => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [p.lon, p.lat] }, properties: { id: p.id } })),
    }), [permits]
  );

  const mapRef = useRef<MapRef | null>(null);
  useEffect(() => {
    if (!selectedId) return;
    const tgt = permits.find(p => p.id === selectedId);
    if (tgt && mapRef.current) mapRef.current.flyTo({ center: [tgt.lon, tgt.lat], zoom: 14, duration: 600 });
  }, [selectedId, permits]);

  const highlightId = selectedId ?? '';
  const [popup, setPopup] = useState<MarkerDatum | null>(null);

  return (
    <Map
      ref={mapRef}
      initialViewState={{ longitude: -117.292, latitude: 33.045, zoom: 11 }}
      style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      interactiveLayerIds={['cluster-count', 'unclustered']}
      onClick={e => {
        const f = e.features?.[0] as unknown as Feature<Point, { id: string; cluster?: boolean }>;
        if (f?.properties?.cluster) {
          mapRef.current?.flyTo({ center: e.lngLat, zoom: mapRef.current?.getZoom() + 2, duration: 400 });
        } else if (f?.properties?.id) {
          onSelect(f.properties.id);
          const datum = permits.find(d => d.id === f.properties.id);
          if (datum) setPopup(datum);
        }
      }}
    >
      <Source id="permits" type="geojson" data={geojson} cluster clusterRadius={40}>
        <Layer id="clusters" filter={["has","point_count"]} type="circle" paint={{ "circle-color": "#94a3b8", "circle-radius": ["step", ["get","point_count"], 15, 10, 20, 30, 25] }} />
        <Layer id="cluster-count" filter={["has","point_count"]} type="symbol" layout={{ "text-field": "{point_count_abbreviated}", "text-size": 12 }} />
        <Layer id="unclustered" filter={["!has","point_count"]} type="circle" paint={{ "circle-color": ["case", ["==", ["get","id"], ["literal", highlightId]], "#ef4444", "#3b82f6"], "circle-radius": 6 }} />
      </Source>
      {popup && <Popup longitude={popup.lon} latitude={popup.lat} anchor="bottom" onClose={() => setPopup(null)} closeButton={false} offset={14} maxWidth="220px">{popup.id}</Popup>}
    </Map>
  );
}