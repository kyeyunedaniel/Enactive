import React, { useMemo, useCallback, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import ElectionDataProd from './candidateData';

// Political party colors for Uganda
const PARTY_COLORS = {
  'NRM': '#FFD700', // National Resistance Movement (Yellow/Gold)
  'NUP': '#FF0000', // National Unity Platform (Red)
  'FDC': '#0000FF', // Forum for Democratic Change (Blue)
  'DP': '#006400',  // Democratic Party (Green)
  'ANT': '#800080', // Alliance for National Transformation (Purple)
  'IND': '#A9A9A9'  // Independent (Gray)
};

// Complete candidate information
const CANDIDATES = {
  'Yoweri Kaguta Museveni Tibuhaburwa': { 
    party: 'NRM', 
    color: PARTY_COLORS['NRM'],
    percentage: 58.38,
    votes: '6,042,898'
  },
  'Robert Kyagulanyi Ssentamu': { 
    party: 'NUP', 
    color: PARTY_COLORS['NUP'],
    percentage: 35.08,
    votes: '3,631,437'
  },
  'Patrick Oboi Amuriat': { 
    party: 'FDC', 
    color: PARTY_COLORS['FDC'],
    percentage: 3.26,
    votes: '337,589'
  },
  'Mugisha Gregg Muntu': { 
    party: 'ANT', 
    color: PARTY_COLORS['ANT'],
    percentage: 0.65,
    votes: '67,574'
  },
  'Norbert Mao': { 
    party: 'DP', 
    color: PARTY_COLORS['DP'],
    percentage: 0.56,
    votes: '57,682'
  },
  'Henry Tumukunde Kakurugu': { 
    party: 'IND', 
    color: PARTY_COLORS['IND'],
    percentage: 0.50,
    votes: '51,392'
  },
  'Joseph Kabuleta Kiiza': { 
    party: 'IND', 
    color: PARTY_COLORS['IND'],
    percentage: 0.44,
    votes: '45,424'
  },
  'Nancy Linda Kalembe': { 
    party: 'IND', 
    color: PARTY_COLORS['IND'],
    percentage: 0.38,
    votes: '38,772'
  },
  'John Katumba': { 
    party: 'IND', 
    color: PARTY_COLORS['IND'],
    percentage: 0.36,
    votes: '37,554'
  },
  'Fred Mwesigye': { 
    party: 'IND', 
    color: PARTY_COLORS['IND'],
    percentage: 0.25,
    votes: '25,483'
  },
  'Willy Mayambala': { 
    party: 'IND', 
    color: PARTY_COLORS['IND'],
    percentage: 0.15,
    votes: '15,014'
  }
};

const dummyElectionData = ElectionDataProd; 

const UgandaDistrictsMap = ({ geojsonData, auth, pageTitle }) => {
  const [unmappedDistricts, setUnmappedDistricts] = useState([]); 
  
  React.useEffect(() => {
    if (geojsonData) {
      const geoJsonDistricts = geojsonData.features.map(f => f.properties.district);
      const electionDistricts = Object.keys(dummyElectionData);
      
      const unmapped = electionDistricts.filter(
        district => !geoJsonDistricts.includes(district)
      );
      
      if (unmapped.length > 0) {
        console.log('Districts in election data missing from GeoJSON:', unmapped);
        setUnmappedDistricts(unmapped);
      }
    }
  }, [geojsonData]);

  // Style function using political party colors
  const getDistrictStyle = useCallback((feature) => {
    const districtName = feature.properties.district;
    const electionResult = dummyElectionData[districtName];
    
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
      const { district, region, subregion, status } = feature.properties;
      const electionResult = dummyElectionData[district];
      
      let electionInfo = '';
      if (electionResult) {
        electionInfo = `
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee">
            <h4 style="margin: 5px 0; color: ${PARTY_COLORS[electionResult.winner] || '#333'}">
              ${electionResult.winner} Party - ${electionResult.candidate}
            </h4>
            <p style="margin: 3px 0"><strong>Percentage:</strong> ${electionResult.percentage.toFixed(2)}%</p>
          </div>
        `;
      }
      
      const popupContent = `
        <div style="min-width: 200px">
          <h4 style="margin: 0 0 5px 0; color: #333">${district}</h4>
          <p style="margin: 3px 0"><strong>Region:</strong> ${region || 'N/A'}</p>
          ${subregion ? `<p style="margin: 3px 0"><strong>Subregion:</strong> ${subregion}</p>` : ''}
          ${status ? `<p style="margin: 3px 0"><strong>Status:</strong> ${status}</p>` : ''}
          ${electionInfo}
        </div>
      `;
      
      layer.bindPopup(popupContent);
      
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

  // Legend component with all candidates
  const MapLegend = () => (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control leaflet-bar" style={{
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
        maxWidth: '300px',
        maxHeight: '60vh',
        overflowY: 'auto'
      }}>
        <div style={{ marginBottom: '15px' }}>
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
        
        <div>
          <h4 style={{ margin: '15px 0 8px 0', fontSize: '14px' }}>Presidential Candidates</h4>
          {Object.entries(CANDIDATES).map(([candidate, data]) => (
            <div key={candidate} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              margin: '5px 0',
              padding: '3px 0'
            }}>
              <div style={{
                width: '15px',
                height: '15px',
                backgroundColor: data.color,
                marginRight: '8px',
                border: '1px solid #333',
                flexShrink: 0
              }}></div>
              <div style={{ fontSize: '12px', lineHeight: '1.3' }}>
                <div><strong>{candidate}</strong></div>
                <div>{data.party} - {data.percentage}% ({data.votes} votes)</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Head title={pageTitle} />
      <AuthenticatedLayout user={auth}>
        <div className="w-full h-[600px] relative">
          {process.env.NODE_ENV === 'development' && unmappedDistricts.length > 0 && (
            <div className="absolute top-2 right-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 z-[1000]" role="alert">
              <p className="font-bold">Warning</p>
              <p>{unmappedDistricts.length} districts in election data not found in GeoJSON</p>
              <p className="text-sm">Check browser console for details</p>
            </div>
          )}
          
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
            
            <MapLegend />
          </MapContainer>
        </div>
      </AuthenticatedLayout>
    </>
  );
};

export default React.memo(UgandaDistrictsMap);