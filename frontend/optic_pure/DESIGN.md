# Design System Specification: The Technical Atelier

## 1. Overview & Creative North Star
**The Creative North Star: "The Digital Darkroom"**
This design system moves beyond the generic "SaaS dashboard" by adopting the precision and quiet confidence of high-end camera equipment and professional editorial journals. We are not just building a converter; we are building a professional tool for creators. 

The aesthetic strategy rejects "template" rigidity in favor of **Tonal Layering**. Instead of boxing content into grids with lines, we use a sophisticated hierarchy of whites and soft grays to create a "nested" environment. This mimics the physical experience of stacking fine-art photo prints. By prioritizing intentional asymmetry and expansive whitespace, we signal to the user that their high-resolution assets are in a safe, premium, and calm environment.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a monochromatic "Paper and Steel" foundation, punctuated by a singular, authoritative "Optic Blue."

### The "No-Line" Rule
**Borders are a failure of hierarchy.** In this system, 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined solely through:
1.  **Background Shifts:** Placing a `surface_container_low` section against a `surface` background.
2.  **Tonal Transitions:** Using depth to separate the workspace from the navigation.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials. 
*   **Base Layer:** `surface` (#f8f9fa) – The infinite canvas.
*   **Sectioning:** `surface_container_low` (#f1f4f6) – Used for large sidebar or background areas.
*   **Active Workspaces:** `surface_container_lowest` (#ffffff) – Reserved for the highest level of focus (e.g., the image upload zone or active editor).
*   **Floating Utility:** `surface_container_high` (#e3e9ec) – Used for temporary overlays or contextual menus.

### The "Glass & Gradient" Rule
To avoid a flat, "budget" feel, use **Glassmorphism** for floating elements (modals, tooltips, navigation bars).
*   **Effect:** Apply `surface_container_lowest` at 80% opacity with a `20px` backdrop-blur.
*   **Signature Textures:** For primary CTAs and Hero sections, use a subtle linear gradient: `primary` (#0c56d0) to `on_primary_container` (#004ab9) at a 135° angle. This adds "optical depth" mimicking a camera lens coating.

---

## 3. Typography: The Editorial Voice
We use a dual-font strategy to balance technical precision with approachable modernism.

*   **Display & Headlines (Manrope):** Chosen for its geometric purity and wide aperture. Used for "Display" and "Headline" scales to create an authoritative, editorial feel. 
    *   *Directorial Note:* Use `display-lg` with tight tracking (-2%) for a high-fashion, premium look.
*   **Functional Text (Inter):** Chosen for its exceptional legibility at small sizes. Used for "Title," "Body," and "Labels."
    *   *Directorial Note:* For `body-md`, increase line-height to 1.6 for maximum "calm" and readability.

| Role | Font | Size | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| Display LG | Manrope | 3.5rem | 700 | Hero marketing headlines |
| Headline MD | Manrope | 1.75rem | 600 | Page headers, Tool titles |
| Title SM | Inter | 1rem | 500 | Card titles, Sidebar items |
| Body MD | Inter | 0.875rem | 400 | General descriptions, Metadata |
| Label MD | Inter | 0.75rem | 600 | Buttons, Micro-copy, All-caps |

---

## 4. Elevation & Depth
In a system without lines, depth is our only currency.

### Ambient Shadows
Forget "drop shadows." We use **Ambient Light Simulations**.
*   **Value:** `0px 12px 32px rgba(43, 52, 55, 0.06)`
*   **Logic:** Shadows must be extra-diffused and tinted with the `on_surface` color (#2b3437) rather than pure black to maintain a natural, photographic feel.

### The "Ghost Border" Fallback
If a container requires a border for accessibility (e.g., an input field), use a **Ghost Border**:
*   **Token:** `outline_variant` (#abb3b7) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons: The "Tactile Lens"
*   **Primary:** Gradient of `primary` to `primary_dim`. Roundedness: `md` (0.375rem). No shadow on rest; `lg` ambient shadow on hover.
*   **Secondary:** `surface_container_highest` background with `on_surface` text. No border.
*   **Tertiary:** Text-only using `primary` color. Underline only on hover.

### Input Fields & Upload Zones
*   **The Zone:** For the image uploader, use `surface_container_lowest`. 
*   **Interaction:** On "Drag-over," shift background to `primary_container` (#dae2ff) with a `primary` ghost border. 
*   **Styling:** Input fields should never have a dark border. Use a subtle `surface_container_high` fill.

### Cards & Lists: The "No-Divider" Rule
*   **Cards:** Use `surface_container_lowest` on a `surface` background. Separate content using `32px` (XL) vertical spacing instead of lines.
*   **Lists:** Forbid `divider` tokens. Use a hover state of `surface_container_low` to define list item boundaries dynamically.

### Specialized Component: The "Metadata Chip"
*   For image codecs (HEIC, AVIF, RAW), use `secondary_container` with `on_secondary_container` text.
*   **Shape:** `full` (pill-shaped) to contrast against the sharp corners of image previews.

---

## 6. Do's and Don'ts

### Do:
*   **DO** use whitespace as a functional element. If a layout feels "crowded," double the padding.
*   **DO** use `surface_tint` at 5% opacity for large background areas to give the "white" a premium, cool-toned professional feel.
*   **DO** align text-heavy content to a strict baseline grid to maintain the "Editorial" look.

### Don't:
*   **DON'T** use 100% black (#000000). Use `on_surface` (#2b3437) for all dark text to keep the contrast "soft" and professional.
*   **DON'T** use standard 1px grey dividers. They create visual noise and "trap" the user's eye.
*   **DON'T** use "Hard" corners. Use the `md` (0.375rem) or `lg` (0.5rem) scale for all containers to maintain the "Soft Minimalist" approachable feel.