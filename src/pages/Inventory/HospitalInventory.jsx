
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { inventoryAPI } from '../../services/api';
import BloodGroupBadge from '../../components/BloodGroupBadge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import {
  Droplet,
  Save,
  History,
  Plus,
  Minus,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const emptyStock = {
  availableUnits: 0,
  reservedUnits: 0,
  expiredUnits: 0,
  notes: ''
};

const getErrorMessage = (err, fallback) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  fallback;

const formatDate = (date) => {
  if (!date) return 'Never';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return '—';

  return parsed.toLocaleString();
};

const HospitalInventory = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [inventory, setInventory] = useState([]);
  const [history, setHistory] = useState([]);
  const [reminder, setReminder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingGroup, setSavingGroup] = useState(null);
  const [batchSaving, setBatchSaving] = useState(false);
  const [stockMap, setStockMap] = useState({});

  // Load hospital inventory and audit history
  const loadInventory = useCallback(async () => {
    setLoading(true);

    try {
      const res = await inventoryAPI.getMyInventory();

      // Supports the backend's direct and nested response formats.
      const responseData = res.data?.inventory
        ? res.data
        : res.data?.data || {};

      const inventoryItems = Array.isArray(responseData.inventory)
        ? responseData.inventory
        : [];

      const historyItems = Array.isArray(responseData.history)
        ? responseData.history
        : [];

      setInventory(inventoryItems);
      setHistory(historyItems);
      setReminder(responseData.reminder || null);

      const map = {};

      BLOOD_GROUPS.forEach((bg) => {
        const item = inventoryItems.find(
          (i) => (i.blood_group || i.bloodGroup) === bg
        );

        map[bg] = {
          availableUnits: Number(
            item?.available_units ?? item?.availableUnits ?? 0
          ),
          reservedUnits: Number(
            item?.reserved_units ?? item?.reservedUnits ?? 0
          ),
          expiredUnits: Number(
            item?.expired_units ?? item?.expiredUnits ?? 0
          ),
          notes: ''
        };
      });

      setStockMap(map);
    } catch (err) {
      console.error(
        'Hospital inventory loading error:',
        err.response?.data || err
      );

      showToast(
        getErrorMessage(err, 'Unable to load hospital inventory.'),
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // Handle stock input changes
  const handleStockChange = (bg, field, value) => {
    const val = Math.max(0, parseInt(value, 10) || 0);

    setStockMap((prev) => ({
      ...prev,
      [bg]: {
        ...prev[bg],
        [field]: val
      }
    }));
  };

  // Quick increase/decrease available units
  const handleQuickAdjust = (bg, delta) => {
    setStockMap((prev) => {
      const current = prev[bg]?.availableUnits || 0;
      const nextVal = Math.max(0, current + delta);

      return {
        ...prev,
        [bg]: {
          ...prev[bg],
          availableUnits: nextVal
        }
      };
    });
  };

  // Validate stock before sending to backend
  const validateStock = (data, bg) => {
    if (!data) {
      return `${bg}: Inventory data is missing.`;
    }

    if (
      data.availableUnits < 0 ||
      data.reservedUnits < 0 ||
      data.expiredUnits < 0
    ) {
      return `${bg}: Stock values cannot be negative.`;
    }

    if (data.reservedUnits > data.availableUnits) {
      return `${bg}: Reserved units cannot exceed available units.`;
    }

    return null;
  };

  // Save one blood group
  const handleSaveSingleGroup = async (bg) => {
    const data = stockMap[bg] || emptyStock;

    const validationError = validateStock(data, bg);

    if (validationError) {
      showToast(validationError, 'error');
      return;
    }

    setSavingGroup(bg);

    try {
      await inventoryAPI.updateItem({
        bloodGroup: bg,
        availableUnits: data.availableUnits,
        reservedUnits: data.reservedUnits,
        expiredUnits: data.expiredUnits,
        notes: data.notes || `Updated ${bg} stock count`
      });

      showToast(
        `${bg} blood stock successfully verified and saved!`,
        'success'
      );

      await loadInventory();
    } catch (err) {
      console.error(
        'Single inventory update error:',
        err.response?.data || err
      );

      showToast(
        getErrorMessage(err, `Failed to update ${bg}.`),
        'error'
      );
    } finally {
      setSavingGroup(null);
    }
  };

  // Save all eight blood groups
  const handleBatchSaveAll = async () => {
    const items = BLOOD_GROUPS.map((bg) => ({
      bloodGroup: bg,
      availableUnits: stockMap[bg]?.availableUnits ?? 0,
      reservedUnits: stockMap[bg]?.reservedUnits ?? 0,
      expiredUnits: stockMap[bg]?.expiredUnits ?? 0
    }));

    // Validate every group before sending the transaction
    for (const bg of BLOOD_GROUPS) {
      const validationError = validateStock(stockMap[bg], bg);

      if (validationError) {
        showToast(validationError, 'error');
        return;
      }
    }

    setBatchSaving(true);

    try {
      await inventoryAPI.batchUpdate({
        items,
        notes: 'Routine comprehensive hospital stock verification'
      });

      showToast(
        'All 8 blood groups successfully saved and verified!',
        'success'
      );

      await loadInventory();
    } catch (err) {
      console.error(
        'Inventory batch update error:',
        err.response?.data || err
      );

      showToast(
        getErrorMessage(err, 'Batch update failed. Please try again.'),
        'error'
      );
    } finally {
      setBatchSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  const totalAvailable = inventory.reduce(
    (sum, item) => sum + (Number(item.available_units) || 0),
    0
  );

  const totalReserved = inventory.reduce(
    (sum, item) => sum + (Number(item.reserved_units) || 0),
    0
  );

  const totalExpired = inventory.reduce(
    (sum, item) => sum + (Number(item.expired_units) || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
            <Droplet className="w-4 h-4 text-[#D7263D] fill-[#D7263D]" />
            Hospital Blood Bank Management
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#102A43]">
            Blood Stock Inventory
          </h1>

          <p className="text-sm text-slate-600 max-w-xl mt-2">
            Update, reserve, or mark expired blood units for all 8 major blood
            groups. Saving changes updates public availability and resets
            reminder schedules.
          </p>

          <p className="text-xs text-slate-500 mt-2">
            Hospital: {user?.hospitalName || user?.hospital_name || user?.name || 'Hospital Account'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadInventory}
            disabled={loading}
            className="p-3 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 transition disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleBatchSaveAll}
            disabled={batchSaving || savingGroup !== null}
            className="btn-teal inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-sm font-bold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {batchSaving ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-white" />
                Save & Verify All Groups
              </>
            )}
          </button>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Droplet className="w-4 h-4 text-rose-600" />
            Total Available
          </div>
          <div className="text-3xl font-black text-[#102A43] mt-2">
            {totalAvailable}
          </div>
          <p className="text-xs text-slate-500 mt-1">Blood units</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="w-4 h-4 text-amber-600" />
            Total Reserved
          </div>
          <div className="text-3xl font-black text-[#102A43] mt-2">
            {totalReserved}
          </div>
          <p className="text-xs text-slate-500 mt-1">Reserved units</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Expired / Discarded
          </div>
          <div className="text-3xl font-black text-[#102A43] mt-2">
            {totalExpired}
          </div>
          <p className="text-xs text-slate-500 mt-1">Expired units</p>
        </div>
      </div>

      {/* Reminder Information */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-teal-700 mt-0.5" />
          <div>
            <h3 className="font-bold text-[#102A43]">
              Inventory Update Reminder
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Update frequency:{' '}
              <strong>
                {reminder?.reminder_frequency_hours ?? 24} hours
              </strong>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Last inventory update:{' '}
              {formatDate(reminder?.last_inventory_update_at)}
            </p>
          </div>
        </div>

        <div>
          {reminder?.reminder_status === 'UP_TO_DATE' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Up to date
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              Reminder status: {reminder?.reminder_status || 'Not available'}
            </span>
          )}
        </div>
      </div>

      {/* Blood Group Inventory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {BLOOD_GROUPS.map((bg) => {
          const item = inventory.find(
            (i) => (i.blood_group || i.bloodGroup) === bg
          );

          const current = stockMap[bg] || emptyStock;
          const isSaving = savingGroup === bg;

          const status =
            current.availableUnits === 0
              ? 'Out of Stock'
              : current.availableUnits <= 4
                ? 'Low Stock'
                : 'In Stock';

          return (
            <div
              key={bg}
              className={`p-5 sm:p-6 rounded-3xl glass-panel border overflow-hidden transition-all duration-200 flex flex-col justify-between ${
                current.availableUnits === 0
                  ? 'border-rose-200 bg-rose-50/40'
                  : current.availableUnits <= 4
                    ? 'border-amber-200 bg-amber-50/40'
                    : 'border-slate-200'
              }`}
            >
              <div>
                {/* Blood Group and Availability */}
                <div className="flex items-center justify-between mb-4">
                  <BloodGroupBadge group={bg} size="lg" />

                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      current.availableUnits === 0
                        ? 'bg-rose-100 text-rose-800'
                        : current.availableUnits <= 4
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {status}
                  </span>
                </div>

                {/* Available Units */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Available Units
                    </label>

                    <button
                      type="button"
                      onClick={() => handleQuickAdjust(bg, 5)}
                      className="px-2.5 py-0.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[11px] transition border border-teal-200 cursor-pointer"
                      title="Quick Add 5 Units"
                    >
                      +5 Quick Add
                    </button>
                  </div>

                  <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => handleQuickAdjust(bg, -1)}
                      className="w-11 h-11 bg-slate-50 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 transition"
                      title="Decrease 1 Unit"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={current.availableUnits}
                      onChange={(e) =>
                        handleStockChange(bg, 'availableUnits', e.target.value)
                      }
                      className="w-full min-w-0 flex-1 text-center py-2 text-xl font-black text-[#102A43] border-none outline-none bg-transparent"
                    />

                    <button
                      type="button"
                      onClick={() => handleQuickAdjust(bg, 1)}
                      className="w-11 h-11 bg-slate-50 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 transition"
                      title="Increase 1 Unit"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Reserved and Expired Units */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Reserved
                    </label>

                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={current.reservedUnits}
                      onChange={(e) =>
                        handleStockChange(bg, 'reservedUnits', e.target.value)
                      }
                      className="w-full min-w-0 py-1.5 px-2 text-sm font-bold text-slate-700 rounded-lg text-center border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Expired / Discarded
                    </label>

                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={current.expiredUnits}
                      onChange={(e) =>
                        handleStockChange(bg, 'expiredUnits', e.target.value)
                      }
                      className="w-full min-w-0 py-1.5 px-2 text-sm font-bold text-rose-700 rounded-lg text-center border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                {/* Inventory Timestamp */}
                <div className="text-[11px] text-slate-500 mb-4 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                  <span className="truncate">
                    Last verified: {formatDate(item?.last_updated_at)}
                  </span>
                </div>

                {/* Verification Status */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {item?.verification_status || 'Not yet verified'}
                </div>
              </div>

              {/* Save Individual Group */}
              <button
                type="button"
                disabled={isSaving || batchSaving || savingGroup !== null}
                onClick={() => handleSaveSingleGroup(bg)}
                className="btn-primary w-full py-2.5 rounded-xl text-white text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-white" />
                    Save {bg} Stock
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Inventory Audit History */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200">
        <div className="flex items-center gap-2 mb-6">
          <History className="w-5 h-5 text-slate-500" />

          <h3 className="text-xl font-black text-[#102A43]">
            Inventory Audit Trail
          </h3>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Previous Units</th>
                  <th className="py-3 px-4">New Units</th>
                  <th className="py-3 px-4">Net Change</th>
                  <th className="py-3 px-4">Updated By</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {history.map((h) => {
                  const change =
                    (Number(h.new_units) || 0) -
                    (Number(h.previous_units) || 0);

                  return (
                    <tr
                      key={h.id}
                      className="hover:bg-slate-50/50 transition"
                    >
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(h.changed_at)}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        {h.blood_group || '—'}
                      </td>

                      <td className="py-3 px-4 uppercase text-[10px] font-semibold tracking-wider text-slate-600">
                        Stock Update
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {h.previous_units ?? 0}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        {h.new_units ?? 0}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`font-bold ${
                            change > 0
                              ? 'text-emerald-600'
                              : change < 0
                                ? 'text-rose-600'
                                : 'text-slate-500'
                          }`}
                        >
                          {change > 0 ? `+${change}` : change}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-700">
                        {h.changed_by || 'Hospital Staff'}
                      </td>

                      <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                        {h.change_reason || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-500">
            No stock adjustments recorded yet. Changes made above will be
            recorded here.
          </div>
        )}
      </div>

    </div>
  );
};

export default HospitalInventory;
