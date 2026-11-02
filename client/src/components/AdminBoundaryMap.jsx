import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import osmtogeojson from 'osmtogeojson';
import { LocateFixed, MapPin } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { translateAdmin } from '../i18n/adminTranslations';
import 'leaflet/dist/leaflet.css';

const KURDISTAN_BOUNDS = L.latLngBounds([[34.5, 41.7], [37.6, 46.6]]);
const GOVERNORATES = [
  { name: 'Duhok', position: [36.8667, 42.95], color: '#2563eb' },
  { name: 'Erbil', position: [36.1911, 44.0092], color: '#059669' },
  { name: 'Sulaymaniyah', position: [35.5613, 45.4308], color: '#7c3aed' },
  { name: 'Halabja', position: [35.1778, 45.9861], color: '#d97706' }
];
const governorateAliases = new Map([
  ['duhok', 'Duhok'],
  ['duhok governorate', 'Duhok'],
  ['dohuk', 'Duhok'],
  ['دهوك', 'Duhok'],
  ['دهۆک', 'Duhok'],
  ['erbil', 'Erbil'],
  ['erbil governorate', 'Erbil'],
  ['hawler', 'Erbil'],
  ['arbil', 'Erbil'],
  ['اربيل', 'Erbil'],
  ['أربيل', 'Erbil'],
  ['هەولێر', 'Erbil'],
  ['sulaymaniyah', 'Sulaymaniyah'],
  ['sulaymaniyah governorate', 'Sulaymaniyah'],
  ['sulaimaniya', 'Sulaymaniyah'],
  ['sulaimaniyah', 'Sulaymaniyah'],
  ['as-sulaymaniyah', 'Sulaymaniyah'],
  ['as sulaymaniyah', 'Sulaymaniyah'],
  ['السليمانية', 'Sulaymaniyah'],
  ['سليمانية', 'Sulaymaniyah'],
  ['سلێمانی', 'Sulaymaniyah'],
  ['halabja', 'Halabja'],
  ['halabja governorate', 'Halabja'],
  ['halabjah', 'Halabja'],
  ['حلبجة', 'Halabja'],
  ['هەڵەبجە', 'Halabja']
]);

const labelForFeature = (feature, language) => {
  const properties = feature.properties || {};
  const tags = properties.tags || properties;
  return (language === 'ckb' && tags['name:ckb']) || tags['name:en'] || tags.name || tags.official_name || 'Unnamed boundary';
};

const propertiesForFeature = (feature) => feature.properties?.tags || feature.properties || {};
const governorateForFeature = (feature) => {
  const tags = propertiesForFeature(feature);
  const names = [tags['name:en'], tags.name, tags.official_name, tags['name:ckb'], tags['name:ar']];
  for (const value of names) {
    if (!value) continue;
    const name = String(value).trim().toLowerCase();
    const governorate = governorateAliases.get(name);
    if (governorate) return governorate;
  }
  return null;
};

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[character]);

const createGovernorateIcon = (name, label, color, selected) => L.divIcon({
  className: 'ked-governorate-marker',
  html: `<span class="${selected ? 'is-selected' : ''}" style="--governorate-color:${color}"><i></i>${escapeHtml(label)}</span>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0]
});

const styleForFeature = (feature) => {
  const properties = feature.properties || {};
  const tags = properties.tags || properties;
  const level = Number(tags.admin_level);
  const governorate = governorateForFeature(feature);
  const color = GOVERNORATES.find(({ name }) => name === governorate)?.color || '#2563eb';
  return {
    color,
    weight: governorate ? 5 : level <= 6 ? 3 : 1.5,
    opacity: 0.9,
    fillColor: color,
    fillOpacity: governorate ? 0.2 : 0
  };
};

const AdminBoundaryMap = ({ selectedGovernorate, onSelectGovernorate }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const requestRef = useRef(null);
  const debounceRef = useRef(null);
  const refreshRef = useRef(null);
  const governorateMarkersRef = useRef(new Map());
  const onSelectGovernorateRef = useRef(onSelectGovernorate);
  onSelectGovernorateRef.current = onSelectGovernorate;
  const { lang } = useLanguage();
  const tx = (text) => translateAdmin(text, lang);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [boundaryCount, setBoundaryCount] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const map = L.map(containerRef.current, {
      minZoom: 6,
      maxZoom: 18,
      zoomControl: true,
      maxBounds: KURDISTAN_BOUNDS,
      maxBoundsViscosity: 1
    });
    map.fitBounds(KURDISTAN_BOUNDS, { padding: [12, 12] });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    const locationMarkers = L.layerGroup().addTo(map);
    layerRef.current = L.geoJSON(undefined, {
      style: styleForFeature,
      pointToLayer: (_feature, latlng) => L.circleMarker(latlng, {
        radius: 5,
        color: '#b45309',
        fillColor: '#f59e0b',
        fillOpacity: 0.9,
        weight: 1.5
      }),
      onEachFeature: (feature, layer) => {
        const tags = propertiesForFeature(feature);
        const name = labelForFeature(feature, lang);
        const level = tags.admin_level ? `${tx('Administrative level')} ${tags.admin_level}` : tx(tags.place || 'Mapped place');
        layer.bindTooltip(name, { sticky: true });
        layer.bindPopup(`<strong>${escapeHtml(name)}</strong><br>${escapeHtml(level)}`);
        const governorate = governorateForFeature(feature);
        if (governorate) {
          layer.on('click', () => onSelectGovernorateRef.current(governorate));
          layer.bindTooltip(tx(governorate), { sticky: true });
        }
      }
    }).addTo(map);
    locationMarkers.clearLayers();
    governorateMarkersRef.current.clear();
    GOVERNORATES.forEach(({ name, position, color }) => {
      const label = tx(name);
      const icon = createGovernorateIcon(name, label, color, selectedGovernorate === name);
      const marker = L.marker(position, { icon, title: label, keyboard: true });
      marker.bindPopup(`<strong>${escapeHtml(label)}</strong><br>${escapeHtml(tx('Governorate capital'))}`);
      marker.bindTooltip(label, { permanent: true, direction: 'top', offset: [0, -4], className: 'ked-governorate-tooltip' });
      marker.on('click', () => {
        onSelectGovernorateRef.current(name);
        map.setView(position, Math.max(map.getZoom(), 9));
      });
      locationMarkers.addLayer(marker);
      governorateMarkersRef.current.set(name, { marker, label, color });
    });
    mapRef.current = map;

    const loadBoundaries = () => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        requestRef.current?.abort();
        const controller = new AbortController();
        requestRef.current = controller;
        const bounds = map.getBounds();
        const requestBounds = bounds.intersects(KURDISTAN_BOUNDS)
          ? L.latLngBounds(
            [Math.max(bounds.getSouth(), KURDISTAN_BOUNDS.getSouth()), Math.max(bounds.getWest(), KURDISTAN_BOUNDS.getWest())],
            [Math.min(bounds.getNorth(), KURDISTAN_BOUNDS.getNorth()), Math.min(bounds.getEast(), KURDISTAN_BOUNDS.getEast())]
          )
          : null;
        if (!requestBounds) {
          layerRef.current.clearLayers();
          setBoundaryCount(0);
          setError('');
          setLoading(false);
          return;
        }
        const bbox = [
          requestBounds.getSouth().toFixed(3),
          requestBounds.getWest().toFixed(3),
          requestBounds.getNorth().toFixed(3),
          requestBounds.getEast().toFixed(3)
        ].join(',');
        setLoading(true);
        setError('');
        try {
          const response = await fetch(`/api/geography/boundaries?bbox=${bbox}&zoom=${map.getZoom()}`, { signal: controller.signal });
          const data = await response.json();
          if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load map boundaries');
          const geojson = osmtogeojson(data.osm, { flatProperties: true });
          const governorateBoundaries = new Map();
          geojson.features.forEach((feature) => {
            const tags = propertiesForFeature(feature);
            const governorate = governorateForFeature(feature);
            if (
              tags.boundary !== 'administrative'
              || !['4', '5', '6'].includes(String(tags.admin_level))
              || !governorate
              || !['Polygon', 'MultiPolygon'].includes(feature.geometry?.type)
            ) return;

            const current = governorateBoundaries.get(governorate);
            if (!current || Number(tags.admin_level) < Number(propertiesForFeature(current).admin_level)) {
              governorateBoundaries.set(governorate, feature);
            }
          });
          const features = [...governorateBoundaries.values()];
          layerRef.current.clearLayers();
          layerRef.current.addData({ type: 'FeatureCollection', features });
          setBoundaryCount(features.length);
        } catch (loadError) {
          if (loadError.name !== 'AbortError') {
            console.error('Unable to load administrative boundaries:', loadError);
            layerRef.current.clearLayers();
            setError(tx('Boundary data could not be loaded from OpenStreetMap. Please try again later.'));
            setBoundaryCount(0);
          }
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      }, 350);
    };
    refreshRef.current = loadBoundaries;

    map.on('moveend zoomend', loadBoundaries);
    loadBoundaries();
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(containerRef.current);
    return () => {
      clearTimeout(debounceRef.current);
      requestRef.current?.abort();
      resizeObserver.disconnect();
      map.off('moveend zoomend', loadBoundaries);
      map.remove();
      mapRef.current = null;
      refreshRef.current = null;
      governorateMarkersRef.current.clear();
    };
  }, [lang]);

  useEffect(() => {
    governorateMarkersRef.current.forEach(({ marker, label, color }, name) => {
      marker.setIcon(createGovernorateIcon(name, label, color, selectedGovernorate === name));
    });
  }, [selectedGovernorate]);

  useEffect(() => {
    if (!selectedGovernorate || !mapRef.current) return;
    const governorate = GOVERNORATES.find(({ name }) => name === selectedGovernorate);
    if (governorate) mapRef.current.setView(governorate.position, Math.max(mapRef.current.getZoom(), 9));
  }, [selectedGovernorate]);

  const zoomToRegion = () => mapRef.current?.fitBounds(KURDISTAN_BOUNDS, { padding: [12, 12] });

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
        <div ref={containerRef} className="h-[55vh] min-h-[420px] w-full bg-slate-100" aria-label={tx('Interactive administrative boundary map')} />
        <button type="button" onClick={zoomToRegion} aria-label={tx('Zoom to Kurdistan Region')} title={tx('Zoom to Kurdistan Region')} className="absolute right-3 top-3 z-[500] inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
          <LocateFixed className="h-4 w-4" />
        </button>
        <div className="absolute bottom-3 left-3 z-[400] flex max-w-[calc(100%-1.5rem)] flex-wrap gap-x-3 gap-y-1 rounded-md bg-white/95 px-3 py-2 text-[10px] font-medium text-slate-700 shadow dark:bg-slate-900/95 dark:text-slate-200">
          {[
            ...GOVERNORATES.map(({ name, color }) => [color, name])
          ].map(([color, label]) => <span key={label} className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />{tx(label)}</span>)}
        </div>
      </div>
      <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3B82F6]" />
        <p className="flex-1" aria-live="polite">{loading ? tx('Loading mapped boundaries…') : error ? `${tx('Map error')}: ${error}` : boundaryCount === 0 ? tx('No mapped boundaries were found in this area at this zoom level.') : `${boundaryCount} ${tx('governorate borders are drawn in their matching colors. Use the colored labels to identify each area.')}`}</p>
        {error && <button type="button" onClick={() => refreshRef.current?.()} className="shrink-0 font-semibold text-blue-600 hover:underline dark:text-blue-400">{tx('Retry')}</button>}
      </div>
      <p className="text-[10px] leading-relaxed text-slate-400">{tx('The map is restricted to the Kurdistan Region and highlights Duhok, Erbil, Sulaymaniyah, and Halabja. Boundary coverage depends on OpenStreetMap contributions.')}</p>
    </div>
  );
};

export default AdminBoundaryMap;
