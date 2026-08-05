import React from 'react';
import { Lock, Award, ShieldCheck, Wrench, Package, Truck, Phone, Mail, MapPin, ExternalLink, ChevronRight, FileText } from 'lucide-react';

export default function WebsiteHome({ onGoToPortal }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#e0e0e0',
      fontFamily: "'Montserrat', sans-serif",
      lineHeight: 1.6
    }}>
      {/* NAVBAR */}
      <nav style={{
        background: 'rgba(20, 20, 20, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #262626',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: '0.85rem 2rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src="https://i.ibb.co/zTkBqd11/hind-traders-01-logo.png"
              alt="Hind Traders Logo"
              style={{ height: '42px', width: 'auto' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>
                HIND TRADERS
              </div>
              <div style={{ fontSize: '0.7rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                Railway Contractor & MSME • Est. 2007
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <a href="#about" style={{ color: '#a0a0a0', fontSize: '0.88rem', fontWeight: 500 }}>About Us</a>
            <a href="#services" style={{ color: '#a0a0a0', fontSize: '0.88rem', fontWeight: 500 }}>Services</a>
            <a href="#products" style={{ color: '#a0a0a0', fontSize: '0.88rem', fontWeight: 500 }}>Catalog</a>
            <a href="#contact" style={{ color: '#a0a0a0', fontSize: '0.88rem', fontWeight: 500 }}>Contact</a>

            {/* Doc Generation Branch Link Button */}
            <button
              type="button"
              onClick={onGoToPortal}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                padding: '0.55rem 1.1rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
              }}
            >
              <Lock size={15} /> Doc Generation Branch
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{
        padding: '5rem 2rem 4rem 2rem',
        background: 'radial-gradient(ellipse at center top, #1e1b4b 0%, #0a0a0a 70%)',
        textAlign: 'center',
        borderBottom: '1px solid #1f1f1f'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1px solid #d4af37',
            color: '#ffd700',
            padding: '0.35rem 1rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '1.5rem'
          }}>
            <Award size={16} /> Approved Indian Railways Supplier & Vendor
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '3.2rem',
            fontWeight: 700,
            color: '#ffffff',
            margin: '0 0 1.25rem 0',
            lineHeight: 1.25
          }}>
            Precision Engineering & Material Supplies for Indian Railways
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: '#a0a0a0',
            maxWidth: '750px',
            margin: '0 auto 2.25rem auto',
            lineHeight: 1.7
          }}>
            Registered MSME Micro Enterprise and official vendor for Eastern Railway Locomotive Workshop, Jamalpur.
            Specializing in high-grade workshop components, rubber gaskets, heat shrink tubes, and infrastructure contracting.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="#products"
              style={{
                background: '#ffffff',
                color: '#000000',
                padding: '0.85rem 1.8rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.95rem'
              }}
            >
              View Material Catalog
            </a>

            <button
              type="button"
              onClick={onGoToPortal}
              style={{
                background: '#4f46e5',
                color: '#ffffff',
                padding: '0.85rem 1.8rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
              }}
            >
              <Lock size={18} /> Internal Doc Generation Portal
            </button>
          </div>
        </div>
      </section>

      {/* REGISTRATION CREDENTIALS */}
      <section style={{ padding: '3.5rem 2rem', background: '#111111', borderBottom: '1px solid #1f1f1f' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: '#161616', border: '1px solid #262626', borderRadius: '10px', padding: '1.5rem' }}>
            <ShieldCheck size={28} color="#d4af37" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#fff' }}>GSTIN Registered</h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#888' }}>
              GSTIN: <strong style={{ color: '#ddd' }}>10DFIPK1994B1ZS</strong><br />
              Fully tax-compliant vendor for Indian Railways tenders & POs.
            </p>
          </div>

          <div style={{ background: '#161616', border: '1px solid #262626', borderRadius: '10px', padding: '1.5rem' }}>
            <Award size={28} color="#60a5fa" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#fff' }}>MSME Micro Enterprise</h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#888' }}>
              Registered under MSME Ministry, Government of India. Dedicated micro-enterprise partner.
            </p>
          </div>

          <div style={{ background: '#161616', border: '1px solid #262626', borderRadius: '10px', padding: '1.5rem' }}>
            <Wrench size={28} color="#10b981" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#fff' }}>Railway Contractor</h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#888' }}>
              Est. 2007 by Shri Satish Kumar. Specialized in Eastern Railway Workshop material contracting.
            </p>
          </div>
        </div>
      </section>

      {/* MATERIAL CATALOG SHOWCASE */}
      <section id="products" style={{ padding: '4.5rem 2rem', background: '#0a0a0a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', margin: '0 0 0.5rem 0' }}>Core Material Supplies</h2>
            <p style={{ color: '#888', fontSize: '0.95rem' }}>Engineered materials and components supplied to Railway Workshops</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.5rem' }}>
            {[
              { title: 'Heat Shrink Tubes', desc: 'Transparent & Colored Inner Dia 3mm to 25mm for loco electrical wiring insulation.', tag: 'Electrical' },
              { title: 'Locomotive Gasket Seals', desc: 'High-temp rubber gaskets & oil-resistant seal rings for diesel engine assemblies.', tag: 'Mechanical' },
              { title: 'Stainless Steel Screws & Bolts', desc: 'Hex head M8 x 25mm, M10, M12 precision grade stainless steel fasteners.', tag: 'Hardware' },
              { title: 'Copper & Lock Washers', desc: 'Inner Dia 12mm, 16mm copper ring washers and tooth lock washers.', tag: 'Hardware' },
              { title: 'Insulation Sleeving', desc: 'Fiberglass & PVC insulating sleeves for workshop panel assemblies.', tag: 'Electrical' },
              { title: 'Cotton Cotter Lock Pins', desc: 'Grade B steel cotter pins and retaining clips for bogie assemblies.', tag: 'Bogie Components' }
            ].map((p, idx) => (
              <div key={idx} style={{ background: '#141414', border: '1px solid #222222', borderRadius: '10px', padding: '1.5rem' }}>
                <span style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                  {p.tag}
                </span>
                <h3 style={{ margin: '0.8rem 0 0.4rem 0', fontSize: '1.15rem', color: '#fff' }}>{p.title}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#888', lineHeight: 1.5 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" style={{ background: '#050505', borderTop: '1px solid #1a1a1a', padding: '3.5rem 2rem 2rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', margin: '0 0 0.75rem 0', color: '#fff' }}>HIND TRADERS</h3>
            <p style={{ fontSize: '0.85rem', color: '#777', lineHeight: 1.6 }}>
              Registered Railway Contractor & MSME Micro Enterprise.<br />
              Jamalpur, Munger, Bihar – 811214.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', margin: '0 0 0.75rem 0' }}>Contact Details</h4>
            <div style={{ fontSize: '0.85rem', color: '#aaa', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div><Phone size={14} color="#d4af37" /> +91 7903235877</div>
              <div><Mail size={14} color="#d4af37" /> contact@hindtraders.in / hindtraders19699@gmail.com</div>
              <div><MapPin size={14} color="#d4af37" /> 25, Chhoti Keshopur, Nakki Nagar, Jamalpur, Bihar</div>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', margin: '0 0 0.75rem 0' }}>Internal Portals</h4>
            <button
              type="button"
              onClick={onGoToPortal}
              style={{
                background: '#1e1b4b',
                border: '1px solid #6366f1',
                color: '#a5b4fc',
                padding: '0.65rem 1.1rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Lock size={15} /> Doc Generation Branch (Locked)
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', borderTop: '1px solid #141414', paddingTop: '1.5rem', fontSize: '0.78rem', color: '#555' }}>
          © {new Date().getFullYear()} Hind Traders. All Rights Reserved. • Registered Railway Contractor
        </div>
      </footer>
    </div>
  );
}
