"use client";

import { useState } from "react";
import { addProduct, signOut } from "./actions";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);

    try {
      await addProduct(formData);
      setMessage("Product added successfully!");
      (event.target as HTMLFormElement).reset();
      setPreview(null);
    } catch (error: any) {
      setMessage("Error: " + (error.message || "Failed to add the product"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Product dashboard</h1>
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
          <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>Product image:</label>
          <input 
            type="file" 
            name="image" 
            accept="image/*"
            required 
            onChange={handleFileChange}
            style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }} 
          />
          <small style={{ color: "#666", display: "block", marginTop: "5px" }}>
            Upload an image from your computer (JPG or PNG, up to 5 MB).
          </small>
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Selected product preview"
              style={{ marginTop: "10px", maxWidth: "180px", borderRadius: "4px", border: "1px solid #eee" }}
            />
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
