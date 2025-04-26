// Visualization functions
function initializeVisualizations() {
    if (!window.visualizationData) return;

    createTariffImpactChart();
    createDeficitInfrastructureChart();
    createHistoricalTrendsChart();
    createTopAffectedChart();
}

// Create the tariff impact visualization
function createTariffImpactChart() {
    const data = window.visualizationData.combinedData;
    
    const trace = {
        x: data.map(d => d.Country),
        y: data.map(d => parseFloat(d['US 2024 Deficit'].replace(/,/g, ''))),
        type: 'bar',
        marker: {
            color: data.map(d => 
                d.DigitalAccessScore < 50 ? '#e74c3c' : '#3498db'
            )
        },
        text: data.map(d => `Digital Access Score: ${d.DigitalAccessScore}`),
        hoverinfo: 'text+y'
    };

    const layout = {
        title: 'US Trade Deficit by Country (2024)',
        xaxis: {
            title: 'Country',
            tickangle: 45
        },
        yaxis: {
            title: 'Trade Deficit (Millions USD)'
        },
        showlegend: false
    };

    Plotly.newPlot('tariff-impact-chart', [trace], layout);
}

// Create the deficit vs. infrastructure access visualization
function createDeficitInfrastructureChart() {
    const data = window.visualizationData.combinedData;
    
    const trace = {
        x: data.map(d => d.DigitalAccessScore),
        y: data.map(d => parseFloat(d['US 2024 Deficit'].replace(/,/g, ''))),
        mode: 'markers',
        type: 'scatter',
        text: data.map(d => d.Country),
        marker: {
            size: data.map(d => Math.sqrt(parseFloat(d.Population || 0) / 1000000)),
            color: '#3498db'
        }
    };

    const layout = {
        title: 'Trade Deficit vs. Digital Infrastructure Access',
        xaxis: {
            title: 'Digital Infrastructure Access Score'
        },
        yaxis: {
            title: 'Trade Deficit (Millions USD)'
        }
    };

    Plotly.newPlot('deficit-infrastructure-chart', [trace], layout);
}

// Create the historical trends visualization
function createHistoricalTrendsChart() {
    const trends = window.visualizationData.historicalTrends;
    const selectedCountries = Object.keys(trends).slice(0, 5); // Show top 5 countries
    
    const traces = selectedCountries.map(country => {
        const countryData = trends[country];
        return {
            x: countryData.map(d => d.year),
            y: countryData.map(d => d.tariffRate),
            name: country,
            type: 'scatter',
            mode: 'lines+markers'
        };
    });

    const layout = {
        title: 'Historical Tariff Rates by Country',
        xaxis: {
            title: 'Year'
        },
        yaxis: {
            title: 'Average Tariff Rate (%)'
        }
    };

    Plotly.newPlot('historical-trends-chart', traces, layout);
}

// Create the top affected countries visualization
function createTopAffectedChart() {
    const data = window.visualizationData.combinedData
        .sort((a, b) => {
            const deficitA = parseFloat(a['US 2024 Deficit'].replace(/,/g, ''));
            const deficitB = parseFloat(b['US 2024 Deficit'].replace(/,/g, ''));
            return deficitA - deficitB;
        })
        .slice(0, 10); // Top 10 most affected countries

    const trace = {
        x: data.map(d => d.Country),
        y: data.map(d => parseFloat(d['Trump Tariffs Alleged'].replace('%', ''))),
        type: 'bar',
        name: 'Alleged Tariffs',
        marker: {
            color: '#e74c3c'
        }
    };

    const trace2 = {
        x: data.map(d => d.Country),
        y: data.map(d => parseFloat(d['Trump Response'].replace('%', ''))),
        type: 'bar',
        name: 'Response Tariffs',
        marker: {
            color: '#3498db'
        }
    };

    const layout = {
        title: 'Top 10 Most Affected Countries by Tariffs',
        xaxis: {
            title: 'Country',
            tickangle: 45
        },
        yaxis: {
            title: 'Tariff Rate (%)'
        },
        barmode: 'group'
    };

    Plotly.newPlot('top-affected-chart', [trace, trace2], layout);
}

// Add event listeners for interactivity
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects to charts
    const charts = document.querySelectorAll('.chart-container');
    charts.forEach(chart => {
        chart.addEventListener('mouseenter', () => {
            chart.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        });
        
        chart.addEventListener('mouseleave', () => {
            chart.style.boxShadow = 'none';
        });
    });
});

// Sample data (replace with actual data from your CSV files)
const data = {
    countries: ['China', 'European Union', 'Mexico', 'Vietnam', 'Taiwan', 'Japan', 'South Korea', 'Canada', 'India'],
    deficits: [-295401.6, -235571.2, -171809.2, -123463.0, -73927.2, -68467.7, -66007.4, -63335.8, -45663.8],
    digitalScores: [65, 85, 70, 45, 75, 80, 75, 85, 55],
    populations: [1412000000, 447700000, 126700000, 97340000, 23820000, 125700000, 51740000, 38010000, 1393000000],
    allegedTariffs: [67, 39, 34, 90, 64, 46, 50, 15, 52],
    responseTariffs: [34, 19, 17, 45, 32, 23, 25, 10, 26],
    employmentImpact: [12, 8, 15, 25, 10, 7, 9, 5, 18]
};

// Helper function to determine color based on digital score
function getColor(score) {
    return score >= 50 ? '#3498db' : '#e74c3c';
}

// Tariff Impact Chart
const tariffCtx = document.getElementById('tariff-impact-chart').getContext('2d');
new Chart(tariffCtx, {
    type: 'bar',
    data: {
        labels: data.countries,
        datasets: [{
            label: 'Trade Deficit (Millions USD)',
            data: data.deficits,
            backgroundColor: data.digitalScores.map(score => getColor(score)),
            borderColor: '#2c3e50',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'US Trade Deficit by Country (2024)'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `Deficit: $${Math.abs(context.raw).toLocaleString()}M`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                title: {
                    display: true,
                    text: 'Trade Deficit (Millions USD)'
                }
            }
        }
    }
});

// Deficit vs. Infrastructure Chart
const deficitCtx = document.getElementById('deficit-infrastructure-chart').getContext('2d');
new Chart(deficitCtx, {
    type: 'scatter',
    data: {
        datasets: [{
            label: 'Countries',
            data: data.countries.map((country, i) => ({
                x: data.digitalScores[i],
                y: data.deficits[i],
                r: Math.sqrt(data.populations[i] / 1000000) * 2
            })),
            backgroundColor: data.digitalScores.map(score => getColor(score)),
            borderColor: '#2c3e50',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Trade Deficit vs. Digital Infrastructure Access'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const index = context.dataIndex;
                        return [
                            `Country: ${data.countries[index]}`,
                            `Digital Score: ${data.digitalScores[index]}`,
                            `Deficit: $${Math.abs(data.deficits[index]).toLocaleString()}M`,
                            `Population: ${data.populations[index].toLocaleString()}`
                        ];
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Digital Infrastructure Access Score'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Trade Deficit (Millions USD)'
                }
            }
        }
    }
});

// Employment Impact Chart
const employmentCtx = document.getElementById('employment-impact-chart').getContext('2d');
new Chart(employmentCtx, {
    type: 'bar',
    data: {
        labels: data.countries,
        datasets: [{
            label: 'Jobs at Risk (%)',
            data: data.employmentImpact,
            backgroundColor: data.digitalScores.map(score => getColor(score)),
            borderColor: '#2c3e50',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Estimated Job Losses Due to Tariffs'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.raw}% of export sector jobs at risk`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Percentage of Jobs at Risk'
                }
            }
        }
    }
});

// Top Affected Countries Chart
const topAffectedCtx = document.getElementById('top-affected-chart').getContext('2d');
new Chart(topAffectedCtx, {
    type: 'bar',
    data: {
        labels: data.countries,
        datasets: [
            {
                label: 'Alleged Tariffs',
                data: data.allegedTariffs,
                backgroundColor: '#e74c3c',
                borderColor: '#2c3e50',
                borderWidth: 1
            },
            {
                label: 'Response Tariffs',
                data: data.responseTariffs,
                backgroundColor: '#3498db',
                borderColor: '#2c3e50',
                borderWidth: 1
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Top Affected Countries by Tariffs'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.raw}%`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Tariff Rate (%)'
                }
            }
        }
    }
}); 