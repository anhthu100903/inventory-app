// Helper local cho page Categories
export function buildCategoryMap(categoriesFromDB = [], products = []) {
  const map = {};

  (categoriesFromDB || []).forEach((cat) => {
    if (!cat || !cat.name) return;
    map[cat.name] = {
      id: cat.id || null,
      name: cat.name,
      description: cat.description || "",
      productCount: 0,
    };
  });

  (products || []).forEach((p) => {
    const key = p?.category?.trim() || "Không phân loại";
    if (!map[key]) {
      map[key] = { id: null, name: key, description: "", productCount: 0 };
    }
    map[key].productCount += 1;
  });

  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
}

export function validateCategoryName(name) {
  if (!name || typeof name !== "string" || !name.trim()) {
    return { ok: false, message: "Tên phân loại không được để trống" };
  }
  if (name.trim().length > 100) {
    return { ok: false, message: "Tên phân loại quá dài" };
  }
  return { ok: true };
}
