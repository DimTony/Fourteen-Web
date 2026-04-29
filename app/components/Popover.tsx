import { useState } from "react";

export function FilterPopover({
  draftFilters,
  setDraftFilters,
  onApply,
}: any) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 border rounded-lg"
      >
        Filters
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white border shadow-lg p-4 rounded-lg z-50">
          <div className="grid grid-cols-2 gap-3">

            <input
              placeholder="Gender"
              value={draftFilters.gender || ""}
              onChange={(e) =>
                setDraftFilters({ ...draftFilters, gender: e.target.value })
              }
              className="border p-2 rounded"
            />

            <input
              placeholder="Country"
              value={draftFilters.country || ""}
              onChange={(e) =>
                setDraftFilters({ ...draftFilters, country: e.target.value })
              }
              className="border p-2 rounded"
            />

            <input
              type="number"
              placeholder="Min Age"
              value={draftFilters.minAge || ""}
              onChange={(e) =>
                setDraftFilters({
                  ...draftFilters,
                  minAge: Number(e.target.value),
                })
              }
              className="border p-2 rounded"
            />

            <input
              type="number"
              placeholder="Max Age"
              value={draftFilters.maxAge || ""}
              onChange={(e) =>
                setDraftFilters({
                  ...draftFilters,
                  maxAge: Number(e.target.value),
                })
              }
              className="border p-2 rounded"
            />

            <input
              placeholder="Sort By"
              value={draftFilters.sortBy || ""}
              onChange={(e) =>
                setDraftFilters({ ...draftFilters, sortBy: e.target.value })
              }
              className="border p-2 rounded"
            />

            <select
              value={draftFilters.order || "asc"}
              onChange={(e) =>
                setDraftFilters({
                  ...draftFilters,
                  order: e.target.value as any,
                })
              }
              className="border p-2 rounded"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>

          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1 border rounded"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                onApply(draftFilters);
                setOpen(false);
              }}
              className="px-3 py-1 bg-black text-white rounded"
            >
              Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
}