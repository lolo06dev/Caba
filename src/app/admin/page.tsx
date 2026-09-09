"use client";

import { useState } from "react";
import { addProduct } from "./actions";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);

    try {
      await addProduct(formData);
      setMessage("Product added successfully!");
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      setMessage("Error: " + (error.message || "Failed to add the product"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Product dashboard</h1>
      
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
          <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>Image URL:</label>
          <input 
            type="url" 
            name="image" 
            required 
            style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }} 
            placeholder="https://images.unsplash.com/photo-..."
          />
          <small style={{ color: "#666", display: "block", marginTop: "5px" }}>
            Paste a direct image link for the product here.
          </small>
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
