import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ServicePincode } from '../types';
import {
  MapPin,
  Plus,
  Trash2,
  Check,
  X,
  Edit2,
  ShieldCheck,
  AlertCircle,
  Building,
  Clock,
  Truck,
  CheckCircle2
} from 'lucide-react';

export const PincodeManagementModal: React.FC = () => {
  const {
    servicePincodes,
    addServicePincode,
    updateServicePincode,
    deleteServicePincode,
    toggleServicePincodeActive
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPin, setEditingPin] = useState<ServicePincode | null>(null);

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formState, setFormState] = useState({
    pincode: '',
    areaName: '',
    district: 'Palghar',
    isActive: true,
    deliveryFee: 15,
    minOrderValue: 99,
    estimatedTimeMins: 30
  });

  const handleOpenAdd = () => {
    setEditingPin(null);
    setFormState({
      pincode: '',
      areaName: '',
      district: 'Palghar',
      isActive: true,
      deliveryFee: 15,
      minOrderValue: 99,
      estimatedTimeMins: 30
    });
    setFeedbackMsg(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (pin: ServicePincode) => {
    setEditingPin(pin);
    setFormState({
      pincode: pin.pincode,
      areaName: pin.areaName,
      district: pin.district,
      isActive: pin.isActive,
      deliveryFee: pin.deliveryFee,
      minOrderValue: pin.minOrderValue,
      estimatedTimeMins: pin.estimatedTimeMins
    });
    setFeedbackMsg(null);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.pincode.trim() || !formState.areaName.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Please fill in PIN code and Area Name.' });
      return;
    }

    if (editingPin) {
      const res = updateServicePincode({
        ...editingPin,
        ...formState,
        pincode: formState.pincode.trim(),
        areaName: formState.areaName.trim()
      });
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: res.message });
        setTimeout(() => setShowAddModal(false), 800);
      } else {
        setFeedbackMsg({ type: 'error', text: res.message });
      }
    } else {
      const res = addServicePincode({
        ...formState,
        pincode: formState.pincode.trim(),
        areaName: formState.areaName.trim()
      });
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: res.message });
        setTimeout(() => setShowAddModal(false), 800);
      } else {
        setFeedbackMsg({ type: 'error', text: res.message });
      }
    }
  };

  const handleDelete = (id: string, code: string) => {
    if (window.confirm(`Are you sure you want to remove PIN code ${code} from service area list?`)) {
      const res = deleteServicePincode(id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white p-5 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-yellow-300 text-orange-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <MapPin className="w-3 h-3 text-orange-950" />
              Service Territory & PIN Control
            </span>
            <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/20">
              Admin & Owner Authority
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight">
            Manage Serviceable PIN Codes & Delivery Zones
          </h2>
          <p className="text-xs text-orange-100 font-medium max-w-xl">
            Control which area PIN codes can place orders. Currently set to <strong>Saphale East & West (PIN 401102), Palghar</strong>. Admin/Owner can activate, add, or expand new PIN codes anytime.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-white hover:bg-amber-100 text-orange-950 font-black text-xs px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-2 shrink-0 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4 text-orange-600" />
          Add New Service Area / PIN
        </button>
      </div>

      {/* PIN Codes Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/40">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-orange-500" />
            <h3 className="font-black text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Active Service Territories ({servicePincodes.length})
            </h3>
          </div>
          <span className="text-[11px] text-gray-400 font-bold">
            Orders allowed ONLY from active PINs below
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 uppercase text-[10px] font-black border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3">PIN Code</th>
                <th className="px-4 py-3">Area Name</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Delivery Fee</th>
                <th className="px-4 py-3">Min Order</th>
                <th className="px-4 py-3">ETA</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-semibold text-gray-800 dark:text-gray-200">
              {servicePincodes.map(pin => (
                <tr key={pin.id} className="hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-colors">
                  <td className="px-4 py-3 font-black text-sm text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {pin.pincode}
                  </td>
                  <td className="px-4 py-3 font-extrabold">{pin.areaName}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{pin.district}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleServicePincodeActive(pin.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 transition-all ${
                        pin.isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                      }`}
                    >
                      {pin.isActive ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Service Active
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 text-rose-600" /> Service Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">₹{pin.deliveryFee}</td>
                  <td className="px-4 py-3">₹{pin.minOrderValue}</td>
                  <td className="px-4 py-3 flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    {pin.estimatedTimeMins} mins
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(pin)}
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 text-gray-700 dark:text-gray-300 hover:text-orange-600 transition-colors"
                        title="Edit Area Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pin.id, pin.pincode)}
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 transition-colors"
                        title="Delete PIN"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Adding / Editing Service Area */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4 text-xs font-bold">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                {editingPin ? 'Edit Service Territory PIN' : 'Add New Service Territory PIN'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-black"
              >
                ✕
              </button>
            </div>

            {feedbackMsg && (
              <div
                className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                  feedbackMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-200 border border-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-200 border border-rose-300'
                }`}
              >
                {feedbackMsg.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 uppercase text-gray-500 text-[10px] font-black">
                    6-Digit PIN Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formState.pincode}
                    onChange={e => setFormState({ ...formState, pincode: e.target.value })}
                    placeholder="e.g. 401102"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 uppercase text-gray-500 text-[10px] font-black">
                    District Name
                  </label>
                  <input
                    type="text"
                    value={formState.district}
                    onChange={e => setFormState({ ...formState, district: e.target.value })}
                    placeholder="e.g. Palghar"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase text-gray-500 text-[10px] font-black">
                  Area / Station Name
                </label>
                <input
                  type="text"
                  value={formState.areaName}
                  onChange={e => setFormState({ ...formState, areaName: e.target.value })}
                  placeholder="e.g. Saphale East & West"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block mb-1 uppercase text-gray-500 text-[10px] font-black">
                    Delivery Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={formState.deliveryFee}
                    onChange={e => setFormState({ ...formState, deliveryFee: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-2 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block mb-1 uppercase text-gray-500 text-[10px] font-black">
                    Min Order (₹)
                  </label>
                  <input
                    type="number"
                    value={formState.minOrderValue}
                    onChange={e => setFormState({ ...formState, minOrderValue: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-2 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block mb-1 uppercase text-gray-500 text-[10px] font-black">
                    ETA (Mins)
                  </label>
                  <input
                    type="number"
                    value={formState.estimatedTimeMins}
                    onChange={e => setFormState({ ...formState, estimatedTimeMins: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheckPin"
                  checked={formState.isActive}
                  onChange={e => setFormState({ ...formState, isActive: e.target.checked })}
                  className="w-4 h-4 text-orange-500 rounded"
                />
                <label htmlFor="isActiveCheckPin" className="text-xs text-gray-700 dark:text-gray-300 font-bold">
                  Enable Order Acceptance for this PIN
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black px-5 py-2 rounded-xl shadow-md"
                >
                  {editingPin ? 'Update Service PIN' : 'Add Service PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
