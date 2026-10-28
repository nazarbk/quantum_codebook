import React from 'react';
import { QuantumSDK } from '../../types/worker';

interface SdkSelectorProps {
  selectedSdk: QuantumSDK;
  onSelectSdk: (sdk: QuantumSDK) => void;
  disabled?: boolean;
}

const SDK_INFO: { id: QuantumSDK; label: string; color: string }[] = [
  { id: 'pennylane', label: 'PennyLane', color: 'from-emerald-500 to-teal-600' },
];

export const SdkSelector: React.FC<SdkSelectorProps> = ({
  selectedSdk,
}) => {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-200" aria-label="Entorno Python">
      <span className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600" />
      {SDK_INFO.find((sdk) => sdk.id === selectedSdk)?.label ?? 'PennyLane'}
    </div>
  );
};
