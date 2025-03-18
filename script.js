function generateCitation() {
  const author = document.getElementById('author').value.trim();
  const year = document.getElementById('year').value.trim();
  const title = document.getElementById('title').value.trim();
  const publisher = document.getElementById('publisher').value.trim();

  if (!author || !year || !title || !publisher) {
    document.getElementById('citationOutput').innerHTML = '<span style="color:red;">Please fill out all fields.</span>';
    return;
  }

  const citation = `<span class="citation">${author} (${year}). <em>${title}</em>. ${publisher}.</span>`;
  document.getElementById('citationOutput').innerHTML = `<strong>Formatted APA Citation:</strong><br><br>${citation}`;
}
 