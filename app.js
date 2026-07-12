/* ==========================================================================
   NutriFit AI - Client Side Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // App State
    const state = {
        apiKey: localStorage.getItem('gemini_api_key') || '',
        activeTab: 'scanner',
        heightUnit: 'metric', // metric (cm), imperial (ft/in)
        weightUnit: 'metric', // metric (kg), imperial (lbs)
        userProfile: JSON.parse(localStorage.getItem('nutrifit_profile')) || null,
        scanHistory: JSON.parse(localStorage.getItem('nutrifit_scans')) || []
    };

    // Standard Food Presets Database (For Demo & Offline Mode)
    const foodPresets = {
        biryani: {
            foodName: "Chicken Biryani (Indian)",
            totalCalories: 790,
            protein: 34,
            carbs: 98,
            fats: 28,
            items: [
                { name: "Basmati Rice (Spiced)", quantity: "1.5 cups", calories: 350 },
                { name: "Marinated Chicken pieces", quantity: "150g", calories: 240 },
                { name: "Ghee & Fried Onion dressing", quantity: "2 tbsp", calories: 150 },
                { name: "Raita (Yogurt side)", quantity: "1/2 cup", calories: 50 }
            ],
            advice: "Biryani is a protein-rich, high-carb dish. It provides great sustained energy but contains substantial fats. Pair with an active day or reduce portion size slightly to keep calories in check.",
            isHealthy: true,
            boundingBoxes: [
                { label: "Rice & Chicken", box: [20, 20, 80, 80] },
                { label: "Raita Cup", box: [10, 65, 40, 90] }
            ]
        },
        pizza: {
            foodName: "Pepperoni Pizza (Foreign)",
            totalCalories: 890,
            protein: 38,
            carbs: 94,
            fats: 40,
            items: [
                { name: "Refined Flour Crust", quantity: "3 slices", calories: 390 },
                { name: "Mozzarella Cheese", quantity: "80g", calories: 260 },
                { name: "Pepperoni Slices", quantity: "12 pieces", calories: 160 },
                { name: "Tomato Sauce & Herb spread", quantity: "4 tbsp", calories: 80 }
            ],
            advice: "Pizza is high in saturated fats and refined carbs. Consider pairing with a side salad to add dietary fiber, and limit serving size to 1-2 slices if tracking a weight goal.",
            isHealthy: false,
            boundingBoxes: [
                { label: "Pizza Slices", box: [15, 10, 85, 90] },
                { label: "Pepperoni topping", box: [35, 40, 60, 65] }
            ]
        },
        samosa: {
            foodName: "Samosa Chaat (Indian)",
            totalCalories: 460,
            protein: 9,
            carbs: 62,
            fats: 20,
            items: [
                { name: "Fried Pastry Shell", quantity: "1 large samosa", calories: 210 },
                { name: "Potato & Pea filling", quantity: "100g", calories: 120 },
                { name: "Chickpea (Chole) Curry", quantity: "1/2 cup", calories: 90 },
                { name: "Tamarind & Mint Chutneys", quantity: "3 tbsp", calories: 40 }
            ],
            advice: "A popular Indian street food. Samosa Chaat is highly savory and deep-fried, raising fat content. Enjoy occasionally as a treat; monitor sodium levels for the day.",
            isHealthy: false,
            boundingBoxes: [
                { label: "Crushed Samosa", box: [30, 25, 75, 75] },
                { label: "Chole & Sauce overlay", box: [15, 15, 85, 85] }
            ]
        },
        salad: {
            foodName: "Greek Salad (Foreign)",
            totalCalories: 280,
            protein: 6,
            carbs: 11,
            fats: 24,
            items: [
                { name: "Mixed Greens & Tomatoes", quantity: "2.5 cups", calories: 45 },
                { name: "Feta Cheese block", quantity: "45g", calories: 120 },
                { name: "Kalamata Olives", quantity: "6 pieces", calories: 45 },
                { name: "Extra Virgin Olive Oil dressing", quantity: "1.5 tbsp", calories: 70 }
            ],
            advice: "Excellent high-fiber, low-glycemic option packed with healthy fats (monounsaturated) and antioxidants. Perfect choice for weight loss and cardiovascular wellness.",
            isHealthy: true,
            boundingBoxes: [
                { label: "Feta Cheese", box: [35, 40, 55, 60] },
                { label: "Olives & Cucumber", box: [20, 25, 75, 80] }
            ]
        },
        sushi: {
            foodName: "Assorted Sushi Platter (Foreign)",
            totalCalories: 420,
            protein: 20,
            carbs: 76,
            fats: 4,
            items: [
                { name: "Seasoned Sushi Rice", quantity: "6 pieces", calories: 240 },
                { name: "Fresh Salmon & Tuna topping", quantity: "70g", calories: 110 },
                { name: "Nori Seaweed wrap", quantity: "3 sheets", calories: 20 },
                { name: "Soy Sauce, Wasabi & Ginger", quantity: "2 tsp", calories: 50 }
            ],
            advice: "Sushi is very low in fat and offers high-quality protein and Omega-3 fatty acids from fish. Be mindful of soy sauce sodium and tempura (fried) varieties.",
            isHealthy: true,
            boundingBoxes: [
                { label: "Salmon Sushi", box: [40, 15, 75, 45] },
                { label: "Tuna Roll", box: [30, 50, 70, 85] }
            ]
        },
        dosa: {
            foodName: "Masala Dosa (Indian)",
            totalCalories: 430,
            protein: 8,
            carbs: 74,
            fats: 11,
            items: [
                { name: "Fermented Rice & Lentil Crepe", quantity: "1 large", calories: 210 },
                { name: "Potato Masala (Spiced filling)", quantity: "120g", calories: 140 },
                { name: "Coconut Chutney side", quantity: "2 tbsp", calories: 60 },
                { name: "Vegetable Sambar bowl", quantity: "1/2 cup", calories: 20 }
            ],
            advice: "Masala Dosa is a moderately balanced South Indian classic. The fermented batter is gut-friendly. Coconut chutney adds calories quickly via saturated fats, so enjoy in moderation.",
            isHealthy: true,
            boundingBoxes: [
                { label: "Crispy Dosa Roll", box: [25, 10, 60, 90] },
                { label: "Sambar Bowl", box: [55, 15, 85, 45] },
                { label: "Chutney Cup", box: [65, 55, 90, 80] }
            ]
        }
    };

    // Generic Mock Database for arbitrary food uploads
    const genericMockFoods = [
        {
            foodName: "Paneer Butter Masala & Roti (Indian)",
            totalCalories: 680,
            protein: 22,
            carbs: 72,
            fats: 34,
            items: [
                { name: "Paneer cheese cubes in rich gravy", quantity: "1 bowl", calories: 380 },
                { name: "Whole Wheat Roti (No butter)", quantity: "2 pieces", calories: 220 },
                { name: "Sliced Onion salad side", quantity: "1/4 cup", calories: 20 },
                { name: "Cooking butter/oil glaze", quantity: "1 tsp", calories: 60 }
            ],
            advice: "Contains good vegetarian protein but is high in fats due to cream and butter gravy. Opt for tandoori roti and double-check gravy portions for weight management.",
            isHealthy: true,
            boundingBoxes: [{ label: "Paneer Curry", box: [20, 20, 60, 80] }, { label: "Rotis", box: [50, 10, 90, 50] }]
        },
        {
            foodName: "Grilled Chicken Salad (Foreign)",
            totalCalories: 350,
            protein: 36,
            carbs: 12,
            fats: 18,
            items: [
                { name: "Grilled Chicken Breast slices", quantity: "150g", calories: 195 },
                { name: "Mixed salad greens & cucumber", quantity: "2 cups", calories: 35 },
                { name: "Vinaigrette Dressing", quantity: "2 tbsp", calories: 90 },
                { name: "Shredded parmesan topping", quantity: "1 tbsp", calories: 30 }
            ],
            advice: "Highly nutritious and low-calorie. Excellent protein density, low carbohydrate impact. Promotes muscle repair and fat loss.",
            isHealthy: true,
            boundingBoxes: [{ label: "Chicken Breasts", box: [30, 25, 65, 75] }, { label: "Leafy Greens", box: [15, 10, 85, 90] }]
        },
        {
            foodName: "Cheeseburger & Fries (Foreign)",
            totalCalories: 950,
            protein: 34,
            carbs: 110,
            fats: 42,
            items: [
                { name: "Beef/Veg Patty with cheese & bun", quantity: "1 burger", calories: 550 },
                { name: "Salted French Fries", quantity: "1 medium box", calories: 320 },
                { name: "Ketchup & burger spread", quantity: "2 tbsp", calories: 80 }
            ],
            advice: "Very high caloric density, sodium, and saturated fats. Lacks sufficient fiber. Consume sparingly; balance with lean meals and aerobic exercise.",
            isHealthy: false,
            boundingBoxes: [{ label: "Cheeseburger", box: [15, 10, 75, 60] }, { label: "French Fries", box: [40, 55, 85, 95] }]
        }
    ];

    /* ==========================================================================
       DOM Elements Selection
       ========================================================================== */
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const navPlanTab = document.getElementById('nav-plan-tab');
    const profileSummary = document.getElementById('profile-summary');
    const statusIndicatorDot = document.getElementById('status-indicator-dot');

    // API Key Panel
    const toggleKeyBtn = document.getElementById('toggle-key-btn');
    const apiKeyPanel = document.getElementById('api-key-panel');
    const geminiApiKeyInput = document.getElementById('gemini-api-key');
    const saveKeyBtn = document.getElementById('save-key-btn');
    const clearKeyBtn = document.getElementById('clear-key-btn');
    const apiStatusIndicator = document.getElementById('api-status-indicator');
    const scanModeBadge = document.getElementById('scan-mode-badge');

    // Calorie Scanner
    const dropZone = document.getElementById('drop-zone');
    const imageUploadInput = document.getElementById('image-upload');
    const uploadPromptView = document.getElementById('upload-prompt-view');
    const scannerPreviewContainer = document.getElementById('scanner-preview-container');
    const scannerPreview = document.getElementById('scanner-preview');
    const scanLaserLine = document.getElementById('scan-laser-line');
    const scanningIndicator = document.getElementById('scanning-indicator');
    const scanningText = document.getElementById('scanning-text');
    const bboxContainer = document.getElementById('bbox-container');
    const resultsPlaceholderCard = document.getElementById('results-placeholder-card');
    const resultsActiveCard = document.getElementById('results-active-card');
    const presetButtons = document.querySelectorAll('.btn-preset');
    const manualFoodInput = document.getElementById('manual-food-input');
    const manualFoodBtn = document.getElementById('manual-food-btn');

    // Scan Results Outputs
    const resTotalCalories = document.getElementById('res-total-calories');
    const resCalorieGaugeBar = document.getElementById('calorie-gauge-bar');
    const resProtein = document.getElementById('res-protein');
    const resProteinCal = document.getElementById('res-protein-cal');
    const resProteinBar = document.getElementById('res-protein-bar');
    const resCarbs = document.getElementById('res-carbs');
    const resCarbsCal = document.getElementById('res-carbs-cal');
    const resCarbsBar = document.getElementById('res-carbs-bar');
    const resFats = document.getElementById('res-fats');
    const resFatsCal = document.getElementById('res-fats-cal');
    const resFatsBar = document.getElementById('res-fats-bar');
    const resItemsList = document.getElementById('res-items-list');
    const resFoodAdvice = document.getElementById('res-food-advice');
    const scanTime = document.getElementById('scan-time');

    // Fitness Calculator
    const calculateBtn = document.getElementById('calculate-btn');
    const inputAge = document.getElementById('input-age');
    const inputActivity = document.getElementById('input-activity');
    const inputGoal = document.getElementById('input-goal');
    const inputWeight = document.getElementById('input-weight');
    const weightUnitAddon = document.getElementById('weight-unit-addon');
    
    const heightMetricInput = document.getElementById('height-metric-input');
    const heightImperialInput = document.getElementById('height-imperial-input');
    const inputHeightCm = document.getElementById('input-height-cm');
    const inputHeightFt = document.getElementById('input-height-ft');
    const inputHeightIn = document.getElementById('input-height-in');

    const optHeightMetric = document.getElementById('opt-height-metric');
    const optHeightImperial = document.getElementById('opt-height-imperial');
    const optWeightMetric = document.getElementById('opt-weight-metric');
    const optWeightImperial = document.getElementById('opt-weight-imperial');

    const toggleAdvanced = document.getElementById('toggle-advanced-measurements');
    const advancedSection = document.getElementById('advanced-measurements-section');
    const hipGroup = document.getElementById('hip-group');
    const inputNeck = document.getElementById('input-neck');
    const inputWaist = document.getElementById('input-waist');
    const inputHip = document.getElementById('input-hip');
    const calculatorEmptyCard = document.getElementById('calculator-empty-card');

    // Fitness Plan Outputs
    const planUserMeta = document.getElementById('plan-user-meta');
    const overallFitnessCard = document.getElementById('overall-fitness-card');
    const planCalBudget = document.getElementById('plan-cal-budget');
    const planCalReason = document.getElementById('plan-cal-reason');
    const planWaterBudget = document.getElementById('plan-water-budget');

    const paramBmiVal = document.getElementById('param-bmi-val');
    const paramBmiBadge = document.getElementById('param-bmi-badge');
    const paramBmiCard = document.getElementById('param-bmi-card');
    const paramBmiIndicator = document.getElementById('param-bmi-indicator');
    const paramBmiDesc = document.getElementById('param-bmi-desc');

    const paramBfVal = document.getElementById('param-bf-val');
    const paramBfBadge = document.getElementById('param-bf-badge');
    const paramBfCard = document.getElementById('param-bf-card');
    const paramBfIndicator = document.getElementById('param-bf-indicator');
    const paramBfDesc = document.getElementById('param-bf-desc');

    const paramIbwVal = document.getElementById('param-ibw-val');
    const paramIbwDiff = document.getElementById('param-ibw-diff');

    const paramBmrVal = document.getElementById('param-bmr-val');
    const paramTdeeVal = document.getElementById('param-tdee-val');

    // Pie Chart SVGs
    const pieProtein = document.getElementById('pie-protein');
    const pieCarbs = document.getElementById('pie-carbs');
    const pieFats = document.getElementById('pie-fats');
    const pieTotalKcal = document.getElementById('pie-total-kcal');
    
    const planProteinPct = document.getElementById('plan-protein-pct');
    const planProteinVal = document.getElementById('plan-protein-val');
    const planCarbsPct = document.getElementById('plan-carbs-pct');
    const planCarbsVal = document.getElementById('plan-carbs-val');
    const planFatsPct = document.getElementById('plan-fats-pct');
    const planFatsVal = document.getElementById('plan-fats-val');

    const planDietBullets = document.getElementById('plan-diet-bullets');
    const planCardioLevel = document.getElementById('plan-cardio-level');
    const planStrengthDays = document.getElementById('plan-strength-days');
    const planExerciseBullets = document.getElementById('plan-exercise-bullets');

    /* ==========================================================================
       INITIALIZATION & SETUP
       ========================================================================== */
    
    function init() {
        // Hydrate API Key UI
        if (state.apiKey) {
            geminiApiKeyInput.value = state.apiKey;
            updateApiStatus(true);
        } else {
            updateApiStatus(false);
        }

        // Hydrate Profile if exists
        if (state.userProfile) {
            renderFitnessProfile(state.userProfile);
            enablePlanTab();
        }

        // Add Listeners
        setupTabListeners();
        setupFormListeners();
        setupScannerListeners();
        setupApiSettingsListeners();
    }

    /* ==========================================================================
       TAB ROUTING SYSTEM
       ========================================================================== */
    function setupTabListeners() {
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (item.classList.contains('disabled')) return;
                
                const targetTab = item.getAttribute('data-tab');
                switchTab(targetTab);
            });
        });
    }

    function switchTab(tabId) {
        state.activeTab = tabId;
        
        // Update nav items UI
        navItems.forEach(item => {
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update sections view
        tabContents.forEach(content => {
            if (content.id === `tab-${tabId}`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }

    function enablePlanTab() {
        navPlanTab.classList.remove('disabled');
    }

    /* ==========================================================================
       API CONFIGURATION
       ========================================================================== */
    function setupApiSettingsListeners() {
        toggleKeyBtn.addEventListener('click', () => {
            apiKeyPanel.classList.toggle('hidden');
        });

        saveKeyBtn.addEventListener('click', () => {
            const key = geminiApiKeyInput.value.trim();
            if (key) {
                state.apiKey = key;
                localStorage.setItem('gemini_api_key', key);
                updateApiStatus(true);
                apiKeyPanel.classList.add('hidden');
            } else {
                alert("Please enter a valid key format.");
            }
        });

        clearKeyBtn.addEventListener('click', () => {
            state.apiKey = '';
            localStorage.removeItem('gemini_api_key');
            geminiApiKeyInput.value = '';
            updateApiStatus(false);
            apiKeyPanel.classList.add('hidden');
        });
    }

    function updateApiStatus(hasKey) {
        if (hasKey) {
            apiStatusIndicator.textContent = "Mode: Active (Gemini API)";
            apiStatusIndicator.style.backgroundColor = "rgba(16, 185, 129, 0.15)";
            apiStatusIndicator.style.color = "var(--color-green)";
            apiStatusIndicator.style.border = "1px solid rgba(16, 185, 129, 0.3)";
            scanModeBadge.textContent = "Gemini AI Vision";
            scanModeBadge.className = "badge badge-green";
        } else {
            apiStatusIndicator.textContent = "Mode: Simulated";
            apiStatusIndicator.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
            apiStatusIndicator.style.color = "var(--text-secondary)";
            apiStatusIndicator.style.border = "none";
            scanModeBadge.textContent = "Simulated Mode";
            scanModeBadge.className = "badge badge-cyan";
        }
    }

    /* ==========================================================================
       FORM CALCULATOR INTERACTIVE LOGIC
       ========================================================================== */
    function setupFormListeners() {
        // Height Unit Swap
        optHeightMetric.addEventListener('click', () => {
            state.heightUnit = 'metric';
            optHeightMetric.classList.add('active');
            optHeightImperial.classList.remove('active');
            heightMetricInput.classList.remove('hidden');
            heightImperialInput.classList.add('hidden');
        });

        optHeightImperial.addEventListener('click', () => {
            state.heightUnit = 'imperial';
            optHeightImperial.classList.add('active');
            optHeightMetric.classList.remove('active');
            heightImperialInput.classList.remove('hidden');
            heightMetricInput.classList.add('hidden');
        });

        // Weight Unit Swap
        optWeightMetric.addEventListener('click', () => {
            state.weightUnit = 'metric';
            optWeightMetric.classList.add('active');
            optWeightImperial.classList.remove('active');
            weightUnitAddon.textContent = 'kg';
            
            // Convert current input value
            const currentVal = parseFloat(inputWeight.value);
            if (currentVal) {
                inputWeight.value = Math.round(currentVal / 2.20462);
            }
        });

        optWeightImperial.addEventListener('click', () => {
            state.weightUnit = 'imperial';
            optWeightImperial.classList.add('active');
            optWeightMetric.classList.remove('active');
            weightUnitAddon.textContent = 'lbs';
            
            // Convert current input value
            const currentVal = parseFloat(inputWeight.value);
            if (currentVal) {
                inputWeight.value = Math.round(currentVal * 2.20462);
            }
        });

        // Advanced measurements toggle
        toggleAdvanced.addEventListener('change', () => {
            if (toggleAdvanced.checked) {
                advancedSection.classList.remove('hidden');
                toggleHipInput();
            } else {
                advancedSection.classList.add('hidden');
            }
        });

        // Monitor gender change to show/hide hip measurements (for US Navy formula)
        document.getElementById('gender-male').addEventListener('change', toggleHipInput);
        document.getElementById('gender-female').addEventListener('change', toggleHipInput);

        // Click labels for male/female to trigger select styling
        const lblMale = document.getElementById('label-gender-male');
        const lblFemale = document.getElementById('label-gender-female');

        lblMale.addEventListener('click', () => {
            lblMale.classList.add('active');
            lblFemale.classList.remove('active');
        });

        lblFemale.addEventListener('click', () => {
            lblFemale.classList.add('active');
            lblMale.classList.remove('active');
        });

        // Perform calculation
        calculateBtn.addEventListener('click', processCalculator);
    }

    function toggleHipInput() {
        const isFemale = document.getElementById('gender-female').checked;
        if (isFemale && toggleAdvanced.checked) {
            hipGroup.style.display = 'block';
        } else {
            hipGroup.style.display = 'none';
        }
    }

    /* ==========================================================================
       HEALTH CALCULATIONS CORE
       ========================================================================== */
    function processCalculator() {
        // Collect Inputs
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const age = parseInt(inputAge.value);
        const activityMultiplier = parseFloat(inputActivity.value);
        const goal = inputGoal.value;
        
        let weightKg = parseFloat(inputWeight.value);
        if (state.weightUnit === 'imperial') {
            weightKg = weightKg * 0.45359237; // lbs to kg
        }

        let heightCm = 0;
        if (state.heightUnit === 'metric') {
            heightCm = parseFloat(inputHeightCm.value);
        } else {
            const ft = parseFloat(inputHeightFt.value) || 0;
            const inch = parseFloat(inputHeightIn.value) || 0;
            heightCm = (ft * 30.48) + (inch * 2.54); // ft/in to cm
        }

        // Validate basic inputs
        if (!age || !weightKg || !heightCm || age < 15 || weightKg < 30 || heightCm < 100) {
            alert("Please supply valid body values (Age 15+, Height 100cm+, Weight 30kg+).");
            return;
        }

        // Calculations
        // 1. BMI
        const heightMeters = heightCm / 100;
        const bmi = weightKg / (heightMeters * heightMeters);

        // 2. BMR (Mifflin-St Jeor Equation)
        let bmr = 0;
        if (gender === 'male') {
            bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
        } else {
            bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
        }

        // 3. TDEE
        const tdee = bmr * activityMultiplier;

        // 4. Target Daily Calories based on Goal
        let targetCalories = tdee;
        if (goal === 'lose') {
            targetCalories = tdee - 500;
            // Floor safety guidelines: never dip below starvation base
            const absoluteMin = gender === 'male' ? 1500 : 1200;
            if (targetCalories < absoluteMin) targetCalories = absoluteMin;
        } else if (goal === 'gain') {
            targetCalories = tdee + 350;
        }
        targetCalories = Math.round(targetCalories);

        // 5. Water intake calculation: 33ml per kg, adjusted upward for activity
        let waterLiters = (weightKg * 0.033);
        if (activityMultiplier >= 1.55) {
            waterLiters += 0.8; // extra hydration for sweat loss
        }
        waterLiters = parseFloat(waterLiters.toFixed(1));

        // 6. Ideal Weight Range (Healthy BMI bounds: 18.5 to 24.9)
        const ibwMin = 18.5 * (heightMeters * heightMeters);
        const ibwMax = 24.9 * (heightMeters * heightMeters);
        
        // Robinson & Devine target weight average reference (height in inches > 60)
        const heightInches = heightCm / 2.54;
        let ibwTarget = 0;
        if (heightInches > 60) {
            const inchesOver60 = heightInches - 60;
            let devine = 0;
            let robinson = 0;
            if (gender === 'male') {
                devine = 50.0 + (2.3 * inchesOver60);
                robinson = 52.0 + (1.9 * inchesOver60);
            } else {
                devine = 45.5 + (2.3 * inchesOver60);
                robinson = 49.0 + (1.7 * inchesOver60);
            }
            ibwTarget = (devine + robinson) / 2;
        } else {
            // Fallback for shorter heights to mid-healthy BMI range
            ibwTarget = 21.7 * (heightMeters * heightMeters);
        }

        // 7. Body Fat % Estimation
        let bodyFat = 0;
        let bodyFatMethod = 'BMI Estimation';
        
        if (toggleAdvanced.checked) {
            const neck = parseFloat(inputNeck.value);
            const waist = parseFloat(inputWaist.value);
            const hip = parseFloat(inputHip.value);

            if (neck && waist && (gender === 'male' || hip)) {
                if (gender === 'male') {
                    // US Navy Formula Men (Metric)
                    // BF = 86.010 * log10(waist - neck) - 70.041 * log10(height) + 36.76
                    const logWaistNeck = Math.log10(waist - neck);
                    const logHeight = Math.log10(heightCm);
                    if (waist > neck) {
                        bodyFat = 86.010 * logWaistNeck - 70.041 * logHeight + 36.76;
                        bodyFatMethod = 'US Navy Method';
                    }
                } else {
                    // US Navy Formula Women (Metric)
                    // BF = 163.205 * log10(waist + hip - neck) - 97.684 * log10(height) - 78.387
                    const logWaistHipNeck = Math.log10(waist + hip - neck);
                    const logHeight = Math.log10(heightCm);
                    if ((waist + hip) > neck) {
                        bodyFat = 163.205 * logWaistHipNeck - 97.684 * logHeight - 78.387;
                        bodyFatMethod = 'US Navy Method';
                    }
                }
            }
        }

        // Fallback to standard BMI-based formula if Navy calculations fail or waist/neck inputs are invalid
        if (bodyFat <= 0 || isNaN(bodyFat)) {
            if (gender === 'male') {
                bodyFat = (1.20 * bmi) + (0.23 * age) - 16.2;
            } else {
                bodyFat = (1.20 * bmi) + (0.23 * age) - 5.4;
            }
            bodyFatMethod = 'BMI Estimation';
        }
        bodyFat = parseFloat(bodyFat.toFixed(1));

        // Create Profile Object
        const profile = {
            gender,
            age,
            heightCm: Math.round(heightCm),
            weightKg: Math.round(weightKg),
            activityMultiplier,
            goal,
            bmi: parseFloat(bmi.toFixed(1)),
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            targetCalories,
            waterLiters,
            ibwMin: Math.round(ibwMin),
            ibwMax: Math.round(ibwMax),
            ibwTarget: Math.round(ibwTarget),
            bodyFat,
            bodyFatMethod,
            timestamp: new Date().toISOString()
        };

        // Save State
        state.userProfile = profile;
        localStorage.setItem('nutrifit_profile', JSON.stringify(profile));

        // Render Results
        renderFitnessProfile(profile);
        
        // Unlock Plan section
        enablePlanTab();
        
        // Instantly transition to the Fitness Plan Tab
        switchTab('plan');
    }

    function renderFitnessProfile(profile) {
        // Sidebar Summary
        const goalLabel = profile.goal === 'lose' ? 'Loss' : profile.goal === 'gain' ? 'Bulk' : 'Maintain';
        profileSummary.innerHTML = `<strong>Goal:</strong> ${goalLabel}<br><strong>Weight:</strong> ${profile.weightKg} kg | <strong>BMI:</strong> ${profile.bmi}`;
        statusIndicatorDot.classList.add('active');

        // Plan User Meta text
        planUserMeta.textContent = `Calculated profile for a ${profile.age}yo ${profile.gender} (${profile.weightKg}kg, ${profile.heightCm}cm) targeting ${profile.goal === 'lose' ? 'Caloric Deficit (Fat Loss)' : profile.goal === 'gain' ? 'Caloric Surplus (Muscle Gain)' : 'Weight Maintenance'}.`;

        // Budgets
        planCalBudget.textContent = `${profile.targetCalories} kcal/day`;
        planCalReason.textContent = profile.goal === 'lose' ? 'Daily Target for Fat Loss' : profile.goal === 'gain' ? 'Daily Target for Muscle Gain' : 'Daily Target for Maintenance';
        planWaterBudget.textContent = `${profile.waterLiters} Liters`;

        // 1. BMI Card Rendering
        paramBmiVal.textContent = profile.bmi;
        let bmiCategory = '';
        let bmiBadgeClass = '';
        let bmiDesc = '';
        
        if (profile.bmi < 18.5) {
            bmiCategory = 'Underweight';
            bmiBadgeClass = 'badge badge-red';
            bmiDesc = 'Your BMI indicates you are underweight. Focus on calorie-dense nutrient foods and structural lean muscle gain.';
        } else if (profile.bmi >= 18.5 && profile.bmi < 25) {
            bmiCategory = 'Normal';
            bmiBadgeClass = 'badge badge-green';
            bmiDesc = 'Excellent! Your weight is in the healthy BMI range, denoting minimal weight-associated disease risks.';
        } else if (profile.bmi >= 25 && profile.bmi < 30) {
            bmiCategory = 'Overweight';
            bmiBadgeClass = 'badge badge-amber';
            bmiDesc = 'Slightly elevated health risks. A modest caloric deficit combined with clean strength exercises is suggested.';
        } else {
            bmiCategory = 'Obese';
            bmiBadgeClass = 'badge badge-red';
            bmiDesc = 'Significant health risks (metabolic syndrome, cardiovascular tension). Highly recommend prioritizing a fat loss program.';
        }
        
        paramBmiBadge.textContent = bmiCategory;
        paramBmiBadge.className = bmiBadgeClass;
        paramBmiDesc.textContent = bmiDesc;
        
        // Move gauge needle indicator: BMI limits are mapped 15 to 35 in width (0% to 100%)
        let bmiPct = ((profile.bmi - 15) / 20) * 100;
        if (bmiPct < 0) bmiPct = 0;
        if (bmiPct > 100) bmiPct = 100;
        paramBmiIndicator.style.left = `${bmiPct}%`;

        // 2. Body Fat Card Rendering
        paramBfVal.textContent = `${profile.bodyFat}%`;
        let bfCategory = '';
        let bfBadgeClass = '';
        let bfDesc = '';
        
        // Ranges vary by sex
        if (profile.gender === 'male') {
            if (profile.bodyFat < 6) {
                bfCategory = 'Essential Fat';
                bfBadgeClass = 'badge badge-red';
                bfDesc = 'Extremely low body fat. Can cause hormonal fatigue unless preparing for bodybuilding competitions.';
            } else if (profile.bodyFat >= 6 && profile.bodyFat < 14) {
                bfCategory = 'Athletic';
                bfBadgeClass = 'badge badge-green';
                bfDesc = 'Leanness is very high. Defined vascularity and low subcutaneous fat.';
            } else if (profile.bodyFat >= 14 && profile.bodyFat < 18) {
                bfCategory = 'Fit';
                bfBadgeClass = 'badge badge-green';
                bfDesc = 'Ideal body structure. Highly optimal metabolic and physical health indicators.';
            } else if (profile.bodyFat >= 18 && profile.bodyFat < 25) {
                bfCategory = 'Average';
                bfBadgeClass = 'badge badge-cyan';
                bfDesc = 'Normal distribution. Fits healthy medical standards for adult males.';
            } else {
                bfCategory = 'High';
                bfBadgeClass = 'badge badge-red';
                bfDesc = 'Adipose tissue is above healthy threshold. Elevated risk of cardiovascular indicators.';
            }
        } else { // Female
            if (profile.bodyFat < 14) {
                bfCategory = 'Essential Fat';
                bfBadgeClass = 'badge badge-red';
                bfDesc = 'Excessively low fat. May affect standard reproductive health. Recommend caloric enrichment.';
            } else if (profile.bodyFat >= 14 && profile.bodyFat < 21) {
                bfCategory = 'Athletic';
                bfBadgeClass = 'badge badge-green';
                bfDesc = 'Aesthetic athlete conditioning. Lean and highly active core definition.';
            } else if (profile.bodyFat >= 21 && profile.bodyFat < 25) {
                bfCategory = 'Fit';
                bfBadgeClass = 'badge badge-green';
                bfDesc = 'Excellent healthy target. Defined shape, optimal energy and structural support.';
            } else if (profile.bodyFat >= 25 && profile.bodyFat < 32) {
                bfCategory = 'Average';
                bfBadgeClass = 'badge badge-cyan';
                bfDesc = 'Healthy female biological range. Ideal fat cushions for hormonal balance.';
            } else {
                bfCategory = 'High';
                bfBadgeClass = 'badge badge-red';
                bfDesc = 'Body fat is elevated. Recommend structured nutritional changes and muscle building.';
            }
        }

        paramBfBadge.textContent = bfCategory;
        paramBfBadge.className = bfBadgeClass;
        paramBfDesc.innerHTML = `${bfDesc}<br><small>Estimated via ${profile.bodyFatMethod}</small>`;
        
        // Move BF Indicator: Map 5% to 40% (0% to 100%)
        let bfPct = ((profile.bodyFat - 5) / 35) * 100;
        if (bfPct < 0) bfPct = 0;
        if (bfPct > 100) bfPct = 100;
        paramBfIndicator.style.left = `${bfPct}%`;

        // 3. Ideal Weight Card Rendering
        paramIbwVal.textContent = `${profile.ibwTarget} kg`;
        
        // Weight comparison block
        const weightDiff = profile.weightKg - profile.ibwTarget;
        if (Math.abs(weightDiff) <= 2) {
            paramIbwDiff.textContent = "You are currently at your Ideal Weight!";
            paramIbwDiff.className = "weight-difference-indicator";
        } else if (weightDiff > 2) {
            paramIbwDiff.textContent = `Reduce weight by ${Math.round(weightDiff)} kg for target IBW`;
            paramIbwDiff.className = "weight-difference-indicator loss";
        } else {
            paramIbwDiff.textContent = `Gain weight by ${Math.round(Math.abs(weightDiff))} kg for target IBW`;
            paramIbwDiff.className = "weight-difference-indicator gain";
        }

        // BMR / TDEE Card Rendering
        paramBmrVal.textContent = `${profile.bmr} kcal`;
        paramTdeeVal.textContent = `${profile.tdee} kcal`;

        // 4. Overall Health Score Calculation
        let healthScore = 100;
        let healthStatus = 'Healthy & Fit';
        let healthClass = 'badge-green';
        let healthDetails = 'Your health vectors match standard physiological guidelines. Maintain your activity level and balanced macro targets.';

        // BMI Deductions
        if (profile.bmi < 18.5) {
            healthScore -= 15;
            healthStatus = 'Underweight';
            healthClass = 'badge-amber';
            healthDetails = 'Your weight is below the standard guidelines. Focusing on protein and moderate caloric surplus will help build healthy mass.';
        } else if (profile.bmi >= 25 && profile.bmi < 30) {
            healthScore -= 10;
            healthStatus = 'Overweight';
            healthClass = 'badge-amber';
            healthDetails = 'Body mass is slightly elevated. A combination of caloric regulation and structural exercises is advised.';
        } else if (profile.bmi >= 30) {
            healthScore -= 25;
            healthStatus = 'At Risk (Obese)';
            healthClass = 'badge-red';
            healthDetails = 'High weight mass limits daily mobility and impacts cardiovascular markers. Focus heavily on nutrition adjustments.';
        }

        // Fat Deductions
        const maleHighFat = profile.gender === 'male' && profile.bodyFat >= 25;
        const femaleHighFat = profile.gender === 'female' && profile.bodyFat >= 32;
        if (maleHighFat || femaleHighFat) {
            healthScore -= 15;
            if (healthScore > 65) {
                healthStatus = 'High Body Fat';
                healthClass = 'badge-amber';
            }
        }

        // Sedentary Deductions
        if (profile.activityMultiplier <= 1.2) {
            healthScore -= 10;
        }

        if (healthScore < 60) {
            healthStatus = 'Needs Attention';
            healthClass = 'badge-red';
        }

        overallFitnessCard.innerHTML = `
            <div class="overall-status-header">
                <span class="overall-status-title">Fitness Index Status</span>
                <span class="badge ${healthClass}">${healthStatus}</span>
            </div>
            <div class="fitness-score-shield">
                ${healthScore}<span>/100</span>
            </div>
            <p class="status-summary-text">${healthDetails}</p>
        `;

        // 5. Diet & Macro Blueprint Calculation
        // Macros: Lose: 30P/40C/30F, Gain: 30P/45C/25F, Maintain: 25P/50C/25F
        let pPct = 25, cPct = 50, fPct = 25;
        if (profile.goal === 'lose') {
            pPct = 30; cPct = 40; fPct = 30;
        } else if (profile.goal === 'gain') {
            pPct = 30; cPct = 45; fPct = 25;
        }

        const pKcal = (profile.targetCalories * pPct) / 100;
        const cKcal = (profile.targetCalories * cPct) / 100;
        const fKcal = (profile.targetCalories * fPct) / 100;

        const pGrams = Math.round(pKcal / 4);
        const cGrams = Math.round(cKcal / 4);
        const fGrams = Math.round(fKcal / 9);

        // Update Pie values
        pieTotalKcal.textContent = profile.targetCalories;
        planProteinPct.textContent = pPct;
        planCarbsPct.textContent = cPct;
        planFatsPct.textContent = fPct;
        planProteinVal.textContent = `${pGrams}g (${Math.round(pKcal)} kcal)`;
        planCarbsVal.textContent = `${cGrams}g (${Math.round(cKcal)} kcal)`;
        planFatsVal.textContent = `${fGrams}g (${Math.round(fKcal)} kcal)`;

        // SVG Pie Ring animations
        // Circumference C = 2 * pi * r = 2 * 3.1416 * 40 = 251.32
        const C = 251.32;
        pieProtein.style.strokeDasharray = `${C}`;
        pieCarbs.style.strokeDasharray = `${C}`;
        pieFats.style.strokeDasharray = `${C}`;

        // Calculate offsets
        const pOffset = C - (C * pPct) / 100;
        const cOffset = C - (C * cPct) / 100;
        const fOffset = C - (C * fPct) / 100;

        // Set stroke positions using rotating shifts
        pieProtein.style.strokeDashoffset = `${pOffset}`;
        
        // Carbs offset starts after protein
        const rotateCarbs = (pPct / 100) * 360;
        pieCarbs.style.strokeDashoffset = `${cOffset}`;
        pieCarbs.style.transform = `rotate(${rotateCarbs - 90}deg)`; // rotate offset reference

        // Fats offset starts after protein + carbs
        const rotateFats = ((pPct + cPct) / 100) * 360;
        pieFats.style.strokeDashoffset = `${fOffset}`;
        pieFats.style.transform = `rotate(${rotateFats - 90}deg)`;

        // Build recommendations list
        const dietBullets = [];
        if (profile.goal === 'lose') {
            dietBullets.push("Maintain a calorie budget of " + profile.targetCalories + " kcal. Record meals to prevent calorie creep.");
            dietBullets.push("Consume " + pGrams + "g of lean protein daily to protect muscle mass during deficit. Focus on egg whites, paneer, tofu, sprouts, or chicken breast.");
            dietBullets.push("Prioritize high-fiber complex carbohydrates (oats, brown rice, whole wheat) over refined flour (maida, white bread) to stay satiated longer.");
            dietBullets.push("Use portion control on fats like oils, ghee, and nuts. Limit oil to 2 teaspoons per meal.");
        } else if (profile.goal === 'gain') {
            dietBullets.push("Eat in a surplus of " + profile.targetCalories + " kcal. Plan 4-5 regular meals to meet calorie densities.");
            dietBullets.push("Target " + pGrams + "g of protein to facilitate muscle hypertrophy. Include whey, lentils, paneer, eggs, and lean meats.");
            dietBullets.push("Power your workouts with " + cGrams + "g of carbohydrates, replenishing glycogen reserves after lifting.");
            dietBullets.push("Integrate healthy fats like peanut butter, avocados, almonds, and pumpkin seeds to hit surplus targets easily.");
        } else {
            dietBullets.push("Adhere to your maintenance energy of " + profile.targetCalories + " kcal to retain composition.");
            dietBullets.push("Consume a balanced macro ratio: " + pGrams + "g Protein, " + cGrams + "g Carbs, and " + fGrams + "g Fats.");
            dietBullets.push("Consume a diverse range of seasonal fruits, leafy greens, and fermented foods (curd/yogurt) to support gut microbiome diversity.");
        }
        dietBullets.push("Maintain hydration by drinking at least " + profile.waterLiters + "L of water. Drink 500ml upon waking.");

        planDietBullets.innerHTML = dietBullets.map(bullet => `<li>${bullet}</li>`).join('');

        // 6. Workout Routine Generator
        let cardioIntensity = 'Moderate (2-3 days/wk)';
        let strengthDaysVal = '3 Days/wk';
        const exerciseBullets = [];

        if (profile.goal === 'lose') {
            cardioIntensity = 'High Aerobic (3-4 days/wk)';
            strengthDaysVal = '3-4 Days/wk';
            exerciseBullets.push("Strength Train 3-4 days per week focusing on progressive overload. Building muscle prevents metabolic adaptation during dieting.");
            exerciseBullets.push("Perform 150-200 minutes of Moderate-Intensity Steady State (MISS) cardio weekly (e.g. brisk walking at 6 km/h, light cycling).");
            exerciseBullets.push("Incorporate 1 session of HIIT (High-Intensity Interval Training) weekly (e.g., 20 mins of 30-sec sprints / 60-sec walking) to boost caloric burn.");
        } else if (profile.goal === 'gain') {
            cardioIntensity = 'Low Recovery (1-2 days/wk)';
            strengthDaysVal = '4-5 Days/wk';
            exerciseBullets.push("Prioritize heavy resistance compound lifts (Squats, Deadlifts, Bench Press, Overhead Press) 4-5 times a week.");
            exerciseBullets.push("Limit intense cardio sessions to 1-2 per week. Cardio should only be done for cardiovascular health, not for high calorie depletion.");
            exerciseBullets.push("Incorporate 7-9 hours of deep sleep. Hypertrophy and muscle tissue repair happen during rest, not during workouts.");
        } else {
            cardioIntensity = 'Moderate Active (2-3 days/wk)';
            strengthDaysVal = '3 Days/wk';
            exerciseBullets.push("Perform full-body strength workouts 3 days a week. Keep exercises focused on overall functional mobility and joint health.");
            exerciseBullets.push("Aim for 150 minutes of active movement weekly, including swimming, jogging, or sports.");
            exerciseBullets.push("Incorporate stretching or Yoga sessions twice weekly to maintain flexibility and core stability.");
        }
        exerciseBullets.push("Ensure you complete a 5-10 minute active warm-up before lifting (arm circles, bodyweight squats) to prevent strain.");

        planCardioLevel.textContent = cardioIntensity;
        planStrengthDays.textContent = strengthDaysVal;
        planExerciseBullets.innerHTML = exerciseBullets.map(bullet => `<li>${bullet}</li>`).join('');
    }

    /* ==========================================================================
       AI CALORIE SCANNER WORKFLOW
       ========================================================================== */
    function setupScannerListeners() {
        // Drag & Drop bindings
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
            }, false);
        });

        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length) {
                handleUploadedFile(files[0]);
            }
        });

        imageUploadInput.addEventListener('change', (e) => {
            if (imageUploadInput.files.length) {
                handleUploadedFile(imageUploadInput.files[0]);
            }
        });

        // Trigger file browser on zone click (avoiding click looping)
        dropZone.addEventListener('click', (e) => {
            if (e.target !== imageUploadInput && !scannerPreviewContainer.classList.contains('active')) {
                imageUploadInput.click();
            }
        });

        // Preset buttons click
        presetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent triggering upload clicks
                const key = btn.getAttribute('data-preset');
                if (foodPresets[key]) {
                    runFoodAnalysis(foodPresets[key], `Preset: ${key}`);
                }
            });
        });

        // Manual food button click
        manualFoodBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const text = manualFoodInput.value.trim();
            if (!text) {
                alert("Please enter a food name to analyze.");
                return;
            }
            
            // Show scanning overlay
            uploadPromptView.classList.add('hidden');
            scannerPreviewContainer.classList.remove('hidden');
            scanLaserLine.style.display = 'block';
            scanningIndicator.classList.remove('hidden');
            scanningText.textContent = `AI Analyzing "${text}"...`;
            bboxContainer.innerHTML = '';
            
            setTimeout(() => {
                const result = generateDynamicFoodProfile(text);
                runFoodAnalysis(result, text);
            }, 1800);
        });
    }

    function handleUploadedFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('File must be an image.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            // Render file preview
            scannerPreview.src = e.target.result;
            
            // Show preview UI
            uploadPromptView.classList.add('hidden');
            scannerPreviewContainer.classList.remove('hidden');
            scanLaserLine.style.display = 'block';
            scanningIndicator.classList.remove('hidden');
            bboxContainer.innerHTML = ''; // reset boxes
            
            // Trigger actual analysis logic
            if (state.apiKey) {
                analyzeImageWithGemini(file, e.target.result.split(',')[1]);
            } else {
                analyzeMockImage(file);
            }
        };
        reader.readAsDataURL(file);
    }

    /* ==========================================================================
       DYNAMIC FOOD NUTRITIONAL PROFILE GENERATOR (MOCK AI SIMULATION)
       ========================================================================== */
    function generateDynamicFoodProfile(foodName) {
        const query = foodName.toLowerCase().trim();
        
        // Exact preset checks
        if (query.includes('biryani')) return foodPresets.biryani;
        if (query.includes('pizza')) return foodPresets.pizza;
        if (query.includes('samosa')) return foodPresets.samosa;
        if (query.includes('salad') && !query.includes('chicken') && !query.includes('fruit')) return foodPresets.salad;
        if (query.includes('sushi')) return foodPresets.sushi;
        if (query.includes('dosa')) return foodPresets.dosa;

        // Base values
        let calories = 350;
        let protein = 10;
        let carbs = 40;
        let fats = 12;
        let items = [];
        let advice = "";
        let isHealthy = true;
        let isIndian = false;
        
        const indianKeywords = [
            'paneer', 'tikka', 'masala', 'roti', 'nan', 'naan', 'paratha', 'dal', 'sambar', 'korma', 
            'chole', 'rajma', 'curry', 'biryani', 'pulao', 'khichdi', 'kofta', 'bhaji', 'aloo', 'gobi',
            'dosa', 'idli', 'vada', 'upma', 'poha', 'samosa', 'pakora', 'chutney', 'lassi', 'kheer'
        ];
        
        if (indianKeywords.some(keyword => query.includes(keyword))) {
            isIndian = true;
        }

        let proteinFoods = [];
        let carbFoods = [];
        let fatFoods = [];
        let greenFoods = [];

        // Protein
        if (query.includes('chicken')) {
            protein += 26; calories += 170; fats += 6;
            proteinFoods.push({ name: "Cooked Chicken Breasts", quantity: "150g", calories: 180 });
        }
        if (query.includes('paneer')) {
            protein += 18; calories += 220; fats += 16;
            proteinFoods.push({ name: "Fresh Paneer cubes", quantity: "100g", calories: 240 });
        }
        if (query.includes('fish') || query.includes('salmon') || query.includes('tuna') || query.includes('seafood')) {
            protein += 22; calories += 130; fats += 5;
            proteinFoods.push({ name: "Grilled Fish Fillet", quantity: "120g", calories: 150 });
        }
        if (query.includes('egg') || query.includes('eggs') || query.includes('omelette')) {
            protein += 12; calories += 140; fats += 10;
            proteinFoods.push({ name: "Whole Eggs (Scrambled/Boiled)", quantity: "2 eggs", calories: 150 });
        }
        if (query.includes('beef') || query.includes('mutton') || query.includes('pork') || query.includes('lamb') || query.includes('steak')) {
            protein += 28; calories += 240; fats += 18;
            proteinFoods.push({ name: "Lean Red Meat cuts", quantity: "120g", calories: 250 });
        }
        if (query.includes('tofu') || query.includes('soya') || query.includes('soy')) {
            protein += 12; calories += 80; fats += 4;
            proteinFoods.push({ name: "Organic Firm Tofu", quantity: "100g", calories: 90 });
        }
        if (query.includes('dal') || query.includes('lentil') || query.includes('chickpea') || query.includes('chole') || query.includes('rajma') || query.includes('sprouts')) {
            protein += 10; carbs += 22; calories += 120; fats += 1.5;
            proteinFoods.push({ name: isIndian ? "Spiced Lentil/Bean Curry" : "Boiled Legumes", quantity: "1/2 cup", calories: 130 });
        }

        // Carbohydrates
        if (query.includes('rice') || query.includes('pulao') || query.includes('jeera rice')) {
            carbs += 40; calories += 180;
            carbFoods.push({ name: "Steamed Rice", quantity: "1 cup", calories: 180 });
        }
        if (query.includes('roti') || query.includes('chapati') || query.includes('phulka')) {
            carbs += 26; protein += 3; calories += 110;
            carbFoods.push({ name: "Whole Wheat Chapati", quantity: "2 pieces", calories: 120 });
        }
        if (query.includes('naan') || query.includes('nan') || query.includes('paratha') || query.includes('bhatura')) {
            carbs += 38; protein += 4; calories += 200; fats += 6;
            carbFoods.push({ name: isIndian ? "Butter Naan / Paratha" : "Flatbread", quantity: "1 piece", calories: 230 });
        }
        if (query.includes('bread') || query.includes('toast') || query.includes('bun') || query.includes('sandwich')) {
            carbs += 28; calories += 120;
            carbFoods.push({ name: "Baked Wheat Bread", quantity: "2 slices", calories: 130 });
        }
        if (query.includes('pizza')) {
            carbs += 60; fats += 18; protein += 15; calories += 450;
            carbFoods.push({ name: "Cheesy Pizza Base", quantity: "2 slices", calories: 400 });
        }
        if (query.includes('pasta') || query.includes('noodles') || query.includes('spaghetti')) {
            carbs += 55; calories += 240; protein += 5;
            carbFoods.push({ name: "Boiled Pasta/Noodles", quantity: "1.5 cups", calories: 250 });
        }
        if (query.includes('dosa') || query.includes('idli') || query.includes('uttapam')) {
            carbs += 42; protein += 4; calories += 180;
            carbFoods.push({ name: "Fermented Batter Crepe/Idli", quantity: "1 serving", calories: 180 });
        }
        if (query.includes('potato') || query.includes('fries') || query.includes('aloo')) {
            carbs += 30; calories += 130;
            carbFoods.push({ name: "Cooked Potatoes", quantity: "100g", calories: 120 });
        }

        // Fats
        if (query.includes('butter') || query.includes('ghee') || query.includes('cheese') || query.includes('creamy') || query.includes('cream')) {
            fats += 14; calories += 120;
            fatFoods.push({ name: "Butter/Cheese/Cream dressing", quantity: "1.5 tbsp", calories: 130 });
        }
        if (query.includes('fried') || query.includes('crispy') || query.includes('tempura') || query.includes('pakora') || query.includes('fritter') || query.includes('oil')) {
            fats += 16; calories += 145;
            fatFoods.push({ name: "Deep Frying Oils", quantity: "2 tbsp", calories: 160 });
        }

        // Greens / Fruits
        if (query.includes('salad') || query.includes('greens') || query.includes('cucumber') || query.includes('vegetable') || query.includes('gobi') || query.includes('broccoli') || query.includes('veg') || query.includes('soup')) {
            calories -= 80; carbs -= 10; fats -= 4;
            greenFoods.push({ name: "Fresh green vegetables & herbs", quantity: "1.5 cups", calories: 30 });
        }
        if (query.includes('fruit') || query.includes('apple') || query.includes('banana') || query.includes('orange') || query.includes('mango') || query.includes('berries') || query.includes('grape')) {
            carbs += 18; calories -= 30; fats -= 4;
            greenFoods.push({ name: "Fresh Fruit pieces", quantity: "1 cup", calories: 70 });
        }

        // Combine
        items = [...proteinFoods, ...carbFoods, ...fatFoods, ...greenFoods];
        if (items.length === 0) {
            items.push({ name: "Primary food portion", quantity: "1 plate", calories: 250 });
            items.push({ name: "Oils & Seasonings", quantity: "1 tbsp", calories: 100 });
        }

        // Clamp
        calories = Math.max(120, calories);
        protein = Math.max(3, protein);
        carbs = Math.max(10, carbs);
        fats = Math.max(2, fats);

        if (fats > 25 || calories > 650 || query.includes('fried') || query.includes('cake') || query.includes('pizza') || query.includes('burger')) {
            isHealthy = false;
        }

        const formattedName = foodName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ') + (isIndian ? " (Indian)" : " (Foreign)");

        if (isHealthy) {
            advice = `This is a highly balanced, nutrient-dense ${isIndian ? 'Indian' : 'foreign'} dish. It has a favorable ratio of macronutrients (${Math.round((protein*4)/calories*100)}% protein) and fits exceptionally well into standard weight plans.`;
        } else {
            advice = `This ${isIndian ? 'Indian' : 'foreign'} meal is calorie-dense and rich in lipids. While it offers energy, consider reducing portion sizing to stay within daily limits and balance with high-fiber sides.`;
        }

        if (protein > 20) {
            advice += " Provides high dietary protein, supporting skeletal recovery and cell synthesis.";
        }

        const boundingBoxes = [
            { label: formattedName, box: [15, 15, 85, 85] }
        ];

        return {
            foodName: formattedName,
            totalCalories: Math.round(calories),
            protein: Math.round(protein),
            carbs: Math.round(carbs),
            fats: Math.round(fats),
            items,
            advice,
            isHealthy,
            boundingBoxes
        };
    }

    /* ==========================================================================
       SIMULATED SCAN MODE
       ========================================================================== */
    function analyzeMockImage(file) {
        scanningText.textContent = "AI Scanning Ingredients (Simulated)...";
        
        // Wait 2.5 seconds to simulate neural net scanning
        setTimeout(() => {
            let cleanName = file.name.toLowerCase();
            // Remove file extension
            cleanName = cleanName.substring(0, cleanName.lastIndexOf('.')) || cleanName;
            // Clean up numbers, spaces, underscores, and hyphens
            cleanName = cleanName.replace(/[\d_\-]+/g, ' ').replace(/\s+/g, ' ').trim();

            const selectedFood = generateDynamicFoodProfile(cleanName);
            runFoodAnalysis(selectedFood, file.name);
        }, 2200);
    }

    /* ==========================================================================
       LIVE GEMINI API VISION CALLS (CLIENT SIDE)
       ========================================================================== */
    async function analyzeImageWithGemini(file, base64Data) {
        scanningText.textContent = "Gemini Analyzing Plate Visuals...";
        
        const prompt = `Analyze this food image. Provide a detailed nutritional analysis. Identify the primary foods, estimate their calories, protein (g), carbs (g), fats (g), portion size, and details. Also provide bounding boxes for each major item detected as percentage coordinates [ymin, xmin, ymax, xmax] relative to the image borders (0 to 100). Respond ONLY with a JSON object of this structure: 
        { 
          "foodName": "string", 
          "totalCalories": number, 
          "protein": number, 
          "carbs": number, 
          "fats": number, 
          "items": [{"name": "string", "quantity": "string", "calories": number}], 
          "advice": "string", 
          "isHealthy": boolean, 
          "boundingBoxes": [{"label": "string", "box": [ymin, xmin, ymax, xmax]}] 
        }`;

        try {
            // Note: Support gemini-2.0-flash endpoint
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${state.apiKey}`;
            const payload = {
                contents: [
                    {
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: file.type,
                                    data: base64Data
                                }
                            }
                        ]
                    }
                ],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errMsg = errorData.error?.message || response.statusText;
                throw new Error(`Google API Error: ${errMsg}`);
            }

            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!textResponse) {
                throw new Error("Empty response returned from Gemini.");
            }

            // Parse and apply JSON, ensuring we strip markdown tags if Gemini wraps them
            let cleanText = textResponse.trim();
            cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```$/s, '').trim();
            const result = JSON.parse(cleanText);
            runFoodAnalysis(result, file.name);

        } catch (error) {
            console.error(error);
            alert(`Scanning Failed: ${error.message}\nFalling back to Simulated scan Mode...`);
            // Run simulated fallback
            analyzeMockImage(file);
        }
    }

    /* ==========================================================================
       RENDER SCANNED CALORIES & NUTRITIONAL MATRIX
       ========================================================================== */
    function runFoodAnalysis(foodObj, filename) {
        // Complete the scanning progress states
        scanLaserLine.style.display = 'none';
        scanningIndicator.classList.add('hidden');

        // Swap cards visibility
        resultsPlaceholderCard.classList.add('hidden');
        resultsActiveCard.classList.remove('hidden');

        // Hydrate Basic data
        resTotalCalories.textContent = foodObj.totalCalories;
        resProtein.textContent = `${foodObj.protein}g`;
        resProteinCal.textContent = `${foodObj.protein * 4} kcal`;
        resCarbs.textContent = `${foodObj.carbs}g`;
        resCarbsCal.textContent = `${foodObj.carbs * 4} kcal`;
        resFats.textContent = `${foodObj.fats}g`;
        resFatsCal.textContent = `${foodObj.fats * 9} kcal`;

        // Calculate macro percentages based on total calories
        const calculatedKcal = (foodObj.protein * 4) + (foodObj.carbs * 4) + (foodObj.fats * 9);
        const refKcal = calculatedKcal > 0 ? calculatedKcal : foodObj.totalCalories;
        
        const pPct = ((foodObj.protein * 4) / refKcal) * 100;
        const cPct = ((foodObj.carbs * 4) / refKcal) * 100;
        const fPct = ((foodObj.fats * 9) / refKcal) * 100;

        resProteinBar.style.width = `${pPct}%`;
        resCarbsBar.style.width = `${cPct}%`;
        resFatsBar.style.width = `${fPct}%`;

        // Radial gauge stroke dashoffset calculation:
        // C = 314.16. Max is TDEE limit if profile exists, else fixed 2000.
        const maxKcalLimit = state.userProfile ? state.userProfile.targetCalories : 2000;
        const calorieRatio = foodObj.totalCalories / maxKcalLimit;
        let strokeOffset = 314.16 - (314.16 * calorieRatio);
        if (strokeOffset < 0) strokeOffset = 0; // complete ring filled
        resCalorieGaugeBar.style.strokeDashoffset = strokeOffset;

        // Populate detected items list
        resItemsList.innerHTML = foodObj.items.map(item => `
            <div class="food-item-row">
                <div>
                    <span class="food-item-name">${item.name}</span>
                    <span class="food-item-qty">${item.quantity}</span>
                </div>
                <span class="food-item-cal">${item.calories} kcal</span>
            </div>
        `).join('');

        // Advice Card update
        const adviceClass = foodObj.isHealthy ? "" : "warning-advice";
        const adviceIcon = foodObj.isHealthy ? `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="food-advice-icon">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
        ` : `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="food-advice-icon" style="color: var(--color-amber)">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
        `;

        resFoodAdvice.className = `food-advice-card ${adviceClass}`;
        resFoodAdvice.innerHTML = `
            ${adviceIcon}
            <div>
                <strong>Nutrition Analysis:</strong> ${foodObj.advice}
            </div>
        `;

        // Update timestamp
        const now = new Date();
        scanTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Render Bounding Boxes
        renderBoundingBoxes(foodObj.boundingBoxes);

        // Update local scan history
        state.scanHistory.push({
            name: foodObj.foodName,
            calories: foodObj.totalCalories,
            timestamp: now.toISOString()
        });
        localStorage.setItem('nutrifit_scans', JSON.stringify(state.scanHistory.slice(-10))); // keep last 10
    }

    function renderBoundingBoxes(boxes) {
        bboxContainer.innerHTML = '';
        if (!boxes || !boxes.length) return;

        boxes.forEach(item => {
            // box should contain: [ymin, xmin, ymax, xmax] as values out of 100
            const [ymin, xmin, ymax, xmax] = item.box;
            const width = xmax - xmin;
            const height = ymax - ymin;

            const bboxEl = document.createElement('div');
            bboxEl.className = 'bbox';
            bboxEl.style.top = `${ymin}%`;
            bboxEl.style.left = `${xmin}%`;
            bboxEl.style.width = `${width}%`;
            bboxEl.style.height = `${height}%`;

            const labelEl = document.createElement('div');
            labelEl.className = 'bbox-label';
            labelEl.textContent = item.label;

            bboxEl.appendChild(labelEl);
            bboxContainer.appendChild(bboxEl);
        });
    }

    // Run initialization
    init();
});
