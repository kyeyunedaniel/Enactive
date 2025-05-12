// resources/js/Components/UgandaDistrictsMap.jsx
import React, { useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const UgandaDistrictsMap = ({ geojsonData }) => {
  // Style function with region-based coloring
  const getDistrictStyle = useCallback((feature) => {
    const regionColors = {
      'Central': '#ff7800',
      'Eastern': '#3388ff',
      'Northern': '#33cc33',
      'Western': '#ff33cc'
    };
    
    return {
      color: regionColors[feature.properties.region] || '#666666',
      weight: 1.5,
      opacity: 1,
      fillColor: regionColors[feature.properties.region] || '#aaaaaa',
      fillOpacity: 0.4
    };
  }, []);

  // Enhanced popup content
  const onEachFeature = useCallback((feature, layer) => {
    if (feature.properties) {
      const { district, region, subregion, status } = feature.properties;
      const popupContent = `
        <div style="min-width: 150px">
          <h4 style="margin: 0 0 5px 0; color: #333">${district}</h4>
          <p style="margin: 3px 0"><strong>Region:</strong> ${region}</p>
          ${subregion ? `<p style="margin: 3px 0"><strong>Subregion:</strong> ${subregion}</p>` : ''}
          ${status ? `<p style="margin: 3px 0"><strong>Status:</strong> ${status}</p>` : ''}
        </div>
      `;
      layer.bindPopup(popupContent);
      
      // Highlight on hover
      layer.on({
        mouseover: (e) => {
          e.target.setStyle({
            weight: 3,
            fillOpacity: 0.7
          });
        },
        mouseout: (e) => {
          e.target.setStyle({
            weight: 1.5,
            fillOpacity: 0.4
          });
        }
      });
    }
  }, []);

  // Uganda's approximate center coordinates
  const ugandaCenter = useMemo(() => [1.3733, 32.2903], []);

  return (
    <div className="w-full h-[600px] relative">
      <MapContainer 
        center={ugandaCenter}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        minZoom={6}
        maxBounds={[
          [-1.5, 29.0], // SW corner
          [4.5, 35.0]   // NE corner
        ]}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {geojsonData && (
          <GeoJSON 
            data={geojsonData}
            style={getDistrictStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default React.memo(UgandaDistrictsMap);