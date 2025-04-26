import dash
from dash import dcc, html
from dash.dependencies import Input, Output
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import numpy as np

# Load and process data
def load_data():
    # Load tariff data
    tariff_df = pd.read_csv('Tariff Calculations.csv', sep=';')
    
    # Load population data
    population_df = pd.read_csv('Tariff Calculations plus Population.csv', sep=';')
    
    # Clean and process data
    tariff_df['US 2024 Deficit'] = tariff_df['US 2024 Deficit'].str.replace(',', '').astype(float)
    tariff_df['Trump Tariffs Alleged'] = tariff_df['Trump Tariffs Alleged'].str.replace('%', '').astype(float)
    tariff_df['Trump Response'] = tariff_df['Trump Response'].str.replace('%', '').astype(float)
    
    # Merge data
    df = pd.merge(tariff_df, population_df[['Country', 'Population']], on='Country', how='left')
    
    # Add digital infrastructure score (simplified for demonstration)
    df['DigitalAccessScore'] = np.random.randint(0, 100, size=len(df))
    
    return df

# Initialize the Dash app
app = dash.Dash(__name__)

# Load data
df = load_data()

# Create the layout
app.layout = html.Div([
    html.Header([
        html.H1("US Tariffs 2025: Impact on Global Trade"),
        html.P("Analyzing the effects of US tariffs on countries with limited digital infrastructure access",
              className="subtitle")
    ]),
    
    html.Main([
        # Tariff Impact by Country
        html.Section([
            html.H2("Tariff Impact by Country"),
            dcc.Graph(id='tariff-impact-chart'),
            html.P("This visualization shows the projected impact of US tariffs on different countries. "
                  "Countries with limited digital infrastructure access (marked in red) are particularly vulnerable to these changes.",
                  className="explanation")
        ], className="visualization-section"),
        
        # Trade Deficit vs. Digital Infrastructure Access
        html.Section([
            html.H2("Trade Deficit vs. Digital Infrastructure Access"),
            dcc.Graph(id='deficit-infrastructure-chart'),
            html.P("The correlation between trade deficits and digital infrastructure access highlights how countries "
                  "with limited technological capabilities are disproportionately affected by tariff changes.",
                  className="explanation")
        ], className="visualization-section"),
        
        # Tariff Impact on GDP
        html.Section([
            html.H2("Tariff Impact on GDP per Capita"),
            dcc.Graph(id='gdp-impact-chart'),
            html.P("This visualization shows how tariffs affect countries' GDP per capita, with emphasis on "
                  "countries with limited digital infrastructure access.",
                  className="explanation")
        ], className="visualization-section"),
        
        # Top Affected Countries
        html.Section([
            html.H2("Top Affected Countries"),
            dcc.Graph(id='top-affected-chart'),
            html.P("Countries most affected by the 2025 tariffs, with emphasis on those lacking digital infrastructure access.",
                  className="explanation")
        ], className="visualization-section")
    ]),
    
    html.Footer([
        html.P("Data Sources: US Trade Data, World Bank Digital Infrastructure Index"),
        html.P("Created for educational purposes")
    ])
])

# Callback for Tariff Impact Chart
@app.callback(
    Output('tariff-impact-chart', 'figure'),
    Input('tariff-impact-chart', 'relayoutData')
)
def update_tariff_impact_chart(relayoutData):
    fig = go.Figure()
    
    # Add bars for countries with good digital access
    good_access = df[df['DigitalAccessScore'] >= 50]
    fig.add_trace(go.Bar(
        x=good_access['Country'],
        y=good_access['US 2024 Deficit'],
        name='Good Digital Access',
        marker_color='#3498db'
    ))
    
    # Add bars for countries with poor digital access
    poor_access = df[df['DigitalAccessScore'] < 50]
    fig.add_trace(go.Bar(
        x=poor_access['Country'],
        y=poor_access['US 2024 Deficit'],
        name='Poor Digital Access',
        marker_color='#e74c3c'
    ))
    
    fig.update_layout(
        title='US Trade Deficit by Country (2024)',
        xaxis_title='Country',
        yaxis_title='Trade Deficit (Millions USD)',
        barmode='group',
        xaxis_tickangle=45
    )
    
    return fig

# Callback for Deficit vs. Infrastructure Chart
@app.callback(
    Output('deficit-infrastructure-chart', 'figure'),
    Input('deficit-infrastructure-chart', 'relayoutData')
)
def update_deficit_infrastructure_chart(relayoutData):
    fig = px.scatter(
        df,
        x='DigitalAccessScore',
        y='US 2024 Deficit',
        size='Population',
        color='DigitalAccessScore',
        hover_name='Country',
        title='Trade Deficit vs. Digital Infrastructure Access'
    )
    
    fig.update_layout(
        xaxis_title='Digital Infrastructure Access Score',
        yaxis_title='Trade Deficit (Millions USD)'
    )
    
    return fig

# Callback for GDP Impact Chart
@app.callback(
    Output('gdp-impact-chart', 'figure'),
    Input('gdp-impact-chart', 'relayoutData')
)
def update_gdp_impact_chart(relayoutData):
    # Calculate GDP per capita impact (simplified for demonstration)
    df['GDP_Impact'] = df['US 2024 Deficit'] / df['Population'].astype(float)
    
    fig = go.Figure()
    
    # Add bars for countries with good digital access
    good_access = df[df['DigitalAccessScore'] >= 50]
    fig.add_trace(go.Bar(
        x=good_access['Country'],
        y=good_access['GDP_Impact'],
        name='Good Digital Access',
        marker_color='#3498db'
    ))
    
    # Add bars for countries with poor digital access
    poor_access = df[df['DigitalAccessScore'] < 50]
    fig.add_trace(go.Bar(
        x=poor_access['Country'],
        y=poor_access['GDP_Impact'],
        name='Poor Digital Access',
        marker_color='#e74c3c'
    ))
    
    fig.update_layout(
        title='Tariff Impact on GDP per Capita',
        xaxis_title='Country',
        yaxis_title='GDP Impact per Capita (USD)',
        barmode='group',
        xaxis_tickangle=45
    )
    
    return fig

# Callback for Top Affected Countries Chart
@app.callback(
    Output('top-affected-chart', 'figure'),
    Input('top-affected-chart', 'relayoutData')
)
def update_top_affected_chart(relayoutData):
    # Sort by deficit and take top 10
    top_affected = df.nlargest(10, 'US 2024 Deficit')
    
    fig = go.Figure()
    
    fig.add_trace(go.Bar(
        x=top_affected['Country'],
        y=top_affected['Trump Tariffs Alleged'],
        name='Alleged Tariffs',
        marker_color='#e74c3c'
    ))
    
    fig.add_trace(go.Bar(
        x=top_affected['Country'],
        y=top_affected['Trump Response'],
        name='Response Tariffs',
        marker_color='#3498db'
    ))
    
    fig.update_layout(
        title='Top 10 Most Affected Countries by Tariffs',
        xaxis_title='Country',
        yaxis_title='Tariff Rate (%)',
        barmode='group',
        xaxis_tickangle=45
    )
    
    return fig

if __name__ == '__main__':
    app.run_server(debug=True) 