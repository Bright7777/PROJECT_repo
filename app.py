from flask import Flask, request, jsonify, render_template, send_file
from datetime import datetime, date
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
import json
try:
    import openai
except ImportError:
    openai = None
from dotenv import load_dotenv
import plotly.graph_objs as go
import plotly.utils

# Load environment variables
load_dotenv()

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        "message": "Flask Application Running Successfully!",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "libraries": {
            "numpy": np.__version__,
            "sklearn": "available",
            "plotly": "available",
            "flask": "available"
        }
    })

@app.route('/api/test')
def api_test():
    """Test API endpoint to verify basic functionality"""
    # Create sample data
    X = np.random.rand(100, 4)
    y = np.random.randint(0, 2, 100)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train a simple model
    model = LogisticRegression()
    model.fit(X_train, y_train)
    
    # Make predictions
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    
    return jsonify({
        "test": "success",
        "model": "LogisticRegression",
        "accuracy": float(accuracy),
        "sample_size": len(X),
        "features": X.shape[1]
    })

@app.route('/api/plot')
def create_plot():
    """Create a simple plotly plot"""
    import plotly.graph_objs as go
    import plotly.utils
    
    # Sample data
    x = np.linspace(0, 10, 100)
    y = np.sin(x)
    
    # Create plot
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=x, y=y, mode='lines', name='sin(x)'))
    fig.update_layout(title='Sample Sine Wave Plot')
    
    graph_json = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    
    return jsonify({
        "plot_data": graph_json,
        "message": "Plot created successfully"
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)