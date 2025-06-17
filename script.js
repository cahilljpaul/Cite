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

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
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

// Handle source type changes
function updateFormFields() {
  const sourceType = document.getElementById('sourceType').value;
  const activeStyle = document.querySelector('.style-btn.active').getAttribute('data-style');
  const fieldsContainer = document.getElementById(`${activeStyle}-fields`);

  // Hide all field groups
  fieldsContainer.querySelectorAll('.book-fields, .journal-fields, .webpage-fields, .newspaper-fields, .image-fields, .social-fields, .video-fields, .podcast-fields').forEach(group => {
    group.style.display = 'none';
  });

  // Show relevant field group
  const relevantFields = fieldsContainer.querySelector(`.${sourceType}-fields`);
  if (relevantFields) {
    relevantFields.style.display = 'block';
  }
}

// Handle multiple authors
function addAuthorField(style) {
  const authorsContainer = document.getElementById(`${style}-authors`);
  const authorCount = authorsContainer.children.length;
  
  if (authorCount >= 10) {
    showError('Maximum of 10 authors allowed.');
    return;
  }

  const authorField = document.createElement('div');
  authorField.className = 'author-field';
  authorField.innerHTML = `
    <label for="${style}-author-${authorCount + 1}">Author ${authorCount + 1}</label>
    <input type="text" id="${style}-author-${authorCount + 1}" placeholder="e.g., ${style === 'harvard' ? 'Smith, J.' : 'Smith, John'}">
    ${authorCount > 0 ? '<button type="button" class="remove-author" onclick="removeAuthorField(this)">×</button>' : ''}
  `;
  
  authorsContainer.appendChild(authorField);
}

function removeAuthorField(button) {
  button.parentElement.remove();
  // Renumber remaining authors
  const authorsContainer = button.closest('.authors-section');
  const authorFields = authorsContainer.querySelectorAll('.author-field');
  authorFields.forEach((field, index) => {
    const label = field.querySelector('label');
    const input = field.querySelector('input');
    label.textContent = `Author ${index + 1}`;
    input.id = input.id.replace(/\d+$/, index + 1);
  });
}

function getAuthors(style) {
  const authorsContainer = document.getElementById(`${style}-authors`);
  const authorInputs = authorsContainer.querySelectorAll('input');
  const authors = Array.from(authorInputs).map(input => formatAuthorName(input.value.trim())).filter(author => author);
  
  if (authors.length === 0) return null;
  
  // Format authors based on count
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
  if (authors.length === 3) return `${authors[0]}, ${authors[1]}, and ${authors[2]}`;
  return `${authors[0]} et al.`;
}

// Reference List Management
let referenceList = [];

function addToReferenceList() {
  const citation = document.querySelector('.citation').textContent;
  const style = document.querySelector('.style-btn.active').getAttribute('data-style');
  const sourceType = document.getElementById('sourceType').value;
  
  referenceList.push({
    citation,
    style,
    sourceType,
    timestamp: new Date().toISOString()
  });
  
  updateReferenceList();
  showSuccess('Citation added to reference list');
}

function removeFromReferenceList(index) {
  referenceList.splice(index, 1);
  updateReferenceList();
}

function updateReferenceList() {
  const container = document.getElementById('referenceItems');
  container.innerHTML = '';
  
  referenceList.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'reference-item';
    div.innerHTML = `
      <div class="reference-content">
        <span class="citation">${item.citation}</span>
        <div class="reference-actions">
          <button onclick="copyReference(${index})" class="action-btn" title="Copy citation">
            <i class="fas fa-copy"></i>
          </button>
          <button onclick="editReference(${index})" class="action-btn" title="Edit citation">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="removeFromReferenceList(${index})" class="action-btn" title="Remove citation">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="reference-meta">
        <span class="style-badge">${item.style.toUpperCase()}</span>
        <span class="type-badge">${item.sourceType}</span>
      </div>
    `;
    container.appendChild(div);
  });
}

function copyReference(index) {
  const citation = referenceList[index].citation;
  navigator.clipboard.writeText(citation).then(() => {
    showSuccess('Citation copied to clipboard!');
  }).catch(err => {
    showError('Failed to copy citation. Please try again.');
  });
}

function editReference(index) {
  const item = referenceList[index];
  // Set the form to match the citation's style and source type
  document.querySelector(`.style-btn[data-style="${item.style}"]`).click();
  document.getElementById('sourceType').value = item.sourceType;
  updateFormFields();
  
  // TODO: Implement form field population based on the citation
  // This would require parsing the citation and setting the form fields accordingly
  
  showSuccess('Edit mode activated. Please update the citation details.');
}

function exportReferences(format) {
  let content = '';
  const timestamp = new Date().toISOString().split('T')[0];
  
  if (format === 'text') {
    content = referenceList.map(item => item.citation).join('\n\n');
    downloadFile(content, `references_${timestamp}.txt`, 'text/plain');
  } else if (format === 'html') {
    content = `
      <html>
        <head>
          <title>Reference List</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; }
            .citation { margin-bottom: 20px; }
            .meta { color: #666; font-size: 0.9em; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <h1>Reference List</h1>
          ${referenceList.map(item => `
            <div class="citation">
              <div class="meta">${item.style.toUpperCase()} - ${item.sourceType}</div>
              ${item.citation}
            </div>
          `).join('')}
        </body>
      </html>
    `;
    downloadFile(content, `references_${timestamp}.html`, 'text/html');
  } else if (format === 'bibtex') {
    content = referenceList.map(item => generateBibTeX(item)).join('\n\n');
    downloadFile(content, `references_${timestamp}.bib`, 'text/plain');
  }
}

function generateBibTeX(item) {
  const key = `${item.sourceType}_${Date.now()}`;
  let entry = `@${item.sourceType}{${key},\n`;
  
  // Add common fields
  entry += `  author = {${item.citation.split('.')[0]}},\n`;
  
  // Add type-specific fields
  switch (item.sourceType) {
    case 'book':
      entry += `  title = {${item.citation.split('.').slice(1, -2).join('.')}},\n`;
      entry += `  year = {${item.citation.match(/\d{4}/)[0]}},\n`;
      break;
    case 'journal':
      // Add journal-specific fields
      break;
    // Add other source types
  }
  
  entry += '}';
  return entry;
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function clearReferenceList() {
  if (confirm('Are you sure you want to clear the reference list?')) {
    referenceList = [];
    updateReferenceList();
  }
}

function showSuccess(message) {
  const output = document.getElementById('citationOutput');
  output.innerHTML = `<span style="color: green;">${message}</span>`;
  setTimeout(() => {
    output.innerHTML = '';
  }, 3000);
}

function generateCitation() {
  const activeStyle = document.querySelector('.style-btn.active').getAttribute('data-style');
  const sourceType = document.getElementById('sourceType').value;
  let citation = '';

  const authors = getAuthors(activeStyle);
  if (!authors) {
    showError('Please enter at least one author.');
    return;
  }

  switch (activeStyle) {
    case 'apa':
      if (sourceType === 'book') {
        const year = document.getElementById('year').value.trim();
        const title = formatTitleCase(document.getElementById('title').value.trim());
        const publisher = formatPublisher(document.getElementById('publisher').value.trim());

        if (!year || !title || !publisher) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${authors} (${year}). <em>${title}</em>. ${publisher}.`;
      } else if (sourceType === 'journal') {
        const year = document.getElementById('year').value.trim();
        const title = formatTitleCase(document.getElementById('title').value.trim());
        const journalTitle = formatTitleCase(document.getElementById('journal-title').value.trim());
        const volume = document.getElementById('volume').value.trim();
        const issue = document.getElementById('issue').value.trim();
        const pages = document.getElementById('pages').value.trim();
        const doi = document.getElementById('doi').value.trim();

        if (!year || !title || !journalTitle || !volume || !pages) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${authors} (${year}). ${title}. <em>${journalTitle}</em>, ${volume}${issue ? `(${issue})` : ''}, ${pages}.${doi ? ` https://doi.org/${doi}` : ''}`;
      } else if (sourceType === 'newspaper') {
        const year = document.getElementById('year').value.trim();
        const title = formatTitleCase(document.getElementById('article-title').value.trim());
        const newspaperTitle = formatTitleCase(document.getElementById('newspaper-title').value.trim());
        const date = document.getElementById('publication-date').value;
        const pages = document.getElementById('newspaper-pages').value.trim();
        const url = document.getElementById('newspaper-url').value.trim();

        if (!year || !title || !newspaperTitle || !date) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${authors} (${year}, ${formatDate(date)}). ${title}. <em>${newspaperTitle}</em>${pages ? `, ${pages}` : ''}.${url ? ` Retrieved from ${url}` : ''}`;
      } else if (sourceType === 'image') {
        const title = formatTitleCase(document.getElementById('image-title').value.trim());
        const platform = formatTitleCase(document.getElementById('image-platform').value.trim());
        const url = document.getElementById('image-url').value.trim();
        const date = document.getElementById('image-date').value;

        if (!title || !platform || !url || !date) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${authors} (${formatDate(date)}). <em>${title}</em> [Image]. ${platform}. ${url}`;
      } else if (sourceType === 'webpage') {
        const title = formatTitleCase(document.getElementById('webpage-title').value.trim());
        const website = formatTitleCase(document.getElementById('website-name').value.trim());
        const url = document.getElementById('url').value.trim();
        const date = document.getElementById('access-date').value;

        if (!title || !website || !url || !date) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${authors} (${formatDate(date)}). ${title}. <em>${website}</em>. Retrieved from ${url}`;
      } else if (sourceType === 'social') {
        const platform = formatTitleCase(document.getElementById('platform').value.trim());
        const username = document.getElementById('username').value.trim();
        const text = document.getElementById('post-text').value.trim();
        const date = document.getElementById('post-date').value;
        const url = document.getElementById('post-url').value.trim();

        if (!platform || !username || !text || !date || !url) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${username} [${platform}]. (${formatDate(date)}). ${text.substring(0, 50)}${text.length > 50 ? '...' : ''} [Status update]. Retrieved from ${url}`;
      } else if (sourceType === 'video') {
        const title = formatTitleCase(document.getElementById('video-title').value.trim());
        const platform = formatTitleCase(document.getElementById('video-platform').value.trim());
        const channel = formatTitleCase(document.getElementById('channel-name').value.trim());
        const date = document.getElementById('video-date').value;
        const url = document.getElementById('video-url').value.trim();

        if (!title || !platform || !channel || !date || !url) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${channel}. (${formatDate(date)}). <em>${title}</em> [Video]. ${platform}. ${url}`;
      } else if (sourceType === 'podcast') {
        const title = formatTitleCase(document.getElementById('podcast-title').value.trim());
        const podcast = formatTitleCase(document.getElementById('podcast-name').value.trim());
        const date = document.getElementById('podcast-date').value;
        const url = document.getElementById('podcast-url').value.trim();

        if (!title || !podcast || !date || !url) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${authors} (${formatDate(date)}). <em>${title}</em> [Audio podcast episode]. In ${podcast}. ${url}`;
      }
      break;

    case 'harvard':
      if (sourceType === 'book') {
        const year = document.getElementById('harvard-year').value.trim();
        const title = formatTitleCase(document.getElementById('harvard-title').value.trim());
        const publisher = formatPublisher(document.getElementById('harvard-publisher').value.trim());
        const place = formatTitleCase(document.getElementById('harvard-place').value.trim());
        const edition = document.getElementById('harvard-edition').value.trim();

        if (!year || !title || !publisher || !place) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${authors} (${year}) <em>${title}</em>${edition ? `, ${edition}` : ''}. ${place}: ${publisher}.`;
      } else if (sourceType === 'journal') {
        const year = document.getElementById('harvard-year').value.trim();
        const title = formatTitleCase(document.getElementById('harvard-title').value.trim());
        const journalTitle = formatTitleCase(document.getElementById('journal-title').value.trim());
        const volume = document.getElementById('volume').value.trim();
        const issue = document.getElementById('issue').value.trim();
        const pages = document.getElementById('pages').value.trim();

        if (!year || !title || !journalTitle || !volume || !pages) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${authors} (${year}) '${title}', <em>${journalTitle}</em>, ${volume}${issue ? `(${issue})` : ''}, pp. ${pages}.`;
      }
      break;

    case 'mla':
      if (sourceType === 'book') {
        const year = document.getElementById('year').value.trim();
        const title = formatTitleCase(document.getElementById('title').value.trim());
        const publisher = formatPublisher(document.getElementById('publisher').value.trim());

        if (!year || !title || !publisher) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${authors}. <em>${title}</em>. ${publisher}, ${year}.`;
      } else if (sourceType === 'journal') {
        const year = document.getElementById('year').value.trim();
        const title = formatTitleCase(document.getElementById('title').value.trim());
        const journalTitle = formatTitleCase(document.getElementById('journal-title').value.trim());
        const volume = document.getElementById('volume').value.trim();
        const issue = document.getElementById('issue').value.trim();
        const pages = document.getElementById('pages').value.trim();
        const doi = document.getElementById('doi').value.trim();

        if (!year || !title || !journalTitle || !volume || !pages) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${authors}. "${title}." <em>${journalTitle}</em>, vol. ${volume}${issue ? `, no. ${issue}` : ''}, ${year}, pp. ${pages}.${doi ? ` doi:${doi}` : ''}`;
      } else if (sourceType === 'newspaper') {
        const year = document.getElementById('year').value.trim();
        const title = formatTitleCase(document.getElementById('article-title').value.trim());
        const newspaperTitle = formatTitleCase(document.getElementById('newspaper-title').value.trim());
        const date = document.getElementById('publication-date').value;
        const pages = document.getElementById('newspaper-pages').value.trim();
        const url = document.getElementById('newspaper-url').value.trim();

        if (!year || !title || !newspaperTitle || !date) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${authors}. "${title}." <em>${newspaperTitle}</em>, ${formatDate(date)}${pages ? `, p. ${pages}` : ''}.${url ? ` ${url}` : ''}`;
      } else if (sourceType === 'image') {
        const title = formatTitleCase(document.getElementById('image-title').value.trim());
        const platform = formatTitleCase(document.getElementById('image-platform').value.trim());
        const url = document.getElementById('image-url').value.trim();
        const date = document.getElementById('image-date').value;

        if (!title || !platform || !url || !date) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${authors}. <em>${title}</em>. ${formatDate(date)}, ${platform}, ${url}.`;
      } else if (sourceType === 'webpage') {
        const title = formatTitleCase(document.getElementById('webpage-title').value.trim());
        const website = formatTitleCase(document.getElementById('website-name').value.trim());
        const url = document.getElementById('url').value.trim();
        const date = document.getElementById('access-date').value;

        if (!title || !website || !url || !date) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${authors}. "${title}." <em>${website}</em>, ${formatDate(date)}, ${url}.`;
      } else if (sourceType === 'social') {
        const platform = formatTitleCase(document.getElementById('platform').value.trim());
        const username = document.getElementById('username').value.trim();
        const text = document.getElementById('post-text').value.trim();
        const date = document.getElementById('post-date').value;
        const url = document.getElementById('post-url').value.trim();

        if (!platform || !username || !text || !date || !url) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${username}. "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" ${platform}, ${formatDate(date)}, ${url}.`;
      } else if (sourceType === 'video') {
        const title = formatTitleCase(document.getElementById('video-title').value.trim());
        const platform = formatTitleCase(document.getElementById('video-platform').value.trim());
        const channel = formatTitleCase(document.getElementById('channel-name').value.trim());
        const date = document.getElementById('video-date').value;
        const url = document.getElementById('video-url').value.trim();

        if (!title || !platform || !channel || !date || !url) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${channel}. "${title}." ${platform}, ${formatDate(date)}, ${url}.`;
      } else if (sourceType === 'podcast') {
        const title = formatTitleCase(document.getElementById('podcast-title').value.trim());
        const podcast = formatTitleCase(document.getElementById('podcast-name').value.trim());
        const date = document.getElementById('podcast-date').value;
        const url = document.getElementById('podcast-url').value.trim();

        if (!title || !podcast || !date || !url) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${authors}. "${title}." <em>${podcast}</em>, ${formatDate(date)}, ${url}.`;
      }
      break;

    case 'chicago':
      if (sourceType === 'book') {
        const year = document.getElementById('year').value.trim();
        const title = formatTitleCase(document.getElementById('title').value.trim());
        const publisher = formatPublisher(document.getElementById('publisher').value.trim());

        if (!year || !title || !publisher) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${authors}. <em>${title}</em>. ${publisher}, ${year}.`;
      } else if (sourceType === 'journal') {
        const year = document.getElementById('year').value.trim();
        const title = formatTitleCase(document.getElementById('title').value.trim());
        const journalTitle = formatTitleCase(document.getElementById('journal-title').value.trim());
        const volume = document.getElementById('volume').value.trim();
        const issue = document.getElementById('issue').value.trim();
        const pages = document.getElementById('pages').value.trim();
        const doi = document.getElementById('doi').value.trim();

        if (!year || !title || !journalTitle || !volume || !pages) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${authors}. "${title}." <em>${journalTitle}</em> ${volume}, no. ${issue} (${year}): ${pages}.${doi ? ` https://doi.org/${doi}` : ''}`;
      } else if (sourceType === 'newspaper') {
        const year = document.getElementById('year').value.trim();
        const title = formatTitleCase(document.getElementById('article-title').value.trim());
        const newspaperTitle = formatTitleCase(document.getElementById('newspaper-title').value.trim());
        const date = document.getElementById('publication-date').value;
        const pages = document.getElementById('newspaper-pages').value.trim();
        const url = document.getElementById('newspaper-url').value.trim();

        if (!year || !title || !newspaperTitle || !date) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${authors}. "${title}." <em>${newspaperTitle}</em>, ${formatDate(date)}${pages ? `, ${pages}` : ''}.${url ? ` ${url}` : ''}`;
      } else if (sourceType === 'image') {
        const title = formatTitleCase(document.getElementById('image-title').value.trim());
        const platform = formatTitleCase(document.getElementById('image-platform').value.trim());
        const url = document.getElementById('image-url').value.trim();
        const date = document.getElementById('image-date').value;

        if (!title || !platform || !url || !date) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${authors}. <em>${title}</em>. ${formatDate(date)}. ${platform}. ${url}.`;
      } else if (sourceType === 'webpage') {
        const title = formatTitleCase(document.getElementById('webpage-title').value.trim());
        const website = formatTitleCase(document.getElementById('website-name').value.trim());
        const url = document.getElementById('url').value.trim();
        const date = document.getElementById('access-date').value;

        if (!title || !website || !url || !date) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${authors}. "${title}." ${website}. Last modified ${formatDate(date)}. ${url}.`;
      } else if (sourceType === 'social') {
        const platform = formatTitleCase(document.getElementById('platform').value.trim());
        const username = document.getElementById('username').value.trim();
        const text = document.getElementById('post-text').value.trim();
        const date = document.getElementById('post-date').value;
        const url = document.getElementById('post-url').value.trim();

        if (!platform || !username || !text || !date || !url) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${username}. "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" ${platform}. ${formatDate(date)}. ${url}.`;
      } else if (sourceType === 'video') {
        const title = formatTitleCase(document.getElementById('video-title').value.trim());
        const platform = formatTitleCase(document.getElementById('video-platform').value.trim());
        const channel = formatTitleCase(document.getElementById('channel-name').value.trim());
        const date = document.getElementById('video-date').value;
        const url = document.getElementById('video-url').value.trim();

        if (!title || !platform || !channel || !date || !url) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${channel}. "${title}." ${platform}. ${formatDate(date)}. ${url}.`;
      } else if (sourceType === 'podcast') {
        const title = formatTitleCase(document.getElementById('podcast-title').value.trim());
        const podcast = formatTitleCase(document.getElementById('podcast-name').value.trim());
        const date = document.getElementById('podcast-date').value;
        const url = document.getElementById('podcast-url').value.trim();

        if (!title || !podcast || !date || !url) {
          showError('Please fill out all required fields.');
          return;
        }

        citation = `${authors}. "${title}." <em>${podcast}</em>. ${formatDate(date)}. ${url}.`;
      }
      break;
  }

  document.getElementById('citationOutput').innerHTML = `
    <strong>Formatted ${activeStyle.toUpperCase()} Citation (${sourceType}):</strong><br><br>
    <div class="citation-container">
      <span class="citation">${citation}</span>
      <div class="citation-actions">
        <button onclick="copyCitation()" class="action-btn" title="Copy citation">
          <i class="fas fa-copy"></i> Copy
        </button>
        <button onclick="addToReferenceList()" class="action-btn" title="Add to reference list">
          <i class="fas fa-plus"></i> Add to List
        </button>
        <button onclick="printCitation()" class="action-btn" title="Print citation">
          <i class="fas fa-print"></i> Print
        </button>
      </div>
    </div>
  `;
}

function copyCitation() {
  const citation = document.querySelector('.citation').textContent;
  navigator.clipboard.writeText(citation).then(() => {
    showSuccess('Citation copied to clipboard!');
  }).catch(err => {
    showError('Failed to copy citation. Please try again.');
  });
}

function printCitation() {
  const citation = document.querySelector('.citation').textContent;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Citation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          .citation {
            font-size: 14pt;
            line-height: 1.5;
            margin: 20px 0;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="citation">${citation}</div>
        <div class="no-print">
          <button onclick="window.print()">Print</button>
          <button onclick="window.close()">Close</button>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
}

function showError(message) {
  document.getElementById('citationOutput').innerHTML = `<span style="color: red;">${message}</span>`;
}
 