import Link from "next/link";

const Footer = () => {
  return (
    <footer style={{ background: "#000", color: "#fff", marginTop: "0" }}>
      {/* Main footer */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px" }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Caba Product"
                style={{
                  height: "32px",
                  width: "auto",
                  objectFit: "contain",
                  filter: "brightness(0) invert(1)",
                }}
              />
            </div>
            <p style={{ fontSize: "0.8rem", color: "#888", lineHeight: 1.7 }}>
              Caba Product by Tayab Routel. For those who choose original things.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: "16px", fontSize: "0.9rem" }}>Quick Links</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <li><Link href="/" style={{ color: "#888", textDecoration: "none", fontSize: "0.8rem", transition: "color 0.2s" }}>Home</Link></li>
              <li><Link href="/products" style={{ color: "#888", textDecoration: "none", fontSize: "0.8rem" }}>All Products</Link></li>
              <li><Link href="/products?filter=new" style={{ color: "#888", textDecoration: "none", fontSize: "0.8rem" }}>New Arrivals</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: "16px", fontSize: "0.9rem" }}>Contact</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem", color: "#888" }}>
              <li>📍 Algeria</li>
              <li>📞 +213 559 28 59 08</li>
              <li>📧 Tayabroutel@gmail.com</li>

            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid #222", padding: "16px 20px", textAlign: "center", fontSize: "0.7rem", color: "#555" }}>
        © {new Date().getFullYear()} Caba Product by Tayab Routel. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
