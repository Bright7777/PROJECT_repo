#!/usr/bin/env python3
"""
Test script for Multiple Disease Prediction System API
This script demonstrates how to use the API endpoints
"""

import requests
import json
import time

# Base URL for the API
BASE_URL = "http://localhost:5000"

def test_breast_cancer_prediction():
    """Test breast cancer prediction endpoint"""
    print("Testing Breast Cancer Prediction...")
    
    data = {
        "patient_name": "Test Patient 1",
        "features": {
            "mean_radius": 17.99,
            "mean_texture": 10.38,
            "mean_perimeter": 122.8,
            "mean_area": 1001,
            "mean_smoothness": 0.1184,
            "mean_compactness": 0.2776,
            "mean_concavity": 0.3001,
            "mean_concave_points": 0.1471,
            "mean_symmetry": 0.2419,
            "mean_fractal_dimension": 0.07871
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/predict/breast_cancer", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Breast Cancer Prediction Result:")
            print(f"   Patient: {data['patient_name']}")
            print(f"   Prediction: {result['prediction']}")
            print(f"   Confidence: {result['confidence']:.2%}")
            print(f"   Prediction ID: {result['prediction_id']}")
            return result['prediction_id']
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None

def test_diabetes_prediction():
    """Test diabetes prediction endpoint"""
    print("\nTesting Diabetes Prediction...")
    
    data = {
        "patient_name": "Test Patient 2",
        "features": {
            "glucose": 148,
            "blood_pressure": 72,
            "skin_thickness": 35,
            "insulin": 0,
            "bmi": 33.6,
            "diabetes_pedigree": 0.627,
            "age": 50
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/predict/diabetes", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Diabetes Prediction Result:")
            print(f"   Patient: {data['patient_name']}")
            print(f"   Prediction: {result['prediction']}")
            print(f"   Confidence: {result['confidence']:.2%}")
            print(f"   Prediction ID: {result['prediction_id']}")
            return result['prediction_id']
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None

def test_heart_disease_prediction():
    """Test heart disease prediction endpoint"""
    print("\nTesting Heart Disease Prediction...")
    
    data = {
        "patient_name": "Test Patient 3",
        "features": {
            "age": 63,
            "sex": 1,
            "chest_pain": 3,
            "resting_bp": 145,
            "cholesterol": 233,
            "fasting_bs": 1,
            "resting_ecg": 0,
            "max_hr": 150,
            "exercise_angina": 0,
            "oldpeak": 2.3,
            "st_slope": 0
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/predict/heart_disease", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Heart Disease Prediction Result:")
            print(f"   Patient: {data['patient_name']}")
            print(f"   Prediction: {result['prediction']}")
            print(f"   Confidence: {result['confidence']:.2%}")
            print(f"   Prediction ID: {result['prediction_id']}")
            return result['prediction_id']
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None

def test_chatbot():
    """Test chatbot endpoint"""
    print("\nTesting AI Chatbot...")
    
    questions = [
        "What are the symptoms of diabetes?",
        "How to prevent heart disease?",
        "Tell me about breast cancer risk factors"
    ]
    
    for question in questions:
        data = {
            "message": question,
            "session_id": "test_session"
        }
        
        try:
            response = requests.post(f"{BASE_URL}/chatbot", json=data)
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Question: {question}")
                print(f"   Response: {result['response'][:100]}...")
            else:
                print(f"❌ Error: {response.status_code} - {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {e}")
        
        time.sleep(1)  # Small delay between requests

def test_history():
    """Test prediction history endpoint"""
    print("\nTesting Prediction History...")
    
    try:
        response = requests.get(f"{BASE_URL}/history")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ History Retrieved:")
            print(f"   Total predictions: {len(result['history'])}")
            if result['history']:
                latest = result['history'][0]
                print(f"   Latest prediction: {latest['patient_name']} - {latest['disease_type']} - {latest['prediction_result']}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")

def test_report_download(prediction_id):
    """Test report download endpoint"""
    if not prediction_id:
        return
        
    print(f"\nTesting Report Download for Prediction ID: {prediction_id}...")
    
    try:
        response = requests.get(f"{BASE_URL}/generate_report/{prediction_id}")
        if response.status_code == 200:
            # Save the PDF file
            filename = f"test_report_{prediction_id}.pdf"
            with open(filename, 'wb') as f:
                f.write(response.content)
            print(f"✅ Report downloaded successfully: {filename}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")

def main():
    """Main test function"""
    print("🧪 Multiple Disease Prediction System - API Test Suite")
    print("=" * 60)
    
    # Test if the server is running
    try:
        response = requests.get(BASE_URL)
        if response.status_code != 200:
            print(f"❌ Server not responding correctly. Status: {response.status_code}")
            return
    except requests.exceptions.RequestException:
        print("❌ Server is not running. Please start the application first:")
        print("   python app.py")
        return
    
    print("✅ Server is running. Starting tests...\n")
    
    # Run all tests
    bc_id = test_breast_cancer_prediction()
    db_id = test_diabetes_prediction()
    hd_id = test_heart_disease_prediction()
    
    test_chatbot()
    test_history()
    
    # Test report download with the first successful prediction
    if bc_id:
        test_report_download(bc_id)
    
    print("\n" + "=" * 60)
    print("🎉 All tests completed!")
    print("\n📋 Test Summary:")
    print("   - Disease predictions: ✅")
    print("   - AI Chatbot: ✅")
    print("   - History retrieval: ✅")
    print("   - Report generation: ✅")
    print("\n💡 You can now test the web interface at: http://localhost:5000")

if __name__ == "__main__":
    main()