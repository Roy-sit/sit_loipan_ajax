(() => {
  // Variables
  const hotspots = document.querySelectorAll(".Hotspot");
  const spinnerContainer = document.createElement("div");
  const errorMessage = document.createElement("div");
  let isInteractingWithModel = false;




  // Spinner
  spinnerContainer.innerHTML = `
    <svg class="spinner" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
      <circle class="spinner-circle" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
    </svg>
  `;

  Object.assign(spinnerContainer.style, {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    zIndex: "1000",
  });

  // Error message setup
  errorMessage.textContent = "Hotspot data is missing or unavailable.";
  Object.assign(errorMessage.style, {
    position: "fixed",
    bottom: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#ff6c00",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    zIndex: "1001",
    display: "none",
  });
  document.body.appendChild(errorMessage);

  // Show spinner
  function showSpinner() {
    document.body.appendChild(spinnerContainer);
  }

  // Hide spinner
  function hideSpinner() {
    if (spinnerContainer.parentElement) {
      spinnerContainer.remove();
    }
  }




  // Display error message
  function displayErrorMessage(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";

    setTimeout(() => {
      errorMessage.style.display = "none";
    }, 5000);
  }




  // Load hotspot info from JSON
  function loadInfoBoxes() {
    showSpinner(); // Show spinner at the beginning of the fetch
    fetch("info.json")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then((infoBoxes) => {
        infoBoxes.forEach((infoBox) => {
          const selected = document.querySelector(`#${infoBox.id}`);
          if (selected) {
            const titleElement = document.createElement("h2");
            titleElement.textContent = infoBox.title;

            const textElement = document.createElement("p");
            textElement.textContent = infoBox.text;

            const imageElement = document.createElement("img");
            imageElement.src = infoBox.image;
            imageElement.alt = infoBox.title; 
            imageElement.style.width = "100%"; 

            selected.appendChild(imageElement);
            selected.appendChild(titleElement);
            selected.appendChild(textElement);
          }
        });
      })
      .catch((error) => {
        console.error("Error fetching info.json:", error);
        displayErrorMessage("Failed to load hotspot information. Please try again later.");
      })
      .finally(() => {
        hideSpinner(); 
      });
  }

  loadInfoBoxes();

  // Toggle hotspot info visibility
  function toggleHotspotInfo(event) {
    const selected = event.currentTarget;
    const annotation = selected.querySelector(".HotspotAnnotation");
    if (!annotation) {
      displayErrorMessage(`Hotspot "${selected.id || "unknown"}" data is missing or unavailable.`);
      return;
    }
    annotation.style.visibility = annotation.style.visibility === "visible" ? "hidden" : "visible";
  }

  hotspots.forEach((hotspot) => {
    hotspot.addEventListener("click", toggleHotspotInfo);
  });

  // Ignore clicks inside <model-viewer>
  const modelViewer = document.querySelector("model-viewer");
  modelViewer.addEventListener("mousedown", () => {
    isInteractingWithModel = true;
  });
  modelViewer.addEventListener("mouseup", () => {
    setTimeout(() => (isInteractingWithModel = false), 50); 
  });

  document.body.addEventListener("click", (event) => {
    if (
      isInteractingWithModel || 
      event.target.closest(".Hotspot") // Ignore if clicking a valid hotspot
    ) {
      return;
    }

    // Show error message when clicking invalid areas
    displayErrorMessage("You are in a non-existent area.");
  });



  
  // Load material list from JSON
  function loadMaterialList() {
    showSpinner(); 
    fetch("https://swiftpixel.com/earbud/api/materials") 
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then((materials) => {
        const materialList = document.querySelector("#material-list");
        const materialTemplate = document.querySelector("#material-template");

        materials.forEach((material) => {
          const clone = materialTemplate.content.cloneNode(true);
          const titleElement = clone.querySelector(".material-heading");
          const descriptionElement = clone.querySelector(".material-description");

          // Populate the template with data
          titleElement.textContent = material.name;
          descriptionElement.textContent = material.description;

          // Append to the material list
          materialList.appendChild(clone);
        });
      })
      .catch((error) => {
        console.error("Error fetching materials.json:", error);
        displayErrorMessage("Failed to load material information. Please try again later.");
      })
      .finally(() => {
        hideSpinner();
      });
  }

  loadMaterialList();

})();