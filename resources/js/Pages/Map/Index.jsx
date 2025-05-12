import React, { useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

// Political party colors for Uganda
const PARTY_COLORS = {
  'NRM': '#FFD700', // National Resistance Movement (Yellow/Gold)
  'NUP': '#FF0000', // National Unity Platform (Red)
  'FDC': '#0000FF', // Forum for Democratic Change (Blue)
  'DP': '#006400',  // Democratic Party (Green)
  'ANT': '#800080', // Alliance for National Transformation (Purple)
  'IND': '#A9A9A9'  // Independent (Gray)
};

// Comprehensive dummy election data for Uganda's districts
const dummyElectionData = {
  "KAMPALA": { winner: "NUP", candidate: "Robert Kyagulanyi", votes: 450000 },
  "WAKISO": { winner: "NUP", candidate: "Betty Nambooze", votes: 380000 },
  "MUKONO": { winner: "NUP", candidate: "Johnson Muyanja", votes: 290000 },
  "JINJA": { winner: "FDC", candidate: "Nathan Nandala", votes: 210000 },
  "MBALE": { winner: "FDC", candidate: "Alice Alaso", votes: 185000 },
  "GULU": { winner: "NRM", candidate: "Jacob Oulanyah", votes: 150000 },
  "LIRA": { winner: "NRM", candidate: "Jane Aceng", votes: 165000 },
  "MBARARA": { winner: "NRM", candidate: "John Magezi", votes: 220000 },
  "KABALE": { winner: "DP", candidate: "Norbert Mao", votes: 120000 },
  "ARUA": { winner: "IND", candidate: "Ojara Mapenduzi", votes: 95000 },
  // Add more districts in uppercase to match your GeoJSON
};

const UgandaDistrictsMap = ({ geojsonData, auth, pageTitle }) => {
  // Style function using political party colors
  const getDistrictStyle = useCallback((feature) => {
    const districtName = feature.properties.district;
    const electionResult = dummyElectionData[districtName];
    
    // Default style if no election data
    if (!electionResult) {
      return {
        color: '#666666',
        weight: 1,
        opacity: 1,
        fillColor: '#dddddd',
        fillOpacity: 0.6
      };
    }
    
    return {
      color: '#333333',
      weight: 1.5,
      opacity: 1,
      fillColor: PARTY_COLORS[electionResult.winner] || '#aaaaaa',
      fillOpacity: 0.7
    };
  }, []);

  // Enhanced popup content with election data
  const onEachFeature = useCallback((feature, layer) => {
    if (feature.properties) {
      const { district } = feature.properties;
      const electionResult = dummyElectionData[district];
      
      let electionInfo = '';
      if (electionResult) {
        electionInfo = `
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee">
            <h4 style="margin: 5px 0; color: ${PARTY_COLORS[electionResult.winner] || '#333'}">
              ${electionResult.winner} Party
            </h4>
            <p style="margin: 3px 0"><strong>Candidate:</strong> ${electionResult.candidate}</p>
            <p style="margin: 3px 0"><strong>Votes:</strong> ${electionResult.votes.toLocaleString()}</p>
          </div>
        `;
      }
      
      const popupContent = `
        <div style="min-width: 180px">
          <h4 style="margin: 0 0 5px 0; color: #333">${district}</h4>
          ${electionInfo}
        </div>
      `;
      
      layer.bindPopup(popupContent);
      
      // Highlight on hover
      layer.on({
        mouseover: (e) => {
          e.target.setStyle({
            weight: 3,
            fillOpacity: 0.9
          });
        },
        mouseout: (e) => {
          e.target.setStyle({
            weight: 1.5,
            fillOpacity: 0.7
          });
        }
      });
    }
  }, []);

  // Uganda's approximate center coordinates
  const ugandaCenter = useMemo(() => [1.3733, 32.2903], []);

  // Legend component
  const PartyLegend = () => (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control leaflet-bar" style={{
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 1px 5px rgba(0,0,0,0.4)'
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Political Parties</h4>
        {Object.entries(PARTY_COLORS).map(([party, color]) => (
          <div key={party} style={{ display: 'flex', alignItems: 'center', margin: '5px 0' }}>
            <div style={{
              width: '15px',
              height: '15px',
              backgroundColor: color,
              marginRight: '8px',
              border: '1px solid #333'
            }}></div>
            <span style={{ fontSize: '12px' }}>{party}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Head title={pageTitle} />
      <AuthenticatedLayout user={auth}>
        <div className="w-full h-[600px] relative">
          <MapContainer 
            center={ugandaCenter}
            zoom={7}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tiles.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
              attribution='Uganda Map Data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              id="your-style-id"
              accessToken="your-access-token"
            />
            
            {geojsonData && (
              <GeoJSON 
                data={geojsonData}
                style={getDistrictStyle}
                onEachFeature={onEachFeature}
              />
            )}
            
            <PartyLegend />
          </MapContainer>
        </div>
      </AuthenticatedLayout>
    </>
  );
};

export default React.memo(UgandaDistrictsMap);