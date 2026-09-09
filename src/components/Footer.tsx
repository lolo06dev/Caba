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
              <li>
                <a
                  href="https://www.facebook.com/louis.him.9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-link"
                  aria-label="Caba Product on Facebook (opens in a new tab)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="#888"
                    aria-hidden="true"
                  >
                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                  </svg>
                  Facebook
                </a>
              </li>
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
