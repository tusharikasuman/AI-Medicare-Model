// DOM Elements
const bloodPressureInput = document.getElementById('bloodPressure');
const heartRateInput = document.getElementById('heartRate');
const weightInput = document.getElementById('weight');
const temperatureInput = document.getElementById('temperature');
const updateButton = document.getElementById('updateMetrics');
const updateStatus = document.getElementById('updateStatus');
const lastUpdated = document.getElementById('lastUpdated');
const healthForm = document.getElementById('healthForm');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendMessage = document.getElementById('sendMessage');
const metricSelect = document.getElementById('metricSelect');
const timeRange = document.getElementById('timeRange');
const periodCalendar = document.getElementById('periodCalendar');
const cycleLength = document.getElementById('cycleLength');
const periodLength = document.getElementById('periodLength');
const nextPeriod = document.getElementById('nextPeriod');
const updatePeriodButton = document.getElementById('updatePeriod');

// Nutrition Tracker Elements
const caloriesConsumed = document.getElementById('caloriesConsumed');
const caloriesGoal = document.getElementById('caloriesGoal');
const waterIntake = document.getElementById('waterIntake');
const waterGoal = document.getElementById('waterGoal');
const caloriesProgress = document.getElementById('caloriesProgress');
const waterProgress = document.getElementById('waterProgress');
const caloriesProgressBar = document.getElementById('caloriesProgressBar');
const waterProgressBar = document.getElementById('waterProgressBar');
const mealsList = document.getElementById('mealsList');
const mealName = document.getElementById('mealName');
const mealCalories = document.getElementById('mealCalories');
const addMeal = document.getElementById('addMeal');

// Chart instance
let healthChart = null;

// Sample data for the graph (in a real app, this would come from a database)
let healthData = {
    heartRate: {
        dates: ['2023-05-01', '2023-05-02', '2023-05-03', '2023-05-04', '2023-05-05', '2023-05-06', '2023-05-07'],
        values: [72, 75, 70, 68, 73, 71, 72]
    },
    weight: {
        dates: ['2023-05-01', '2023-05-02', '2023-05-03', '2023-05-04', '2023-05-05', '2023-05-06', '2023-05-07'],
        values: [70, 70.2, 70.1, 70.3, 70.2, 70.1, 70.0]
    },
    temperature: {
        dates: ['2023-05-01', '2023-05-02', '2023-05-03', '2023-05-04', '2023-05-05', '2023-05-06', '2023-05-07'],
        values: [36.6, 36.5, 36.7, 36.6, 36.5, 36.6, 36.6]
    }
};

// Period tracker data
let periodData = {
    cycleLength: 28,
    periodLength: 5,
    lastPeriodStart: new Date('2023-05-01'),
    periodDays: [1, 2, 3, 4, 5]
};

// Nutrition tracker data
let nutritionData = {
    caloriesConsumed: 1250,
    caloriesGoal: 2000,
    waterIntake: 1.5,
    waterGoal: 2.5,
    meals: [
        { name: 'Breakfast', calories: 350 },
        { name: 'Lunch', calories: 550 },
        { name: 'Dinner', calories: 350 }
    ]
};

// Chart Configuration
const chartConfig = {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: '',
            data: [],
            borderColor: '#4caf50',
            tension: 0.4,
            fill: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            y: {
                beginAtZero: false
            }
        }
    }
};

// Validation functions
const validateBloodPressure = (value) => {
    const regex = /^\d{2,3}\/\d{2,3}$/;
    if (!regex.test(value)) return false;
    const [systolic, diastolic] = value.split('/').map(Number);
    return systolic >= 90 && systolic <= 180 && diastolic >= 60 && diastolic <= 120;
};

const validateHeartRate = (value) => {
    const rate = Number(value);
    return !isNaN(rate) && rate >= 40 && rate <= 200;
};

const validateWeight = (value) => {
    const weight = Number(value);
    return !isNaN(weight) && weight > 0 && weight <= 300;
};

const validateTemperature = (value) => {
    const temp = Number(value);
    return !isNaN(temp) && temp >= 35 && temp <= 42;
};

// Initialize chart
const initChart = () => {
    const ctx = document.getElementById('healthChart').getContext('2d');
    
    // Get the selected metric and time range
    const selectedMetric = metricSelect.value;
    const days = parseInt(timeRange.value);
    
    // Filter data based on time range
    const filteredData = healthData[selectedMetric];
    
    // Prepare chart data
    const labels = filteredData.dates.slice(-days);
    const values = filteredData.values.slice(-days);
    
    // Chart configuration
    const config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: getMetricLabel(selectedMetric),
                data: values,
                borderColor: '#6a11cb',
                backgroundColor: 'rgba(106, 17, 203, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: getMetricUnit(selectedMetric)
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    };
    
    // Create or update chart
    if (healthChart) {
        healthChart.destroy();
    }
    
    healthChart = new Chart(ctx, config);
};

// Get metric label
const getMetricLabel = (metric) => {
    const labels = {
        heartRate: 'Heart Rate (bpm)',
        weight: 'Weight (kg)',
        temperature: 'Temperature (°C)'
    };
    return labels[metric];
};

// Get metric unit
const getMetricUnit = (metric) => {
    switch (metric) {
        case 'heartRate': return 'bpm';
        case 'weight': return 'kg';
        case 'temperature': return '°C';
        default: return '';
    }
};

// Initialize period calendar
const initPeriodCalendar = () => {
    // Clear existing calendar
    periodCalendar.innerHTML = '';
    
    // Add day labels
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayLabels.forEach(day => {
        const dayLabel = document.createElement('div');
        dayLabel.className = 'calendar-day';
        dayLabel.textContent = day;
        dayLabel.style.fontWeight = 'bold';
        periodCalendar.appendChild(dayLabel);
    });
    
    // Get current date info
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        periodCalendar.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        // Check if this day is today
        if (day === today.getDate()) {
            dayElement.classList.add('active');
        }
        
        // Check if this day is a period day
        if (periodData.periodDays.includes(day)) {
            dayElement.classList.add('period');
        }
        
        // Add click event to toggle period day
        dayElement.addEventListener('click', () => {
            togglePeriodDay(day, dayElement);
        });
        
        periodCalendar.appendChild(dayElement);
    }
    
    // Update period stats
    updatePeriodStats();
};

// Toggle period day
const togglePeriodDay = (day, element) => {
    const index = periodData.periodDays.indexOf(day);
    
    if (index === -1) {
        // Add day to period days
        periodData.periodDays.push(day);
        element.classList.add('period');
    } else {
        // Remove day from period days
        periodData.periodDays.splice(index, 1);
        element.classList.remove('period');
    }
    
    // Update period stats
    updatePeriodStats();
};

// Update period stats
const updatePeriodStats = () => {
    // Update cycle length
    cycleLength.textContent = periodData.cycleLength;
    
    // Update period length
    periodLength.textContent = periodData.periodDays.length;
    
    // Calculate days until next period
    const today = new Date();
    const lastPeriodStart = periodData.lastPeriodStart;
    const nextPeriodStart = new Date(lastPeriodStart);
    nextPeriodStart.setDate(nextPeriodStart.getDate() + periodData.cycleLength);
    
    const daysUntilNext = Math.ceil((nextPeriodStart - today) / (1000 * 60 * 60 * 24));
    nextPeriod.textContent = daysUntilNext;
};

// Update metrics
const updateMetrics = async () => {
    const metrics = {
        bloodPressure: bloodPressureInput.value,
        heartRate: heartRateInput.value,
        weight: weightInput.value,
        temperature: temperatureInput.value
    };

    // Validate all metrics
    if (!validateBloodPressure(metrics.bloodPressure)) {
        showError('Invalid blood pressure value. Format: XXX/XX (e.g., 120/80)');
        return;
    }
    if (!validateHeartRate(metrics.heartRate)) {
        showError('Invalid heart rate. Must be between 40-200 bpm');
        return;
    }
    if (!validateWeight(metrics.weight)) {
        showError('Invalid weight. Must be between 0-300 kg');
        return;
    }
    if (!validateTemperature(metrics.temperature)) {
        showError('Invalid temperature. Must be between 35-42°C');
        return;
    }

    try {
        updateButton.disabled = true;
        updateStatus.innerHTML = '<div class="loading">Updating metrics...</div>';

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update last updated timestamp
        lastUpdated.textContent = new Date().toLocaleString();
        
        // Add new data point to the graph data
        const today = new Date().toISOString().split('T')[0];
        
        // Update heart rate data
        healthData.heartRate.dates.push(today);
        healthData.heartRate.values.push(parseInt(metrics.heartRate));
        
        // Update weight data
        healthData.weight.dates.push(today);
        healthData.weight.values.push(parseFloat(metrics.weight));
        
        // Update temperature data
        healthData.temperature.dates.push(today);
        healthData.temperature.values.push(parseFloat(metrics.temperature));
        
        // Update the chart
        initChart();
        
        // Show success message
        updateStatus.innerHTML = '<div class="success">Metrics updated successfully!</div>';
        
        // Reset button after 2 seconds
        setTimeout(() => {
            updateButton.disabled = false;
            updateStatus.innerHTML = '';
        }, 2000);

    } catch (error) {
        showError('Failed to update metrics. Please try again.');
    }
};

// Update period data
const updatePeriodData = async () => {
    try {
        updatePeriodButton.disabled = true;
        updatePeriodButton.textContent = 'Updating...';
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update last period start date
        const today = new Date();
        periodData.lastPeriodStart = new Date(today);
        
        // Show success message
        updatePeriodButton.textContent = 'Updated!';
        
        // Reset button after 2 seconds
        setTimeout(() => {
            updatePeriodButton.disabled = false;
            updatePeriodButton.textContent = 'Update Period Data';
        }, 2000);
        
        // Update period stats
        updatePeriodStats();
        
    } catch (error) {
        showError('Failed to update period data. Please try again.');
    }
};

// Show error message
const showError = (message) => {
    updateStatus.innerHTML = `<div class="error">${message}</div>`;
    setTimeout(() => {
        updateStatus.innerHTML = '';
    }, 3000);
};

// Handle form submission
const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(healthForm);
    const data = Object.fromEntries(formData.entries());

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Health data submitted successfully!');
        healthForm.reset();
    } catch (error) {
        alert('Failed to submit health data. Please try again.');
    }
};

// Chat functionality
const addMessage = (message, isUser = false) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

const handleSendMessage = () => {
    const message = userInput.value.trim();
    if (message) {
        addMessage(message, true);
        userInput.value = '';

        // Simulate bot response
        setTimeout(() => {
            addMessage('Thank you for your message. I am your AI health assistant. How can I help you today?');
        }, 1000);
    }
};

// Event Listeners
updateButton.addEventListener('click', updateMetrics);
healthForm.addEventListener('submit', handleFormSubmit);
sendMessage.addEventListener('click', handleSendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});

// Graph event listeners
metricSelect.addEventListener('change', initChart);
timeRange.addEventListener('change', initChart);

// Period tracker event listeners
updatePeriodButton.addEventListener('click', updatePeriodData);

// Navigation
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        
        // Update active link
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show target section
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(targetId).classList.add('active');
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    lastUpdated.textContent = new Date().toLocaleString();
    addMessage('Hello! I am your AI health assistant. How can I help you today?');
    initChart();
    initPeriodCalendar();
    updatePeriodStats();
    updateNutritionProgress();
});

// Update Nutrition Progress
function updateNutritionProgress() {
    // Update calories progress
    const caloriesPercentage = (nutritionData.caloriesConsumed / nutritionData.caloriesGoal) * 100;
    caloriesProgress.textContent = `${nutritionData.caloriesConsumed} / ${nutritionData.caloriesGoal}`;
    caloriesProgressBar.style.width = `${caloriesPercentage}%`;
    
    // Update water progress
    const waterPercentage = (nutritionData.waterIntake / nutritionData.waterGoal) * 100;
    waterProgress.textContent = `${nutritionData.waterIntake} / ${nutritionData.waterGoal} L`;
    waterProgressBar.style.width = `${waterPercentage}%`;
}

// Add Meal
function addNewMeal() {
    const name = mealName.value.trim();
    const calories = parseInt(mealCalories.value);
    
    if (!name || isNaN(calories) || calories <= 0) {
        showError('Please enter valid meal details');
        return;
    }
    
    nutritionData.meals.push({ name, calories });
    nutritionData.caloriesConsumed += calories;
    
    // Update UI
    const mealElement = document.createElement('div');
    mealElement.className = 'nutrition-meal';
    mealElement.innerHTML = `
        <div class="nutrition-meal-name">${name}</div>
        <div class="nutrition-meal-calories">${calories} cal</div>
    `;
    mealsList.appendChild(mealElement);
    
    // Update progress
    updateNutritionProgress();
    
    // Clear inputs
    mealName.value = '';
    mealCalories.value = '';
} 