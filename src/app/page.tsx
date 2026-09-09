import Link from "next/link";
import { getProducts } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import HeroSlider from "@/components/HeroSlider";
import StorySlider from "@/components/StorySlider";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allProducts = await getProducts({ limit: 100 });

  // Split into collections
  const summer2026 = allProducts.filter((p) => p.brand === "SUMMER 2026");
  const drop2025 = allProducts.filter((p) => p.brand === "DROP 2025");
  const drop2024 = allProducts.filter((p) => p.brand === "DROP 2024");
  const olderProducts = [...drop2025, ...drop2024];

  return (
    <div style={{ background: "#fff" }}>
      {/* Hero Slider */}
      <HeroSlider />

      {/* Next Drop Banner */}
      <section className="next-drop">
        <div className="next-drop-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80"
            alt="Caba Product Back"
          />
        </div>
        <div className="next-drop-center">
          <div className="quote-mark">&ldquo;&rdquo;</div>
          <h2>
            STAY TUNED<br />
            NEXT DROP<br />
            IS COMING
          </h2>
          <div className="designer">BY TAYAB ROUTEL</div>
          <Link href="/products" className="order-btn">
            COMMANDÉ
          </Link>
        </div>
        <div className="next-drop-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=800&q=80"
            alt="Caba Product embroidery detail"
          />
        </div>
      </section>

      {/* Summer 2026 Collection */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
        <div className="collection-header">
          <div className="subtitle">SEE OUR COLLECTION</div>
          <h2>SUMMER 2026</h2>
        </div>
        <div className="products-grid">
          {summer2026.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Older Collections */}
      {olderProducts.length > 0 && (
        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px 40px" }}>
          <div className="collection-header">
            <div className="subtitle">PREVIOUS DROPS</div>
            <h2>ARCHIVE</h2>
          </div>
          <div className="products-grid">
            {olderProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Services Strip */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
        <div className="services-strip">
          <div className="service-item">
            <div className="service-icon">
              <div style={{
                width: "60px", height: "60px", borderRadius: "50%",
                background: "#FFF3E0", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "28px"
              }}>
                🚚
              </div>
            </div>
            <div className="service-info">
              <h4>Livraison 58 wilayas.</h4>
              <p>Livraison Disponible 58 wilayas avec la société de Livraison Yalidine</p>
            </div>
          </div>
          <div className="service-item">
            <div className="service-icon">
              <div style={{
                width: "60px", height: "60px", borderRadius: "50%",
                background: "#E8F5E9", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "28px"
              }}>
                💳
              </div>
            </div>
            <div className="service-info">
              <h4>Paiement A La Livraison & En Ligne</h4>
              <p>Payer A La Livraison ou en ligne</p>
            </div>
          </div>
          <div className="service-item">
            <div className="service-icon">
              <div style={{
                width: "60px", height: "60px", borderRadius: "50%",
                background: "#E3F2FD", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "28px"
              }}>
                🎧
              </div>
            </div>
            <div className="service-info">
              <h4>Support.</h4>
              <p>Support 24h/7j Pour n&apos;importe quelle Probleme (echange, retour)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="brand-story">
        <StorySlider />
        <div className="brand-story-text">
          <p>
            The CABA product is inspired by people choosing their own path rather than following trends. The store is designed for the purpose of obtaining original European products and for people who cannot travel, as it combines clean aesthetics with the culture of countries. This brand is for those who think that these original products are what they lack wherever they are.
          </p>
        </div>
      </section>
    </div>
  );
}
