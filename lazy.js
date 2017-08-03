// Get all of the images that are marked up to lazy load
const images = document.querySelectorAll('.js-lazy-image');
const config = {
  // If the image gets within 50px in the Y axis, start the download.
  rootMargin: '50px 0px',
  threshold: 0.01
};

let imageCount = images.length;
let observer;

// If we don't have support for intersection observer, loads the images immediately
if (!('IntersectionObserver' in window)) {
  Array.from(images).forEach(image => preloadImage(image));
} else {
  // It is supported, load the images
  observer = new IntersectionObserver(onIntersection, config);
  images.forEach(image => {
    if (image.classList.contains('js-lazy-image--handled')) {
      return;
    }

    observer.observe(image);
  });
}

/**
 * Fetchs the image for the given URL
 * @param {string} url 
 */
function fetchImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = resolve;
    image.onerror = reject;
  });
}

/**
 * Preloads the image
 * @param {object} image 
 */
function preloadImage(image) {
  const src = image.dataset.src;
  if (!src) {
    return;
  }

  return fetchImage(src).then(() => { applyImage(image, src) });
}

/**
 * Load all of the images immediately
 * @param {array} images 
 */
function loadImagesImmediately(images) {
  Array.from(images).forEach(image => preloadImage(image));
}

/**
 * Disconnect the observer
 */
function disconnect() {
  if (!observer) {
    return;
  }

  observer.disconnect();
}

/**
 * On intersection
 * @param {array} entries 
 */
function onIntersection(entries) {
  // Disconnect if we've already loaded all of the images
  if (imageCount === 0) {
    observer.disconnect();
  }

  // Loop through the entries
  entries.forEach(entry => {
    // Are we in viewport?
    if (entry.intersectionRatio > 0) {
      imageCount--;

      // Stop watching and load the image
      observer.unobserve(entry.target);
      preloadImage(entry.target);
    }
  });
}

/**
 * Apply the image
 * @param {object} img 
 * @param {string} src 
 */
function applyImage(img, src) {
  const el = img.querySelector('.js-lazy-image-content');
  if (!el) {
    return;
  }

  // Prevent this from being lazy loaded a second time.
  img.classList.add('js-lazy-image--handled');
  el.style.backgroundImage = `url(${src})`;
  el.classList.add('fade-in');
}