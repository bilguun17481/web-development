# 🎨 Web Design Builder

A powerful visual web design editor for your Elektro Dvořák e-shop. Built with vanilla JavaScript, this tool allows you to edit your website visually without touching code - similar to Wix or Webflow.

## ✨ Features

### 🎯 Core Functionality

- **Visual Editing**: Click any element to select and edit it in real-time
- **Drag & Drop**: Add new elements by dragging from the sidebar
- **Text Editing**: Double-click any text to edit it inline
- **Image Management**: Upload, manage, and replace images with ease
- **Animation Controls**: Add smooth animations with visual previews
- **Export Functionality**: Download your modified website as HTML files
- **Multi-User Support**: Role-based authentication (Admin, Editor, Viewer)
- **Responsive Views**: Preview your site in desktop, tablet, and mobile views
- **History Tracking**: Track all changes made during your session
- **Undo/Redo**: Coming soon!

### 👥 User Roles

#### Admin (Full Access)
- View, edit, and delete elements
- Upload and manage images
- Export website files
- Manage all animations and properties
- **Login**: `admin` / `admin123`

#### Editor (Edit Access)
- View and edit elements
- Upload and manage images
- Export website files
- Add animations
- **Login**: `editor` / `editor123`

#### Viewer (Read-Only)
- View the website
- No editing permissions
- **Login**: `viewer` / `viewer123`

## 🚀 Getting Started

### 1. Access the Builder

```bash
# Navigate to the builder directory
cd /home/user/web-development/builder

# Open index.html in your browser
# Or serve with a local server:
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

### 2. Login

1. Open `builder/index.html` in your browser
2. Enter credentials (see User Roles above)
3. Select your role from the dropdown
4. Click "Login to Builder"

### 3. Start Editing

You'll be redirected to the visual editor interface!

## 🎨 Using the Editor

### Interface Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Toolbar (Undo, Redo, Preview, Export, Logout)             │
├─────────┬───────────────────────────────────┬──────────────┤
│         │                                   │              │
│  Left   │        Canvas Area                │    Right     │
│ Sidebar │   (Your website preview)          │   Sidebar    │
│         │                                   │              │
│ Elements│                                   │ Properties   │
│  Pages  │                                   │ Animations   │
│ Assets  │                                   │  History     │
│         │                                   │              │
└─────────┴───────────────────────────────────┴──────────────┘
```

### Left Sidebar

#### 📦 Elements Tab
Drag and drop elements onto your page:

**Layout Elements:**
- Section: Full-width container
- Container: Standard content container
- Grid: Responsive grid layout

**Content Elements:**
- Heading: H1-H6 headings
- Text: Paragraph text
- Image: Images
- Button: Call-to-action buttons

**Components:**
- Product Card: Pre-styled product display
- Feature Card: Feature highlights
- Category Card: Category navigation

#### 📄 Pages Tab
Switch between different pages:
- Homepage (`index.html`)
- About (`pages/about.html`)
- Categories (`pages/categories.html`)
- Product (`pages/product.html`)
- Cart (`pages/cart.html`)
- Contact (`pages/contact.html`)

#### 🖼 Assets Tab
Manage images:
- Click "Upload Images" to add new images
- Click any image to replace the selected element's image
- Right-click an image to delete it

### Center Canvas

This is where you edit your website:

**Selection:**
- **Click** any element to select it
- Selected elements have a blue outline
- **Hover** over elements to preview selection

**Text Editing:**
- **Double-click** any text element to edit inline
- **Enter** to save changes
- **Esc** to cancel

**Context:**
- All changes are made in real-time
- Changes persist in the browser session

### Right Sidebar

#### ⚙ Properties Tab
Edit selected element properties:
- Text content
- Image source and alt text
- Link URLs
- Background color
- Text color
- Font size
- Padding and margin

Click "Apply Changes" to update the element.

#### ✨ Animations Tab
Add animations to selected elements:

1. Select an element
2. Choose animation type:
   - Fade In
   - Slide In (Left, Right, Up, Down)
   - Zoom In
   - Bounce
3. Adjust duration (100-3000ms)
4. Set delay (0-2000ms)
5. Choose easing function
6. Click "Preview" to see animation
7. Click "Apply Animation" to add to element

#### 🕐 History Tab
View all changes made during your session:
- Shows recent 20 actions
- Each action timestamped
- Great for tracking your work

## 💾 Exporting Your Website

### Single Page Export

1. Click the **"Export Site"** button in the toolbar
2. Configure export options:
   - ✅ Include all images
   - ✅ Include CSS and JavaScript
   - ⬜ Minify code (smaller file size)
3. Click **"Download ZIP"**
4. Save the HTML file
5. Upload to your web hosting

### What Gets Exported

- Clean HTML without builder classes
- All your content changes
- Modified styles and properties
- Applied animations
- Optimized and ready to deploy

### Important Notes

- Builder-specific classes (`.builder-selected`, `.builder-hover`) are automatically removed
- Inline editing attributes are cleaned up
- The exported HTML is production-ready

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Z` | Undo (coming soon) |
| `Ctrl + Y` | Redo (coming soon) |
| `Delete` | Delete selected element |
| `Backspace` | Delete selected element |
| `Double-click` | Edit text inline |
| `Enter` | Save text edit |
| `Esc` | Cancel text edit |

## 🛠 Technical Details

### Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with Flexbox and Grid
- **Storage**: localStorage for images and user sessions
- **Architecture**: Modular class-based design

### File Structure

```
builder/
├── index.html              # Login page
├── editor.html             # Main editor interface
├── assets/
│   ├── css/
│   │   ├── builder.css     # Login page styles
│   │   └── editor.css      # Editor interface styles
│   └── js/
│       ├── auth.js         # Authentication system
│       ├── editor.js       # Main editor controller
│       ├── drag-drop.js    # Drag and drop functionality
│       ├── text-editor.js  # Inline text editing
│       ├── image-manager.js # Image upload and management
│       ├── animation-controls.js # Animation system
│       └── exporter.js     # Export functionality
└── README.md              # This file
```

### Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE11: ❌ Not supported (requires ES6)

### Storage Limits

- **localStorage**: ~5-10MB per domain
- Uploaded images are stored as base64 data URLs
- Recommended: Keep images under 1MB each
- Total storage capacity: ~50-100 images

## 🎯 Best Practices

### For Best Results

1. **Save Often**: Use the Export feature regularly to backup your work
2. **Optimize Images**: Compress images before uploading (use tools like TinyPNG)
3. **Test Responsive**: Check all three viewport sizes (Desktop, Tablet, Mobile)
4. **Keep It Simple**: Don't over-animate - subtle is better
5. **Browser Testing**: Test exported files in multiple browsers

### Common Workflows

#### Changing a Product Image

1. Go to Assets tab
2. Click "Upload Images"
3. Select product image
4. Click on the product card in the canvas
5. Click the product's image element
6. Click your uploaded image in Assets
7. Done!

#### Adding a New Section

1. Go to Elements tab
2. Drag "Section" element
3. Drop it where you want it
4. Double-click the heading to edit text
5. Click text to edit
6. Select section, go to Properties
7. Adjust colors, padding, etc.

#### Creating an Animated Hero Section

1. Click the hero section
2. Go to Animations tab
3. Choose "Fade In"
4. Set duration to 1000ms
5. Click "Preview" to test
6. Click "Apply Animation"
7. Refresh page to see it on load

## 🔒 Security Notes

- User credentials are stored in JavaScript (demo only)
- For production use, implement server-side authentication
- localStorage is client-side only - not secure for sensitive data
- Exported files should be reviewed before deployment

## 🐛 Troubleshooting

### Images Not Uploading

- Check file size (must be under 5MB)
- Ensure file is an image format (JPG, PNG, GIF, WebP)
- Clear localStorage if storage is full

### Changes Not Saving

- Changes persist only in browser session
- Use Export to save changes permanently
- Don't clear browser cache during editing

### Iframe Not Loading

- Check that parent directory (`../`) has the website files
- Ensure `index.html` exists in parent directory
- Check browser console for errors

### Export Not Working

- Ensure you have "export" permission (Admin or Editor role)
- Check that browser allows downloads
- Try a different browser if issues persist

## 🚧 Roadmap

### Coming Soon

- ✅ Basic visual editing
- ✅ Drag and drop elements
- ✅ Image management
- ✅ Animation controls
- ✅ Export functionality
- ⬜ Full undo/redo system
- ⬜ ZIP export with all assets
- ⬜ Real-time collaboration
- ⬜ Template library
- ⬜ Custom CSS editor
- ⬜ Mobile touch support
- ⬜ Cloud storage integration

## 📝 License

This builder is part of the Elektro Dvořák e-shop project.

## 🤝 Support

For issues or questions:
1. Check this README
2. Review browser console for errors
3. Test in different browser
4. Contact your development team

---

**Built with ❤️ for Elektro Dvořák**

*Version 1.0.0 - January 2026*
