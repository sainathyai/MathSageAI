# Logo Setup Instructions

## How to Add Your Professional Logo

### Step 1: Save Your Logo File

1. **Save your logo file** to the `public/` folder:
   - Recommended formats: `.svg` (best), `.png`, or `.webp`
   - Recommended name: `logo.svg` (or `logo.png`)

2. **File location**:
   ```
   public/
   └── logo.svg  (or logo.png)
   ```

### Step 2: Supported Formats

The logo will automatically work with:
- **SVG** (recommended) - Scalable, crisp at any size
- **PNG** - Good quality, supports transparency
- **WebP** - Modern, smaller file size

### Step 3: Logo Specifications

For best results, your logo should:
- **Size**: At least 512x512px (for high DPI displays)
- **Format**: SVG preferred (vector graphics scale perfectly)
- **Background**: Transparent or matches gradient theme
- **Aspect Ratio**: Square (1:1) works best for circular avatars

### Step 4: Verify It Works

After adding the logo file:

1. **Restart dev server** (if running):
   ```bash
   npm run dev
   ```

2. **Check the UI**:
   - Header logo should display
   - Welcome screen logo should display
   - Message bubbles (AI avatar) should show logo

3. **If logo doesn't appear**:
   - Check file is in `public/` folder
   - Check filename matches exactly: `logo.svg` (case-sensitive)
   - Check browser console for 404 errors
   - Fallback emoji (🦉) will show if logo not found

### Step 5: Update Logo in Multiple Places

The logo is used in these components:
- ✅ `components/Header.tsx` - Header logo (already updated)
- ✅ `components/WelcomeScreen.tsx` - Welcome screen (already updated)
- ✅ `components/MessageBubble.tsx` - AI avatar in messages (already updated)
- `app/about/page.tsx` - About page (can update if needed)
- `app/how-it-works/page.tsx` - How It Works page (can update if needed)
- `app/help/page.tsx` - Help page (can update if needed)

All components are already configured to use `/logo.svg` from the public folder.

### Step 6: Alternative Logo Names

If you want to use a different filename, update these files:
- `components/Header.tsx` - Change `src="/logo.svg"` to your filename
- `components/WelcomeScreen.tsx` - Change `src="/logo.svg"` to your filename
- `components/MessageBubble.tsx` - Change `src="/logo.svg"` to your filename

### Step 7: Favicon (Optional)

To also use your logo as favicon:

1. Save a smaller version as `public/favicon.ico` or `public/favicon.svg`
2. Next.js will automatically use it

Or convert your logo to favicon:
- Use online tool: https://realfavicongenerator.net/
- Save as `public/favicon.ico`

---

## Current Logo Usage

The logo is currently displayed as:
- **Header**: 48x48px (h-12 w-12) circular
- **Welcome Screen**: 128x128px (h-32 w-32) circular with pulse animation
- **Message Avatar**: 32x32px (h-8 w-8) circular
- **Info Pages**: 64x64px to 80x80px circular

All use the same `/logo.svg` file from the public folder.

---

## Troubleshooting

**Logo not showing?**
1. Check file is in `public/` folder (not `public/images/`)
2. Check filename is exactly `logo.svg` (case-sensitive)
3. Clear browser cache
4. Restart dev server
5. Check browser console for 404 errors

**Logo too small/large?**
- Adjust the `h-*` and `w-*` classes in components
- SVG scales automatically, PNG/WebP may need resizing

**Logo looks blurry?**
- Use SVG format (vector graphics)
- Or use high-resolution PNG (2x or 3x for retina displays)

---

**Status**: Components are ready - just add your logo file to `public/logo.svg`!

