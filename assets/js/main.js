const tabsContainer = document.querySelector("[role=tablist]");
const tabButtons = tabsContainer.querySelectorAll("[role=tab]");
const tabPanels = document.querySelectorAll("[role=tabpanel]");

// Handle clicks on tabs
tabsContainer.addEventListener("click", (e) => {
  const clickedTab = e.target.closest("button");
  const currentTab = tabsContainer.querySelector('[aria-selected="true"]');

  if (!clickedTab || clickedTab === currentTab) return; // Ignore if the clicked tab is already active

  switchTab(clickedTab);
});

// Handle keyboard navigation (Arrow keys, Home, End)
tabsContainer.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowLeft":
      moveLeft();
      break;
    case "ArrowRight":
      moveRight();
      break;
    case "Home":
      e.preventDefault();
      switchTab(tabButtons[0]);
      break;
    case "End":
      e.preventDefault();
      switchTab(tabButtons[tabButtons.length - 1]);
      break;
  }
});

// Move focus to the previous tab (ArrowLeft)
function moveLeft() {
  const currentTab = document.activeElement;
  if (!currentTab.previousElementSibling) {
    tabButtons.item(tabButtons.length - 1).focus();
  } else {
    currentTab.previousElementSibling.focus();
  }
}

// Move focus to the next tab (ArrowRight)
function moveRight() {
  const currentTab = document.activeElement;
  if (!currentTab.nextElementSibling) {
    tabButtons.item(0).focus();
  } else {
    currentTab.nextElementSibling.focus();
  }
}

// Switch tabs and load respective panel content
function switchTab(newTab) {
  const oldTab = tabsContainer.querySelector('[aria-selected="true"]');
  const activePanelId = newTab.getAttribute("aria-controls");
  const activePanel = document.getElementById(activePanelId);

  if (!activePanel) {
    console.error(`Panel with ID ${activePanelId} not found`);
    return;
  }

  // Hide all panels
  tabPanels.forEach((panel) => {
    panel.setAttribute("hidden", true);
  });

  // Show the active panel
  activePanel.removeAttribute("hidden");

  // Set the correct tab states (aria-selected, tabindex)
  tabButtons.forEach((button) => {
    button.setAttribute("aria-selected", false);
    button.setAttribute("tabindex", "-1");
  });

  newTab.setAttribute("aria-selected", true);
  newTab.setAttribute("tabindex", "0");

  moveIndicator(oldTab, newTab);

  // Load external content if needed (AJAX)
  const contentUrl = newTab.getAttribute("data-url");
  if (contentUrl) {
    loadContent(contentUrl, activePanel);
  } else {
    console.error(`No data-url found for tab ${newTab.id}`);
    activePanel.innerHTML =
      "<p>Error: No content URL specified for this tab.</p>";
  }

  // Hide mobile nav after tab click if small-screen-nav is active
  if (tabsContainer.classList.contains("small-screen-nav")) {
    tabsContainer.classList.remove("small-screen-nav");
    tabsContainer.classList.add("navigate");
  }
}

// Load external content into a tab panel via AJAX
function loadContent(url, panel) {
  if (!url) {
    console.error("No URL provided for content loading");
    panel.innerHTML = "<p>Error: No content URL provided.</p>";
    return;
  }

  $.ajax({
    url: url,
    method: "GET",
    success: function (data) {
      panel.innerHTML = data; // Update the panel's content
      console.log(`Loaded content from ${url}`);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error(
        `Failed to load content from ${url}: ${textStatus} - ${errorThrown}`
      );
      panel.innerHTML = `<p>Error loading content from ${url}. Please try again.</p>`;
    },
  });
}

// Move the indicator (underline) between tabs
function moveIndicator(oldTab, newTab) {
  const newTabPosition = oldTab.compareDocumentPosition(newTab);
  const newTabWidth = newTab.offsetWidth / tabsContainer.offsetWidth;
  let transitionWidth;

  // Determine the direction of the transition (left or right)
  if (newTabPosition === 4) {
    // New tab is to the right
    transitionWidth =
      newTab.offsetLeft + newTab.offsetWidth - oldTab.offsetLeft;
  } else {
    // New tab is to the left
    transitionWidth =
      oldTab.offsetLeft + oldTab.offsetWidth - newTab.offsetLeft;
    tabsContainer.style.setProperty("--_left", newTab.offsetLeft + "px");
  }

  tabsContainer.style.setProperty(
    "--_width",
    transitionWidth / tabsContainer.offsetWidth
  );

  // Final transition adjustment
  setTimeout(() => {
    tabsContainer.style.setProperty("--_left", newTab.offsetLeft + "px");
    tabsContainer.style.setProperty("--_width", newTabWidth);
  }, 220);
}

// Initialize the home tab to be active and load content for it by default
document.addEventListener("DOMContentLoaded", () => {
  const firstTab = tabButtons[0];
  if (firstTab) {
    switchTab(firstTab); // Set the first tab as active by default
  } else {
    console.error("No tab buttons found");
  }
});

/* Floating Navigation */
const top_nav = document.querySelector(".top_lvl_header");

window.onscroll = function () {
  nav_manipulator();
};

function nav_manipulator() {
  if (document.body.scrollTop > 10 || document.documentElement.scrollTop > 10) {
    tabsContainer.classList.add("float-nav");
    tabsContainer.classList.remove("navigate");
    tabsContainer.classList.remove("small-screen-nav");
  } else {
    tabsContainer.classList.remove("float-nav");
    tabsContainer.classList.add("navigate");
  }
}

/* Menu Control for Small Screens */
const navButton = document.querySelector(".toggle-menu");
navButton.addEventListener("click", () => {
  tabsContainer.classList.add("small-screen-nav");
  tabsContainer.classList.remove("navigate");
  tabsContainer.classList.remove("float-nav");
});

/* Theme Control */
document.querySelector(".logo").addEventListener("click", () => {
  const colorPicker = document.querySelector(".color-picker");
  const inputs = colorPicker.querySelectorAll("input");
  const isVisible = colorPicker.style.visibility === "visible";

  if (isVisible) {
    // Hide the palette with reverse animation
    inputs.forEach((input, index) => {
      setTimeout(() => {
        input.style.opacity = 0;
        input.style.transform = `translate(0)`; // Move to original position
      }, index * 50); // Stagger the animations
    });
    setTimeout(() => {
      colorPicker.style.visibility = "hidden";
    }, inputs.length * 50); // Ensure visibility is set to hidden after animation
  } else {
    colorPicker.style.visibility = "visible";
    // Show the palette with forward animation
    inputs.forEach((input, index) => {
      setTimeout(() => {
        input.style.opacity = 1;
        const angle = index / (inputs.length - 1); // Calculate angle for arch
        const radius = 100; // Radius of the arch
        const x = radius * Math.cos(angle);
        input.style.transform = `translate(${x}px)`;
      }, index * 50); // Stagger the animations
    });
  }
});

/* Theme Persistence */
const colorThemes = document.querySelectorAll('[name="theme"]');
// Store theme
const storeTheme = function (theme) {
  localStorage.setItem("theme", theme);
};

// Set theme when visitor returns
const setTheme = function () {
  const activeTheme = localStorage.getItem("theme");
  colorThemes.forEach((themeOption) => {
    if (themeOption.id === activeTheme) {
      themeOption.checked = true;
    }
  });
  // Fallback for no :has() support
  document.documentElement.className = activeTheme || "light"; // Default to light theme
};

colorThemes.forEach((themeOption) => {
  themeOption.addEventListener("click", () => {
    storeTheme(themeOption.id);
    document.documentElement.className = themeOption.id;
  });
});

document.addEventListener("DOMContentLoaded", setTheme);

/* Card Hover Effects */
document.getElementById("cards")?.addEventListener("mousemove", (e) => {
  for (const card of document.getElementsByClassName("card")) {
    const rect = card.getBoundingClientRect(),
      x = e.clientX - rect.left,
      y = e.clientY - rect.top;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  }
});

/* Mini Image Round */
const images = document.querySelectorAll(".project-img");
document.querySelector(".mini-image")?.addEventListener("click", function () {
  images.forEach((img) => {
    if (img.style.visibility === "visible") {
      img.style.visibility = "hidden";
      img.style.transform = `translate(${this.offsetLeft - img.offsetLeft}px, ${
        this.offsetTop - img.offsetTop
      }px) scale(0.1)`;
    } else {
      img.style.visibility = "visible";
      img.style.transform = `translate(${img.offsetLeft - this.offsetLeft}px, ${
        img.offsetTop - this.offsetTop
      }px) scale(0.1)`;
      setTimeout(() => {
        img.style.transform = "";
      }, 100);
    }
  });
});

// Remove images on hover
document.querySelector(".main-img")?.addEventListener("mouseover", () => {
  images.forEach((img) => {
    img.style.visibility = "hidden";
    img.style.transition = "all .2s ease";
  });
});

/* Scroll to Top */
const scrollToTopButton = document.getElementById("scrollToTop");
scrollToTopButton.addEventListener("click", function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

/* Service Step Design */
const steps = document.querySelectorAll(".process-step");
const descriptions = document.querySelectorAll(".step-description");

// Show the description for the first step by default
if (descriptions[0]) descriptions[0].style.display = "block";
if (steps[0]) steps[0].classList.add("active");

steps.forEach((step) => {
  step.addEventListener("click", () => {
    const stepId = step.getAttribute("data-step");
    const description = document.getElementById(stepId);

    if (!description) {
      console.error(`Description with ID ${stepId} not found`);
      return;
    }

    // Hide all descriptions
    descriptions.forEach((desc) => {
      desc.style.display = "none";
    });

    // Show the clicked step's description
    description.style.display = "block";

    // Remove active class from all steps
    steps.forEach((s) => s.classList.remove("active"));

    // Add active class to the clicked step
    step.classList.add("active");
  });
});

/* Tools Scroll Functionality */
const imgParent = document.querySelector("#work .wrapper.tools .img-parent");
if (imgParent) {
  let isDragging = false;
  let startX, scrollLeft;

  imgParent.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.pageX - imgParent.offsetLeft;
    scrollLeft = imgParent.scrollLeft;
    imgParent.style.cursor = "grabbing";
  });

  imgParent.addEventListener("mouseleave", () => {
    isDragging = false;
    imgParent.style.cursor = "grab";
  });

  imgParent.addEventListener("mouseup", () => {
    isDragging = false;
    imgParent.style.cursor = "grab";
  });

  imgParent.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - imgParent.offsetLeft;
    const walk = (x - startX) * 2; // Adjust drag speed
    imgParent.scrollLeft = scrollLeft - walk;
  });

  // Touch events for mobile
  imgParent.addEventListener("touchstart", (e) => {
    isDragging = true;
    startX = e.touches[0].pageX - imgParent.offsetLeft;
    scrollLeft = imgParent.scrollLeft;
  });

  imgParent.addEventListener("touchend", () => {
    isDragging = false;
  });

  imgParent.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.touches[0].pageX - imgParent.offsetLeft;
    const walk = (x - startX) * 2;
    imgParent.scrollLeft = scrollLeft - walk;
  });
}
