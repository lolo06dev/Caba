"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { addProduct, signOut } from "./actions";

type Category = {
  id: number;
  name: string;
  slug: string;
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [previews, setPreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesError, setCategoriesError] = useState("");

  // Load the store categories (Clothes / Shoes / Electronics)
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => setCategoriesError("Failed to load categories, please refresh the page."));
  }, []);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);

    try {
      const result = await addProduct(formData);
      if (result.success) {
        setMessage("Product added successfully!");
        (event.target as HTMLFormElement).reset();
        setPreviews([]);
      } else {
        setMessage("Error: " + result.error);
      }
    } catch (error: any) {
      setMessage("Error: " + (error?.message || "Failed to add the product"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Product dashboard</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link
            href="/admin/products"
            style={{
              padding: "8px 14px",
              backgroundColor: "#000",
              color: "#fff",
              border: "1px solid #000",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Manage products
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              style={{
                padding: "8px 14px",
                backgroundColor: "#fff",
                color: "#000",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
      
      {message && (
        <div style={{ 
          padding: "10px", 
          marginBottom: "20px", 
          backgroundColor: message.includes("successfully") ? "#d4edda" : "#f8d7da",
          color: message.includes("successfully") ? "#155724" : "#721c24",
          borderRadius: "4px" 
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        
        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>Product name:</label>
          <input 
            type="text" 
            name="name" 
            required 
            style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }} 
            placeholder="e.g. Caba Product T-Shirt"
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>Price (in centimes):</label>
          <input 
            type="number" 
            name="price" 
            required 
            min="0"
            style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }} 
            placeholder="e.g. 450000"
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>Description:</label>
          <textarea
            name="description"
            required
            rows={4}
            style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
            placeholder="Detailed product description"
          ></textarea>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>Category:</label>
          <select
            name="categoryId"
            required
            defaultValue=""
            style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
          >
            <option value="" disabled>
              Choose a category...
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <small style={{ color: "#666", display: "block", marginTop: "5px" }}>
            The product will be displayed in the selected category page.
          </small>
          {categoriesError && (
            <small style={{ color: "#c0392b", display: "block", marginTop: "5px" }}>
              {categoriesError}
            </small>
          )}
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>Quantity (stock):</label>
          <input
            type="number"
            name="stock"
            required
            min="0"
            style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
            placeholder="e.g. 15"
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>Product images:</label>
          <input 
            type="file" 
            name="images" 
            accept="image/*"
            multiple
            required 
            onChange={handleFileChange}
            style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }} 
          />
          <small style={{ color: "#666", display: "block", marginTop: "5px" }}>
            Upload up to 8 images from your computer (JPG or PNG, up to 5 MB each). The first one is the main image.
          </small>
          {previews.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
              {previews.map((preview, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={preview}
                  src={preview}
                  alt={`Selected product preview ${index + 1}`}
                  style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "4px", border: index === 0 ? "2px solid #000" : "1px solid #eee" }}
                />
              ))}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: "12px", 
            backgroundColor: "#000", 
            color: "#fff", 
            border: "none", 
            borderRadius: "4px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer" 
          }}
        >
          {loading ? "Adding..." : "Add product"}
        </button>
      </form>
    </div>
  );
}
