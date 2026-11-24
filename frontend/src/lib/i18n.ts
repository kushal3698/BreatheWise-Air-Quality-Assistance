export type SupportedLanguage = 'en' | 'hi' | 'te' | 'ta';

export interface Translations {
  appName: string;
  tagline: string;
  nav: {
    dashboard: string;
    planner: string;
    assistant: string;
    impact: string;
    community: string;
    school: string;
  };
  aqiLabels: {
    stationDistance: string;
    updatedJustNow: string;
    safeWindowsTitle: string;
    hourlyTrend: string;
    pollutants: string;
  };
  plannerLabels: {
    householdTitle: string;
    planSummary: string;
    routines: string;
    indoorAir: string;
    sustainable_alternatives: string;
    timeline: string;
    why: string;
    impactTitle: string;
  };
  impactLabels: {
    beforeAfter: string;
    exposureAvoided: string;
    co2Avoided: string;
    costSaved: string;
    cigarettesAvoided: string;
  };
  common: {
    refresh: string;
    generatePlan: string;
    loading: string;
    disclaimer: string;
    safeWindow: string;
  };
}

export const I18N_DATA: Record<SupportedLanguage, Translations> = {
  en: {
    appName: "BreatheWise",
    tagline: "Cleaner air begins with smarter daily choices.",
    nav: {
      dashboard: "Air Dashboard",
      planner: "Daily Action Plan",
      assistant: "GenAI Assistant",
      impact: "Personal Impact",
      community: "Community Challenges",
      school: "School Guidance",
    },
    aqiLabels: {
      stationDistance: "Nearest Monitor",
      updatedJustNow: "Live CPCB / Open-Meteo",
      safeWindowsTitle: "Optimal Safe Windows Today",
      hourlyTrend: "24-Hour Forecast & PM2.5 Trend",
      pollutants: "Key Pollutant Breakdown",
    },
    plannerLabels: {
      householdTitle: "Household Profile",
      planSummary: "Personalized Daily Plan",
      routines: "Low-Emission Daily Routines",
      indoorAir: "Indoor Air Playbook",
      sustainable_alternatives: "Sustainable Alternatives",
      timeline: "Today's Hourly Safe Timeline",
      why: "Why this helps:",
      impactTitle: "Estimated Direct Impact",
    },
    impactLabels: {
      beforeAfter: "Before vs. After Comparison",
      exposureAvoided: "Harmful PM2.5 Exposure Avoided",
      co2Avoided: "Household CO₂ Avoided",
      costSaved: "Monthly Fuel / Transport Cost Saved",
      cigarettesAvoided: "Equivalent Cigarettes Avoided Today",
    },
    common: {
      refresh: "Refresh Live Data",
      generatePlan: "Generate Tailored Plan",
      loading: "Analyzing local air quality...",
      disclaimer: "Estimates for awareness only. Not medical advice.",
      safeWindow: "Safe Window",
    },
  },
  hi: {
    appName: "ब्रीदवाइज़ (BreatheWise)",
    tagline: "स्वच्छ हवा की शुरुआत समझदार दैनिक विकल्पों से होती है।",
    nav: {
      dashboard: "वायु डैशबोर्ड",
      planner: "दैनिक कार्य योजना",
      assistant: "एआई सहायक",
      impact: "व्यक्तिगत प्रभाव",
      community: "सामुदायिक पहल",
      school: "स्कूल दिशानिर्देश",
    },
    aqiLabels: {
      stationDistance: "निकटतम निगरानी केंद्र",
      updatedJustNow: "लाइव CPCB / ओपन-मेटियो",
      safeWindowsTitle: "आज के सबसे सुरक्षित समय",
      hourlyTrend: "24 घंटे का पूर्वानुमान और PM2.5",
      pollutants: "मुख्य प्रदूषक स्तर",
    },
    plannerLabels: {
      householdTitle: "परिवार प्रोफ़ाइल",
      planSummary: "अनुकूलित दैनिक योजना",
      routines: "कम उत्सर्जन दिनचर्या",
      indoorAir: "घर के अंदर स्वच्छ वायु उपाय",
      sustainable_alternatives: "टिकाऊ विकल्प",
      timeline: "आज की सुरक्षित समय-सारणी",
      why: "यह क्यों उपयोगी है:",
      impactTitle: "अनुमानित प्रत्यक्ष प्रभाव",
    },
    impactLabels: {
      beforeAfter: "पहले बनाम बाद में तुलना",
      exposureAvoided: "हानिकारक PM2.5 से बचाव",
      co2Avoided: "CO₂ उत्सर्जन में कमी",
      costSaved: "मासिक परिवहन बचत",
      cigarettesAvoided: "सिगरेट के बराबर हानिकारक धुएं से बचाव",
    },
    common: {
      refresh: "डेटा ताज़ा करें",
      generatePlan: "योजना तैयार करें",
      loading: "वायु गुणवत्ता का विश्लेषण हो रहा है...",
      disclaimer: "अनुमान केवल जागरूकता के लिए हैं। यह चिकित्सा उपकरण नहीं है।",
      safeWindow: "सुरक्षित समय",
    },
  },
  te: {
    appName: "బ్రీత్‌వైజ్ (BreatheWise)",
    tagline: "స్మార్ట్ రోజువారీ నిర్ణయాలతో స్వచ్ఛమైన గాలి ప్రారంభమవుతుంది.",
    nav: {
      dashboard: "గాలి డాష్‌బోర్డ్",
      planner: "రోజువారీ కార్యాచరణ ప్రణాళిక",
      assistant: "AI అసిస్టెంట్",
      impact: "వ్యక్తిగత ప్రభావం",
      community: "కమ్యూనిటీ కార్యక్రమాలు",
      school: "పాఠశాల మార్గదర్శకాలు",
    },
    aqiLabels: {
      stationDistance: "సమీప పర్యవేక్షణ కేంద్రం",
      updatedJustNow: "లైవ్ CPCB / ఓపెన్-మెటియో",
      safeWindowsTitle: "ఈ రోజు ఉత్తమ సురక్షిత సమయాలు",
      hourlyTrend: "24 గంటల సూచన & PM2.5 ట్రెండ్",
      pollutants: "కాలుష్య కారకాల వివరాలు",
    },
    plannerLabels: {
      householdTitle: "కుటుంబ ప్రొఫైల్",
      planSummary: "వ్యక్తిగత ప్రణాళిక",
      routines: "తక్కువ ఉద్గార రోజువారీ పనులు",
      indoorAir: "ఇంట్లో స్వచ్ఛమైన గాలి పద్ధతులు",
      sustainable_alternatives: "పర్యావరణ అనుకూల ప్రత్యామ్నాయాలు",
      timeline: "సురక్షిత సమయ సూచిక",
      why: "ఇది ఎందుకు సహాయపడుతుంది:",
      impactTitle: "అంచనా వేయబడిన ప్రభావం",
    },
    impactLabels: {
      beforeAfter: "ముందు vs తర్వాత పోలిక",
      exposureAvoided: "PM2.5 కాలుష్యం నుండి రక్షణ",
      co2Avoided: "తగ్గించిన CO₂ ఉద్గారాలు",
      costSaved: "నెలవారీ రవాణా ఖర్చు ఆదా",
      cigarettesAvoided: "సిగరెట్ పొగతో సమానమైన కాలుష్యం ఆదా",
    },
    common: {
      refresh: "డేటాను రిఫ్రెష్ చేయండి",
      generatePlan: "ప్లాన్ సిద్ధం చేయండి",
      loading: "విశ్లేషిస్తోంది...",
      disclaimer: "అవగాహన కోసం మాత్రమే అంచనాలు. ఇది వైద్య సలహా కాదు.",
      safeWindow: "సేఫ్ విండో",
    },
  },
  ta: {
    appName: "ப்ரீத்வைஸ் (BreatheWise)",
    tagline: "தூய்மையான காற்று சிறந்த தினசரி தேர்வுகளிலிருந்து தொடங்குகிறது.",
    nav: {
      dashboard: "காற்று டாஷ்போர்டு",
      planner: "தினசரி செயல் திட்டம்",
      assistant: "AI உதவியாளர்",
      impact: "தனிப்பட்ட தாக்கம்",
      community: "சமூக சவால்கள்",
      school: "பள்ளி வழிகாட்டுதல்",
    },
    aqiLabels: {
      stationDistance: "அருகிலுள்ள கண்காணிப்பு மையம்",
      updatedJustNow: "நேரலை CPCB / Open-Meteo",
      safeWindowsTitle: "இன்றைய பாதுகாப்பான நேரங்கள்",
      hourlyTrend: "24 மணி நேர முன்னறிவிப்பு",
      pollutants: "மாசுபடுத்திகள் விவரம்",
    },
    plannerLabels: {
      householdTitle: "குடும்ப விவரக்குறிப்பு",
      planSummary: "தனிப்பயனாக்கப்பட்ட திட்டம்",
      routines: "குறைந்த உமிழ்வு பழக்கவழக்கங்கள்",
      indoorAir: "உட்புற காற்று குறிப்புகள்",
      sustainable_alternatives: "நிலையான மாற்றுகள்",
      timeline: "பாதுகாப்பான காலவரிசை",
      why: "ஏன் உதவுகிறது:",
      impactTitle: "நேரடி தாக்கம்",
    },
    impactLabels: {
      beforeAfter: "முன் மற்றும் பின் ஒப்பீடு",
      exposureAvoided: "PM2.5 துகள்களிலிருந்து பாதுகாப்பு",
      co2Avoided: "குறைக்கப்பட்ட CO₂ உமிழ்வு",
      costSaved: "மாதாந்திர எரிபொருள் சேமிப்பு",
      cigarettesAvoided: "சிகரெட் அளவுக்கு நிகரான பாதுகாப்பு",
    },
    common: {
      refresh: "புதுப்பிக்கவும்",
      generatePlan: "திட்டத்தை உருவாக்கவும்",
      loading: "பகுப்பாய்வு செய்கிறது...",
      disclaimer: "விழிப்புணர்வுக்கு மட்டுமே. இது மருத்துவ ஆலோசனை அல்ல.",
      safeWindow: "பாதுகாப்பான நேரம்",
    },
  },
};
