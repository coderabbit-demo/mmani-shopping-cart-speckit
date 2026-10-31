"use client";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { categories, products, type Category } from "../lib/catalog";
import { defaultFilters, filterProducts, sortOptions, type BrowseFilters } from "../lib/browse";
import { ProductCard } from "./product-card";

export function Shop() {
  const [filters, setFilters] = useState<BrowseFilters>(defaultFilters);
  const filtered = filterProducts(products, filters);
  function update(change: Partial<BrowseFilters>) { setFilters((previous) => ({ ...previous, ...change })); }
  return <>
    <section className="hero wrap"><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot" /> OBJECTS FOR BETTER DAYS</p><h1>DeskDrop</h1><p className="hero-title">A little joy for<br /><em>your everyday.</em></p><p className="hero-description">Thoughtful objects for the spaces where good ideas happen. Make yourself at home.</p><a className="hero-link" href="#collection">Explore the collection <span aria-hidden="true">↘</span></a></div><div className="hero-graphic" aria-hidden="true"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-disc"><span>GOOD<br />DESK<br />ENERGY<span>.</span></span></div><span className="hero-star">✳</span><span className="hero-caption">A LITTLE MORE YOU / 001</span></div></section>
    <section className="collection wrap" id="collection"><div className="section-heading"><div><p className="eyebrow">THE DESKDROP EDIT <span> / 001</span></p><h2>Find your thing<span>.</span></h2></div><p>Everyday essentials, a little less ordinary.</p></div>
      <div className="filter-bar"><label className="search-field"><Search size={18} aria-hidden="true" /><span className="sr-only">Search products</span><input type="search" placeholder="Search objects..." value={filters.query} onChange={(event) => update({ query: event.target.value })} /></label>
        <label className="select-field"><span>Category</span><select value={filters.category} onChange={(event) => update({ category: event.target.value as Category })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
        <label className="select-field"><span>Sort by</span><select value={filters.sort} onChange={(event) => update({ sort: event.target.value as BrowseFilters["sort"] })}>{sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label className="stock-filter"><input type="checkbox" checked={filters.inStockOnly} onChange={(event) => update({ inStockOnly: event.target.checked })} /><span>In stock only</span></label>
      </div><div className="results-line"><p role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? "product" : "products"}</p><span><SlidersHorizontal size={14} aria-hidden="true" /> CURATED FOR YOU</span></div>
      {filtered.length ? <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><p>No products match your filters.</p>{filters.query && <p className="empty-query">{filters.query}</p>}<button type="button" className="primary-button" onClick={() => setFilters(defaultFilters)}>Clear filters</button></div>}
    </section>
  </>;
}
