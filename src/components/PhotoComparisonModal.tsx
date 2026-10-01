import React, { useState } from 'react';
import { X, CheckCircle, FileText, Sparkles, Upload, Eye } from 'lucide-react';

interface PhotoComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhotoComparisonModal: React.FC<PhotoComparisonModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomPhotoUrl(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Handwritten Ward Chart Verification & Reference
              </h2>
              <p className="text-xs text-slate-400">
                Hospital postnatal monitoring sheet (24/9/26) digitized with automated formulas and feeding metrics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900">
            <h4 className="font-bold flex items-center gap-1.5 mb-1 text-amber-950">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Full Parameter Digitization & Enhancements</span>
            </h4>
            <p className="text-amber-800 leading-relaxed">
              Every parameter from the paper sheet has been faithfully digitized with automatic calculations:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 font-medium">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-700" />
                <span><strong>Patient Details:</strong> Baby's name (B/o...), DOB & TOB, Maternal & Baby Blood Group</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-700" />
                <span><strong>Age Monitoring:</strong> Live Hours of Life (HOL) and Days of Life (DOL)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-700" />
                <span><strong>Daily Weight:</strong> Birth weight (B.wt), Yesterday (Y.wt), Today (T.wt)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-700" />
                <span><strong>Daily Change (g) & %:</strong> Auto-computes grams ↑/↓ and % loss/gain with &gt;10% alerts</span>
              </li>
              <li className="flex items-center gap-1.5 col-span-1 md:col-span-2">
                <CheckCircle className="w-3.5 h-3.5 text-teal-700" />
                <span><strong>Daily Feeding & Volumes (Requested):</strong> Method (EBF/EBM/Formula), frequency, mL/feed, 24h volume, and mL/kg/day fluid quota</span>
              </li>
            </ul>
          </div>

          {/* Yellow Paper Chart Transcription Replica */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-600" />
                <span>Yellow Hospital Ward Paper Sheet (24/9/26 Transcription)</span>
              </h3>
              
              <label className="inline-flex items-center gap-1 text-xs text-teal-700 hover:text-teal-900 font-semibold cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Paper Chart Photo</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {customPhotoUrl ? (
              <div className="border border-slate-300 rounded-lg overflow-hidden bg-slate-100 p-2 flex justify-center">
                <img
                  src={customPhotoUrl}
                  alt="Uploaded paper chart"
                  className="max-h-[450px] w-auto rounded object-contain shadow-xs"
                />
              </div>
            ) : (
              <div className="bg-[#fef9c3] border-2 border-[#eab308]/70 rounded-lg p-4 font-mono text-[11px] text-slate-900 shadow-inner overflow-x-auto">
                <div className="border-b-2 border-slate-700 pb-1 mb-2 font-bold flex justify-between items-center text-xs">
                  <span>DATE: 24/9/26 (WARD ROUND SHEET)</span>
                  <span className="text-[10px] text-slate-600">HANDWRITTEN POSTNATAL LOG</span>
                </div>
                
                <table className="w-full border-collapse border border-slate-600 text-left">
                  <thead>
                    <tr className="border-b border-slate-600 bg-amber-100/60 font-bold">
                      <th className="border border-slate-500 p-1">Name</th>
                      <th className="border border-slate-500 p-1">DOB / TOB</th>
                      <th className="border border-slate-500 p-1">MBG / BBG</th>
                      <th className="border border-slate-500 p-1">HOL / DOL</th>
                      <th className="border border-slate-500 p-1 text-right">B.wt</th>
                      <th className="border border-slate-500 p-1 text-right">Y.wt</th>
                      <th className="border border-slate-500 p-1 text-right">T.wt</th>
                      <th className="border border-slate-500 p-1 text-center">↑ / ↓</th>
                      <th className="border border-slate-500 p-1 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-400">
                      <td className="border border-slate-500 p-1">B/o Manisha</td>
                      <td className="border border-slate-500 p-1">22/9/26</td>
                      <td className="border border-slate-500 p-1">—</td>
                      <td className="border border-slate-500 p-1">—</td>
                      <td className="border border-slate-500 p-1 text-right">2.760</td>
                      <td className="border border-slate-500 p-1 text-right">2.645</td>
                      <td className="border border-slate-500 p-1 text-right">2.595</td>
                      <td className="border border-slate-500 p-1 text-center">50g ↓</td>
                      <td className="border border-slate-500 p-1 text-right">-5.98%</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <td className="border border-slate-500 p-1">B/o Sarita</td>
                      <td className="border border-slate-500 p-1">22/9/26 @ 3:19am</td>
                      <td className="border border-slate-500 p-1">O +ve</td>
                      <td className="border border-slate-500 p-1">53 HOL</td>
                      <td className="border border-slate-500 p-1 text-right">2.790</td>
                      <td className="border border-slate-500 p-1 text-right">—</td>
                      <td className="border border-slate-500 p-1 text-right">3.055</td>
                      <td className="border border-slate-500 p-1 text-center">—</td>
                      <td className="border border-slate-500 p-1 text-right">+9.50%</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <td className="border border-slate-500 p-1">B/o Deepika</td>
                      <td className="border border-slate-500 p-1">23/9/26 @ 7pm</td>
                      <td className="border border-slate-500 p-1">—</td>
                      <td className="border border-slate-500 p-1">13 HOL</td>
                      <td className="border border-slate-500 p-1 text-right">3.520</td>
                      <td className="border border-slate-500 p-1 text-right">3.520</td>
                      <td className="border border-slate-500 p-1 text-right">3.320</td>
                      <td className="border border-slate-500 p-1 text-center">200g ↓</td>
                      <td className="border border-slate-500 p-1 text-right">-5.68%</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <td className="border border-slate-500 p-1">B/o Laxmikantha</td>
                      <td className="border border-slate-500 p-1">23/9/26 @ 10:05pm</td>
                      <td className="border border-slate-500 p-1">—</td>
                      <td className="border border-slate-500 p-1">11 HOL</td>
                      <td className="border border-slate-500 p-1 text-right">2.590</td>
                      <td className="border border-slate-500 p-1 text-right">2.590</td>
                      <td className="border border-slate-500 p-1 text-right">2.570</td>
                      <td className="border border-slate-500 p-1 text-center">20g ↓</td>
                      <td className="border border-slate-500 p-1 text-right">-0.77%</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <td className="border border-slate-500 p-1">B/o Radhika</td>
                      <td className="border border-slate-500 p-1">18/9/26 @ 10:26am</td>
                      <td className="border border-slate-500 p-1">B +ve /</td>
                      <td className="border border-slate-500 p-1">6th DOL</td>
                      <td className="border border-slate-500 p-1 text-right">3.155</td>
                      <td className="border border-slate-500 p-1 text-right">3.040</td>
                      <td className="border border-slate-500 p-1 text-right">3.095</td>
                      <td className="border border-slate-500 p-1 text-center">55g ↑</td>
                      <td className="border border-slate-500 p-1 text-right">-1.90%</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <td className="border border-slate-500 p-1">B/o Lakshmi</td>
                      <td className="border border-slate-500 p-1">16/9/26 @ 1:58pm</td>
                      <td className="border border-slate-500 p-1">A +ve /</td>
                      <td className="border border-slate-500 p-1">7th DOL</td>
                      <td className="border border-slate-500 p-1 text-right">2.765</td>
                      <td className="border border-slate-500 p-1 text-right">2.710</td>
                      <td className="border border-slate-500 p-1 text-right">2.725</td>
                      <td className="border border-slate-500 p-1 text-center">15g ↑</td>
                      <td className="border border-slate-500 p-1 text-right">+0.72%</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <td className="border border-slate-500 p-1">B/o Lavanya</td>
                      <td className="border border-slate-500 p-1">19/9/26 @ 7:49pm</td>
                      <td className="border border-slate-500 p-1">A +ve</td>
                      <td className="border border-slate-500 p-1">5th DOL</td>
                      <td className="border border-slate-500 p-1 text-right">2.885</td>
                      <td className="border border-slate-500 p-1 text-right">2.620</td>
                      <td className="border border-slate-500 p-1 text-right">2.650</td>
                      <td className="border border-slate-500 p-1 text-center">30g ↑</td>
                      <td className="border border-slate-500 p-1 text-right">-8.15%</td>
                    </tr>
                    <tr className="border-b border-slate-400 bg-rose-200/40">
                      <td className="border border-slate-500 p-1 font-bold">B/o Sirisha</td>
                      <td className="border border-slate-500 p-1">22/9/26 @ 6:17pm</td>
                      <td className="border border-slate-500 p-1">B +ve</td>
                      <td className="border border-slate-500 p-1">38 HOL</td>
                      <td className="border border-slate-500 p-1 text-right">2.940</td>
                      <td className="border border-slate-500 p-1 text-right">—</td>
                      <td className="border border-slate-500 p-1 text-right font-bold">2.640</td>
                      <td className="border border-slate-500 p-1 text-center font-bold">300g ↓</td>
                      <td className="border border-slate-500 p-1 text-right font-bold text-rose-700">-10.20%</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <td className="border border-slate-500 p-1">B/o Unisa</td>
                      <td className="border border-slate-500 p-1">22/9/26 @ 11:50am</td>
                      <td className="border border-slate-500 p-1">A +ve</td>
                      <td className="border border-slate-500 p-1">45 HOL</td>
                      <td className="border border-slate-500 p-1 text-right">3.965</td>
                      <td className="border border-slate-500 p-1 text-right">—</td>
                      <td className="border border-slate-500 p-1 text-right">3.665</td>
                      <td className="border border-slate-500 p-1 text-center">300g ↓</td>
                      <td className="border border-slate-500 p-1 text-right text-amber-800">-7.57%</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <td className="border border-slate-500 p-1">B/o Keerthi</td>
                      <td className="border border-slate-500 p-1">22/9/26 @ 11:47am</td>
                      <td className="border border-slate-500 p-1">B +ve /</td>
                      <td className="border border-slate-500 p-1">45 HOL</td>
                      <td className="border border-slate-500 p-1 text-right">3.010</td>
                      <td className="border border-slate-500 p-1 text-right">3.010</td>
                      <td className="border border-slate-500 p-1 text-right">2.830</td>
                      <td className="border border-slate-500 p-1 text-center">180g ↓</td>
                      <td className="border border-slate-500 p-1 text-right">-5.98%</td>
                    </tr>
                    <tr className="border-b border-slate-400">
                      <td className="border border-slate-500 p-1">B/o Aarthi</td>
                      <td className="border border-slate-500 p-1">24/9/26 @ 6am</td>
                      <td className="border border-slate-500 p-1">AB +ve</td>
                      <td className="border border-slate-500 p-1">2 HOL</td>
                      <td className="border border-slate-500 p-1 text-right">2.60</td>
                      <td className="border border-slate-500 p-1 text-right">2.60</td>
                      <td className="border border-slate-500 p-1 text-right">2.60</td>
                      <td className="border border-slate-500 p-1 text-center">—</td>
                      <td className="border border-slate-500 p-1 text-right">—</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-500 p-1">B/o Tanuja</td>
                      <td className="border border-slate-500 p-1">24/9/26 @ 8:03am</td>
                      <td className="border border-slate-500 p-1">B +ve</td>
                      <td className="border border-slate-500 p-1">1 HOL</td>
                      <td className="border border-slate-500 p-1 text-right">2.560</td>
                      <td className="border border-slate-500 p-1 text-right">2.560</td>
                      <td className="border border-slate-500 p-1 text-right">2.560</td>
                      <td className="border border-slate-500 p-1 text-center">—</td>
                      <td className="border border-slate-500 p-1 text-right">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-md cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
