'use client';

import React, { useEffect, useState } from 'react';
import { School, AlertTriangle, ShieldCheck, Activity, Users, Bell, Bus, CheckCircle } from 'lucide-react';
import { fetchSchoolGuidance, SchoolGuidance } from '@/lib/api';
import { getCityPresetAQI } from '@/lib/initialData';

interface SchoolViewProps {
  city: string;
}

function getPresetSchoolGuidance(cityName: string): SchoolGuidance {
  const aqiInfo = getCityPresetAQI(cityName);
  const aqi = aqiInfo.current.aqi;
  const category = aqiInfo.current.category;

  if (aqi > 250) {
    return {
      aqi,
      category,
      city: cityName,
      assembly_guideline: `Relocate morning assembly indoors or broadcast via classroom PA. Severe morning ground-inversion smog in ${cityName} makes outdoor gathering hazardous.`,
      sports_guideline: `Suspend all high-intensity outdoor sports, running, and athletic drills. Substitute with indoor tactical chess, yoga, or respiratory-safe stretching.`,
      recess_guideline: `Students must remain in closed, filtered classrooms during recess. Avoid playground exposure.`,
      classroom_guideline: `Keep exterior windows sealed until midday solar dispersion. Run classroom air filtration units on high setting.`,
      precautions_for_asthmatic_students: [
        `Ensure students with diagnosed asthma or allergies have fast-acting reliever inhalers stored at the campus infirmary.`,
        `Enforce strict zero-idling zone for school buses and parent cars within 150m of school perimeter gates.`,
        `Outdoor duty teachers and campus gatekeepers should wear certified N95 particulate respirators.`
      ]
    };
  } else if (aqi > 100) {
    return {
      aqi,
      category,
      city: cityName,
      assembly_guideline: `Conduct brief outdoor assembly (maximum 15 minutes) under moderate conditions.`,
      sports_guideline: `Moderate outdoor physical education permitted. Schedule frequent hydration breaks and allow asthmatic students to rest.`,
      recess_guideline: `Outdoor recess allowed in shaded, green courtyards away from roadside pollution.`,
      classroom_guideline: `Open windows during the afternoon safe window when atmospheric mixing disperses surface particulate.`,
      precautions_for_asthmatic_students: [
        `PE instructors should monitor sensitive students for early cough or shortness of breath.`,
        `Keep clean drinking water and medical inhalers readily available.`
      ]
    };
  } else {
    return {
      aqi,
      category,
      city: cityName,
      assembly_guideline: `Normal outdoor morning assembly fully permitted in ${cityName}. Clean air conditions.`,
      sports_guideline: `Full outdoor sports, athletic training, and playground activities actively encouraged.`,
      recess_guideline: `Unrestricted outdoor playground recess.`,
      classroom_guideline: `Keep windows open for fresh ambient air circulation throughout classrooms.`,
      precautions_for_asthmatic_students: [
        `Standard sports guidelines apply. Routine nurse check-in.`,
        `Maintain general campus hygiene and dust-free play courts.`
      ]
    };
  }
}

export const SchoolView: React.FC<SchoolViewProps> = ({ city }) => {
  const [data, setData] = useState<SchoolGuidance>(() => getPresetSchoolGuidance(city));

  useEffect(() => {
    // ⚡ Instant synchronous switch
    setData(getPresetSchoolGuidance(city));

    // Optional silent background sync with live backend
    let mounted = true;
    fetchSchoolGuidance(city)
      .then(res => {
        if (mounted && res) setData(res);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [city]);

  return (
    <div key={city} className="space-y-6 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2">
          <School className="w-4 h-4" />
          <span>School & Campus Air Safety Protocol</span>
        </div>
        <h2 className="text-xl font-bold leading-snug">
          Operational Guidelines for Schools in {city} (Current AQI: {data.aqi} · {data.category})
        </h2>
        <p className="text-xs text-blue-100 mt-1">
          CPCB-aligned health advisory for principals, teachers, and physical education directors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Morning Assembly */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800 mb-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            <span>Morning Assembly</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {data.assembly_guideline}
          </p>
        </div>

        {/* Physical Education & Sports */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800 mb-2">
            <Activity className="w-4 h-4 text-orange-600" />
            <span>Outdoor Sports & PE</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {data.sports_guideline}
          </p>
        </div>

        {/* Recess & Playtime */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800 mb-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Recess & Break Time</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {data.recess_guideline}
          </p>
        </div>

        {/* Classroom Air Management */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800 mb-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Classroom Air Management</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {data.classroom_guideline}
          </p>
        </div>
      </div>

      {/* School Bus Anti-Idling & Infirmary Safeguards */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
          <Bus className="w-4 h-4 text-indigo-600" />
          Mandatory Safety Checklist for Campus Administration
        </h4>
        <ul className="space-y-2 text-xs text-slate-600">
          {data.precautions_for_asthmatic_students.map((p, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
