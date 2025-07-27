// Disease Prediction System JavaScript

// Global variables
let currentPredictionId = null;
let chatSessionId = 'session_' + Date.now();

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeForms();
    initializeChatbot();
    loadHistory();
    
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
});

// Initialize prediction forms
function initializeForms() {
    // Breast Cancer Form
    document.getElementById('breastCancerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitPrediction('breast_cancer', this);
    });
    
    // Diabetes Form
    document.getElementById('diabetesForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitPrediction('diabetes', this);
    });
    
    // Heart Disease Form
    document.getElementById('heartDiseaseForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitPrediction('heart_disease', this);
    });
}

// Submit prediction
async function submitPrediction(diseaseType, form) {
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    // Show loading state
    submitButton.classList.add('loading');
    submitButton.innerHTML = '<span class="loading"></span> Predicting...';
    submitButton.disabled = true;
    
    try {
        // Prepare data
        const data = {
            patient_name: formData.get('patient_name'),
            features: {}
        };
        
        // Get feature names based on disease type
        let featureNames = [];
        if (diseaseType === 'breast_cancer') {
            featureNames = ['mean_radius', 'mean_texture', 'mean_perimeter', 'mean_area', 
                          'mean_smoothness', 'mean_compactness', 'mean_concavity', 
                          'mean_concave_points', 'mean_symmetry', 'mean_fractal_dimension'];
        } else if (diseaseType === 'diabetes') {
            featureNames = ['glucose', 'blood_pressure', 'skin_thickness', 'insulin', 
                          'bmi', 'diabetes_pedigree', 'age'];
        } else if (diseaseType === 'heart_disease') {
            featureNames = ['age', 'sex', 'chest_pain', 'resting_bp', 'cholesterol', 
                          'fasting_bs', 'resting_ecg', 'max_hr', 'exercise_angina', 
                          'oldpeak', 'st_slope'];
        }
        
        // Extract features
        featureNames.forEach(name => {
            data.features[name] = parseFloat(formData.get(name)) || 0;
        });
        
        // Make API request
        const response = await fetch(`/predict/${diseaseType}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            currentPredictionId = result.prediction_id;
            showResults(result, diseaseType, data.patient_name);
            form.reset();
            loadHistory(); // Refresh history
        } else {
            throw new Error(result.error || 'Prediction failed');
        }
        
    } catch (error) {
        showError('Prediction Error', error.message);
    } finally {
        // Reset button state
        submitButton.classList.remove('loading');
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// Show prediction results
function showResults(result, diseaseType, patientName) {
    const modal = new bootstrap.Modal(document.getElementById('resultsModal'));
    const resultsContent = document.getElementById('resultsContent');
    
    const resultClass = result.prediction === 'Positive' ? 'result-positive' : 'result-negative';
    const statusClass = result.prediction === 'Positive' ? 'status-positive' : 'status-negative';
    const confidencePercentage = (result.confidence * 100).toFixed(1);
    
    resultsContent.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="card border-0">
                    <div class="card-body text-center">
                        <h4 class="card-title">
                            <span class="status-indicator ${statusClass}"></span>
                            Prediction Result
                        </h4>
                        <h2 class="${resultClass}">${result.prediction}</h2>
                        <p class="text-muted">Patient: ${patientName}</p>
                        <p class="text-muted">Disease: ${diseaseType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                        
                        <div class="mt-3">
                            <label class="form-label"><strong>Confidence Level: ${confidencePercentage}%</strong></label>
                            <div class="confidence-bar">
                                <div class="confidence-fill" style="width: ${confidencePercentage}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-0">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fas fa-lightbulb text-warning me-2"></i>
                            Recommendations
                        </h5>
                        <ul class="recommendations-list">
                            ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="alert alert-warning mt-3">
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>Important:</strong> This prediction is for informational purposes only and should not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.
        </div>
    `;
    
    modal.show();
}

// Initialize chatbot
function initializeChatbot() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendMessage');
    
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Send chat message
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat('user', message);
    chatInput.value = '';
    
    // Show typing indicator
    const typingIndicator = addMessageToChat('bot', '<span class="loading"></span> Typing...');
    
    try {
        const response = await fetch('/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                session_id: chatSessionId
            })
        });
        
        const result = await response.json();
        
        // Remove typing indicator
        typingIndicator.remove();
        
        if (response.ok) {
            addMessageToChat('bot', result.response);
        } else {
            throw new Error(result.error || 'Failed to get response');
        }
        
    } catch (error) {
        // Remove typing indicator
        typingIndicator.remove();
        addMessageToChat('bot', 'Sorry, I encountered an error. Please try again later.');
    }
}

// Add message to chat
function addMessageToChat(sender, message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    messageDiv.innerHTML = `
        <div class="message-content">
            ${sender === 'bot' ? '<i class="fas fa-robot me-2"></i>' : ''}
            ${message}
        </div>
        <div class="message-time text-end">${currentTime}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv;
}

// Load prediction history
async function loadHistory() {
    try {
        const response = await fetch('/history');
        const data = await response.json();
        
        if (response.ok) {
            displayHistory(data.history);
        } else {
            throw new Error(data.error || 'Failed to load history');
        }
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

// Display history in table
function displayHistory(history) {
    const tbody = document.querySelector('#historyTable tbody');
    tbody.innerHTML = '';
    
    if (history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No predictions yet</td></tr>';
        return;
    }
    
    history.forEach(record => {
        const row = document.createElement('tr');
        const date = new Date(record.timestamp).toLocaleString();
        const badgeClass = record.prediction_result === 'Positive' ? 'badge-positive' : 'badge-negative';
        const confidencePercentage = (record.confidence * 100).toFixed(1);
        
        row.innerHTML = `
            <td>${date}</td>
            <td>${record.patient_name}</td>
            <td>${record.disease_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
            <td>
                <span class="badge ${badgeClass}">${record.prediction_result}</span>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <span class="me-2">${confidencePercentage}%</span>
                    <div class="confidence-bar" style="width: 60px;">
                        <div class="confidence-fill" style="width: ${confidencePercentage}%"></div>
                    </div>
                </div>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="downloadReport(${record.id})">
                    <i class="fas fa-download me-1"></i>Report
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Download report
async function downloadReport(predictionId) {
    try {
        const response = await fetch(`/generate_report/${predictionId}`);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `medical_report_${predictionId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            throw new Error('Failed to generate report');
        }
    } catch (error) {
        showError('Download Error', error.message);
    }
}

// Download report from modal
document.getElementById('downloadReport').addEventListener('click', function() {
    if (currentPredictionId) {
        downloadReport(currentPredictionId);
    }
});

// Show error message
function showError(title, message) {
    // Create error toast or modal
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed';
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
    alertDiv.innerHTML = `
        <strong>${title}:</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 5000);
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Auto-fill sample data for testing
function fillSampleData(diseaseType) {
    if (diseaseType === 'breast_cancer') {
        const form = document.getElementById('breastCancerForm');
        const sampleData = {
            patient_name: 'Jane Doe',
            mean_radius: 17.99,
            mean_texture: 10.38,
            mean_perimeter: 122.8,
            mean_area: 1001,
            mean_smoothness: 0.1184,
            mean_compactness: 0.2776,
            mean_concavity: 0.3001,
            mean_concave_points: 0.1471,
            mean_symmetry: 0.2419,
            mean_fractal_dimension: 0.07871
        };
        
        Object.keys(sampleData).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) input.value = sampleData[key];
        });
    } else if (diseaseType === 'diabetes') {
        const form = document.getElementById('diabetesForm');
        const sampleData = {
            patient_name: 'John Smith',
            glucose: 148,
            blood_pressure: 72,
            skin_thickness: 35,
            insulin: 0,
            bmi: 33.6,
            diabetes_pedigree: 0.627,
            age: 50
        };
        
        Object.keys(sampleData).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) input.value = sampleData[key];
        });
    } else if (diseaseType === 'heart_disease') {
        const form = document.getElementById('heartDiseaseForm');
        const sampleData = {
            patient_name: 'Bob Johnson',
            age: 63,
            sex: 1,
            chest_pain: 3,
            resting_bp: 145,
            cholesterol: 233,
            fasting_bs: 1,
            resting_ecg: 0,
            max_hr: 150,
            exercise_angina: 0,
            oldpeak: 2.3,
            st_slope: 0
        };
        
        Object.keys(sampleData).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) input.value = sampleData[key];
        });
    }
}

// Add sample data buttons (for testing purposes)
document.addEventListener('DOMContentLoaded', function() {
    // Add sample data buttons to each form
    const forms = [
        {id: 'breastCancerForm', type: 'breast_cancer'},
        {id: 'diabetesForm', type: 'diabetes'},
        {id: 'heartDiseaseForm', type: 'heart_disease'}
    ];
    
    forms.forEach(form => {
        const formElement = document.getElementById(form.id);
        const submitButton = formElement.querySelector('button[type="submit"]');
        
        const sampleButton = document.createElement('button');
        sampleButton.type = 'button';
        sampleButton.className = 'btn btn-outline-secondary w-100 mt-2';
        sampleButton.innerHTML = '<i class="fas fa-flask me-2"></i>Fill Sample Data';
        sampleButton.onclick = () => fillSampleData(form.type);
        
        submitButton.parentNode.appendChild(sampleButton);
    });
});

// Enhanced chat with quick response buttons
function addQuickResponses() {
    const quickResponses = [
        'What are the symptoms of diabetes?',
        'How to prevent heart disease?',
        'Breast cancer risk factors',
        'Healthy lifestyle tips'
    ];
    
    const chatInput = document.getElementById('chatInput');
    const quickResponsesDiv = document.createElement('div');
    quickResponsesDiv.className = 'quick-responses mt-2';
    quickResponsesDiv.innerHTML = quickResponses.map(response => 
        `<button class="btn btn-sm btn-outline-primary me-2 mb-2" onclick="sendQuickResponse('${response}')">${response}</button>`
    ).join('');
    
    chatInput.parentNode.appendChild(quickResponsesDiv);
}

function sendQuickResponse(message) {
    document.getElementById('chatInput').value = message;
    sendMessage();
}

// Add quick responses after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addQuickResponses, 1000);
});

// Export functions for global access
window.scrollToSection = scrollToSection;
window.downloadReport = downloadReport;
window.fillSampleData = fillSampleData;
window.sendQuickResponse = sendQuickResponse;