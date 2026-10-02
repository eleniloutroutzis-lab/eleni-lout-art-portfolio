# Eleni • Visual Art Portfolio Website

Welcome, Eleni! Your website is pre-configured with a private **Artist Studio Portal** linked directly to **`eleniloutroutzis@gmail.com`**.

This allows you to visit your portfolio, sign in with your account or studio passcode, and add or manage your artworks directly from your browser, phone, iPad, or any device!

---

## 🚀 How to Open Your Website

1. Navigate to:
   ```
   C:\Users\Katerina\.gemini\antigravity\scratch\eleni-art-portfolio\
   ```
2. Double-click [**`index.html`**](file:///C:/Users/Katerina/.gemini/antigravity/scratch/eleni-art-portfolio/index.html) to open it in Chrome, Edge, Safari, or Firefox.

---

## 🔐 How to Log In to Your Studio

When regular visitors browse your site, they only see your beautiful public art exhibition. They cannot edit or post anything.

To access your artist controls:

1. Click **"Artist Sign In"** in the top navigation (or "Studio Access" in the footer).
2. You can either:
   * Click **"Sign in with Google as Eleni"** for 1-click access, **OR**
   * Enter your Studio Passcode: `eleni2026`
3. Once logged in:
   * A purple **"Artist Studio Active"** banner appears at the top.
   * The glowing **"+ Post Artwork"** button unlocks.
   * Each artwork card displays **Edit** and **Delete** buttons so you can manage your collection.

---

## ☁️ How to Add Art (Even If Images Are Not on Your Computer)

Since your artwork might be on your phone, tablet, Google Drive, or Google Photos:

### Option A: Using Google Drive / Google Photos
1. In Google Drive, right-click (or tap) your art image and select **Share** > **Copy Link** (ensure access is set to *"Anyone with the link can view"*).
2. Click **"+ Post Artwork"** on your website.
3. Paste that link into the **"Or Paste Google Drive / Cloud Image URL"** box.
4. The website will automatically convert your Google Drive link into a direct high-resolution image!
5. Enter your Title, Medium, and Story, then click **"Publish to Gallery"**.

### Option B: Upload from Any Phone or Device
- When you host this site or open it on your phone/tablet/laptop, click **"+ Post Artwork"**, tap the upload box, and pick any photo directly from your camera roll or photo library!

---

## 🎨 Changing Your Passcode or Saving Permenantly

- **Default Studio Passcode**: `eleni2026`
- **Exporting Code**: If you add new pieces and want them permanently saved in the source code file, click the **"Export Works JSON"** button inside the Studio modal. This copies the exact code that can be pasted into [**`js/artworks-data.js`**](file:///C:/Users/Katerina/.gemini/antigravity/scratch/eleni-art-portfolio/js/artworks-data.js).

---

## 📂 Project Structure

```
eleni-art-portfolio/
│
├── index.html              # Main website with Lightbox & Artist Login Portal
├── README.md               # Instructions & guide
├── css/
│   └── style.css           # Modern Dark Gallery design system
├── js/
│   ├── artworks-data.js    # Starter artworks list
│   └── app.js              # Gallery engine, Google Drive converter & Auth
└── assets/
    └── images/             # Local images folder
```
