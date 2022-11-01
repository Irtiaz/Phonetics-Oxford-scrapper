const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const app = express();

const jsonParser = bodyParser.json();

app.use(express.static(path.join(__dirname, 'public')));

app.listen(process.env.PORT | 3000, () => {
  console.log('Started listening');
});

app.get('/', (req, res) => {
  console.log('Request made');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/transcribe', jsonParser, async (req, res) => {
  const lines = removePunctuationsAndExtraSpaces(req.body.text).split('\n');

  const transcription = [];

  for (const line of lines) {
    const words = line.split(' ');

    const lineTranscriptions = [];

    for (const word of words) {
      const wordTranscription = await getPhoneticTranscription(
        word.toLowerCase()
      );
      lineTranscriptions.push(wordTranscription);
    }
    transcription.push(lineTranscriptions);
  }

  res.send({
    transcription,
  });
});

async function getPhoneticTranscription(word) {
  const res = await fetch(
    `https://www.oxfordlearnersdictionaries.com/definition/english/${word}`
  );
  const text = await res.text();

  let $ = cheerio.load(text);
  let phoneSpans = $('.phon');

  if (phoneSpans.length == 0) {
    const res = await fetch(
      `https://www.oxfordlearnersdictionaries.com/definition/english/${word}1`
    );
    const text = await res.text();
    $ = cheerio.load(text);
    phoneSpans = $('.phon');
  }

  const phones = [];

  for (let i = 0; i < phoneSpans.length; ++i) {
    phones.push(phoneSpans[i].children[0].data);
  }

  return phones;
}

function removePunctuationsAndExtraSpaces(s) {
  const punctuationless = s.replace(/[.,\/#!$%\^&\*;:{}=\-_`"~()]/g, '');
  const finalString = punctuationless.replace(/\s{2,}/g, ' ');
  return finalString;
}
