// Data processing and management
let tariffData = [];
let historicalData = [];
let populationData = [];

// Function to load and process CSV data
async function loadData() {
    try {
        // Load tariff data
        const tariffResponse = await fetch('Tariff Calculations.csv');
        const tariffText = await tariffResponse.text();
        tariffData = processCSV(tariffText);

        // Load population data
        const populationResponse = await fetch('Tariff Calculations plus Population.csv');
        const populationText = await populationResponse.text();
        populationData = processCSV(populationText);

        // Load historical data
        const historicalResponse = await fetch('34_years_world_export_import_dataset.csv');
        const historicalText = await historicalResponse.text();
        historicalData = processCSV(historicalText);

        // Process and combine data
        processCombinedData();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Helper function to process CSV data
function processCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(';');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(';');
        if (values.length === headers.length) {
            const entry = {};
            headers.forEach((header, index) => {
                entry[header.trim()] = values[index].trim();
            });
            data.push(entry);
        }
    }

    return data;
}

// Process and combine data from different sources
function processCombinedData() {
    // Combine tariff and population data
    const combinedData = tariffData.map(tariffEntry => {
        const populationEntry = populationData.find(p => p.Country === tariffEntry.Country);
        return {
            ...tariffEntry,
            Population: populationEntry ? populationEntry.Population : null,
            // Add digital infrastructure access score (simplified for demonstration)
            DigitalAccessScore: calculateDigitalAccessScore(tariffEntry.Country)
        };
    });

    // Process historical data for trends
    const historicalTrends = processHistoricalData();

    // Make data available globally
    window.visualizationData = {
        combinedData,
        historicalTrends
    };

    // Initialize visualizations
    initializeVisualizations();
}

// Simplified function to calculate digital infrastructure access score
function calculateDigitalAccessScore(country) {
    // This is a simplified scoring system
    // In a real application, this would use actual digital infrastructure data
    const baseScore = Math.random() * 100; // Random score for demonstration
    return Math.round(baseScore);
}

// Process historical data for trend analysis
function processHistoricalData() {
    const trends = {};
    
    historicalData.forEach(entry => {
        const country = entry['Partner Name'];
        if (!trends[country]) {
            trends[country] = [];
        }
        
        trends[country].push({
            year: parseInt(entry.Year),
            exports: parseFloat(entry['Export (US$ Thousand)']),
            imports: parseFloat(entry['Import (US$ Thousand)']),
            tariffRate: parseFloat(entry['AHS Simple Average (%)'])
        });
    });

    return trends;
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', loadData); 