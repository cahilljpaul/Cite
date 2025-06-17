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
      const author = document.getElementById('author').value.trim();
      const year = document.getElementById('year').value.trim();
      const title = document.getElementById('title').value.trim();
      const publisher = document.getElementById('publisher').value.trim();

      if (!author || !year || !title || !publisher) {
        showError('Please fill out all fields.');
        return;
      }

      citation = `${author} (${year}). <em>${title}</em>. ${publisher}.`;
      break;

    case 'mla':
      const mlaAuthor = document.getElementById('mla-author').value.trim();
      const mlaTitle = document.getElementById('mla-title').value.trim();
      const mlaPublisher = document.getElementById('mla-publisher').value.trim();
      const mlaYear = document.getElementById('mla-year').value.trim();

      if (!mlaAuthor || !mlaTitle || !mlaPublisher || !mlaYear) {
        showError('Please fill out all fields.');
        return;
      }

      citation = `${mlaAuthor}. <em>${mlaTitle}</em>. ${mlaPublisher}, ${mlaYear}.`;
      break;

    case 'chicago':
      const chicagoAuthor = document.getElementById('chicago-author').value.trim();
      const chicagoTitle = document.getElementById('chicago-title').value.trim();
      const chicagoPublisher = document.getElementById('chicago-publisher').value.trim();
      const chicagoYear = document.getElementById('chicago-year').value.trim();
      const chicagoCity = document.getElementById('chicago-city').value.trim();

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
 