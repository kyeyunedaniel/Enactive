import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, ScaleControl } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet library itself for bounds calculation etc.
import 'leaflet/dist/leaflet.css';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import ElectionDataProd from './candidateData'; // Assuming this path is correct

// --- Constants ---

// Political party colors for Uganda
const PARTY_COLORS = {
  'NRM': '#FFD700', // National Resistance Movement (Yellow/Gold)
  'NUP': '#FF0000', // National Unity Platform (Red)
  'FDC': '#0000FF', // Forum for Democratic Change (Blue)
  'DP': '#006400',  // Democratic Party (Green)
  'ANT': '#800080', // Alliance for National Transformation (Purple)
  'IND': '#A9A9A9', // Independent (Gray)
  'DEFAULT': '#dddddd', // Default color for missing data
  'HIGHLIGHT': '#00FFFF', // Cyan highlight color
};

// Complete candidate information (Assuming this is up-to-date)
const CANDIDATES = {
    'Yoweri Kaguta Museveni Tibuhaburwa': { party: 'NRM', color: PARTY_COLORS['NRM'], percentage: 58.38, votes: '6,042,898' },
    'Robert Kyagulanyi Ssentamu': { party: 'NUP', color: PARTY_COLORS['NUP'], percentage: 35.08, votes: '3,631,437' },
    'Patrick Oboi Amuriat': { party: 'FDC', color: PARTY_COLORS['FDC'], percentage: 3.26, votes: '337,589' },
    'Mugisha Gregg Muntu': { party: 'ANT', color: PARTY_COLORS['ANT'], percentage: 0.65, votes: '67,574' },
    'Norbert Mao': { party: 'DP', color: PARTY_COLORS['DP'], percentage: 0.56, votes: '57,682' },
    'Henry Tumukunde Kakurugu': { party: 'IND', color: PARTY_COLORS['IND'], percentage: 0.50, votes: '51,392' },
    'Joseph Kabuleta Kiiza': { party: 'IND', color: PARTY_COLORS['IND'], percentage: 0.44, votes: '45,424' },
    'Nancy Linda Kalembe': { party: 'IND', color: PARTY_COLORS['IND'], percentage: 0.38, votes: '38,772' },
    'John Katumba': { party: 'IND', color: PARTY_COLORS['IND'], percentage: 0.36, votes: '37,554' },
    'Fred Mwesigye': { party: 'IND', color: PARTY_COLORS['IND'], percentage: 0.25, votes: '25,483' },
    'Willy Mayambala': { party: 'IND', color: PARTY_COLORS['IND'], percentage: 0.15, votes: '15,014' }
};

// Election data keyed by DISTRICT NAME IN CAPS
const dummyElectionData = ElectionDataProd;

// --- Helper Components ---

// Component to handle map actions like zooming programmatically
const MapController = ({ center, zoom, boundsToFit }) => {
  const map = useMap();

  useEffect(() => {
    if (boundsToFit) {
      // Check if bounds are valid before fitting
      if (boundsToFit.isValid()) {
        map.flyToBounds(boundsToFit, { padding: [50, 50] }); // Add padding
      } else {
        console.warn("Invalid bounds provided to MapController:", boundsToFit);
        // Optionally fly to default view if bounds are invalid
        if (center && zoom) {
          map.flyTo(center, zoom);
        }
      }
    } else if (center && zoom) {
      map.flyTo(center, zoom);
    }
  }, [map, center, zoom, boundsToFit]);

  return null; // This component doesn't render anything itself
};

// Legend component
const MapLegend = () => (
    <div className="leaflet-control leaflet-bar map-legend" style={{ // Added map-legend class
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slightly transparent background
        padding: '10px 15px', // Adjusted padding
        borderRadius: '5px',
        boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
        maxWidth: '300px',
        maxHeight: 'calc(60vh - 40px)', // Ensure it doesn't overlap controls
        overflowY: 'auto',
        fontSize: '13px', // Slightly larger base font size
        lineHeight: '1.4',
    }}>
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Political Parties</h4>
        {Object.entries(PARTY_COLORS)
            .filter(([key]) => key !== 'DEFAULT' && key !== 'HIGHLIGHT') // Exclude helper colors
            .map(([party, color]) => (
          <div key={party} style={{ display: 'flex', alignItems: 'center', margin: '5px 0' }}>
            <div style={{
              width: '18px', height: '18px', backgroundColor: color, marginRight: '10px',
              border: '1px solid #555', flexShrink: 0
            }}></div>
            <span>{party}</span>
          </div>
        ))}
        {/* Optional: Add default color explanation */}
         <div style={{ display: 'flex', alignItems: 'center', margin: '5px 0' }}>
            <div style={{
              width: '18px', height: '18px', backgroundColor: PARTY_COLORS.DEFAULT, marginRight: '10px',
              border: '1px solid #555', flexShrink: 0
            }}></div>
            <span>No Data / Unmatched</span>
          </div>
      </div>

      <div>
        <h4 style={{ margin: '15px 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Presidential Candidates (2021)</h4>
        {Object.entries(CANDIDATES).map(([candidate, data]) => (
          <div key={candidate} style={{
            display: 'flex', alignItems: 'center', margin: '6px 0', padding: '4px 0',
            borderBottom: '1px solid #eee' // Separator
          }}>
            <div style={{
              width: '18px', height: '18px', backgroundColor: data.color, marginRight: '10px',
              border: '1px solid #555', flexShrink: 0
            }}></div>
            <div>
              <div style={{ fontWeight: '600' }}>{candidate}</div>
              <div>{data.party} - {data.percentage}% <span style={{ color: '#555', fontSize: '11px' }}>({data.votes} votes)</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

// Data Insights Panel Component
const InsightsPanel = ({ stats, partyColors, onDismiss }) => {
    if (!stats) return null;

    const totalDistricts = Object.values(stats).reduce((sum, count) => sum + count, 0);

    return (
        <div className="leaflet-control leaflet-bar data-insights" style={{ // Added data-insights class
            backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '15px', borderRadius: '5px',
            boxShadow: '0 1px 5px rgba(0,0,0,0.4)', maxWidth: '280px',
            fontSize: '13px', lineHeight: '1.5'
        }}>
            <button onClick={onDismiss} style={{ float: 'right', border: 'none', background: 'transparent', fontSize: '16px', cursor: 'pointer', padding: '0 5px' }}>×</button>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>District Wins by Party</h4>
             <p style={{margin: '0 0 10px 0', fontSize: '12px', color: '#555'}}>Total Districts with Data: {totalDistricts}</p>
            {Object.entries(stats)
                .sort(([, countA], [, countB]) => countB - countA) // Sort by count descending
                .map(([party, count]) => (
                    <div key={party} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{
                            width: '18px', height: '18px', marginRight: '10px',
                            backgroundColor: partyColors[party] || PARTY_COLORS.DEFAULT,
                            border: '1px solid #555', flexShrink: 0
                        }}></div>
                        <span><strong>{party}:</strong> {count} district{count > 1 ? 's' : ''} ({((count / totalDistricts) * 100).toFixed(1)}%)</span>
                    </div>
                ))}
        </div>
    );
};


// --- Main Map Component ---

const UgandaDistrictsMap = ({ geojsonData, auth, pageTitle }) => {
  const [unmappedDistricts, setUnmappedDistricts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(''); // Use '' for 'All Regions'
  const [highlightedDistrict, setHighlightedDistrict] = useState(null); // Store name of highlighted district
  const [boundsToFit, setBoundsToFit] = useState(null); // LatLngBounds to zoom to
  const [showInsights, setShowInsights] = useState(false);
  const [partyStats, setPartyStats] = useState(null);
  const [mapCenter, setMapCenter] = useState([1.3733, 32.2903]); // Initial center
  const [mapZoom, setMapZoom] = useState(7); // Initial zoom

  const geoJsonLayerRef = useRef(null); // Ref to access GeoJSON layer methods if needed


  // --- Effects ---

  // Check for unmapped districts
  useEffect(() => {
    if (geojsonData) {
      const geoJsonDistricts = new Set(geojsonData.features.map(f => f.properties.district?.toUpperCase())); // Ensure comparison is case-insensitive
      const electionDistricts = Object.keys(dummyElectionData); // Already uppercase

      const unmapped = electionDistricts.filter(
        district => !geoJsonDistricts.has(district)
      );

      if (unmapped.length > 0) {
        console.warn('Districts in election data missing from GeoJSON properties.district (using UPPERCASE comparison):', unmapped);
        setUnmappedDistricts(unmapped);
      } else {
        setUnmappedDistricts([]); // Clear if all mapped
      }
    }
  }, [geojsonData]);

  // Calculate party statistics for the insights panel
  useEffect(() => {
    const stats = Object.values(dummyElectionData).reduce((acc, curr) => {
      if (curr && curr.winner) { // Ensure data is valid
        acc[curr.winner] = (acc[curr.winner] || 0) + 1;
      }
      return acc;
    }, {});
    setPartyStats(stats);
  }, []); // Runs once on mount as dummyElectionData is static

  // --- Memoized Values ---

  // Extract unique regions for the filter dropdown
  const availableRegions = useMemo(() => {
    if (!geojsonData) return [];
    const regions = new Set(geojsonData.features.map(f => f.properties.region).filter(Boolean)); // Filter out null/undefined regions
    return ['All Regions', ...Array.from(regions).sort()];
  }, [geojsonData]);

  // Uganda's approximate center coordinates (kept for reference)
  const ugandaCenter = useMemo(() => [1.3733, 32.2903], []);
  const defaultBounds = useMemo(() => { // Define default bounds for resetting view
      // Approximate bounds for Uganda - adjust as needed
      return L.latLngBounds(L.latLng(-1.5, 29.5), L.latLng(4.3, 35.0));
  }, []);


  // --- Callbacks ---

  // Filter GeoJSON features based on selected region
  const filterByRegion = useCallback((feature) => {
    if (!selectedRegion || selectedRegion === 'All Regions') return true;
    return feature.properties.region === selectedRegion;
  }, [selectedRegion]);

  // Style function using political party colors and highlight
  const getDistrictStyle = useCallback((feature) => {
    const districtName = feature.properties.district?.toUpperCase(); // Use uppercase for matching
    const electionResult = dummyElectionData[districtName];
    const isHighlighted = highlightedDistrict === districtName;

    let fillColor = PARTY_COLORS.DEFAULT;
    let fillOpacity = 0.6;
    let weight = 1;
    let color = '#666666'; // Border color

    if (electionResult) {
      fillColor = PARTY_COLORS[electionResult.winner] || PARTY_COLORS.DEFAULT; // Fallback to default
      fillOpacity = 0.7;
      weight = 1.5;
      color = '#333333';
    }

    // Apply highlight styles
    if (isHighlighted) {
      fillOpacity = 0.9;
      weight = 3;
      color = PARTY_COLORS.HIGHLIGHT; // Highlight border color
    }

    return { color, weight, opacity: 1, fillColor, fillOpacity };
  }, [highlightedDistrict]); // Dependency on highlightedDistrict

  // Function to handle search
  const handleSearch = useCallback(() => {
    if (!searchTerm.trim() || !geojsonData) {
        setHighlightedDistrict(null); // Clear highlight if search is empty
        setBoundsToFit(defaultBounds); // Reset view
        return;
    };

    const searchTermLower = searchTerm.trim().toLowerCase();
    let foundFeature = null;
    let featureLayer = null;

    // Access the GeoJSON layer instance through the ref
    const layer = geoJsonLayerRef.current;
    if (layer) {
        layer.eachLayer((l) => {
            // Check if feature matches search term (case-insensitive)
            if (l.feature.properties.district?.toLowerCase().includes(searchTermLower)) {
                foundFeature = l.feature;
                featureLayer = l; // Get the specific layer instance
                return; // Stop searching once found (optional, could collect multiple)
            }
        });
    }


    if (featureLayer && featureLayer.getBounds) {
      const bounds = featureLayer.getBounds();
      if (bounds.isValid()) {
        setHighlightedDistrict(foundFeature.properties.district.toUpperCase());
        setBoundsToFit(bounds); // Trigger MapController to zoom
      } else {
        console.warn("Found feature but bounds are invalid:", foundFeature.properties.district);
        alert(`Found ${foundFeature.properties.district}, but cannot determine its bounds.`);
         setHighlightedDistrict(null);
         setBoundsToFit(defaultBounds); // Reset view
      }
    } else {
      alert(`District matching "${searchTerm}" not found.`);
      setHighlightedDistrict(null);
      setBoundsToFit(defaultBounds); // Reset view
    }
  }, [searchTerm, geojsonData, defaultBounds]); // Added defaultBounds


  // Reset search, filter, and highlight
  const handleClear = useCallback(() => {
    setSearchTerm('');
    setSelectedRegion('');
    setHighlightedDistrict(null);
    setBoundsToFit(defaultBounds); // Reset map view to default bounds
    setShowInsights(false); // Optionally hide insights too
  }, [defaultBounds]); // Added defaultBounds


  // Configure popups and interactions for each district feature
  const onEachFeature = useCallback((feature, layer) => {
    // Store layer reference for search/highlight
    // Note: This happens for every feature, might be better to access via ref if needed globally

    if (feature.properties) {
      const { district, region, subregion, status } = feature.properties;
      const districtNameUpper = district?.toUpperCase(); // Use uppercase for matching
      const electionResult = dummyElectionData[districtNameUpper];

      // --- Popup Content ---
      let electionInfo = '<p style="margin: 3px 0; font-style: italic; color: #555;">No election data available</p>';
      if (electionResult) {
        electionInfo = `
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee">
            <h4 style="margin: 5px 0; color: ${PARTY_COLORS[electionResult.winner] || '#333'}; font-weight: bold;">
              Winner: ${electionResult.candidate || 'N/A'} (${electionResult.winner || 'N/A'})
            </h4>
            <p style="margin: 3px 0"><strong>Percentage:</strong> ${electionResult.percentage?.toFixed(2) ?? 'N/A'}%</p>
          </div>
        `;
      }

      const popupContent = `
        <div style="min-width: 200px; font-family: sans-serif; font-size: 13px;">
          <h3 style="margin: 0 0 8px 0; color: #222; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 4px;">${district || 'Unnamed District'}</h3>
          <p style="margin: 3px 0"><strong>Region:</strong> ${region || 'N/A'}</p>
          ${subregion ? `<p style="margin: 3px 0"><strong>Subregion:</strong> ${subregion}</p>` : ''}
          ${status ? `<p style="margin: 3px 0"><strong>Status:</strong> ${status}</p>` : ''}
          ${electionInfo}
        </div>
      `;

      layer.bindPopup(popupContent);

      // --- Event Handlers ---
      layer.on({
        mouseover: (e) => {
          // Only change style if not the currently highlighted district from search/click
          if (highlightedDistrict !== districtNameUpper) {
              const targetLayer = e.target;
              targetLayer.setStyle({
                  weight: 3,
                  fillOpacity: 0.9 // Make it slightly more opaque on hover
              });
                // Optional: Bring to front
              if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                 targetLayer.bringToFront();
              }
          }
        },
        mouseout: (e) => {
           // Only reset style if not the currently highlighted district
           if (highlightedDistrict !== districtNameUpper) {
               // Use the GeoJSON layer's resetStyle method if available, otherwise re-apply base style
               if (geoJsonLayerRef.current && geoJsonLayerRef.current.resetStyle) {
                   geoJsonLayerRef.current.resetStyle(e.target);
               } else {
                   // Fallback: Manually re-apply style (less efficient)
                   e.target.setStyle(getDistrictStyle(feature));
               }
           }
        },
        click: (e) => {
          // Highlight on click and zoom
          const clickedDistrictName = e.target.feature.properties.district?.toUpperCase();
          const bounds = e.target.getBounds();
          if (bounds.isValid()) {
              setHighlightedDistrict(clickedDistrictName);
              setBoundsToFit(bounds); // Zoom to clicked district
          } else {
              console.warn("Clicked feature has invalid bounds:", clickedDistrictName);
          }
          // Optional: Open popup programmatically if needed
          // e.target.openPopup();
        }
      });
    }
  }, [highlightedDistrict, getDistrictStyle]); // Dependencies


  // --- Render ---

  return (
    <>
      <Head title={pageTitle || 'Uganda Election Map'} />
      <AuthenticatedLayout user={auth.user}> {/* Ensure correct prop name for user */}
        {/* --- UI Controls Overlay --- */}
        <div className="absolute top-2 left-[60px] z-[1000] bg-white p-3 rounded shadow-md flex flex-col space-y-2 max-w-xs"> {/* Adjusted position slightly */}
            {/* Search */}
            <div className="flex items-center space-x-2">
                <input
                type="text"
                placeholder="Search district..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && handleSearch()} // Search on Enter
                className="p-2 border rounded-md text-sm w-full focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <button
                onClick={handleSearch}
                title="Search for district"
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm"
                >
                🔍 {/* Search Icon */}
                </button>
            </div>

            {/* Region Filter */}
            <select
                value={selectedRegion}
                onChange={(e) => {
                     setSelectedRegion(e.target.value);
                     setHighlightedDistrict(null); // Clear highlight when changing region
                     if (e.target.value === 'All Regions') {
                         setBoundsToFit(defaultBounds); // Reset view if 'All Regions' selected
                     }
                     // Optional: Zoom to region bounds if available/needed
                }}
                className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            >
                {availableRegions.map(region => (
                <option key={region} value={region}>{region}</option>
                ))}
            </select>

             {/* Clear Button */}
            <button
                onClick={handleClear}
                className="w-full bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded-md text-sm"
            >
                Clear Search/Filter
            </button>

            {/* Toggle Insights Panel */}
            <button
                onClick={() => setShowInsights(prev => !prev)}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white px-3 py-2 rounded-md text-sm mt-2"
            >
                {showInsights ? 'Hide' : 'Show'} Insights
            </button>
        </div>

        {/* --- Unmapped Districts Warning --- */}
        {process.env.NODE_ENV === 'development' && unmappedDistricts.length > 0 && (
            <div className="absolute top-2 right-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 z-[1000] rounded-md shadow text-xs max-w-sm" role="alert">
              <p className="font-bold">Data Warning</p>
              <p>{unmappedDistricts.length} district(s) in election data might not be matched in GeoJSON.</p>
              <p className="mt-1">Check console for details. (Using UPPERCASE matching for 'properties.district').</p>
              {/* Optional: Add a dismiss button */}
            </div>
        )}

         {/* --- Data Insights Panel (Conditional) --- */}
         {showInsights && (
            <div className="absolute bottom-10 right-4 z-[1000]"> {/* Adjusted position */}
               <InsightsPanel
                 stats={partyStats}
                 partyColors={PARTY_COLORS}
                 onDismiss={() => setShowInsights(false)}
               />
            </div>
         )}


        {/* --- Map Container --- */}
        <div className="w-full h-[calc(100vh-100px)] relative map-container"> {/* Adjusted height example */}
          <MapContainer
            // Use center/zoom only for initial load if no bounds are set
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%', backgroundColor: '#f0f0f0' }}
            // Bounds can also be set here for initial view
            // bounds={defaultBounds}
          >
            {/* Controller Component */}
            <MapController boundsToFit={boundsToFit} center={mapCenter} zoom={mapZoom} />

            {/* Base Tile Layer */}
            <TileLayer
              // Using OpenStreetMap standard tile layer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'



              // Optional: Add Mapbox or other tile layers if you have tokens/styles
              // url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
              // attribution='Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
              // id='mapbox/streets-v11' // Example style ID
              // accessToken="YOUR_MAPBOX_ACCESS_TOKEN" // Replace with your token
              
              
              // url="https://{s}.tiles.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
              // attribution='Uganda Map Data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              id="your-style-id"
              accessToken="your-access-token"
            
            />

             {/* Scale Control */}
             <ScaleControl position="bottomleft" />

            {/* GeoJSON Layer for Districts */}
            {geojsonData && (
              <GeoJSON
                ref={geoJsonLayerRef} // Assign ref
                key={selectedRegion} // Re-render GeoJSON layer when filter changes (simplest way to apply filter)
                data={geojsonData}
                style={getDistrictStyle}
                filter={filterByRegion} // Apply region filter function
                onEachFeature={onEachFeature}
              />
            )}

            {/* Legend */}
             <div className="leaflet-bottom leaflet-left" style={{ pointerEvents: 'none' }}> {/* Wrapper for legend position */}
                 <div style={{ pointerEvents: 'auto' }}> {/* Allow interaction with legend */}
                    <MapLegend />
                </div>
             </div>

          </MapContainer>
        </div>
      </AuthenticatedLayout>
    </>
  );
};

export default React.memo(UgandaDistrictsMap); // Memoize the component