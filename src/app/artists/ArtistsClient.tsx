"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Select from "@/components/ui/Select";
import ArtistCard from "@/components/cards/ArtistCard";
import { ARTISTS, LABELS } from "@/lib/data";

const PAGE_SIZE = 8;

export default function ArtistsClient() {
  const searchParams = useSearchParams();
  const initialLabel = searchParams.get("label") ?? "all";

  // Derived-state-during-render pattern (no effect needed): whenever the URL's
  // ?label= changes, reset the local override so the filter reflects the link
  // that was clicked, while still letting the user pick a different label after.
  const [prevInitialLabel, setPrevInitialLabel] = useState(initialLabel);
  const [labelOverride, setLabelOverride] = useState<string | null>(null);
  if (initialLabel !== prevInitialLabel) {
    setPrevInitialLabel(initialLabel);
    setLabelOverride(null);
  }
  const label = labelOverride ?? initialLabel;

  const [genre, setGenre] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  function updateFilter(kind: "label" | "genre" | "status" | "sort", value: string) {
    setPage(1);
    if (kind === "label") setLabelOverride(value);
    if (kind === "genre") setGenre(value);
    if (kind === "status") setStatus(value);
    if (kind === "sort") setSort(value);
  }

  const genres = useMemo(() => Array.from(new Set(ARTISTS.map((a) => a.genre))), []);

  const filtered = useMemo(() => {
    let list = ARTISTS.filter((a) => (label === "all" ? true : a.label === label));
    if (genre !== "all") list = list.filter((a) => a.genre === genre);
    if (status !== "all") list = list.filter((a) => a.status === status);
    if (sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "newest") list = [...list].sort((a, b) => (a.status === "new" ? -1 : 1) - (b.status === "new" ? -1 : 1));
    return list;
  }, [label, genre, status, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <section id="roster" className="mx-auto max-w-[1400px] px-6 pb-16 pt-8 lg:px-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Select
            label="Label"
            value={label}
            onChange={(v) => updateFilter("label", v)}
            options={[{ label: "All Labels", value: "all" }, ...LABELS.map((l) => ({ label: l.name, value: l.slug }))]}
          />
          <Select
            label="Genre"
            value={genre}
            onChange={(v) => updateFilter("genre", v)}
            options={[{ label: "All Genres", value: "all" }, ...genres.map((g) => ({ label: g, value: g }))]}
          />
          <Select
            label="Status"
            value={status}
            onChange={(v) => updateFilter("status", v)}
            options={[
              { label: "All Status", value: "all" },
              { label: "Active", value: "active" },
              { label: "New", value: "new" },
            ]}
          />
          <Select
            label="Sort by"
            value={sort}
            onChange={(v) => updateFilter("sort", v)}
            options={[
              { label: "Newest First", value: "newest" },
              { label: "A–Z", value: "az" },
            ]}
          />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.08em] text-muted-onlight">
          Showing {visible.length} of {filtered.length} artists
        </p>

        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((artist, i) => (
            <motion.div
              key={artist.id}
              id={artist.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: (i % PAGE_SIZE) * 0.04 }}
            >
              <ArtistCard artist={artist} light />
            </motion.div>
          ))}
        </div>

        {visible.length === 0 && (
          <p className="mt-10 border border-dashed border-black/15 py-16 text-center text-sm text-muted-onlight">
            No artists match those filters yet. Try clearing a filter above.
          </p>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={
                  page === i + 1
                    ? "flex size-9 items-center justify-center bg-ink text-sm font-semibold text-paper"
                    : "flex size-9 items-center justify-center border border-black/15 text-sm font-semibold text-ink hover:border-ink"
                }
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
