"use client";

import { useState, useTransition } from "react";
import { formatPrice } from "@/app/components/ProductData";
import type { InventoryProduct, EquipmentRow } from "@/app/actions/inventory";
import {
  updateProduct,
  addEquipmentStock,
  removeEquipmentStock,
} from "@/app/actions/inventory";

// ─── Inline Editable Cell ───
function EditableCell({
  value,
  onSave,
  type = "text",
}: {
  value: string;
  onSave: (v: string) => Promise<void>;
  type?: "text" | "number";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  if (!editing) {
    return (
      <span
        onClick={() => { setDraft(value); setEditing(true); }}
        className="cursor-pointer hover:bg-white/5 px-2 py-1 rounded-lg transition-colors inline-block min-w-[60px] border border-transparent hover:border-[var(--accent-blue)]/30"
        title="Click to edit"
      >
        {type === "number" ? `฿${formatPrice(Number(value))}` : value}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <input
        autoFocus
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={async (e) => {
          if (e.key === "Enter") { setSaving(true); await onSave(draft); setSaving(false); setEditing(false); }
          if (e.key === "Escape") setEditing(false);
        }}
        className="bg-white/5 border border-[var(--accent-blue)]/50 rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-[var(--accent-blue)] w-full max-w-[160px]"
        disabled={saving}
      />
      <button
        onClick={async () => { setSaving(true); await onSave(draft); setSaving(false); setEditing(false); }}
        disabled={saving}
        className="text-green-400 hover:text-green-300 text-sm font-bold px-1"
      >{saving ? "..." : "✓"}</button>
      <button onClick={() => setEditing(false)} className="text-red-400 hover:text-red-300 text-sm font-bold px-1">✕</button>
    </span>
  );
}

// ─── Specs Editor ───
function SpecsEditor({
  specs,
  onSave,
}: {
  specs: Record<string, string>;
  onSave: (s: Record<string, string>) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(specs);
  const [saving, setSaving] = useState(false);

  if (!editing) {
    return (
      <div
        onClick={() => { setDraft({ ...specs }); setEditing(true); }}
        className="cursor-pointer hover:bg-white/5 px-2 py-1 rounded-lg transition-colors border border-transparent hover:border-[var(--accent-blue)]/30 space-y-0.5"
        title="Click to edit specs"
      >
        {Object.entries(specs).map(([k, v]) => (
          <div key={k} className="text-xs">
            <span className="text-[var(--text-muted)]">{k}:</span>{" "}
            <span className="text-[var(--text-secondary)]">{v}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2 bg-white/5 rounded-lg border border-[var(--accent-blue)]/30">
      {Object.entries(draft).map(([k, v]) => (
        <div key={k} className="flex items-center gap-1">
          <span className="text-[10px] text-[var(--text-muted)] w-16 truncate">{k}</span>
          <input
            value={v}
            onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
            className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-xs text-white outline-none focus:border-[var(--accent-blue)] flex-1"
            disabled={saving}
          />
        </div>
      ))}
      <div className="flex gap-1 pt-1">
        <button
          onClick={async () => { setSaving(true); await onSave(draft); setSaving(false); setEditing(false); }}
          disabled={saving}
          className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 font-bold"
        >{saving ? "Saving..." : "✓ Save"}</button>
        <button onClick={() => setEditing(false)} className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 font-bold">✕</button>
      </div>
    </div>
  );
}

// ─── Popularity Bar ───
function PopularityBar({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? Math.min((score / max) * 100, 100) : 0;
  const color = pct > 66 ? "from-red-500 to-orange-400" : pct > 33 ? "from-yellow-400 to-orange-400" : "from-blue-400 to-cyan-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-[var(--text-secondary)]">{score}</span>
    </div>
  );
}

// ─── Status Badge ───
function StatusBadge({ status, count }: { status: string; count: number }) {
  if (count === 0) return null;
  const map: Record<string, { bg: string; text: string; icon: string }> = {
    AVAILABLE: { bg: "bg-green-500/15", text: "text-green-400", icon: "🟢" },
    RENTED: { bg: "bg-blue-500/15", text: "text-blue-400", icon: "🔵" },
    RESERVED: { bg: "bg-yellow-500/15", text: "text-yellow-400", icon: "🟡" },
    SOLD: { bg: "bg-red-500/15", text: "text-red-400", icon: "🔴" },
    MAINTENANCE: { bg: "bg-gray-500/15", text: "text-gray-400", icon: "⚙️" },
  };
  const s = map[status] || map.AVAILABLE;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full ${s.bg} ${s.text} font-bold`}>
      {s.icon} {count}
    </span>
  );
}

// ─── Add Stock Modal ───
function AddStockModal({
  product,
  onClose,
}: {
  product: InventoryProduct;
  onClose: () => void;
}) {
  const [serials, setSerials] = useState([""]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addField = () => setSerials([...serials, ""]);
  const updateField = (i: number, v: string) => {
    const next = [...serials];
    next[i] = v;
    setSerials(next);
  };
  const removeField = (i: number) => setSerials(serials.filter((_, idx) => idx !== i));

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await addEquipmentStock(product.id, serials);
      if (result.success) {
        setSuccess(true);
        setTimeout(onClose, 1200);
      } else {
        setError(result.error || "Failed to add stock.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0a0a0f] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-2xl max-w-md w-full mx-4 animate-in">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h3 className="font-bold text-white">📦 Add Stock — {product.name}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">✕</button>
        </div>
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {success ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-green-400 font-bold">Stock added successfully!</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-[var(--text-muted)]">Enter serial numbers for new equipment units. Each unit will be created with AVAILABLE status.</p>
              {serials.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={s}
                    onChange={(e) => updateField(i, e.target.value)}
                    placeholder={`Serial Number #${i + 1}`}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent-cyan)] placeholder:text-[var(--text-muted)] transition-colors"
                    disabled={isPending}
                  />
                  {serials.length > 1 && (
                    <button onClick={() => removeField(i)} className="text-red-400 hover:text-red-300 text-sm px-1">✕</button>
                  )}
                </div>
              ))}
              <button onClick={addField} disabled={isPending} className="text-xs text-[var(--accent-cyan)] hover:text-white transition-colors font-bold">+ Add another serial number</button>
              {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</div>}
            </>
          )}
        </div>
        {!success && (
          <div className="p-4 border-t border-white/5 flex gap-2 justify-end">
            <button onClick={onClose} disabled={isPending} className="px-4 py-2 rounded-xl text-sm font-bold text-[var(--text-secondary)] hover:text-white bg-white/5 hover:bg-white/10 transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={isPending} className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] hover:opacity-90 transition-opacity disabled:opacity-50">
              {isPending ? "Adding..." : `Add ${serials.filter(Boolean).length} Unit(s)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Remove Stock Modal ───
function RemoveStockModal({
  product,
  onClose,
}: {
  product: InventoryProduct;
  onClose: () => void;
}) {
  const available = product.equipment.filter((e) => e.status === "AVAILABLE");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === available.length) setSelected(new Set());
    else setSelected(new Set(available.map((e) => e.id)));
  };

  const handleRemove = () => {
    if (!confirm) { setConfirm(true); return; }
    setError(null);
    startTransition(async () => {
      const result = await removeEquipmentStock([...selected]);
      if (result.success) {
        setSuccess(true);
        setTimeout(onClose, 1200);
      } else {
        setError(result.error || "Failed to remove stock.");
        setConfirm(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0a0a0f] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-2xl max-w-md w-full mx-4 animate-in">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h3 className="font-bold text-white">🗑️ Remove Stock — {product.name}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">✕</button>
        </div>
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {success ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-green-400 font-bold">Stock removed successfully!</p>
            </div>
          ) : available.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-[var(--text-secondary)]">No AVAILABLE equipment to remove.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-[var(--text-muted)]">Select AVAILABLE equipment to remove. Only units not currently rented, reserved, or sold can be removed.</p>
              <div className="flex items-center gap-2 pb-1 border-b border-white/5">
                <input type="checkbox" checked={selected.size === available.length && available.length > 0} onChange={toggleAll} className="accent-[var(--accent-cyan)]" />
                <span className="text-xs text-[var(--text-muted)] font-bold">Select All ({available.length})</span>
              </div>
              {available.map((eq) => (
                <label key={eq.id} className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${selected.has(eq.id) ? "bg-red-500/10 border border-red-500/20" : "hover:bg-white/5 border border-transparent"}`}>
                  <input type="checkbox" checked={selected.has(eq.id)} onChange={() => toggle(eq.id)} className="accent-red-400" />
                  <div>
                    <div className="text-sm font-mono text-white">{eq.serialNumber}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">Added: {new Date(eq.createdAt).toLocaleDateString("th-TH")}</div>
                  </div>
                </label>
              ))}
              {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</div>}
            </>
          )}
        </div>
        {!success && available.length > 0 && (
          <div className="p-4 border-t border-white/5 flex gap-2 justify-end">
            <button onClick={onClose} disabled={isPending} className="px-4 py-2 rounded-xl text-sm font-bold text-[var(--text-secondary)] hover:text-white bg-white/5 hover:bg-white/10 transition-colors">Cancel</button>
            <button onClick={handleRemove} disabled={isPending || selected.size === 0} className={`px-4 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-30 ${confirm ? "bg-red-600 hover:bg-red-500 animate-pulse" : "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"}`}>
              {isPending ? "Removing..." : confirm ? `⚠️ Confirm Remove ${selected.size}` : `Remove ${selected.size} Selected`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Equipment Detail Row ───
function EquipmentDetail({ equipment }: { equipment: EquipmentRow[] }) {
  const [open, setOpen] = useState(false);
  if (!equipment.length) return <span className="text-xs text-[var(--text-muted)]">No units</span>;
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="text-[10px] text-[var(--accent-cyan)] hover:text-white transition-colors font-bold">{open ? "▼ Hide" : "▶ Show"} {equipment.length} units</button>
      {open && (
        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
          {equipment.map((eq) => (
            <div key={eq.id} className="flex items-center gap-2 text-[10px] bg-white/3 rounded-lg px-2 py-1">
              <span className="font-mono text-white">{eq.serialNumber}</span>
              <StatusBadge status={eq.status} count={1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// Main Component
// ═══════════════════════════════════════

interface Props {
  products: InventoryProduct[];
}

export default function InventoryClient({ products }: Props) {
  const [search, setSearch] = useState("");
  const [addModal, setAddModal] = useState<InventoryProduct | null>(null);
  const [removeModal, setRemoveModal] = useState<InventoryProduct | null>(null);

  const maxPop = Math.max(...products.map((p) => p.popularityScore), 1);

  const filtered = products.filter((p) =>
    !search.trim() ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    Object.values(p.specs).some((v) => v.toLowerCase().includes(search.toLowerCase()))
  );

  const totalEquipment = products.reduce((s, p) => s + p.totalEquipment, 0);
  const totalAvailable = products.reduce((s, p) => s + p.availableEquipment, 0);

  const handleUpdateName = async (id: string, name: string) => { await updateProduct(id, { name }); };
  const handleUpdatePrice = async (id: string, price: string) => { await updateProduct(id, { monthlyPrice: Number(price) }); };
  const handleUpdateSpecs = async (id: string, specs: Record<string, string>) => { await updateProduct(id, { specs }); };

  return (
    <>
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-gradient">{products.length}</div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Products</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-gradient-cyan">{totalEquipment}</div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Total Units</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-black bg-gradient-to-r from-[var(--accent-green)] to-[var(--accent-cyan)] bg-clip-text text-transparent">{totalAvailable}</div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Available</div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="glass rounded-xl p-1 flex items-center">
          <span className="px-3 text-[var(--text-muted)]">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or specs..."
            className="flex-1 bg-transparent outline-none text-sm text-white py-2 pr-3 placeholder:text-[var(--text-muted)]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden neon-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[var(--text-muted)] text-xs uppercase tracking-wider">
                <th className="text-left p-4 font-bold">Product</th>
                <th className="text-left p-4 font-bold hidden md:table-cell">Specs</th>
                <th className="text-left p-4 font-bold">Price/mo</th>
                <th className="text-center p-4 font-bold">Stock</th>
                <th className="text-center p-4 font-bold hidden sm:table-cell">Popularity</th>
                <th className="text-center p-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[var(--text-muted)]">
                    <div className="text-4xl mb-2">📭</div>
                    No products found.
                  </td>
                </tr>
              ) : (
                filtered.map((product, idx) => (
                  <tr
                    key={product.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Name */}
                    <td className="p-4">
                      <EditableCell value={product.name} onSave={(v) => handleUpdateName(product.id, v)} />
                      <div className="mt-1">
                        <EquipmentDetail equipment={product.equipment} />
                      </div>
                    </td>

                    {/* Specs */}
                    <td className="p-4 hidden md:table-cell">
                      <SpecsEditor specs={product.specs} onSave={(s) => handleUpdateSpecs(product.id, s)} />
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[var(--text-muted)] w-12">Rent:</span>
                          <EditableCell value={String(product.monthlyPrice)} onSave={(v) => handleUpdatePrice(product.id, v)} type="number" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[var(--text-muted)] w-12">Buy:</span>
                          <EditableCell value={String(product.buyPrice)} onSave={(v) => handleUpdateBuyPrice(product.id, v)} type="number" />
                        </div>
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="p-4 text-center">
                      <div className="font-black text-white">{product.availableEquipment}<span className="text-[var(--text-muted)] font-normal">/{product.totalEquipment}</span></div>
                      <div className="flex flex-wrap justify-center gap-1 mt-1">
                        {Object.entries(product.statusBreakdown).map(([s, c]) => (
                          <StatusBadge key={s} status={s} count={c as number} />
                        ))}
                      </div>
                    </td>

                    {/* Popularity */}
                    <td className="p-4 hidden sm:table-cell">
                      <div className="flex flex-col items-center gap-1">
                        <PopularityBar score={product.popularityScore} max={maxPop} />
                        <div className="text-[10px] text-[var(--text-muted)]">
                          {product.rentalCount}R · {product.purchaseCount}P
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex flex-col items-center gap-1.5">
                        <button
                          onClick={() => setAddModal(product)}
                          className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 transition-colors text-xs font-bold w-full max-w-[120px]"
                        >📦 Add Stock</button>
                        <button
                          onClick={() => setRemoveModal(product)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors text-xs font-bold w-full max-w-[120px]"
                        >🗑️ Remove</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {addModal && <AddStockModal product={addModal} onClose={() => setAddModal(null)} />}
      {removeModal && <RemoveStockModal product={removeModal} onClose={() => setRemoveModal(null)} />}
    </>
  );
}
