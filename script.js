// Case formatting functions
function formatTitleCase(text) {
  // Split into words and handle special cases
  return text.toLowerCase().split(' ').map((word, index) => {
    // Skip capitalizing certain words unless they're the first word
    const skipWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'in', 'of'];
    if (index !== 0 && skipWords.includes(word)) {
      return word;
    }
    // Capitalize the first letter of each word
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

function formatAuthorName(name) {
  // Handle different author name formats
  const parts = name.split(',');
  if (parts.length > 1) {
    // Format: "Last, First"
    const lastName = parts[0].trim();
    const firstName = parts[1].trim();
    return `${lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase()}, ${firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()}`;
  } else {
    // Format: "First Last"
    return name.split(' ').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    ).join(' ');
  }
}

function formatPublisher(publisher) {
  // Capitalize first letter of each word in publisher name
  return publisher.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

// Handle citation style navigation
document.querySelectorAll('.style-btn').forEach(button => {
  button.addEventListener('click', () => {
    // Remove active class from all buttons and fields
    document.querySelectorAll('.style-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.citation-fields').forEach(field => field.classList.remove('active'));
    
    // Add active class to clicked button and corresponding fields
    button.classList.add('active');
    const style = button.getAttribute('data-style');
    document.getElementById(`${style}-fields`).classList.add('active');
  });
});

function generateCitation() {
  const activeStyle = document.querySelector('.style-btn.active').getAttribute('data-style');
  let citation = '';

  switch (activeStyle) {
    case 'apa':
      const author = formatAuthorName(document.getElementById('author').value.trim());
      const year = document.getElementById('year').value.trim();
      const title = formatTitleCase(document.getElementById('title').value.trim());
      const publisher = formatPublisher(document.getElementById('publisher').value.trim());

      if (!author || !year || !title || !publisher) {
        showError('Please fill out all fields.');
        return;
      }

      citation = `${author} (${year}). <em>${title}</em>. ${publisher}.`;
      break;

    case 'mla':
      const mlaAuthor = formatAuthorName(document.getElementById('mla-author').value.trim());
      const mlaTitle = formatTitleCase(document.getElementById('mla-title').value.trim());
      const mlaPublisher = formatPublisher(document.getElementById('mla-publisher').value.trim());
      const mlaYear = document.getElementById('mla-year').value.trim();

      if (!mlaAuthor || !mlaTitle || !mlaPublisher || !mlaYear) {
        showError('Please fill out all fields.');
        return;
      }

      citation = `${mlaAuthor}. <em>${mlaTitle}</em>. ${mlaPublisher}, ${mlaYear}.`;
      break;

    case 'chicago':
      const chicagoAuthor = formatAuthorName(document.getElementById('chicago-author').value.trim());
      const chicagoTitle = formatTitleCase(document.getElementById('chicago-title').value.trim());
      const chicagoPublisher = formatPublisher(document.getElementById('chicago-publisher').value.trim());
      const chicagoYear = document.getElementById('chicago-year').value.trim();
      const chicagoCity = formatTitleCase(document.getElementById('chicago-city').value.trim());

      if (!chicagoAuthor || !chicagoTitle || !chicagoPublisher || !chicagoYear || !chicagoCity) {
        showError('Please fill out all fields.');
        return;
      }

      citation = `${chicagoAuthor}. <em>${chicagoTitle}</em>. ${chicagoCity}: ${chicagoPublisher}, ${chicagoYear}.`;
      break;
  }

  document.getElementById('citationOutput').innerHTML = `
    <strong>Formatted ${activeStyle.toUpperCase()} Citation:</strong><br><br>
    <span class="citation">${citation}</span>
  `;
}

function showError(message) {
  document.getElementById('citationOutput').innerHTML = `<span style="color: red;">${message}</span>`;
}
 