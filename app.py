from flask import Flask, request, jsonify, render_template, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
import json
import openai
from dotenv import load_dotenv
import plotly.graph_objs as go
import plotly.utils
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
import io
import base64

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///disease_predictions.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'

CORS(app)
db = SQLAlchemy(app)

# Database Models
class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_name = db.Column(db.String(100), nullable=False)
    disease_type = db.Column(db.String(50), nullable=False)
    prediction_result = db.Column(db.String(20), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    input_features = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    recommendations = db.Column(db.Text)

class ChatHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    response = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Initialize models dictionary
models = {}
scalers = {}

def create_sample_data():
    """Create sample datasets for training models"""
    # Breast Cancer Dataset
    np.random.seed(42)
    n_samples = 1000
    
    # Breast Cancer features
    breast_cancer_data = {
        'mean_radius': np.random.normal(14, 3, n_samples),
        'mean_texture': np.random.normal(19, 4, n_samples),
        'mean_perimeter': np.random.normal(92, 17, n_samples),
        'mean_area': np.random.normal(655, 350, n_samples),
        'mean_smoothness': np.random.normal(0.096, 0.014, n_samples),
        'mean_compactness': np.random.normal(0.104, 0.053, n_samples),
        'mean_concavity': np.random.normal(0.089, 0.080, n_samples),
        'mean_concave_points': np.random.normal(0.048, 0.039, n_samples),
        'mean_symmetry': np.random.normal(0.181, 0.027, n_samples),
        'mean_fractal_dimension': np.random.normal(0.063, 0.007, n_samples)
    }
    
    # Create target based on logical rules
    breast_cancer_target = []
    for i in range(n_samples):
        score = (breast_cancer_data['mean_radius'][i] > 15) * 0.3 + \
                (breast_cancer_data['mean_texture'][i] > 20) * 0.2 + \
                (breast_cancer_data['mean_area'][i] > 700) * 0.3 + \
                (breast_cancer_data['mean_compactness'][i] > 0.1) * 0.2
        breast_cancer_target.append(1 if score > 0.5 + np.random.normal(0, 0.1) else 0)
    
    breast_cancer_df = pd.DataFrame(breast_cancer_data)
    breast_cancer_df['target'] = breast_cancer_target
    
    # Diabetes Dataset
    diabetes_data = {
        'glucose': np.random.normal(120, 30, n_samples),
        'blood_pressure': np.random.normal(75, 15, n_samples),
        'skin_thickness': np.random.normal(20, 10, n_samples),
        'insulin': np.random.normal(80, 40, n_samples),
        'bmi': np.random.normal(25, 5, n_samples),
        'diabetes_pedigree': np.random.normal(0.4, 0.3, n_samples),
        'age': np.random.randint(20, 80, n_samples)
    }
    
    diabetes_target = []
    for i in range(n_samples):
        score = (diabetes_data['glucose'][i] > 140) * 0.4 + \
                (diabetes_data['bmi'][i] > 30) * 0.3 + \
                (diabetes_data['age'][i] > 50) * 0.2 + \
                (diabetes_data['diabetes_pedigree'][i] > 0.5) * 0.1
        diabetes_target.append(1 if score > 0.4 + np.random.normal(0, 0.1) else 0)
    
    diabetes_df = pd.DataFrame(diabetes_data)
    diabetes_df['target'] = diabetes_target
    
    # Heart Disease Dataset
    heart_data = {
        'age': np.random.randint(30, 80, n_samples),
        'sex': np.random.randint(0, 2, n_samples),
        'chest_pain': np.random.randint(0, 4, n_samples),
        'resting_bp': np.random.normal(130, 20, n_samples),
        'cholesterol': np.random.normal(240, 50, n_samples),
        'fasting_bs': np.random.randint(0, 2, n_samples),
        'resting_ecg': np.random.randint(0, 3, n_samples),
        'max_hr': np.random.normal(150, 25, n_samples),
        'exercise_angina': np.random.randint(0, 2, n_samples),
        'oldpeak': np.random.normal(1, 1, n_samples),
        'st_slope': np.random.randint(0, 3, n_samples)
    }
    
    heart_target = []
    for i in range(n_samples):
        score = (heart_data['age'][i] > 55) * 0.2 + \
                (heart_data['chest_pain'][i] > 1) * 0.3 + \
                (heart_data['cholesterol'][i] > 240) * 0.2 + \
                (heart_data['exercise_angina'][i] == 1) * 0.3
        heart_target.append(1 if score > 0.4 + np.random.normal(0, 0.1) else 0)
    
    heart_df = pd.DataFrame(heart_data)
    heart_df['target'] = heart_target
    
    return breast_cancer_df, diabetes_df, heart_df

def train_models():
    """Train machine learning models for disease prediction"""
    print("Creating sample data and training models...")
    
    breast_cancer_df, diabetes_df, heart_df = create_sample_data()
    
    # Train Breast Cancer Model
    X_bc = breast_cancer_df.drop('target', axis=1)
    y_bc = breast_cancer_df['target']
    X_train_bc, X_test_bc, y_train_bc, y_test_bc = train_test_split(X_bc, y_bc, test_size=0.2, random_state=42)
    
    scaler_bc = StandardScaler()
    X_train_bc_scaled = scaler_bc.fit_transform(X_train_bc)
    X_test_bc_scaled = scaler_bc.transform(X_test_bc)
    
    model_bc = RandomForestClassifier(n_estimators=100, random_state=42)
    model_bc.fit(X_train_bc_scaled, y_train_bc)
    
    accuracy_bc = accuracy_score(y_test_bc, model_bc.predict(X_test_bc_scaled))
    print(f"Breast Cancer Model Accuracy: {accuracy_bc:.2f}")
    
    # Train Diabetes Model
    X_db = diabetes_df.drop('target', axis=1)
    y_db = diabetes_df['target']
    X_train_db, X_test_db, y_train_db, y_test_db = train_test_split(X_db, y_db, test_size=0.2, random_state=42)
    
    scaler_db = StandardScaler()
    X_train_db_scaled = scaler_db.fit_transform(X_train_db)
    X_test_db_scaled = scaler_db.transform(X_test_db)
    
    model_db = RandomForestClassifier(n_estimators=100, random_state=42)
    model_db.fit(X_train_db_scaled, y_train_db)
    
    accuracy_db = accuracy_score(y_test_db, model_db.predict(X_test_db_scaled))
    print(f"Diabetes Model Accuracy: {accuracy_db:.2f}")
    
    # Train Heart Disease Model
    X_hd = heart_df.drop('target', axis=1)
    y_hd = heart_df['target']
    X_train_hd, X_test_hd, y_train_hd, y_test_hd = train_test_split(X_hd, y_hd, test_size=0.2, random_state=42)
    
    scaler_hd = StandardScaler()
    X_train_hd_scaled = scaler_hd.fit_transform(X_train_hd)
    X_test_hd_scaled = scaler_hd.transform(X_test_hd)
    
    model_hd = RandomForestClassifier(n_estimators=100, random_state=42)
    model_hd.fit(X_train_hd_scaled, y_train_hd)
    
    accuracy_hd = accuracy_score(y_test_hd, model_hd.predict(X_test_hd_scaled))
    print(f"Heart Disease Model Accuracy: {accuracy_hd:.2f}")
    
    # Store models and scalers
    models['breast_cancer'] = model_bc
    models['diabetes'] = model_db
    models['heart_disease'] = model_hd
    
    scalers['breast_cancer'] = scaler_bc
    scalers['diabetes'] = scaler_db
    scalers['heart_disease'] = scaler_hd
    
    # Save models
    os.makedirs('models', exist_ok=True)
    joblib.dump(model_bc, 'models/breast_cancer_model.pkl')
    joblib.dump(model_db, 'models/diabetes_model.pkl')
    joblib.dump(model_hd, 'models/heart_disease_model.pkl')
    
    joblib.dump(scaler_bc, 'models/breast_cancer_scaler.pkl')
    joblib.dump(scaler_db, 'models/diabetes_scaler.pkl')
    joblib.dump(scaler_hd, 'models/heart_disease_scaler.pkl')

def get_health_recommendations(disease_type, prediction, confidence):
    """Generate health recommendations based on prediction"""
    recommendations = []
    
    if disease_type == 'breast_cancer':
        if prediction == 1:
            recommendations = [
                "Consult with an oncologist immediately for further evaluation",
                "Consider getting additional imaging tests (MRI, CT scan)",
                "Maintain a healthy diet rich in antioxidants",
                "Regular exercise as recommended by your doctor",
                "Join support groups for emotional support"
            ]
        else:
            recommendations = [
                "Continue regular mammogram screenings",
                "Maintain a healthy weight",
                "Limit alcohol consumption",
                "Exercise regularly",
                "Eat a balanced diet with plenty of fruits and vegetables"
            ]
    
    elif disease_type == 'diabetes':
        if prediction == 1:
            recommendations = [
                "Consult with an endocrinologist for diabetes management",
                "Monitor blood glucose levels regularly",
                "Follow a diabetic-friendly diet plan",
                "Engage in regular physical activity",
                "Take prescribed medications as directed"
            ]
        else:
            recommendations = [
                "Maintain a healthy weight",
                "Exercise regularly (at least 150 minutes per week)",
                "Eat a balanced diet low in refined sugars",
                "Get regular health check-ups",
                "Monitor blood pressure and cholesterol levels"
            ]
    
    elif disease_type == 'heart_disease':
        if prediction == 1:
            recommendations = [
                "Consult with a cardiologist immediately",
                "Consider cardiac rehabilitation programs",
                "Take prescribed heart medications",
                "Follow a heart-healthy diet (low sodium, low saturated fat)",
                "Engage in doctor-approved physical activity"
            ]
        else:
            recommendations = [
                "Maintain regular cardiovascular exercise",
                "Follow a heart-healthy diet",
                "Monitor blood pressure regularly",
                "Avoid smoking and limit alcohol",
                "Manage stress through relaxation techniques"
            ]
    
    return recommendations

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict/<disease_type>', methods=['POST'])
def predict_disease(disease_type):
    try:
        data = request.json
        patient_name = data.get('patient_name', 'Anonymous')
        features = data.get('features', {})
        
        if disease_type not in models:
            return jsonify({'error': 'Invalid disease type'}), 400
        
        # Prepare feature array based on disease type
        if disease_type == 'breast_cancer':
            feature_names = ['mean_radius', 'mean_texture', 'mean_perimeter', 'mean_area', 
                           'mean_smoothness', 'mean_compactness', 'mean_concavity', 
                           'mean_concave_points', 'mean_symmetry', 'mean_fractal_dimension']
        elif disease_type == 'diabetes':
            feature_names = ['glucose', 'blood_pressure', 'skin_thickness', 'insulin', 
                           'bmi', 'diabetes_pedigree', 'age']
        elif disease_type == 'heart_disease':
            feature_names = ['age', 'sex', 'chest_pain', 'resting_bp', 'cholesterol', 
                           'fasting_bs', 'resting_ecg', 'max_hr', 'exercise_angina', 
                           'oldpeak', 'st_slope']
        
        feature_array = np.array([[features.get(name, 0) for name in feature_names]])
        
        # Scale features
        feature_array_scaled = scalers[disease_type].transform(feature_array)
        
        # Make prediction
        prediction = models[disease_type].predict(feature_array_scaled)[0]
        prediction_proba = models[disease_type].predict_proba(feature_array_scaled)[0]
        confidence = max(prediction_proba)
        
        # Get recommendations
        recommendations = get_health_recommendations(disease_type, prediction, confidence)
        
        # Save prediction to database
        prediction_record = Prediction(
            patient_name=patient_name,
            disease_type=disease_type,
            prediction_result='Positive' if prediction == 1 else 'Negative',
            confidence=confidence,
            input_features=json.dumps(features),
            recommendations=json.dumps(recommendations)
        )
        db.session.add(prediction_record)
        db.session.commit()
        
        return jsonify({
            'prediction': 'Positive' if prediction == 1 else 'Negative',
            'confidence': float(confidence),
            'recommendations': recommendations,
            'prediction_id': prediction_record.id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chatbot', methods=['POST'])
def chatbot():
    try:
        data = request.json
        message = data.get('message', '')
        session_id = data.get('session_id', 'default')
        
        # Simple rule-based chatbot (you can replace with OpenAI API)
        response = generate_chatbot_response(message)
        
        # Save chat history
        chat_record = ChatHistory(
            session_id=session_id,
            message=message,
            response=response
        )
        db.session.add(chat_record)
        db.session.commit()
        
        return jsonify({'response': response})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_chatbot_response(message):
    """Generate chatbot response based on message content"""
    message_lower = message.lower()
    
    if any(word in message_lower for word in ['breast cancer', 'breast', 'cancer']):
        return """Breast cancer is a type of cancer that forms in the cells of the breasts. 
        Key symptoms include lumps in the breast, changes in breast shape, dimpling of the skin, 
        fluid coming from the nipple, or a red or scaly patch of skin. Early detection through 
        regular mammograms is crucial for successful treatment."""
    
    elif any(word in message_lower for word in ['diabetes', 'blood sugar', 'glucose']):
        return """Diabetes is a group of metabolic disorders characterized by high blood sugar levels. 
        Common symptoms include frequent urination, increased thirst, unexplained weight loss, 
        fatigue, and blurred vision. Type 2 diabetes can often be prevented or managed through 
        diet, exercise, and maintaining a healthy weight."""
    
    elif any(word in message_lower for word in ['heart disease', 'heart', 'cardiac', 'cardiovascular']):
        return """Heart disease refers to several types of heart conditions, including coronary artery disease, 
        heart attacks, and heart failure. Risk factors include high blood pressure, high cholesterol, 
        smoking, diabetes, and family history. Symptoms may include chest pain, shortness of breath, 
        fatigue, and irregular heartbeat."""
    
    elif any(word in message_lower for word in ['symptoms', 'signs']):
        return """Symptoms vary by condition:
        - Breast Cancer: Lumps, breast changes, skin dimpling, nipple discharge
        - Diabetes: Frequent urination, excessive thirst, weight loss, fatigue
        - Heart Disease: Chest pain, shortness of breath, fatigue, swelling"""
    
    elif any(word in message_lower for word in ['prevention', 'prevent', 'avoid']):
        return """General prevention tips:
        - Maintain a healthy diet rich in fruits and vegetables
        - Exercise regularly (at least 150 minutes per week)
        - Avoid smoking and limit alcohol consumption
        - Maintain a healthy weight
        - Get regular health screenings
        - Manage stress effectively"""
    
    elif any(word in message_lower for word in ['hello', 'hi', 'help']):
        return """Hello! I'm here to help you with information about breast cancer, diabetes, and heart disease. 
        I can provide information about symptoms, prevention, risk factors, and general health advice. 
        What would you like to know?"""
    
    else:
        return """I can help you with information about breast cancer, diabetes, and heart disease. 
        You can ask me about symptoms, prevention, risk factors, or use our prediction tools for assessment. 
        Please note that this is for informational purposes only and doesn't replace professional medical advice."""

@app.route('/delete_prediction/<int:prediction_id>', methods=['DELETE'])
def delete_prediction(prediction_id):
    try:
        prediction = Prediction.query.get_or_404(prediction_id)
        patient_name = prediction.patient_name
        
        db.session.delete(prediction)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Prediction for {patient_name} deleted successfully'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/clear_all_history', methods=['DELETE'])
def clear_all_history():
    try:
        # Delete all predictions
        num_deleted = Prediction.query.delete()
        
        # Also clear chat history if you want
        ChatHistory.query.delete()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'All prediction history cleared successfully. {num_deleted} records deleted.'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/delete_selected_predictions', methods=['DELETE'])
def delete_selected_predictions():
    try:
        data = request.get_json()
        prediction_ids = data.get('prediction_ids', [])
        
        if not prediction_ids:
            return jsonify({'error': 'No prediction IDs provided'}), 400
        
        # Delete selected predictions
        num_deleted = Prediction.query.filter(Prediction.id.in_(prediction_ids)).delete(synchronize_session=False)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'{num_deleted} prediction(s) deleted successfully'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/generate_report/<int:prediction_id>')
def generate_report(prediction_id):
    try:
        prediction = Prediction.query.get_or_404(prediction_id)
        
        # Create PDF report
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title = Paragraph("Medical Prediction Report", styles['Title'])
        story.append(title)
        story.append(Spacer(1, 12))
        
        # Patient Information
        patient_info = f"""
        <b>Patient Name:</b> {prediction.patient_name}<br/>
        <b>Date:</b> {prediction.timestamp.strftime('%Y-%m-%d %H:%M:%S')}<br/>
        <b>Disease Type:</b> {prediction.disease_type.replace('_', ' ').title()}<br/>
        <b>Prediction Result:</b> {prediction.prediction_result}<br/>
        <b>Confidence:</b> {prediction.confidence:.2%}<br/>
        """
        
        story.append(Paragraph(patient_info, styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Input Features
        features_title = Paragraph("Input Features:", styles['Heading2'])
        story.append(features_title)
        
        features = json.loads(prediction.input_features)
        features_text = "<br/>".join([f"<b>{k.replace('_', ' ').title()}:</b> {v}" for k, v in features.items()])
        story.append(Paragraph(features_text, styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Recommendations
        recommendations_title = Paragraph("Recommendations:", styles['Heading2'])
        story.append(recommendations_title)
        
        recommendations = json.loads(prediction.recommendations)
        for i, rec in enumerate(recommendations, 1):
            story.append(Paragraph(f"{i}. {rec}", styles['Normal']))
        
        story.append(Spacer(1, 12))
        
        # Disclaimer
        disclaimer = Paragraph(
            "<b>Disclaimer:</b> This prediction is for informational purposes only and should not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.",
            styles['Normal']
        )
        story.append(disclaimer)
        
        doc.build(story)
        buffer.seek(0)
        
        return send_file(
            io.BytesIO(buffer.read()),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'medical_report_{prediction_id}.pdf'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/history')
def get_history():
    try:
        predictions = Prediction.query.order_by(Prediction.timestamp.desc()).limit(50).all()
        history = []
        
        for pred in predictions:
            history.append({
                'id': pred.id,
                'patient_name': pred.patient_name,
                'disease_type': pred.disease_type,
                'prediction_result': pred.prediction_result,
                'confidence': pred.confidence,
                'timestamp': pred.timestamp.isoformat()
            })
        
        return jsonify({'history': history})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        train_models()
    
    app.run(debug=True, host='0.0.0.0', port=5000)