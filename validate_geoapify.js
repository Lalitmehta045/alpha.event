require('dotenv').config();
const fs = require('fs');

const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
const MAPBOX_KEY = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const testCases = [
  "Prestige College Indore",
  "Acropolis College Indore",
  "Sheraton Hotel Indore",
  "Sayaji Hotel Indore",
  "Radisson Blu Indore",
  "C21 Mall Indore",
  "Bombay Hospital Indore",
  "Treasure Island Indore",
  "Brilliant Convention Centre",
  "Labh Ganga Garden"
];

async function fetchGeoapify(query) {
  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=3&filter=countrycode:in&apiKey=${GEOAPIFY_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.features || []).map(f => {
    return `[${f.properties.result_type || 'unknown'}] ${f.properties.name || 'Unnamed'} - ${f.properties.formatted}`;
  });
}

async function fetchMapbox(query) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=in&limit=3&types=poi,address&access_token=${MAPBOX_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.features || []).map(f => {
    const category = f.properties?.category || '';
    return `[${f.place_type.join(',')}] ${f.text} ${category ? '('+category+')' : ''} - ${f.place_name}`;
  });
}

async function runTests() {
  let report = "# Mapbox vs Geoapify Comparison Report\n\n";

  for (const query of testCases) {
    console.log(`Testing: ${query}`);
    report += `## Query: "${query}"\n\n`;
    
    report += `### Mapbox Top 3:\n`;
    try {
      const mapboxResults = await fetchMapbox(query);
      if(mapboxResults.length === 0) report += "- No results\n";
      mapboxResults.forEach((r, i) => { report += `${i+1}. ${r}\n` });
    } catch(e) {
       report += `- Error: ${e.message}\n`;
    }

    report += `\n### Geoapify Top 3:\n`;
    try {
      const geoapifyResults = await fetchGeoapify(query);
      if(geoapifyResults.length === 0) report += "- No results\n";
      geoapifyResults.forEach((r, i) => { report += `${i+1}. ${r}\n` });
    } catch(e) {
       report += `- Error: ${e.message}\n`;
    }
    
    report += `\n---\n\n`;
  }

  fs.writeFileSync('C:/Users/HP-PC/.gemini/antigravity-ide/brain/33ed05b8-4247-48e0-8bde-cecbfaabdf4c/comparison_report.md', report);
  console.log("Report generated.");
}

runTests();
