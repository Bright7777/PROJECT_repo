# Multiple Disease Prediction System

An advanced AI-powered healthcare system that predicts multiple diseases including **Breast Cancer**, **Diabetes**, and **Heart Disease** using machine learning algorithms. The system includes an intelligent chatbot for health consultations and comprehensive documentation features.

## Features

### 🔬 Disease Prediction
- **Breast Cancer Detection**: Uses 10 key features from cell nuclei measurements
- **Diabetes Prediction**: Analyzes 7 health indicators including glucose, BMI, and family history
- **Heart Disease Assessment**: Evaluates 11 cardiovascular risk factors

### 🤖 AI Chatbot
- Interactive health assistant providing information about diseases
- Symptom checking and prevention advice
- Quick response buttons for common queries
- Session-based conversation history

### 📊 Documentation & Reports
- Comprehensive PDF reports for each prediction
- Patient information and input features
- Personalized health recommendations
- Professional medical disclaimers

### 📈 Analytics & History
- Complete prediction history tracking
- Confidence level visualization
- Patient data management
- Export capabilities

## Technology Stack

### Backend
- **Flask**: Web framework
- **SQLAlchemy**: Database ORM
- **Scikit-learn**: Machine learning models
- **Pandas & NumPy**: Data processing
- **ReportLab**: PDF generation

### Frontend
- **HTML5/CSS3**: Modern responsive design
- **Bootstrap 5**: UI framework
- **JavaScript (ES6+)**: Interactive functionality
- **Font Awesome**: Icons

### Machine Learning
- **Random Forest Classifier**: Primary prediction algorithm
- **Standard Scaler**: Feature normalization
- **Train-Test Split**: Model validation

## Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd disease-prediction-system
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables** (optional)
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Access the system**
   - Open your browser and navigate to `http://localhost:5000`

## Usage Guide

### Disease Prediction

#### Breast Cancer Prediction
Required inputs:
- Mean Radius, Texture, Perimeter, Area
- Smoothness, Compactness, Concavity
- Concave Points, Symmetry, Fractal Dimension

#### Diabetes Prediction
Required inputs:
- Glucose level (mg/dL)
- Blood pressure (mmHg)
- Skin thickness (mm)
- Insulin level (μU/mL)
- BMI
- Diabetes pedigree function
- Age

#### Heart Disease Prediction
Required inputs:
- Age, Sex, Chest pain type
- Resting blood pressure, Cholesterol
- Fasting blood sugar, Resting ECG
- Maximum heart rate, Exercise angina
- ST depression, ST slope

### AI Chatbot
- Ask questions about symptoms, prevention, or general health
- Use quick response buttons for common queries
- Get immediate responses based on medical knowledge

### Reports & Documentation
- Each prediction generates a downloadable PDF report
- Reports include patient information, input data, results, and recommendations
- Access prediction history from the History section

## API Endpoints

### Prediction APIs
- `POST /predict/breast_cancer` - Breast cancer prediction
- `POST /predict/diabetes` - Diabetes prediction
- `POST /predict/heart_disease` - Heart disease prediction

### Chatbot API
- `POST /chatbot` - Send message to AI assistant

### Utility APIs
- `GET /history` - Get prediction history
- `GET /generate_report/<id>` - Download PDF report

## Sample Data

The system includes sample data buttons for testing purposes:

### Breast Cancer Sample
```json
{
  "patient_name": "Jane Doe",
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
```

### Diabetes Sample
```json
{
  "patient_name": "John Smith",
  "glucose": 148,
  "blood_pressure": 72,
  "skin_thickness": 35,
  "insulin": 0,
  "bmi": 33.6,
  "diabetes_pedigree": 0.627,
  "age": 50
}
```

### Heart Disease Sample
```json
{
  "patient_name": "Bob Johnson",
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
```

## Model Performance

The system uses Random Forest Classifiers trained on synthetic datasets:
- **Breast Cancer Model**: ~85-90% accuracy
- **Diabetes Model**: ~80-85% accuracy
- **Heart Disease Model**: ~85-90% accuracy

*Note: These models are trained on synthetic data for demonstration purposes.*

## Development

### Project Structure
```
disease-prediction-system/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # Project documentation
├── .env.example          # Environment variables template
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css     # Custom styles
│   └── js/
│       └── app.js        # Frontend JavaScript
└── models/               # Trained ML models (auto-generated)
    ├── *.pkl            # Serialized models and scalers
```

### Adding New Diseases
1. Create sample data generation function
2. Add model training logic
3. Update prediction endpoint
4. Add frontend form
5. Update chatbot responses

### Customization
- **Styling**: Modify `static/css/style.css`
- **Functionality**: Update `static/js/app.js`
- **ML Models**: Enhance training in `app.py`
- **Chatbot**: Improve responses in `generate_chatbot_response()`

## Security Considerations

- Input validation on all forms
- SQL injection protection via SQLAlchemy
- XSS prevention in templates
- CSRF protection recommended for production
- HTTPS recommended for production deployment

## Deployment

### Production Deployment
1. Set `debug=False` in `app.py`
2. Use production WSGI server (Gunicorn)
3. Configure environment variables
4. Set up SSL certificates
5. Use production database (PostgreSQL/MySQL)

### Docker Deployment
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

## Legal & Medical Disclaimers

⚠️ **IMPORTANT MEDICAL DISCLAIMER**

This system is for **educational and informational purposes only** and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified healthcare providers with any questions you may have regarding medical conditions.

- Predictions are based on machine learning models and may not be accurate
- This system has not been validated by medical professionals
- Do not make medical decisions based solely on these predictions
- Consult healthcare professionals for proper medical evaluation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Acknowledgments

- Scikit-learn for machine learning capabilities
- Bootstrap for UI framework
- Font Awesome for icons
- Flask community for excellent documentation

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Educational/Demo Project