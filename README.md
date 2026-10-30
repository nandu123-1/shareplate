# SharePlate — Good Food. Shared Future.
### Premium 3D Food Donation & Redistribution Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nandu123-1/shareplate&root-directory=client)

SharePlate is a fullstack food rescue platform designed to connect commercial food businesses (restaurants, bakeries, hotels, caterers, and supermarkets) with verified charitable community organizations (food banks, youth shelters, and community kitchens).

---

## 🌟 Product Highlights & Architecture

- **Signature 3D Experience**: Interactive Three.js / React Three Fiber hero scene featuring a floating ceramic plate, fresh organic produce, sourdough bread, floating herbs, and mouse-responsive parallax physics.
- **Warm Minimalist Aesthetic**: Editorial design language inspired by Linear, Stripe, and modern social-impact startups. Built using custom design tokens (`cream`, `forest`, `citrus`, `sage`).
- **Atomic Concurrency Protection**: Multi-step inventory reservations execute in isolated SQLite ACID transactions, guaranteeing zero overbooking even under high concurrency.
- **6-Digit Cryptographic Handover Pass**: Every accepted donation generates a secure verification code presented by the recipient volunteer upon physical kitchen collection.
- **Transparent Environmental Accounting**: Live database aggregations calculating kilograms rescued, meals provided, and greenhouse gas avoidance based on UN FAO / WRAP carbon conversion models ($1\text{ kg edible food waste prevented} \approx 2.5\text{ kg CO}_2\text{e}$).
- **Role-Based Workspaces**: Tailored dashboards for Donors, Recipient NGOs, and Platform Administrators with audit history and in-app notifications.
- **1-Click Hackathon Demo Bar**: Persistent switcher bar allowing judges and evaluators to swap roles instantly with a single click.

---

## 👥 Demo Accounts & Roles

| Role | Organization / Entity | Email | Password | Key Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Donor** | GreenLeaf Bistro & Catering | `donor@greenleaf.com` | `password123` | Publish surplus listings, review requests, accept/reserve portions, verify pickup |
| **Donor** | The Rustic Hearth Bakery | `donor@thehearth.com` | `password123` | Bakery surplus listings, storage instructions, pickup windows |
| **Recipient** | Hope Haven Food Bank | `ngo@hopehaven.org` | `password123` | Browse surplus catalog, request quantities, view 6-digit pickup pass |
| **Recipient** | City Harvest Youth Shelter | `ngo@cityshelter.org` | `password123` | Portion matching, active collection coordination |
| **Admin** | SharePlate Operations | `admin@shareplate.org` | `admin123` | Platform oversight, user management, safety moderation, audit trail |

*Tip: You can also use the top **Hackathon Demo Bar** on any page to switch accounts instantly without typing.*

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node `v22.23.3`)
- npm `v9+` or `v10+`

### 1. Clone & Install Dependencies
```bash
cd /home/sunraku/shareplate

# Install root orchestration tools
npm install

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 2. Seed Database with Realistic Demo Data
The database seeder is idempotent and seeds 10+ varied culinary listings, 5 donor businesses, 3 recipient NGOs, active pickup passes, completed records, and audit logs:
```bash
cd /home/sunraku/shareplate
npm run seed
```

### 3. Run Automated Workflow Tests
Validates authentication, inventory tracking, overbooking prevention, and pickup codes:
```bash
cd /home/sunraku/shareplate
npm run test
```

### 4. Start the Application
Run both backend (`localhost:5001`) and frontend (`localhost:3000`) concurrently:
```bash
cd /home/sunraku/shareplate
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧩 Technical Stack

```
SharePlate
├── client/                     # Frontend Application (Vite + React + TypeScript)
│   ├── src/
│   │   ├── components/3d/      # Three.js / React Three Fiber interactive hero
│   │   ├── components/food/    # Food cards, detail modal, request wizard
│   │   ├── components/layout/  # Glass navbar, demo switcher, footer
│   │   ├── components/ui/      # Badges, accessible modal, buttons
│   │   ├── context/            # AuthContext, NotificationContext
│   │   ├── pages/              # Landing, Explore, HowItWorks, Impact, Dashboards
│   │   └── services/           # REST API client with JWT interception
│   ├── tailwind.config.js      # Custom cream, forest, citrus tokens
│   └── vite.config.ts          # API reverse-proxy configuration
│
├── server/                     # Backend API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── db/                 # SQLite database initialization, schema & seed
│   │   ├── middleware/         # JWT authentication, role guards (requireRole)
│   │   ├── routes/             # Auth, Listings, Requests, Pickups, Reports, Admin
│   │   └── services/           # History audit logger & notification dispatch
│   └── tests/                  # Automated integration & concurrency tests
│
└── data/                       # Persistent SQLite database storage (WAL mode)
```

---

## 🛡️ Food Safety & Responsibility Framework

SharePlate is a logistical coordination network, not a food safety certification authority.
1. **Donor Declaration**: Donors certify that food is prepared under commercial health conditions and specify storage temperatures (HACCP cooling rules).
2. **Allergen Transparency**: Listings mandate allergen disclosure (gluten, dairy, nuts, soy, etc.).
3. **Recipient Assessment**: Community recipients inspect food temperature and container integrity upon physical collection.
4. **Community Reporting**: Users can report spoiled food or misrepresentations directly to platform administrators.

---

## 🎤 3–5 Minute Hackathon Presentation Script

1. **The Hook (0:00 - 0:45)**:
   > *"Good evening judges. Every night, commercial kitchens discard tons of chef-prepared edible food while community shelters struggle to feed people down the street. SharePlate solves this coordination problem with a premium, zero-friction redistribution platform."*

2. **The 3D Brand Experience (0:45 - 1:30)**:
   > *"Notice our visual identity. We didn't build another generic dashboard. Our 3D interactive hero communicates the freshness, care, and dignity of food redistribution with mouse-responsive tilt and physics. Scrolling down, you see our live surplus catalog with portions, allergen tags, and pickup countdowns."*

3. **Live Donor Workflow (1:30 - 2:30)**:
   > *"Using our Hackathon Demo Bar, let's switch to Chef Marco at GreenLeaf Bistro. On his kitchen dashboard, he has 2 active listings and a pending request from City Harvest Youth Shelter for 20 portions of roast chicken. With one click on 'Accept & Lock', our database performs an atomic ACID transaction: inventory drops from 45 to 25 portions, locking surplus against overbooking, and generates a 6-digit handover code."*

4. **Live Recipient & Pickup Handover (2:30 - 3:30)**:
   > *"Now switching to Rev. Thomas at Hope Haven Food Bank. In his Recipient Hub, he opens his digital Pickup Pass. It shows the secure 6-digit code. When the shelter van arrives at the hotel kitchen, the donor enters this code to verify pickup. Confetti celebrates the completed rescue, and the audit trail updates live impact metrics: 30 portions saved, ~12 kg of food rescued, and 30 kg of CO2 emissions prevented."*

5. **Admin Oversight & Vision (3:30 - 4:00)**:
   > *"In our Admin Command Center, operators monitor platform health, review food safety reports, and inspect the cryptographic audit trail. SharePlate transforms food waste into human nourishment. Thank you!"*

---

## 📄 License
MIT License. Built for Social Impact & Global Food Waste Reduction.
