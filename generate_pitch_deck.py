#!/usr/bin/env python3
"""
SharePlate Pitch Deck Generator
Generates a modern, executive 16:9 widescreen presentation matching the SharePlate dark obsidian & emerald design language.
"""

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck(output_path="SharePlate_Presentation.pptx"):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Theme Colors
    BG_DARK = RGBColor(11, 17, 16)         # Obsidian #0B1110
    CARD_BG = RGBColor(18, 26, 25)         # Charcoal Dark Card #121A19
    CARD_BORDER = RGBColor(28, 42, 40)     # Subtle Border #1C2A28
    EMERALD_ACCENT = RGBColor(16, 185, 129)# Primary Emerald #10B981
    MINT_LIGHT = RGBColor(52, 211, 153)    # Secondary Mint #34D399
    WHITE = RGBColor(245, 245, 247)        # Cream White #F5F5F7
    TEXT_MUTED = RGBColor(156, 163, 175)   # Subdued Gray #9CA3AF
    CITRUS = RGBColor(245, 158, 11)        # Warm Amber #F59E0B
    ROSE = RGBColor(239, 68, 68)           # Accent Rose #EF4444

    def add_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return bg

    def add_header(slide, tag_text, title_text, subtitle_text=None):
        # Category Tag
        tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(8), Inches(0.4))
        tf_tag = tag_box.text_frame
        tf_tag.word_wrap = True
        p_tag = tf_tag.paragraphs[0]
        p_tag.text = tag_text.upper()
        p_tag.font.size = Pt(11)
        p_tag.font.bold = True
        p_tag.font.color.rgb = EMERALD_ACCENT

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11), Inches(0.8))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(28)
        p_title.font.bold = True
        p_title.font.color.rgb = WHITE

        if subtitle_text:
            p_sub = tf_title.add_paragraph()
            p_sub.text = subtitle_text
            p_sub.font.size = Pt(13)
            p_sub.font.color.rgb = TEXT_MUTED

    def add_card(slide, left, top, width, height, title, items, badge=None, accent_color=EMERALD_ACCENT):
        # Card Background
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        card.line.width = Pt(1)

        # Card Title
        tb = slide.shapes.add_textbox(left + Inches(0.25), top + Inches(0.2), width - Inches(0.5), Inches(0.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = WHITE

        if badge:
            p_badge = tf.add_paragraph()
            p_badge.text = badge.upper()
            p_badge.font.size = Pt(9)
            p_badge.font.bold = True
            p_badge.font.color.rgb = accent_color

        # Content items
        tb_body = slide.shapes.add_textbox(left + Inches(0.25), top + Inches(0.8), width - Inches(0.5), height - Inches(0.9))
        tf_body = tb_body.text_frame
        tf_body.word_wrap = True
        
        for idx, item in enumerate(items):
            p_item = tf_body.paragraphs[0] if idx == 0 else tf_body.add_paragraph()
            p_item.text = f"•  {item}"
            p_item.font.size = Pt(12)
            p_item.font.color.rgb = TEXT_MUTED
            p_item.space_after = Pt(8)

    # ==========================================
    # SLIDE 1: TITLE SLIDE
    # ==========================================
    slide1 = prs.slides.add_slide(blank_layout)
    add_background(slide1)

    # Accent glow badge
    glow_box = slide1.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(6), Inches(0.4))
    tf1 = glow_box.text_frame
    p1 = tf1.paragraphs[0]
    p1.text = "FOOD RESCUE & SURPLUS REDISTRIBUTION PLATFORM"
    p1.font.size = Pt(11)
    p1.font.bold = True
    p1.font.color.rgb = EMERALD_ACCENT

    # Main Brand Name
    title_box = slide1.shapes.add_textbox(Inches(1.2), Inches(2.3), Inches(10), Inches(1.8))
    tf_main = title_box.text_frame
    p_main = tf_main.paragraphs[0]
    p_main.text = "SharePlate"
    p_main.font.size = Pt(54)
    p_main.font.bold = True
    p_main.font.color.rgb = WHITE

    p_tagline = tf_main.add_paragraph()
    p_tagline.text = "Good Food. Shared Future."
    p_tagline.font.size = Pt(24)
    p_tagline.font.color.rgb = MINT_LIGHT
    p_tagline.space_before = Pt(8)

    # Subtitle / description
    desc_box = slide1.shapes.add_textbox(Inches(1.2), Inches(4.3), Inches(9), Inches(1.2))
    tf_desc = desc_box.text_frame
    tf_desc.word_wrap = True
    p_desc = tf_desc.paragraphs[0]
    p_desc.text = "An intelligent, hyper-local donation platform connecting food businesses with verified relief charities in real time — powered by 3D digital-twin visualization, cryptographic handover passes, and zero-loss logistics."
    p_desc.font.size = Pt(14)
    p_desc.font.color.rgb = TEXT_MUTED

    # Meta card (Vercel Live URL & GitHub)
    meta_card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(5.8), Inches(10.9), Inches(0.9))
    meta_card.fill.solid()
    meta_card.fill.fore_color.rgb = CARD_BG
    meta_card.line.color.rgb = CARD_BORDER

    meta_tb = slide1.shapes.add_textbox(Inches(1.4), Inches(5.95), Inches(10.5), Inches(0.6))
    tf_meta = meta_tb.text_frame
    p_meta = tf_meta.paragraphs[0]
    p_meta.text = "🚀 Production Web: https://client-nine-ebon.vercel.app  |  💻 GitHub: github.com/nandu123-1/shareplate  |  🌱 100% Free Food Protocol"
    p_meta.font.size = Pt(12)
    p_meta.font.bold = True
    p_meta.font.color.rgb = WHITE

    # ==========================================
    # SLIDE 2: THE PROBLEM (THE GLOBAL PARADOX)
    # ==========================================
    slide2 = prs.slides.add_slide(blank_layout)
    add_background(slide2)
    add_header(slide2, "Market Disconnect & Global Paradox", "The Tragedy of Wasted Food vs. Food Insecurity", "1.3 billion tons discarded annually while local relief organizations face critical shortages.")

    add_card(slide2, Inches(0.8), Inches(2.0), Inches(3.6), Inches(4.8), 
             "Massive Commercial Waste", [
                 "33% to 40% of all prepared food globally is never eaten.",
                 "Restaurants, caterers, and bakeries discard perfectly edible surplus daily.",
                 "Short expiry windows make traditional food bank collection too slow.",
                 "Costly disposal fees and landfill greenhouse gas emissions."
             ], badge="1.3B Tons / Year", accent_color=ROSE)

    add_card(slide2, Inches(4.8), Inches(2.0), Inches(3.6), Inches(4.8), 
             "The Relief Bottleneck", [
                 "828 million people face severe food insecurity worldwide.",
                 "Local NGOs & shelters lack real-time visibility into immediate surplus.",
                 "Coordination happens via scattered group chats and sporadic calls.",
                 "Volunteers arrive too late or lack refrigeration details."
             ], badge="Severe Demand Gap", accent_color=CITRUS)

    add_card(slide2, Inches(8.8), Inches(2.0), Inches(3.6), Inches(4.8), 
             "Coordination Friction", [
                 "No standard verification mechanism to validate pickup recipients.",
                 "Food safety liability concerns without transparent audit trails.",
                 "Absence of quantifiable ESG & carbon offset reporting for donors.",
                 "Fragmented logistics leading to spoilage at the point of handover."
             ], badge="Systemic Friction", accent_color=MINT_LIGHT)

    # ==========================================
    # SLIDE 3: THE SOLUTION (SHAREPLATE)
    # ==========================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_background(slide3)
    add_header(slide3, "Core Solution Architecture", "SharePlate: Autonomous Surplus Redistribution", "Connecting surplus donors with verified community beneficiaries in under 60 seconds.")

    add_card(slide3, Inches(0.8), Inches(2.0), Inches(2.7), Inches(4.8),
             "1. Instant Listing", [
                 "Donors post surplus in under 60 seconds.",
                 "Auto-calculated shelf life and storage protocols.",
                 "Pre-filled dietary & allergen taxonomy.",
                 "Specific pickup windows and loading dock notes."
             ], badge="Zero Friction", accent_color=EMERALD_ACCENT)

    add_card(slide3, Inches(3.7), Inches(2.0), Inches(2.7), Inches(4.8),
             "2. Live Marketplace", [
                 "Search by category, distance, or dietary need.",
                 "Smart matching algorithm aligns NGO capacity.",
                 "Instant reservation mechanism prevents conflicts.",
                 "Automated real-time notifications dispatched."
             ], badge="Smart Match", accent_color=MINT_LIGHT)

    add_card(slide3, Inches(6.6), Inches(2.0), Inches(2.7), Inches(4.8),
             "3. Verified Handover", [
                 "Cryptographic 6-digit verification code.",
                 "Digital Handover Pass displayed on mobile.",
                 "Donor verifies code to finalize custody transfer.",
                 "Tamper-proof audit logging of timestamps."
             ], badge="Fraud Proof", accent_color=CITRUS)

    add_card(slide3, Inches(9.5), Inches(2.0), Inches(2.7), Inches(4.8),
             "4. Impact Accounting", [
                 "Automated CO₂e greenhouse gas reduction formula.",
                 "Live tracker for meals rescued & families fed.",
                 "Corporate ESG certificate export for donors.",
                 "Civic leaderboard inspiring community action."
             ], badge="Measurable ESG", accent_color=EMERALD_ACCENT)

    # ==========================================
    # SLIDE 4: 3D EXPERIENCE & OBSIDIAN DESIGN
    # ==========================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_background(slide4)
    add_header(slide4, "Immersive User Experience", "NVIDIA SimReady 3D Aesthetics & UI System", "Transforming charitable food logistics into an engaging, high-tech digital experience.")

    add_card(slide4, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.8),
             "Interactive 3D Digital Twin Viewer", [
                 "Built with Three.js & React Three Fiber (R3F).",
                 "SimReady-inspired food items floating with organic rotation and translation physics in the background.",
                 "Interactive 360° Inspector: Orbit, pan, zoom, and inspect meals before booking.",
                 "Dynamic environment lighting, soft contact shadows, and specular highlights.",
                 "Zero lag: Optimized lightweight geometry rendering at 60 FPS across desktop and mobile."
             ], badge="Three.js / WebGL", accent_color=EMERALD_ACCENT)

    add_card(slide4, Inches(6.8), Inches(2.0), Inches(5.6), Inches(4.8),
             "Obsidian Dark Mode Design Language", [
                 "Deep obsidian palette (#0B1110) with emerald and citrus accent highlights.",
                 "Strict WCAG 2.2 AA contrast compliance (>4.5:1 ratio for all body copy).",
                 "Micro-interactions: Smooth state transitions, hover lift effects, and tactile feedback.",
                 "One-Click Persona Bar: Instant toggling between Donor, Recipient, and Guest for frictionless testing and live demos.",
                 "Responsive grid: Seamless adaptability from 390px mobile screens to 4K displays."
             ], badge="Design System", accent_color=MINT_LIGHT)

    # ==========================================
    # SLIDE 5: TECHNICAL ARCHITECTURE & STACK
    # ==========================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_background(slide5)
    add_header(slide5, "Engineering & System Architecture", "Resilient Full-Stack Architecture", "Modern TypeScript stack engineered for 100% availability and atomic concurrency.")

    add_card(slide5, Inches(0.8), Inches(2.0), Inches(3.6), Inches(4.8),
             "Frontend Layer", [
                 "React 18 + TypeScript + Vite for instant HMR.",
                 "Tailwind CSS with custom semantic design tokens.",
                 "Three.js / React Three Fiber / Drei for 3D shaders.",
                 "Lucide React for consistent vector iconography.",
                 "React Router DOM v6 with route guard protection."
             ], badge="Client Application", accent_color=EMERALD_ACCENT)

    add_card(slide5, Inches(4.8), Inches(2.0), Inches(3.6), Inches(4.8),
             "Backend & Concurrency", [
                 "Node.js & Express RESTful API with Zod validation.",
                 "SQLite engine with ACID-compliant transactions.",
                 "Atomic quantity reservations preventing race conditions or double-allocations.",
                 "Safe CORS, Helmet security headers, and rate limiting.",
                 "Cryptographic random code generation for passes."
             ], badge="API & Transactions", accent_color=MINT_LIGHT)

    add_card(slide5, Inches(8.8), Inches(2.0), Inches(3.6), Inches(4.8),
             "Resilience & Deployment", [
                 "Built-in Mock Fallback Store enabling full offline and CDN preview support.",
                 "Zero-network-error guarantee when deployed on static Vercel edge infrastructure.",
                 "Automated CI/CD deployment pipeline via Vercel CLI.",
                 "Modular service layer decoupling API calls from state."
             ], badge="High Availability", accent_color=CITRUS)

    # ==========================================
    # SLIDE 6: VERIFICATION & CHAIN OF CUSTODY
    # ==========================================
    slide6 = prs.slides.add_slide(blank_layout)
    add_background(slide6)
    add_header(slide6, "Trust & Security Framework", "Cryptographic Handover & Verification", "Guaranteed chain-of-custody preventing fraud, theft, and delivery disputes.")

    add_card(slide6, Inches(0.8), Inches(2.0), Inches(3.6), Inches(4.8),
             "Step 1: Request & Reserve", [
                 "Recipient charity browses live surplus catalogue.",
                 "Selects portion quantity within donor's surplus limit.",
                 "Submits proposed collection timestamp and logistics note.",
                 "System atomically locks inventory in pending state."
             ], badge="Step 01", accent_color=TEXT_MUTED)

    add_card(slide6, Inches(4.8), Inches(2.0), Inches(3.6), Inches(4.8),
             "Step 2: Donor Approval", [
                 "Donor receives real-time alert on Donor Dashboard.",
                 "Reviews recipient accreditation and pickup vehicle details.",
                 "Clicks 'Approve': System generates unique 6-digit cryptographic PIN.",
                 "Digital Handover Pass instantly unlocks on recipient pass screen."
             ], badge="Step 02", accent_color=EMERALD_ACCENT)

    add_card(slide6, Inches(8.8), Inches(2.0), Inches(3.6), Inches(4.8),
             "Step 3: Verification & Handover", [
                 "Driver arrives at collection location (kitchen / loading bay).",
                 "Presents Digital Handover Pass containing the 6-digit PIN.",
                 "Donor enters code into terminal: Status updates to 'COMPLETED'.",
                 "Impact metrics immediately credited to both profiles."
             ], badge="Step 03", accent_color=CITRUS)

    # ==========================================
    # SLIDE 7: ENVIRONMENTAL & SOCIAL IMPACT
    # ==========================================
    slide7 = prs.slides.add_slide(blank_layout)
    add_background(slide7)
    add_header(slide7, "Measurable Impact & ESG", "Data-Driven Sustainability & Community ROI", "Turning discarded food into quantified social good and certified carbon avoidance.")

    # 3 Stat Cards on Top
    stat1 = slide7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.0), Inches(3.6), Inches(1.8))
    stat1.fill.solid()
    stat1.fill.fore_color.rgb = CARD_BG
    stat1.line.color.rgb = CARD_BORDER
    tf_s1 = stat1.text_frame
    p_s1_num = tf_s1.paragraphs[0]
    p_s1_num.text = "2.5 kg CO₂e"
    p_s1_num.font.size = Pt(28)
    p_s1_num.font.bold = True
    p_s1_num.font.color.rgb = EMERALD_ACCENT
    p_s1_lbl = tf_s1.add_paragraph()
    p_s1_lbl.text = "Emissions Avoided per kg Food Rescued"
    p_s1_lbl.font.size = Pt(11)
    p_s1_lbl.font.color.rgb = TEXT_MUTED

    stat2 = slide7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.8), Inches(2.0), Inches(3.6), Inches(1.8))
    stat2.fill.solid()
    stat2.fill.fore_color.rgb = CARD_BG
    stat2.line.color.rgb = CARD_BORDER
    tf_s2 = stat2.text_frame
    p_s2_num = tf_s2.paragraphs[0]
    p_s2_num.text = "100% Free"
    p_s2_num.font.size = Pt(28)
    p_s2_num.font.bold = True
    p_s2_num.font.color.rgb = MINT_LIGHT
    p_s2_lbl = tf_s2.add_paragraph()
    p_s2_lbl.text = "Guaranteed Non-Commercial Redistribution"
    p_s2_lbl.font.size = Pt(11)
    p_s2_lbl.font.color.rgb = TEXT_MUTED

    stat3 = slide7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.8), Inches(2.0), Inches(3.6), Inches(1.8))
    stat3.fill.solid()
    stat3.fill.fore_color.rgb = CARD_BG
    stat3.line.color.rgb = CARD_BORDER
    tf_s3 = stat3.text_frame
    p_s3_num = tf_s3.paragraphs[0]
    p_s3_num.text = "< 45 Mins"
    p_s3_num.font.size = Pt(28)
    p_s3_num.font.bold = True
    p_s3_num.font.color.rgb = CITRUS
    p_s3_lbl = tf_s3.add_paragraph()
    p_s3_lbl.text = "Average Listing-to-Collection Time"
    p_s3_lbl.font.size = Pt(11)
    p_s3_lbl.font.color.rgb = TEXT_MUTED

    # Detailed Explanatory Cards Below
    add_card(slide7, Inches(0.8), Inches(4.1), Inches(5.6), Inches(2.8),
             "UN Sustainable Development Goals (SDGs)", [
                 "SDG 2: Zero Hunger — Distributing nutritious meals to underserved communities.",
                 "SDG 12: Responsible Consumption — Halving per-capita food waste.",
                 "SDG 13: Climate Action — Eliminating methane generation from food waste landfills."
             ], badge="SDG Alignment", accent_color=EMERALD_ACCENT)

    add_card(slide7, Inches(6.8), Inches(4.1), Inches(5.6), Inches(2.8),
             "Corporate Donor Value Proposition", [
                 "Save up to 40% on commercial organic waste hauling and tipping fees.",
                 "Download verifiable ESG impact statements for corporate disclosures.",
                 "Boost employee pride and brand reputation through hyper-local philanthropy.",
                 "Eligible for charitable food donation tax relief provisions."
             ], badge="Donor Economics", accent_color=MINT_LIGHT)

    # ==========================================
    # SLIDE 8: DEMO & ROADMAP
    # ==========================================
    slide8 = prs.slides.add_slide(blank_layout)
    add_background(slide8)
    add_header(slide8, "Live Demonstration & Next Horizons", "Experience SharePlate Today", "Tested, built, and deployed to production on Vercel.")

    add_card(slide8, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.8),
             "Live Production Links", [
                 "🌐 Production App: https://client-nine-ebon.vercel.app",
                 "📦 GitHub Repository: github.com/nandu123-1/shareplate",
                 "⚡ Instant Demo Bar: Seamlessly switch between:",
                 "   - Donor: Post meals & approve collection requests",
                 "   - Recipient (NGO): Browse surplus & claim 6-digit passes",
                 "   - Guest: Explore public 3D showcase & impact ledger",
                 "🎥 Recorded HD Demo Video: Walkthrough of end-to-end flows."
             ], badge="Production Ready", accent_color=EMERALD_ACCENT)

    add_card(slide8, Inches(6.8), Inches(2.0), Inches(5.6), Inches(4.8),
             "Strategic Future Roadmap", [
                 "Phase 1 (Current): Real-time marketplace, 3D interactive viewer, 6-digit verification.",
                 "Phase 2 (Q1): Smart Scale & BLE temperature probe integrations for automated weight & safety compliance.",
                 "Phase 3 (Q2): Predictive AI surplus forecasting based on historical weather, events, and kitchen production.",
                 "Phase 4 (Q3): Automated volunteer fleet routing algorithm for multi-stop food pickups."
             ], badge="Product Roadmap", accent_color=CITRUS)

    prs.save(output_path)
    print(f"Presentation saved successfully to {output_path}")

if __name__ == "__main__":
    create_deck()
