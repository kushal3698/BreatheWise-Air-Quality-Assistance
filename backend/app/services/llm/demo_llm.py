from typing import Dict, Any, List, Optional
from app.services.llm.base import BaseLLMProvider
from app.models.schemas import HouseholdProfile
from app.services.safety import get_safety_cautions, STANDARD_DISCLAIMER
from app.services.impact import calculate_action_impact, calculate_overall_impact

class DemoLLMProvider(BaseLLMProvider):
    async def generate_plan(
        self,
        city: str,
        aqi_data: Dict[str, Any],
        household: Optional[HouseholdProfile],
        rag_context: List[Dict[str, Any]],
        language: str = "en"
    ) -> Dict[str, Any]:
        curr = aqi_data.get("current", {})
        aqi = curr.get("aqi", 250)
        cat = curr.get("category", "Poor")
        pm25 = curr.get("pm2_5", 150.0)
        safe_windows = aqi_data.get("safe_windows", [])
        
        # Check sensitivities and profile specifics
        has_asthma = False
        has_child = False
        has_elderly = False
        has_purifier = False
        if household:
            if household.members:
                has_asthma = any(any("asthma" in s.lower() or "copd" in s.lower() or "respiratory" in s.lower() for s in m.sensitivities) for m in household.members)
                has_child = any(m.role.lower() == "child" or m.age < 12 for m in household.members)
                has_elderly = any(m.role.lower() == "elderly" or m.age >= 65 for m in household.members)
            if household.home:
                has_purifier = household.home.has_purifier

        # Metro cities whitelist
        METRO_CITIES = {
            "delhi", "new delhi", "noida", "greater noida", "gurugram", "gurgaon",
            "ghaziabad", "faridabad", "mumbai", "navi mumbai", "bengaluru", "bangalore",
            "kolkata", "hyderabad", "chennai", "ahmedabad", "pune", "jaipur", "lucknow",
            "kochi", "kanpur", "nagpur"
        }
        is_metro = city.lower().strip() in METRO_CITIES

        # Safe window textual representation
        safe_start = "13:00"
        safe_end = "16:30"
        safe_aqi = round(aqi * 0.72)
        if safe_windows:
            safe_start = safe_windows[0].get("start", "13:00")
            safe_end = safe_windows[0].get("end", "16:30")
            safe_aqi = safe_windows[0].get("avg_aqi", round(aqi * 0.72))
        safe_text = f"{safe_start} - {safe_end}"

        peak_morning_aqi = round(aqi * 1.30)
        peak_evening_aqi = round(aqi * 1.20)

        # Multilingual summaries (sensitive-aware)
        if language == "hi":
            summary = f"आज {city} में वायु गुणवत्ता '{cat}' (AQI {aqi}) है। सुबह {peak_morning_aqi} के पीक पर सावधानी बरतें और सुरक्षित दोपहर खिड़की ({safe_text}) का उपयोग करें।"
        elif language == "te":
            summary = f"ఈరోజు {city} లో గాలి నాణ్యత '{cat}' (AQI {aqi}) గా ఉంది. ఉదయం పీక్ సమయంలో జాగ్రత్త వహించండి మరియు మధ్యాహ్న సేఫ్ విండో ({safe_text}) ను ఉపయోగించండి."
        elif language == "ta":
            summary = f"இன்று {city} இல் காற்றின் தரம் '{cat}' (AQI {aqi}). காலை நெரிசல் நேரத்தில் தீவிர உடற்பயிற்சியைத் தவிர்க்கவும், பாதுகாப்பான நேரத்தைப் ({safe_text}) பயன்படுத்தவும்."
        else:
            if has_asthma:
                summary = f"Air in {city} is {cat} (AQI {aqi}), peaking at ~{peak_morning_aqi} during morning hours. Asthma caution: keep intense cardio indoors and schedule outdoor activity during the afternoon safe window ({safe_text})."
            elif aqi > 200:
                summary = f"Elevated {cat} pollution in {city} (AQI {aqi}) with morning peak ~{peak_morning_aqi}. Shift intense workouts indoors; ventilate only during the afternoon safe window ({safe_text})."
            elif aqi > 100:
                summary = f"Moderate air quality in {city} (AQI {aqi}) with morning peak ~{peak_morning_aqi}. Keep intense cardio indoors and schedule outdoor recreation during the afternoon safe window ({safe_text})."
            else:
                summary = f"Satisfactory air in {city} (AQI {aqi}). Favorable conditions across most hours; optimal outdoor window is {safe_text} during peak thermal dispersion."

        # Low emission routines
        r1_impact = calculate_action_impact("exercise", pm25, household)
        r2_impact = calculate_action_impact("commute", pm25, household)
        
        commute_action = "Shift peak commute (8–10 AM) to Metro or carpool" if is_metro else "Shift peak commute (8–10 AM) to public bus, shared transit, or carpool"
        commute_why = "Avoids sitting in bumper-to-bumper vehicle exhaust plumes and cuts daily tailpipe emissions."

        routines = [
            {
                "action": f"Schedule outdoor cardio during the afternoon safe window ({safe_text})",
                "why": f"Between 06:00 and 09:30 AM, AQI peaks at ~{peak_morning_aqi}. Deep breathing during morning cardio multiplies fine particle deposition in airways.",
                "effort": "low",
                "cost": "free",
                "impact": r1_impact,
                "sources": ["kb/exercise_and_aqi.md"]
            },
            {
                "action": commute_action,
                "why": commute_why,
                "effort": "medium",
                "cost": "free",
                "impact": r2_impact,
                "sources": ["kb/sustainable_transport.md"]
            }
        ]

        # Indoor air hacks (profile-aware)
        h1_impact = calculate_action_impact("purifier", pm25, household)
        h2_impact = calculate_action_impact("cooking", pm25, household)
        
        purifier_action = "Run bedroom HEPA air purifier on medium/high during morning and evening peaks" if has_purifier else "Set up a HEPA purifier or assemble a DIY Corsi-Rosenthal filter box fan"
        purifier_why = "Filters >75% of fine particles from bedroom air during atmospheric inversion hours." if has_purifier else "A DIY Corsi-Rosenthal box (4x MERV-13 filters + box fan) achieves 350+ CFM CADR at ~₹3,500 INR, cutting indoor PM2.5 by over 70%."

        indoor_hacks = [
            {
                "action": f"Keep windows tightly shut during morning peak; cross-ventilate during {safe_text}",
                "why": "Afternoon solar convection breaks the nocturnal boundary layer, dropping ambient PM2.5 to the daily low (~{safe_aqi}).",
                "effort": "low",
                "cost": "free",
                "impact": {"exposure_reduction_pct": 35.0, "confidence": "Modelled estimate"},
                "sources": ["kb/indoor_air_quality.md"]
            },
            {
                "action": purifier_action,
                "why": purifier_why,
                "effort": "medium",
                "cost": "free" if has_purifier else "low",
                "impact": h1_impact,
                "sources": ["kb/indoor_air_quality.md"]
            },
            {
                "action": "Run kitchen exhaust for all cooking and avoid burning incense (agarbatti)",
                "why": "Cooking fumes and burning incense raise indoor PM2.5 above 400 µg/m³ in enclosed living rooms.",
                "effort": "low",
                "cost": "free",
                "impact": h2_impact,
                "sources": ["kb/clean_cooking_and_heating.md"]
            }
        ]

        # Sustainable alternatives
        alt1_impact = calculate_action_impact("school", pm25, household)
        sustainable_alts = [
            {
                "action": "Batch grocery and errand trips into a single midday route during the safe window",
                "why": "Avoids multiple cold engine starts and saves 60–70% of local vehicle emissions.",
                "effort": "low",
                "cost": "free",
                "impact": {"exposure_reduction_pct": 15.0, "co2_saved_kg": 2.1, "cost_saved_inr": 120.0, "confidence": "Modelled estimate"},
                "sources": ["kb/sustainable_transport.md"]
            },
            {
                "action": "Pool school runs or enroll in neighborhood school bus",
                "why": "Reduces localized tailpipe emissions right at school gates where children gather.",
                "effort": "medium",
                "cost": "free",
                "impact": alt1_impact,
                "sources": ["kb/school_and_community.md"]
            }
        ]

        # Timeline derived strictly from forecast dynamics
        morning_advice = (
            f"Morning peak (AQI up to ~{peak_morning_aqi}): ground inversion traps exhaust; keep workouts indoors." if peak_morning_aqi > 200
            else f"Morning peak (AQI up to ~{peak_morning_aqi}): keep intense cardio indoors and reschedule morning walks." if peak_morning_aqi > 100
            else f"Mild morning peak (AQI ~{peak_morning_aqi}): safe for light outdoor walking; sensitive groups monitor symptoms."
        )
        evening_advice = (
            f"Evening peak (AQI up to ~{peak_evening_aqi}): nocturnal cooling traps rush-hour particulate. Seal living spaces." if peak_evening_aqi > 150
            else f"Moderate evening peak (AQI ~{peak_evening_aqi}): keep windows closed along busy roads; asthma members stay indoors." if peak_evening_aqi > 100
            else f"Pleasant evening hours (AQI ~{peak_evening_aqi}): safe for normal evening routines."
        )

        timeline = [
            {"time": "06:00 - 09:30", "advice": morning_advice},
            {"time": "09:30 - 13:00", "advice": "Commute window: keep car AC on recirculation mode and seal roadside windows."},
            {"time": safe_text, "advice": f"Optimal safe window today (AQI drops to ~{safe_aqi}). Peak solar convection disperses surface pollutants. Best window for outdoor errands, exercise, and home ventilation."},
            {"time": "18:00 - 22:00", "advice": evening_advice}
        ]

        overall_impact = calculate_overall_impact(pm25, household)
        cautions = get_safety_cautions(aqi, cat, household)

        return {
            "summary": summary,
            "risk_level": cat.lower().replace(" ", "_"),
            "sections": {
                "low_emission_routines": routines,
                "indoor_air_hacks": indoor_hacks,
                "sustainable_alternatives": sustainable_alts
            },
            "today_timeline": timeline,
            "impact_summary": overall_impact.model_dump(),
            "cautions": cautions,
            "disclaimer": STANDARD_DISCLAIMER
        }

    async def generate_chat_reply(
        self,
        message: str,
        city: str,
        aqi_data: Dict[str, Any],
        household: Optional[HouseholdProfile],
        rag_context: List[Dict[str, Any]],
        language: str = "en",
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        msg_lower = message.lower()
        curr = aqi_data.get("current", {})
        aqi = curr.get("aqi", 250)
        cat = curr.get("category", "Poor")
        safe_windows = aqi_data.get("safe_windows", [])
        
        safe_summary = ""
        if safe_windows:
            safe_summary = f"Best safe window today: {safe_windows[0]['start']} to {safe_windows[0]['end']} (AQI ~{safe_windows[0]['avg_aqi']})"

        sources = [c["source"] for c in rag_context] if rag_context else ["kb/indoor_air_quality.md", "kb/exercise_and_aqi.md"]
        
        # Grounded response synthesis
        if "play outside" in msg_lower or "8-year-old" in msg_lower or "child" in msg_lower or "kid" in msg_lower:
            reply = (
                f"**Air today in {city} is {cat} (AQI {aqi}) 🔴.**\n\n"
                f"**Recommendation: Do not allow your child to play vigorously outside this afternoon.**\n\n"
                f"- **Why:** Children's respiratory rates are significantly higher per kg of body weight, and developing alveoli are especially susceptible to permanent damage from sub-micron PM2.5.\n"
                f"- **Alternative:** If outdoor recess is unavoidable, restrict it to the safest window ({safe_summary}) for no more than 20–25 minutes of low-intensity play (like walking or reading) rather than active sprinting.\n"
                f"- **Estimated Impact:** Avoiding intense outdoor cardio saves ~60% to 75% acute fine particle alveolar deposition."
            )
            suggested = [
                "What indoor activities can replace outdoor sports?",
                "Which mask is safe and fits a child properly?",
                "What are the best safe windows tomorrow?"
            ]

        elif "commute" in msg_lower or "travel" in msg_lower or "metro" in msg_lower:
            reply = (
                f"**Low-Emission Commute Plan for {city} (Current AQI: {aqi}, {cat}):**\n\n"
                f"1. **Switch to Metro / Underground Rail:** Cabin air in modern metro trains is continuously filtered, reducing direct exposure to roadside particulate spikes by ~40% compared to sitting in road congestion.\n"
                f"2. **If Driving a Car:** Keep all windows shut and switch vehicle air conditioning to **Recirculation mode** (prevents sucking outside exhaust into the cabin).\n"
                f"3. **Turn Off Engine at Signals:** Idling for >15 seconds wastes fuel and creates concentrated toxic fumes at pedestrian breathing height.\n\n"
                f"**Estimated Impact:** Shifting a 15 km car commute to the metro avoids **~2.3 kg of CO₂** and saves **~₹110 INR** in fuel per trip."
            )
            suggested = [
                "How much CO2 does my household save by carpooling?",
                "Should two-wheeler riders wear an N95 mask?",
                "How to seal car cabin air effectively?"
            ]

        elif "purifier" in msg_lower or "diy" in msg_lower or "corsi" in msg_lower:
            reply = (
                f"**Commercial Air Purifier vs. DIY Corsi-Rosenthal (C-R) Box:**\n\n"
                f"| Feature | Commercial HEPA Purifier | DIY Corsi-Rosenthal Box |\n"
                f"|---|---|---|\n"
                f"| **Upfront Cost** | ₹10,000 – ₹25,000 INR | **₹3,000 – ₹4,000 INR** |\n"
                f"| **Clean Air Delivery (CADR)** | 150 – 250 CFM | **350 – 450 CFM** (superior airflow) |\n"
                f"| **Filtration Level** | True HEPA (99.97%) | MERV-13 (90-95% for PM2.5) |\n"
                f"| **Room Coverage** | Ideal for 120–200 sq ft bedroom | Excellent for large living rooms (400+ sq ft) |\n"
                f"| **Noise Level** | Very quiet (sleep mode) | Moderate fan hum |\n\n"
                f"**Verdict:** If budget is a constraint or you need to clean a large shared living space/classroom, the DIY Corsi-Rosenthal box provides the highest clean air per rupee."
            )
            suggested = [
                "What materials are needed to build a C-R box?",
                "How often should HEPA filters be replaced?",
                "Do houseplants clean air as well as purifiers?"
            ]

        elif "3-day" in msg_lower or "plan" in msg_lower:
            reply = (
                f"**3-Day Low-Emission Family Resilience Plan for {city}:**\n\n"
                f"- **Day 1 (Sealing & Infiltration Control):** Check weatherstripping on balcony doors; shift morning jogging indoors; prepare DIY filter or set purifier to auto-boost.\n"
                f"- **Day 2 (Mobility Optimization):** Coordinate with neighbors for carpool school drop-offs; consolidate shopping errands into a single trip during the afternoon safe window ({safe_summary}).\n"
                f"- **Day 3 (Cooking & Indoor Source Reduction):** Switch high-heat cooking to induction or keep exhaust fans on for 15 minutes post-cooking; eliminate all incense sticks and mosquito coils.\n\n"
                f"**Cumulative 3-day Impact:** Approximately **4.8 kg CO₂ avoided** and **~45% lower personal PM2.5 intake**."
            )
            suggested = [
                "How to protect asthmatic family members during smog?",
                "What is the best time to ventilate our home today?",
                "Can you calculate our monthly fuel savings?"
            ]

        else:
            reply = (
                f"Today in **{city}**, air quality is **{cat}** with an AQI of **{aqi}** (PM2.5: {curr.get('pm2_5', 'N/A')} µg/m³).\n\n"
                f"- **Current Guidance:** Ground-level smog is concentrated. Keep non-essential outdoor travel minimal.\n"
                f"- **Safe Window:** {safe_summary if safe_summary else 'Mid-afternoon (1:00 PM – 4:00 PM) offers the lowest particulate levels today.'}\n"
                f"- **Action Tip:** Always use certified N95 respirators for outdoor transit; cloth masks do not filter fine PM2.5 particles."
            )
            suggested = [
                "Should my 8-year-old play outside at 4 PM?",
                "Plan my commute tomorrow to minimise pollution",
                "Is it worth buying a purifier or building a DIY one?"
            ]

        # Translate or append language note if requested
        if language == "hi":
            reply = f"**{city} में वर्तमान वायु गुणवत्ता: {cat} (AQI {aqi})**\n\n" + reply
        elif language == "te":
            reply = f"**{city} లో ప్రస్తుత గాలి నాణ్యత: {cat} (AQI {aqi})**\n\n" + reply
        elif language == "ta":
            reply = f"**{city} இல் தற்போதைய காற்றின் தரம்: {cat} (AQI {aqi})**\n\n" + reply

        return {
            "reply": reply,
            "grounded_sources": list(set(sources))[:3],
            "suggested_questions": suggested,
            "safe_window_summary": safe_summary,
            "disclaimer": STANDARD_DISCLAIMER
        }
