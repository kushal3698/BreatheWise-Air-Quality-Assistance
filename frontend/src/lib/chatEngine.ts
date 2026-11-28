import { ChatResponse, HouseholdProfile } from './api';
import { getCityPresetAQI } from './initialData';

export function generateLocalChatReply(
  message: string,
  city: string,
  language: string = 'en',
  household?: HouseholdProfile
): ChatResponse {
  const msgLower = message.toLowerCase();
  const aqiData = getCityPresetAQI(city);
  const aqi = aqiData.current.aqi;
  const cat = aqiData.current.category;
  const firstSafeWindow = aqiData.safe_windows?.[0];
  const safeWindowStr = firstSafeWindow
    ? `${firstSafeWindow.start} to ${firstSafeWindow.end} (AQI drops to ~${firstSafeWindow.avg_aqi})`
    : '13:00 to 16:00 (peak afternoon solar convection)';

  const hasAsthma = household?.members?.some(m => m.sensitivities?.includes('asthma')) || false;
  const hasPurifier = household?.home?.has_purifier || false;

  let reply = '';
  let grounded_sources = ['kb/indoor_air_quality.md', 'kb/exercise_and_aqi.md'];
  let suggested_questions = [
    'Should my 8-year-old play outside at 4 PM?',
    'Plan my commute tomorrow to minimise pollution',
    'Is it worth buying a purifier or building a DIY one?',
    'What mask is best for cycling or two-wheelers?'
  ];

  // 1. OUTDOOR PLAY / EXERCISE / CHILDREN
  if (
    msgLower.includes('play') ||
    msgLower.includes('outside') ||
    msgLower.includes('8-year') ||
    msgLower.includes('child') ||
    msgLower.includes('kid') ||
    msgLower.includes('walk') ||
    msgLower.includes('run') ||
    msgLower.includes('jog') ||
    msgLower.includes('exercise') ||
    msgLower.includes('4 pm') ||
    msgLower.includes('7 am')
  ) {
    const peakCaution = hasAsthma
      ? '⚠️ **High Sensitivity Caution:** A household member has respiratory sensitivity (asthma). Even moderate outdoor cardio can trigger bronchospasms.'
      : '';

    reply = `**Air quality in ${city} is currently ${cat} (AQI ${aqi}) 🔴.**

${peakCaution}

**Direct Recommendation for Outdoor Play / Exercise:**
- **At 4:00 PM:** Ambient pollution begins rising toward the evening traffic and temperature inversion peak (forecast AQI: ~220–260 in ${city}). It is **not recommended** for an 8-year-old child to engage in strenuous outdoor play (running, soccer, intense cardio) at this time.
- **Why Children are More Vulnerable:** Children breathe up to 50% more air per kilogram of body weight compared to adults, and their narrower airways and developing lung alveoli absorb higher doses of ultra-fine particulate (PM2.5).
- **Best Window Today:** The safest daytime window for outdoor activities today was **${safeWindowStr}**, when ground-level thermal mixing is highest.
- **Actionable Alternative:** Shift energetic play indoors today. Set up an indoor obstacle course, active games, or reading until ambient air improves. If outdoor presence is necessary, limit to low-exertion walking (<20 mins) with a snug child-sized N95 mask.

**Estimated Impact:** Shifting vigorous play indoors saves **~65% to 75%** acute PM2.5 alveolar intake.

*Note: BreatheWise provides environmental health risk support, not medical advice.*`;

    grounded_sources = ['kb/exercise_and_aqi.md', 'kb/vulnerable_groups.md'];
    suggested_questions = [
      'What indoor games replace outdoor cardio on high AQI days?',
      'Which mask fits an 8-year-old properly?',
      'What are the safe outdoor windows tomorrow in ' + city + '?'
    ];

  // 2. COMMUTE / TRAVEL / TRANSIT
  } else if (
    msgLower.includes('commute') ||
    msgLower.includes('travel') ||
    msgLower.includes('metro') ||
    msgLower.includes('bus') ||
    msgLower.includes('car') ||
    msgLower.includes('traffic') ||
    msgLower.includes('work')
  ) {
    reply = `**Low-Emission Commute Advisory for ${city} (Current AQI: ${aqi}, ${cat}):**

1. **Shift Peak Commute Time:** Morning roadside exhaust peaks sharply between **07:30 and 09:30 AM** due to ground-level winter inversion. Shifting travel slightly earlier or later cuts direct vehicle exhaust intake by ~35%.
2. **Switch to Public Transit / Metro:** Modern metro cabins use high-efficiency recirculated filtration, reducing in-transit particulate exposure by ~40% compared to sitting in open-window road traffic.
3. **If Driving a Car:** Keep all windows completely closed and ensure vehicle AC is set to **Recirculation Mode** to avoid drawing outside tailpipe exhaust into the cabin.
4. **Two-Wheeler / Pedestrian:** Wear a certified, well-sealed N95 or FFP2 respirator. Cloth and surgical masks allow over 60% of fine sub-micron soot to bypass through perimeter leaks.

**Estimated Impact:** Shifting a 15 km daily private car commute to public transit avoids **~2.3 kg of CO₂** and saves **~₹110 INR** in fuel per trip.`;

    grounded_sources = ['kb/sustainable_transport.md', 'kb/masks_and_ppe.md'];
    suggested_questions = [
      'Should two-wheeler riders wear an N95 or FFP2 mask?',
      'How to seal car cabin air against PM2.5 in traffic?',
      'How much CO2 can my household save this week?'
    ];

  // 3. AIR PURIFIER / DIY CORSI-ROSENTHAL BOX / INDOOR HACKS
  } else if (
    msgLower.includes('purifier') ||
    msgLower.includes('diy') ||
    msgLower.includes('corsi') ||
    msgLower.includes('filter') ||
    msgLower.includes('hepa') ||
    msgLower.includes('indoor') ||
    msgLower.includes('clean air')
  ) {
    reply = `**Commercial HEPA Purifier vs. DIY Corsi-Rosenthal (C-R) Box:**

| Feature | Commercial HEPA Purifier | DIY Corsi-Rosenthal Filter Box |
|---|---|---|
| **Upfront Cost** | ₹9,000 – ₹25,000 INR | **₹3,000 – ₹4,000 INR** (1/4th the price) |
| **Clean Air Delivery (CADR)** | 180 – 280 CFM | **350 – 480 CFM** (significantly higher airflow) |
| **Filtration Efficiency** | True HEPA (99.97% @ 0.3µm) | MERV-13 (85–90% @ PM2.5 in single pass) |
| **Best Used For** | Bedrooms (120–200 sq ft) | Large living areas & classrooms (400+ sq ft) |

**Recommendation:**
- If you don't own an air purifier yet, building a **DIY Corsi-Rosenthal box** (using a 20-inch box fan and 4x MERV-13 filters sealed with duct tape) cleans indoor air faster in large rooms than a budget commercial purifier.
- **Operating Hack:** Run your purifier on medium/high during morning and evening ambient peaks. Keep doors and windows tightly closed, and ventilate only during the afternoon safe window (${safeWindowStr}).

**Estimated Impact:** Running a HEPA or C-R box drops indoor PM2.5 by **70% to 85%** within 45 minutes.`;

    grounded_sources = ['kb/indoor_air_quality.md', 'kb/clean_cooking_and_heating.md'];
    suggested_questions = [
      'Where can I buy MERV-13 filters in India?',
      'How often do air purifier filters need replacement?',
      'Does burning incense (agarbatti) affect indoor air?'
    ];

  // 4. MULTI-DAY PLAN
  } else if (
    msgLower.includes('3-day') ||
    msgLower.includes('plan') ||
    msgLower.includes('schedule') ||
    msgLower.includes('routine')
  ) {
    reply = `**3-Day Low-Emission & Clean Air Action Plan for ${city}:**

- **Day 1 (Immediate Infiltration Sealing):**
  - Check weather stripping on doors and drafty windows.
  - Run kitchen exhaust during all cooking; eliminate burning incense (agarbatti) which raises indoor PM2.5 above 400 µg/m³.
- **Day 2 (Commute & Travel Optimization):**
  - Consolidate all errands into a single afternoon trip during the safe window (${safeWindowStr}).
  - Carpool or shift to metro/bus transit to prevent cold engine starts.
- **Day 3 (Personalized Family Protection):**
  - ${hasPurifier ? 'Keep bedroom HEPA purifier on overnight.' : 'Set up a HEPA purifier or assemble a DIY filter box for sleeping areas.'}
  - Ensure child school runs avoid idling at school gates.

**Estimated Cumulative Impact:** Avoids **~45% personal particulate exposure**, **~6.8 kg CO₂**, and saves **~₹320 INR**.`;

    grounded_sources = ['kb/indoor_air_quality.md', 'kb/sustainable_transport.md', 'kb/exercise_and_aqi.md'];

  // 5. DEFAULT HELPFUL FALLBACK
  } else {
    reply = `**Air Quality Assessment for ${city} (Current CPCB AQI: ${aqi} • ${cat}):**

Based on diurnal atmospheric models for ${city}:
1. **Current Risk:** Ambient air is in the **${cat}** range. Fine particle concentrations are significantly above the WHO 24-hr guideline (15 µg/m³).
2. **Safe Activity Timing:** Today's optimal daytime window is **${safeWindowStr}**. Morning (07:00–09:30 AM) and evening (07:00–10:00 PM) hours have strong ground inversions that trap smoke and dust.
3. **Indoor Protection:** Keep windows sealed during morning hours. Cross-ventilate briefly in the afternoon. ${hasPurifier ? 'Run your air purifier in occupied rooms.' : 'Consider setting up a DIY Corsi-Rosenthal filter box to cut indoor soot by >70%.'}
4. **Sensitivities:** ${hasAsthma ? 'Household member with asthma: keep reliever inhalers accessible and avoid outdoor cardio.' : 'Limit high-intensity outdoor workouts during peak hours.'}

*How can I help you customize this further for your family?*`;
  }

  return {
    reply,
    grounded_sources,
    suggested_questions,
    safe_window_summary: safeWindowStr,
    disclaimer: 'BreatheWise provides environmental risk decision support, not medical advice. Consult qualified healthcare professionals for medical conditions.'
  };
}
