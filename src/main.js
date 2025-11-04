

const filterBtn = document.getElementById("filter-btn");
const filterPopup = document.getElementById("filter-popup");

filterBtn.addEventListener("click", () => {
  filterPopup.classList.toggle("hidden");
});

document.addEventListener("click", (e) => {
  if (!filterPopup.contains(e.target) && !filterBtn.contains(e.target)) {
    filterPopup.classList.add("hidden");
  }
});

filterPopup.querySelectorAll("button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const filterType = btn.getAttribute("data-filter");
    console.log("Filter selected:", filterType);

    switch (filterType) {
      case "recent":
        break;
      case "oldest":
        break;
      case "az":
        break;
      case "za":
        break;
    }

    filterPopup.classList.add("hidden");
  });
});


// THE STUFF BELOW IS STRICTLY FOR UPLOADING PHOTOS

const TARGET_WIDTH = 480;
const TARGET_HEIGHT = 320; 

const fileInput = document.getElementById('fileInput');
const uploadedFilesContainer = document.getElementById('uploadedFilesContainer');


/**
 * Resizes an image Data URL to a fixed target size (800x600) using the Canvas API.
 */
function resizeImage(dataUrl, width, height) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            
            
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            
            
            ctx.drawImage(img, 0, 0, width, height);

            
            const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            resolve(resizedDataUrl);
        };
        img.src = dataUrl; 
    });
}


fileInput.addEventListener('change', (event) => {
    const files = event.target.files;

    if (files.length > 0) {
  
        for (const file of files) {
            
            const reader = new FileReader();

            reader.onload = async (e) => { 
                const originalDataURL = e.target.result;
                const fileType = file.type.split('/')[0];
                const filePreviewItem = document.createElement('div');
                filePreviewItem.className = 'file-preview-item'; 
                
                let contentElement = null; 

                if (fileType === 'image') {
                    // 1. Resize the image (wait for the result)
                    const resizedDataURL = await resizeImage(
                        originalDataURL, 
                        TARGET_WIDTH, 
                        TARGET_HEIGHT
                    );

                    // 2. Build the image element
                    const imgElement = document.createElement('img');
                    imgElement.src = resizedDataURL; 
                    imgElement.alt = "Uploaded Image"; 
                    contentElement = imgElement; // The image element is the content
                    
                } else if (file.type === 'text/plain') {
                    // Handle plain text files
                    const textContentDiv = document.createElement('div');
                    textContentDiv.className = 'file-content-display';
                    textContentDiv.innerHTML = `<pre>${e.target.result}</pre>`;
                    contentElement = textContentDiv; // The text div is the content

                } else {
                    // Handle all other file types (PDF, etc.)
                    const otherInfoDiv = document.createElement('div');
                    otherInfoDiv.className = 'file-info'; // Reuse file-info class for minimal styling
                    otherInfoDiv.innerHTML = `<p>File preview not available (Type: ${file.type})</p>`;
                    contentElement = otherInfoDiv;
                }
                
                // 3. Append the content element to the item container
                if (contentElement) {
                    filePreviewItem.appendChild(contentElement);
                }

                // 4. PREPEND the fully constructed file preview to the top of the container
                uploadedFilesContainer.prepend(filePreviewItem);
            };

            // Start reading the file
            if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                reader.readAsDataURL(file); 
            } else if (file.type === 'text/plain') {
                reader.readAsText(file); 
            } else {
                reader.readAsDataURL(file); // Default for other file types
            }
        }
    } 
});
// THE STUFF ABOVE IS STRICTLY FOR UPLOADING PHOTOS
