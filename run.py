#!/usr/bin/env python3
"""
Simple script to run the Multiple Disease Prediction System
"""

import os
import sys
from app import app, db

def main():
    """Main function to start the application"""
    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()
        print("Database tables created successfully!")
    
    print("Starting Multiple Disease Prediction System...")
    print("Access the application at: http://localhost:5000")
    print("Press Ctrl+C to stop the server")
    
    # Run the application
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000
    )

if __name__ == "__main__":
    main()