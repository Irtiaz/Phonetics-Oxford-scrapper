async function onTranscribeClick() {
  const textArea = document.getElementById('text');
  const container = document.getElementById('container');

  container.innerHTML = '';

  const textLines = textArea.value.split('\n');

  const postData = {
    text: textArea.value
  };

  console.log(postData);

  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
  };

  const response = await fetch('/api/transcribe', config);
  const resData = await response.json();
  console.log(resData);

  for (let i = 0; i < textLines.length; ++i) {
    const lineWrapper = document.createElement('div');
    lineWrapper.classList.add('line-wrapper');

    const textDiv = document.createElement('div');
    textDiv.textContent = textLines[i];
    lineWrapper.appendChild(textDiv);

    const transLine = resData.transcription[i];
    const transDiv = document.createElement('div');

    for (let j = 0; j < transLine.length; ++j) {
      const word = transLine[j];

      const span = document.createElement('span');
      span.classList.add('phone');
      span.setAttribute('lineIndex', i);
      span.setAttribute('wordIndex', j);
      span.setAttribute('phoneIndex', 0);
      span.textContent = word.length == 0? 'N/A' : word[+span.getAttribute('phoneIndex')];

      transDiv.appendChild(span); 

      span.onclick = (event) => {
        const sp = event.target;
        const lineIndex = +sp.getAttribute('lineIndex');
        const wordIndex = +sp.getAttribute('wordIndex');
        const phoneIndex = +sp.getAttribute('phoneIndex');

        const possibleTransList = resData.transcription[lineIndex][wordIndex];
        let nextIndex = phoneIndex + 1;
        if (nextIndex >= possibleTransList.length) nextIndex = 0;

        sp.setAttribute('phoneIndex', nextIndex);
        sp.textContent = possibleTransList[nextIndex];
      }
    }

    lineWrapper.appendChild(transDiv);

    container.appendChild(lineWrapper);
  }
}