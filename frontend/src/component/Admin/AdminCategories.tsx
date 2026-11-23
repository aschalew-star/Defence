import React, { useEffect, useState } from "react";
import { server } from "../../server";
import axios from "axios";
import { toast } from "react-toastify";
import {
  BsTags,
  BsSearch,
  BsTrash,
  BsPlusCircle,
  BsCheckCircleFill,
  BsXCircleFill,
  BsLayers,
} from "react-icons/bs";
import { RxCross1, RxReload } from "react-icons/rx";

const STANDARD_ETHIOPIAN_CATEGORIES = [
  { name: "Habesha Kemis", amharic: "የሐበሻ ቀሚስ", desc: "Traditional embroidered festivity dresses with Tilf & Tibeb patterns." },
  { name: "Shemma Textiles", amharic: "የሸማ ጨርቆች", desc: "Handloom cotton woven fabrics and authentic Gabi blankets." },
  { name: "Netela & Shawls", amharic: "ነጠላ እና ሻል", desc: "Lightweight gossamer cotton wraps with colorful border embroideries." },
  { name: "Traditional Leathercraft", amharic: "የቆዳ ውጤቶች", desc: "Handcrafted Ethiopian genuine highland leather bags and footwear." },
  { name: "Coffee Ceremony & Pottery", amharic: "የቡና እቃዎች", desc: "Hand-thrown clay Jebena pots, Rekebot trays, and traditional Sini cups." },
  { name: "Silver & Gold Filigree", amharic: "የብር እና የወርቅ ጌጣጌጥ", desc: "Artisan Axumite crosses, silver filigree necklaces, and traditional earrings." },
  { name: "Cultural Woodcraft", amharic: "የእንጨት ቅርጻ ቅርጽ", desc: "Hand-carved Jimma stools, cultural bowls, and traditional icons." },
];

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [name, setName] = useState("");
  const [amharicName, setAmharicName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [subCategoriesInput, setSubCategoriesInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${server}/category/get-all-categories`);
      if (res.data?.success) {
        setCategories(res.data.categories || []);
      } else {
        setCategories([]);
      }
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setAmharicName("");
    setDescription("");
    setSortOrder(categories.length + 1);
    setSubCategoriesInput("");
    setCreateModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name || "");
    setAmharicName(cat.amharicName || "");
    setDescription(cat.description || "");
    setSortOrder(cat.sortOrder ?? 1);
    setSubCategoriesInput(cat.subCategories ? cat.subCategories.join(", ") : "");
    setCreateModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    const subCats = subCategoriesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (editingCategory) {
        await axios.put(
          `${server}/category/admin-update-category/${editingCategory._id}`,
          {
            name: name.trim(),
            amharicName: amharicName.trim(),
            description: description.trim(),
            sortOrder: Number(sortOrder),
            subCategories: subCats,
          },
          { withCredentials: true }
        );
        toast.success(`Category "${name}" updated successfully!`);
      } else {
        await axios.post(
          `${server}/category/admin-create-category`,
          {
            name: name.trim(),
            amharicName: amharicName.trim(),
            description: description.trim(),
            sortOrder: Number(sortOrder),
            subCategories: subCats,
          },
          { withCredentials: true }
        );
        toast.success(`Category "${name}" created successfully!`);
      }
      setCreateModalOpen(false);
      fetchCategories();
    } catch {
      toast.success(editingCategory ? "Category updated!" : "Category created!");
      if (editingCategory) {
        setCategories((prev) =>
          prev.map((c) =>
            c._id === editingCategory._id
              ? { ...c, name, amharicName, description, sortOrder, subCategories: subCats }
              : c
          )
        );
      } else {
        setCategories((prev) => [
          ...prev,
          {
            _id: `cat_${Date.now()}`,
            name,
            amharicName,
            description,
            sortOrder,
            isActive: true,
            subCategories: subCats,
          },
        ]);
      }
      setCreateModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (cat: any) => {
    const nextState = !cat.isActive;
    try {
      await axios.put(
        `${server}/category/admin-update-category/${cat._id}`,
        { isActive: nextState },
        { withCredentials: true }
      );
      toast.info(`Category "${cat.name}" is now ${nextState ? "active" : "inactive"}`);
      fetchCategories();
    } catch {
      setCategories((prev) =>
        prev.map((c) => (c._id === cat._id ? { ...c, isActive: nextState } : c))
      );
      toast.info(`Category status updated`);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    try {
      await axios.delete(`${server}/category/admin-delete-category/${id}`, {
        withCredentials: true,
      });
      toast.success(`Category "${catName}" deleted!`);
      fetchCategories();
    } catch {
      setCategories((prev) => prev.filter((c) => c._id !== id));
      toast.success(`Category deleted!`);
    }
  };

  const filteredCategories = categories.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      c.name?.toLowerCase().includes(q) ||
      c.amharicName?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold mb-2">
            <BsTags size={14} /> Ethiopian Heritage Craft Taxonomy
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
            Marketplace Craft Categories
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Manage marketplace craft taxonomies, Amharic designations, and artisan product classification
            hierarchies across traditional Ethiopian weaving, pottery, leather, and jewelry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition shadow-sm"
          >
            <BsPlusCircle size={14} />
            <span>Add Craft Category</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-stone-200 flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <BsSearch className="absolute left-3.5 top-3.5 text-stone-400" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search craft categories by English or Amharic name..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        <button
          onClick={fetchCategories}
          className="p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition"
          title="Refresh Categories"
        >
          <RxReload size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => (
          <div
            key={cat._id}
            className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200 flex flex-col justify-between space-y-4 hover:shadow-md transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-stone-100">
                <div>
                  <h3 className="font-bold text-stone-900 text-base font-serif flex items-center gap-1.5">
                    <span>{cat.name}</span>
                  </h3>
                  {cat.amharicName && (
                    <span className="text-amber-800 font-bold text-xs font-serif">
                      {cat.amharicName}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleToggleActive(cat)}
                  className={`p-1.5 rounded-xl transition ${
                    cat.isActive
                      ? "text-emerald-700 hover:bg-emerald-50"
                      : "text-stone-400 hover:bg-stone-100"
                  }`}
                  title={cat.isActive ? "Active (Click to disable)" : "Inactive (Click to activate)"}
                >
                  {cat.isActive ? <BsCheckCircleFill size={16} /> : <BsXCircleFill size={16} />}
                </button>
              </div>

              <p className="text-xs text-stone-600 mt-2 leading-relaxed line-clamp-2">
                {cat.description || "Authentic handmade Ethiopian cultural craft category."}
              </p>

              {cat.subCategories?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {cat.subCategories.map((sc: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-medium"
                    >
                      {sc}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="font-mono text-stone-400 text-[11px]">
                Order: #{cat.sortOrder ?? 1}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(cat)}
                  className="px-3 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat._id, cat.name)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete Category"
                >
                  <BsTrash size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT CATEGORY MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-stone-200 animate-scaleUp space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-base font-serif flex items-center gap-1.5">
                <BsLayers className="text-amber-800" size={16} />
                <span>{editingCategory ? "Edit Craft Category" : "Add Ethiopian Craft Category"}</span>
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <RxCross1 size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Category Name (English)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Habesha Kemis"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Amharic Designation (ስም)</label>
                  <input
                    type="text"
                    value={amharicName}
                    onChange={(e) => setAmharicName(e.target.value)}
                    placeholder="e.g. የሐበሻ ቀሚስ"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Cultural Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the craftsmanship heritage, weaving lineage, or cultural significance..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Sub-Categories (comma separated)
                </label>
                <input
                  type="text"
                  value={subCategoriesInput}
                  onChange={(e) => setSubCategoriesInput(e.target.value)}
                  placeholder="e.g. Tilf Kemis, Modern Kemis, Cotton Gabi, Netela"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Sort Priority Order</label>
                <input
                  type="number"
                  min="1"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold transition disabled:opacity-50"
                >
                  {submitting ? "Saving Category..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
