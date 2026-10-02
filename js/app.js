/**
 * Eleni Art Portfolio • Sleek Natural Gothic Edition
 * Includes Live Page Content Editing, Main Hero Photo Swapper,
 * and Artist Studio authentication for eleniloutroutzis@gmail.com.
 */

// State Management
let artworks = [];
let currentFilter = 'all';
let currentLightboxIndex = 0;
let filteredArtworks = [];
let uploadedImageBase64 = null;
let uploadedHeroImageBase64 = null;
let isAdminLoggedIn = false;
let isLiveEditActive = false;
let hasUnsavedTextEdits = false;

const ARTIST_EMAIL = 'eleniloutroutzis@gmail.com';
const DEFAULT_PASSCODE = 'eleni2026';

// DOM Elements - Gallery & Filter
const galleryGrid = document.getElementById('gallery-grid');
const filterButtons = document.querySelectorAll('.filter-btn');
const galleryStats = document.getElementById('gallery-stats');

// DOM Elements - Admin & Auth
const adminStatusBanner = document.getElementById('admin-status-banner');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const openLoginBtn = document.getElementById('open-login-btn');
const loginBtnText = document.getElementById('login-btn-text');
const loginModal = document.getElementById('login-modal');
const closeLoginBtn = document.getElementById('close-login-btn');
const loginForm = document.getElementById('login-form');
const googleSignInBtn = document.getElementById('google-signin-btn');

// DOM Elements - Live Edit Controls
const toggleLiveEditBtn = document.getElementById('toggle-live-edit-btn');
const liveEditStatusText = document.getElementById('live-edit-status-text');
const saveLiveContentBtn = document.getElementById('save-live-content-btn');
const resetContentBtn = document.getElementById('reset-content-btn');
const unsavedFloatingBadge = document.getElementById('unsaved-floating-badge');
const floatingSaveBtn = document.getElementById('floating-save-btn');

// DOM Elements - Hero Main Photo Swapper
const btnChangeHeroImg = document.getElementById('btn-change-hero-img');
const heroImageModal = document.getElementById('hero-image-modal');
const closeHeroImgBtn = document.getElementById('close-hero-img-btn');
const cancelHeroImgBtn = document.getElementById('cancel-hero-img-btn');
const heroImageForm = document.getElementById('hero-image-form');
const heroMainPhoto = document.getElementById('hero-main-photo');
const heroCaptionTitle = document.getElementById('hero-caption-title');
const heroCaptionTag = document.getElementById('hero-caption-tag');
const heroFileInput = document.getElementById('hero-file-input');
const heroDropzone = document.getElementById('hero-dropzone');
const heroPreviewBox = document.getElementById('hero-preview-box');
const heroPreviewImg = document.getElementById('hero-preview-img');
const heroUrlInput = document.getElementById('hero-url-input');
const heroCaptionInput = document.getElementById('hero-caption-input');
const heroSubtagInput = document.getElementById('hero-subtag-input');
const heroPickExistingSelect = document.getElementById('hero-pick-existing-select');

// DOM Elements - Lightbox
const lightboxModal = document.getElementById('lightbox-modal');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxSpecs = document.getElementById('lightbox-specs');
const lightboxDesc = document.getElementById('lightbox-desc');
const lightboxCounter = document.getElementById('lightbox-counter');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

// DOM Elements - Studio Modal
const studioModal = document.getElementById('studio-modal');
const openStudioBtn = document.getElementById('open-studio-btn');
const closeStudioBtn = document.getElementById('close-studio-btn');
const studioModalTitle = document.getElementById('studio-modal-title');
const studioForm = document.getElementById('studio-form');
const editArtIdInput = document.getElementById('edit-art-id');
const artFileInput = document.getElementById('art-file-input');
const artDropzone = document.getElementById('art-dropzone');
const previewBox = document.getElementById('preview-box');
const previewImg = document.getElementById('preview-img');
const removePreviewBtn = document.getElementById('remove-preview-btn');
const exportDataBtn = document.getElementById('export-data-btn');

// Toast Container
const toastContainer = document.getElementById('toast-container');

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadSavedPageContent();
  checkAuthSession();
  loadArtworks();
  setupEventListeners();
  setupDragAndDrop();
  setupHeroImageSwapper();
  setupLiveEditing();
});

// ==========================================================================
// Page Content & Hero Image Persistence (Live Editing)
// ==========================================================================
function loadSavedPageContent() {
  // Load custom text edits
  const savedContent = localStorage.getItem('eleni_page_content');
  if (savedContent) {
    try {
      const contentMap = JSON.parse(savedContent);
      document.querySelectorAll('[data-editable]').forEach(el => {
        const key = el.getAttribute('data-editable');
        if (contentMap[key] !== undefined) {
          el.innerHTML = contentMap[key];
        }
      });
    } catch (e) {
      console.error('Error loading saved content', e);
    }
  }

  // Load custom hero photo
  const savedHero = localStorage.getItem('eleni_hero_photo');
  if (savedHero) {
    try {
      const heroData = JSON.parse(savedHero);
      if (heroData.image && heroMainPhoto) heroMainPhoto.src = heroData.image;
      if (heroData.title && heroCaptionTitle) heroCaptionTitle.textContent = heroData.title;
      if (heroData.tag && heroCaptionTag) heroCaptionTag.textContent = heroData.tag;
    } catch (e) {
      console.error('Error loading saved hero photo', e);
    }
  }
}

function savePageContent() {
  const contentMap = {};
  document.querySelectorAll('[data-editable]').forEach(el => {
    const key = el.getAttribute('data-editable');
    contentMap[key] = el.innerHTML.trim();
  });

  localStorage.setItem('eleni_page_content', JSON.stringify(contentMap));
  hasUnsavedTextEdits = false;
  if (unsavedFloatingBadge) unsavedFloatingBadge.style.display = 'none';
  showToast('Page text edits saved successfully!');
}

function resetPageContent() {
  if (confirm('Are you sure you want to reset all text edits back to original defaults?')) {
    localStorage.removeItem('eleni_page_content');
    localStorage.removeItem('eleni_hero_photo');
    window.location.reload();
  }
}

function setupLiveEditing() {
  // Toggle Live Edit Mode button
  if (toggleLiveEditBtn) {
    toggleLiveEditBtn.addEventListener('click', () => {
      setLiveEditMode(!isLiveEditActive);
    });
  }

  // Save buttons
  if (saveLiveContentBtn) saveLiveContentBtn.addEventListener('click', savePageContent);
  if (floatingSaveBtn) floatingSaveBtn.addEventListener('click', savePageContent);
  if (resetContentBtn) resetContentBtn.addEventListener('click', resetPageContent);

  // Mark unsaved changes when user types into any editable field
  document.querySelectorAll('[data-editable]').forEach(el => {
    el.addEventListener('input', () => {
      hasUnsavedTextEdits = true;
      if (unsavedFloatingBadge) unsavedFloatingBadge.style.display = 'flex';
    });
  });
}

function setLiveEditMode(active) {
  isLiveEditActive = active;

  if (active) {
    document.body.classList.add('live-edit-active');
    document.querySelectorAll('[data-editable]').forEach(el => {
      el.setAttribute('contenteditable', 'true');
    });
    if (liveEditStatusText) {
      liveEditStatusText.textContent = 'ON';
      liveEditStatusText.style.color = '#4ade80';
    }
    showToast('Live Edit ON: Click any text on the page to edit it directly!');
  } else {
    document.body.classList.remove('live-edit-active');
    document.querySelectorAll('[data-editable]').forEach(el => {
      el.removeAttribute('contenteditable');
    });
    if (liveEditStatusText) {
      liveEditStatusText.textContent = 'OFF';
      liveEditStatusText.style.color = '';
    }
    if (hasUnsavedTextEdits) {
      savePageContent();
    }
  }
}

// ==========================================================================
// Hero Main Photo Swapper Modal
// ==========================================================================
function setupHeroImageSwapper() {
  if (btnChangeHeroImg) {
    btnChangeHeroImg.addEventListener('click', () => {
      openHeroImageModal();
    });
  }

  if (closeHeroImgBtn) closeHeroImgBtn.addEventListener('click', closeHeroImageModal);
  if (cancelHeroImgBtn) cancelHeroImgBtn.addEventListener('click', closeHeroImageModal);

  // Setup file drag and drop for hero image
  if (heroDropzone && heroFileInput) {
    ['dragenter', 'dragover'].forEach(name => {
      heroDropzone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        heroDropzone.style.borderColor = '#ffffff';
        heroDropzone.style.background = 'rgba(255, 255, 255, 0.08)';
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      heroDropzone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        heroDropzone.style.borderColor = 'var(--border-medium)';
        heroDropzone.style.background = 'rgba(10, 11, 14, 0.5)';
      });
    });

    heroDropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      if (dt.files.length > 0) {
        handleHeroFileSelected(dt.files[0]);
      }
    });

    heroFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleHeroFileSelected(e.target.files[0]);
      }
    });
  }

  // Handle Quick Pick from Existing Collection
  if (heroPickExistingSelect) {
    heroPickExistingSelect.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      if (selectedId) {
        const art = artworks.find(a => a.id === selectedId);
        if (art) {
          uploadedHeroImageBase64 = art.image;
          heroPreviewImg.src = art.image;
          heroPreviewBox.style.display = 'block';
          if (heroCaptionInput) heroCaptionInput.value = art.title;
          if (heroSubtagInput) heroSubtagInput.value = art.medium || art.categoryLabel;
        }
      }
    });
  }

  // Save new hero image
  if (heroImageForm) {
    heroImageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const rawUrl = heroUrlInput.value.trim();
      const parsedUrl = parseImageUrl(rawUrl);
      const chosenImage = uploadedHeroImageBase64 || parsedUrl;

      if (!chosenImage) {
        alert('Please upload an image file or provide an image URL.');
        return;
      }

      const newTitle = heroCaptionInput.value.trim() || 'Featured Masterpiece';
      const newTag = heroSubtagInput.value.trim() || 'Selected Work';

      if (heroMainPhoto) heroMainPhoto.src = chosenImage;
      if (heroCaptionTitle) heroCaptionTitle.textContent = newTitle;
      if (heroCaptionTag) heroCaptionTag.textContent = newTag;

      // Save to localStorage
      localStorage.setItem('eleni_hero_photo', JSON.stringify({
        image: chosenImage,
        title: newTitle,
        tag: newTag
      }));

      closeHeroImageModal();
      showToast('Main featured photo updated on screen!');
    });
  }
}

function handleHeroFileSelected(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file (JPG, PNG, WebP).');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedHeroImageBase64 = e.target.result;
    heroPreviewImg.src = uploadedHeroImageBase64;
    heroPreviewBox.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function openHeroImageModal() {
  if (!isAdminLoggedIn) {
    openLogin();
    return;
  }

  // Prepopulate existing works into select dropdown
  if (heroPickExistingSelect) {
    heroPickExistingSelect.innerHTML = '<option value="">-- Choose an artwork from your collection --</option>';
    artworks.forEach(art => {
      const opt = document.createElement('option');
      opt.value = art.id;
      opt.textContent = `${art.title} (${art.categoryLabel || art.category})`;
      heroPickExistingSelect.appendChild(opt);
    });
  }

  if (heroCaptionInput && heroCaptionTitle) {
    heroCaptionInput.value = heroCaptionTitle.textContent.trim();
  }
  if (heroSubtagInput && heroCaptionTag) {
    heroSubtagInput.value = heroCaptionTag.textContent.trim();
  }

  uploadedHeroImageBase64 = null;
  if (heroPreviewBox) heroPreviewBox.style.display = 'none';

  if (heroImageModal) {
    heroImageModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeHeroImageModal() {
  if (heroImageModal) {
    heroImageModal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ==========================================================================
// Artist Authentication System
// ==========================================================================
function checkAuthSession() {
  const session = localStorage.getItem('eleni_artist_session');
  if (session === 'authenticated') {
    setAdminState(true, false);
  } else {
    setAdminState(false, false);
  }
}

function setAdminState(isLoggedIn, showNotification = true) {
  isAdminLoggedIn = isLoggedIn;

  if (isLoggedIn) {
    localStorage.setItem('eleni_artist_session', 'authenticated');
    if (adminStatusBanner) adminStatusBanner.classList.add('active');
    if (openStudioBtn) openStudioBtn.classList.add('visible');
    if (btnChangeHeroImg) btnChangeHeroImg.classList.add('visible');
    if (loginBtnText) loginBtnText.textContent = 'Studio Active';
    if (openLoginBtn) openLoginBtn.title = 'Studio Unlocked (Click to add artwork)';
    if (showNotification) {
      showToast(`Welcome, Eleni. Studio & live editing controls unlocked.`);
    }
  } else {
    localStorage.removeItem('eleni_artist_session');
    if (adminStatusBanner) adminStatusBanner.classList.remove('active');
    if (openStudioBtn) openStudioBtn.classList.remove('visible');
    if (btnChangeHeroImg) btnChangeHeroImg.classList.remove('visible');
    if (loginBtnText) loginBtnText.textContent = 'Studio Access';
    if (openLoginBtn) openLoginBtn.title = 'Artist Sign In';
    setLiveEditMode(false);
    if (showNotification) {
      showToast('Signed out of Studio Mode');
    }
  }

  renderGallery();
}

function openLogin() {
  if (isAdminLoggedIn) {
    openStudio();
    return;
  }
  if (loginModal) {
    loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeLogin() {
  if (loginModal) {
    loginModal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ==========================================================================
// Gallery Data & Storage
// ==========================================================================
function loadArtworks() {
  const stored = localStorage.getItem('eleni_portfolio_artworks');
  if (stored) {
    try {
      artworks = JSON.parse(stored);
      if (!artworks.some(a => a.id === 'art-tiger-dream')) {
        artworks.unshift(DEFAULT_ARTWORKS[0]);
      }
      if (!artworks.some(a => a.id === 'art-surf-study')) {
        artworks.splice(1, 0, DEFAULT_ARTWORKS[1]);
      }
    } catch (e) {
      console.error('Error parsing stored artworks, resetting to defaults.', e);
      artworks = [...DEFAULT_ARTWORKS];
    }
  } else {
    artworks = [...DEFAULT_ARTWORKS];
  }
  applyFilter(currentFilter);
}

function saveArtworks() {
  localStorage.setItem('eleni_portfolio_artworks', JSON.stringify(artworks));
}

// ==========================================================================
// Gallery Rendering & Filtering
// ==========================================================================
function applyFilter(category) {
  currentFilter = category;

  filterButtons.forEach(btn => {
    if (btn.getAttribute('data-filter') === category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (category === 'all') {
    filteredArtworks = [...artworks];
  } else {
    filteredArtworks = artworks.filter(item => item.category === category);
  }

  updateCategoryCounts();
  renderGallery();
}

function updateCategoryCounts() {
  const counts = {
    all: artworks.length,
    digital: artworks.filter(a => a.category === 'digital').length,
    traditional: artworks.filter(a => a.category === 'traditional').length,
    photography: artworks.filter(a => a.category === 'photography').length
  };

  document.querySelectorAll('.filter-count').forEach(counter => {
    const parentFilter = counter.parentElement.getAttribute('data-filter');
    if (counts[parentFilter] !== undefined) {
      counter.textContent = `(${counts[parentFilter]})`;
    }
  });

  if (galleryStats) {
    galleryStats.textContent = `SHOWING ${filteredArtworks.length} OF ${artworks.length} WORKS`;
  }
}

function renderGallery() {
  if (!galleryGrid) return;
  galleryGrid.innerHTML = '';

  if (filteredArtworks.length === 0) {
    galleryGrid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:5rem 2rem; background:var(--bg-surface); border:1px solid var(--border-medium);">
        <h3 style="font-family:var(--font-gothic); font-size:1.6rem; color:#ffffff;">NO PIECES IN THIS CATEGORY</h3>
        <p style="margin:1rem 0; color:var(--text-ash); font-family:var(--font-editorial); font-size:1.2rem;">This section is waiting for new works.</p>
        ${isAdminLoggedIn ? `
          <button class="btn-gothic-primary" onclick="openStudio()">+ Add New Artwork</button>
        ` : `
          <button class="btn-gothic-secondary" onclick="openLogin()">Sign In to Publish</button>
        `}
      </div>
    `;
    return;
  }

  filteredArtworks.forEach((art, index) => {
    const card = document.createElement('article');
    card.className = 'art-card';
    card.dataset.index = index;

    const aspectClass = art.aspectRatio === 'portrait' ? 'aspect-portrait' :
                        art.aspectRatio === 'wide' ? 'aspect-wide' : 'aspect-square';

    card.innerHTML = `
      <div class="card-media ${aspectClass}">
        <img src="${escapeHtml(art.image)}" alt="${escapeHtml(art.title)}" loading="lazy" />
        <span class="card-category-badge">${escapeHtml(art.categoryLabel || art.category)}</span>
      </div>

      <div class="card-caption-panel">
        <div>
          <h3 class="card-title">${escapeHtml(art.title)}</h3>
          <div class="card-medium-sub">${escapeHtml(art.medium)} • ${escapeHtml(art.year)}</div>
        </div>

        <div class="card-admin-actions ${isAdminLoggedIn ? 'visible' : ''}">
          <button class="card-action-btn edit-art-btn" title="Edit artwork" data-id="${art.id}">
            Edit
          </button>
          <button class="card-action-btn btn-delete delete-art-btn" title="Delete artwork" data-id="${art.id}">
            Delete
          </button>
        </div>
      </div>
    `;

    card.querySelector('.card-media').addEventListener('click', () => {
      openLightbox(index);
    });

    const editBtn = card.querySelector('.edit-art-btn');
    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        editArtwork(art.id);
      });
    }

    const deleteBtn = card.querySelector('.delete-art-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteArtwork(art.id);
      });
    }

    galleryGrid.appendChild(card);
  });
}

function deleteArtwork(id) {
  if (confirm('Are you sure you want to remove this piece from your collection?')) {
    artworks = artworks.filter(a => a.id !== id);
    saveArtworks();
    applyFilter(currentFilter);
    showToast('Piece removed from collection');
  }
}

function editArtwork(id) {
  const art = artworks.find(a => a.id === id);
  if (!art) return;

  editArtIdInput.value = art.id;
  studioModalTitle.textContent = `EDIT: ${art.title}`;

  document.getElementById('art-title').value = art.title;
  document.getElementById('art-category').value = art.category;
  document.getElementById('art-medium').value = art.medium;
  document.getElementById('art-year').value = art.year;
  document.getElementById('art-dimensions').value = art.dimensions || '';
  document.getElementById('art-desc').value = art.description || '';
  document.getElementById('art-url').value = art.image.startsWith('data:') ? '' : art.image;

  uploadedImageBase64 = art.image;
  previewImg.src = art.image;
  previewBox.style.display = 'block';
  artDropzone.style.display = 'none';

  document.getElementById('submit-art-btn').innerHTML = `<span>Save Changes</span>`;

  openStudio();
}

// ==========================================================================
// Google Drive URL Converter
// ==========================================================================
function parseImageUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();

  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${driveFileMatch[1]}&sz=w1600`;
  }

  const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (trimmed.includes('drive.google.com') && driveIdMatch && driveIdMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${driveIdMatch[1]}&sz=w1600`;
  }

  return trimmed;
}

// ==========================================================================
// Fullscreen Lightbox
// ==========================================================================
function openLightbox(index) {
  if (index < 0 || index >= filteredArtworks.length) return;
  currentLightboxIndex = index;
  updateLightboxContent();
  lightboxModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightboxModal.classList.remove('active');
  document.body.style.overflow = '';
}

function updateLightboxContent() {
  const art = filteredArtworks[currentLightboxIndex];
  if (!art) return;

  lightboxImg.src = art.image;
  lightboxImg.alt = art.title;
  lightboxTitle.textContent = art.title;
  
  let specs = `${art.categoryLabel || art.category} // ${art.medium} // ${art.year}`;
  if (art.dimensions) specs += ` // ${art.dimensions}`;
  lightboxSpecs.textContent = specs;

  lightboxDesc.textContent = art.description || 'No description provided for this work.';
  lightboxCounter.textContent = `PIECE ${currentLightboxIndex + 1} OF ${filteredArtworks.length}`;
}

function nextLightboxItem() {
  currentLightboxIndex = (currentLightboxIndex + 1) % filteredArtworks.length;
  updateLightboxContent();
}

function prevLightboxItem() {
  currentLightboxIndex = (currentLightboxIndex - 1 + filteredArtworks.length) % filteredArtworks.length;
  updateLightboxContent();
}

// ==========================================================================
// Studio Modal ("Upload / Edit")
// ==========================================================================
function openStudio() {
  if (!isAdminLoggedIn) {
    openLogin();
    return;
  }
  studioModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeStudio() {
  studioModal.classList.remove('active');
  document.body.style.overflow = '';
  resetStudioForm();
}

function resetStudioForm() {
  studioForm.reset();
  editArtIdInput.value = '';
  uploadedImageBase64 = null;
  previewBox.style.display = 'none';
  artDropzone.style.display = 'block';
  studioModalTitle.textContent = 'INSERT NEW ARTWORK';
  document.getElementById('submit-art-btn').innerHTML = `<span>Publish Artwork</span>`;
}

function setupDragAndDrop() {
  if (!artDropzone || !artFileInput) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    artDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      artDropzone.style.borderColor = '#ffffff';
      artDropzone.style.background = 'rgba(255, 255, 255, 0.05)';
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    artDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      artDropzone.style.borderColor = 'var(--border-medium)';
      artDropzone.style.background = 'rgba(10, 11, 14, 0.5)';
    });
  });

  artDropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      handleFileSelected(files[0]);
    }
  });

  artFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  });

  if (removePreviewBtn) {
    removePreviewBtn.addEventListener('click', (e) => {
      e.preventDefault();
      uploadedImageBase64 = null;
      artFileInput.value = '';
      previewBox.style.display = 'none';
      artDropzone.style.display = 'block';
    });
  }
}

function handleFileSelected(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file (JPG, PNG, WebP).');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedImageBase64 = event.target.result;
    previewImg.src = uploadedImageBase64;
    previewBox.style.display = 'block';
    artDropzone.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

// ==========================================================================
// Event Listeners
// ==========================================================================
function setupEventListeners() {
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      applyFilter(btn.getAttribute('data-filter'));
    });
  });

  if (openLoginBtn) openLoginBtn.addEventListener('click', openLogin);
  if (closeLoginBtn) closeLoginBtn.addEventListener('click', closeLogin);

  if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', () => {
      closeLogin();
      setAdminState(true, true);
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredPass = document.getElementById('login-passcode').value;
      const savedPass = localStorage.getItem('eleni_studio_passcode') || DEFAULT_PASSCODE;

      if (enteredPass === savedPass) {
        closeLogin();
        setAdminState(true, true);
        document.getElementById('login-passcode').value = '';
      } else {
        alert('Access denied: Invalid passcode. Default is "eleni2026".');
      }
    });
  }

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      setAdminState(false, true);
    });
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', prevLightboxItem);
  if (lightboxNext) lightboxNext.addEventListener('click', nextLightboxItem);

  window.addEventListener('keydown', (e) => {
    if (lightboxModal && lightboxModal.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextLightboxItem();
      if (e.key === 'ArrowLeft') prevLightboxItem();
    }
    if (studioModal && studioModal.classList.contains('active')) {
      if (e.key === 'Escape') closeStudio();
    }
    if (loginModal && loginModal.classList.contains('active')) {
      if (e.key === 'Escape') closeLogin();
    }
    if (heroImageModal && heroImageModal.classList.contains('active')) {
      if (e.key === 'Escape') closeHeroImageModal();
    }
  });

  if (openStudioBtn) openStudioBtn.addEventListener('click', openStudio);
  if (closeStudioBtn) closeStudioBtn.addEventListener('click', closeStudio);

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal || e.target.classList.contains('lightbox-body')) {
        closeLightbox();
      }
    });
  }
  if (studioModal) {
    studioModal.addEventListener('click', (e) => {
      if (e.target === studioModal) closeStudio();
    });
  }
  if (loginModal) {
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) closeLogin();
    });
  }
  if (heroImageModal) {
    heroImageModal.addEventListener('click', (e) => {
      if (e.target === heroImageModal) closeHeroImageModal();
    });
  }

  if (studioForm) {
    studioForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const editingId = editArtIdInput.value;
      const title = document.getElementById('art-title').value.trim();
      const category = document.getElementById('art-category').value;
      const medium = document.getElementById('art-medium').value.trim();
      const year = document.getElementById('art-year').value.trim() || '2026';
      const dimensions = document.getElementById('art-dimensions').value.trim();
      const description = document.getElementById('art-desc').value.trim();
      const rawUrl = document.getElementById('art-url').value.trim();
      const parsedUrl = parseImageUrl(rawUrl);

      const imageSrc = uploadedImageBase64 || parsedUrl;

      if (!imageSrc) {
        alert('Please attach an image file or provide a valid URL.');
        return;
      }

      const categoryLabels = {
        digital: 'Mythic & Digital',
        traditional: 'Oils & Graphite',
        photography: '35mm Film'
      };

      if (editingId) {
        const index = artworks.findIndex(a => a.id === editingId);
        if (index !== -1) {
          artworks[index] = {
            ...artworks[index],
            title: title || 'Untitled Work',
            category: category,
            categoryLabel: categoryLabels[category] || category,
            medium: medium || 'Mixed Media',
            year: year,
            dimensions: dimensions,
            description: description,
            image: imageSrc
          };
          showToast(`"${artworks[index].title}" updated.`);
        }
      } else {
        const newArtwork = {
          id: 'art-' + Date.now(),
          title: title || 'Untitled Work',
          category: category,
          categoryLabel: categoryLabels[category] || category,
          medium: medium || 'Mixed Media',
          year: year,
          dimensions: dimensions,
          description: description,
          image: imageSrc,
          aspectRatio: 'wide',
          isCustom: true
        };
        artworks.unshift(newArtwork);
        showToast(`"${newArtwork.title}" published to collection.`);
      }

      saveArtworks();
      applyFilter(currentFilter);
      closeStudio();
    });
  }

  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', () => {
      const dataStr = "const DEFAULT_ARTWORKS = " + JSON.stringify(artworks, null, 2) + ";";
      navigator.clipboard.writeText(dataStr).then(() => {
        showToast('Artworks JSON copied to clipboard.');
      }).catch(() => {
        showToast('Artworks logged to console.');
        console.log(dataStr);
      });
    });
  }

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const senderName = document.getElementById('contact-name').value;
      contactForm.reset();
      showToast(`Message sent. Thank you, ${senderName}.`);
    });
  }
}

// ==========================================================================
// Utilities
// ==========================================================================
function showToast(message) {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
