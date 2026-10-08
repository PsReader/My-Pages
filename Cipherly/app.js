const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let mode = 'password';
let activePreset = '';
let resultAvailable = false;
let resultHidden = false;
const output = $('#single-output');
const bulkOutput = $('#bulk-output');
const singleMeta = $('#single-meta');
const copyStatus = $('#copy-status');
const meterBars = $$('.strength-meter i');
const outputPanel = $('.output-panel');
const copyButton = $('#copy-button');
const visibilityButton = $('#visibility-button');
const clearButton = $('#clear-button');
const copyShortcutLabel = /Mac|iPhone|iPad|iPod/i.test(navigator.userAgentData?.platform || navigator.platform || '') ? '⌘⇧C' : 'Ctrl+Shift+C';
copyButton.querySelector('span').textContent = copyShortcutLabel;
const strengthMeter = $('.strength-meter');
const words = `amber atlas autumn beacon birch bliss blue cabin cedar circle cobalt comet coral creek dawn delta dune ember fern field flint forest frost garden gold harbor hazel honey jade juniper kite lagoon lemon linen maple meadow mint moon moss oak ocean olive orbit orchid pebble pine plum pond quartz raven river robin sage scarlet seed shadow silver slate solar spruce stone storm summer summit sunset teal thistle tide timber toast topaz trail valley velvet violet willow winter wren yellow zephyr`.split(' ');
const sets = { uppercase:'ABCDEFGHJKLMNPQRSTUVWXYZ', lowercase:'abcdefghijkmnopqrstuvwxyz', numbers:'23456789', symbols:'!@#$%^&*+=?-_' };

function clearPresetSelection() {
  if (!activePreset) return;
  activePreset = '';
  $$('.preset-button').forEach(button => button.classList.remove('selected'));
  $('#preset-status').textContent = 'customized';
}

function updateResultTools() {
  const concealed = resultHidden && resultAvailable;
  output.classList.toggle('is-concealed', concealed && mode !== 'bulk');
  if (concealed && mode !== 'bulk') output.setAttribute('aria-hidden', 'true');
  else output.removeAttribute('aria-hidden');
  bulkOutput.querySelectorAll('.bulk-row span').forEach(secret => {
    secret.classList.toggle('is-concealed', concealed);
    if (concealed) secret.setAttribute('aria-hidden', 'true');
    else secret.removeAttribute('aria-hidden');
  });
  visibilityButton.setAttribute('aria-label', concealed ? 'Show result' : 'Hide result');
  visibilityButton.title = concealed ? 'Show result' : 'Hide result';
  visibilityButton.setAttribute('aria-pressed', String(concealed));
  visibilityButton.disabled = !resultAvailable;
  clearButton.disabled = !resultAvailable;
  copyButton.disabled = !resultAvailable;
  $('#download-button').disabled = !resultAvailable;
}

function setResultHidden(hidden) {
  if (!resultAvailable) return;
  resultHidden = hidden;
  updateResultTools();
  copyStatus.textContent = hidden ? 'Result hidden on screen.' : 'Result shown.';
}

function clearResult() {
  if (!resultAvailable) return;
  resultAvailable = false;
  resultHidden = false;
  output.textContent = 'Result cleared — generate another when you’re ready.';
  bulkOutput.replaceChildren();
  if (mode === 'bulk') {
    const notice = document.createElement('p');
    notice.className = 'bulk-empty';
    notice.textContent = 'Batch cleared — generate another when you’re ready.';
    bulkOutput.append(notice);
  } else {
    meterBars.forEach(bar => { bar.classList.remove('filled', 'best'); });
    $('#strength-label').textContent = 'cleared';
    $('#entropy-label').textContent = '— bits';
    $('#generated-time').textContent = 'cleared';
  }
  window.clearTimeout(copyButton.resetTimer);
  copyButton.classList.remove('is-copied');
  copyButton.innerHTML = `Copy result <span>${copyShortcutLabel}</span>`;
  updateResultTools();
  copyStatus.textContent = 'Result cleared from this page. Clipboard and downloads are unchanged.';
}

function resetSettings() {
  activePreset = '';
  $$('.preset-button').forEach(button => button.classList.remove('selected'));
  $('#length').value = '20';
  ['uppercase','lowercase','numbers','symbols'].forEach(key => { $(`#${key}`).checked = true; });
  $('#word-count').value = '4';
  $('#capitalize').checked = true;
  $('#phrase-number').checked = true;
  $('#phrase-symbol').checked = false;
  $('#phrase-separator').value = '-';
  $('#quantity').value = '10';
  $('#custom-charset').value = '';
  $('#exclude-ambiguous').checked = false;
  $('#compatibility').value = 'flexible';
  $('.custom-details').open = false;
  resultHidden = false;
  $('#preset-status').textContent = 'defaults restored';
  syncControlLabels();
  setMode('password');
  copyStatus.textContent = 'Generator settings reset.';
}

function setTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  const toggle = $('#theme-toggle');
  toggle.setAttribute('aria-pressed', String(isDark));
  toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  toggle.querySelector('.theme-icon').textContent = isDark ? '☀' : '☾';
  toggle.querySelector('.theme-label').textContent = isDark ? 'Light mode' : 'Dark mode';
  try { localStorage.setItem('cipherly-theme', isDark ? 'dark' : 'light'); } catch (error) { /* storage is optional */ }
}

function applyPreset(name) {
  activePreset = name;
  $('#custom-charset').value = '';
  const presets = {
    pin: { mode:'password', length:6, custom:'0123456789', uppercase:false, lowercase:false, numbers:false, symbols:false, ambiguous:false, compatibility:'digits' },
    wifi: { mode:'password', length:20, uppercase:true, lowercase:true, numbers:true, symbols:true, ambiguous:true, compatibility:'wifi' },
    phrase: { mode:'passphrase', words:4, capitalize:true, number:true, symbol:false },
    api: { mode:'password', length:32, custom:'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789-_', ambiguous:true, compatibility:'url' },
    otp: { mode:'password', length:8, custom:'0123456789', ambiguous:false, compatibility:'digits' },
    'strong-phrase': { mode:'passphrase', words:6, capitalize:false, number:true, symbol:false }
  };
  const preset = presets[name];
  if (!preset) return;
  if (preset.mode === 'password') {
    $('#length').value = preset.length;
    ['uppercase','lowercase','numbers','symbols'].forEach(key => { $(`#${key}`).checked = preset[key]; });
    $('#custom-charset').value = preset.custom || '';
    $('#exclude-ambiguous').checked = preset.ambiguous;
    $('#compatibility').value = preset.compatibility || 'flexible';
  } else {
    $('#custom-charset').value = '';
    $('#compatibility').value = 'flexible';
    $('#word-count').value = preset.words;
    $('#capitalize').checked = preset.capitalize;
    $('#phrase-number').checked = preset.number;
    $('#phrase-symbol').checked = preset.symbol;
    if (!getCharset()) {
      ['uppercase','lowercase','numbers','symbols'].forEach(key => { $(`#${key}`).checked = true; });
      $('#exclude-ambiguous').checked = true;
    }
  }
  if (preset.mode === 'passphrase') $('#phrase-separator').value = '-';
  syncControlLabels();
  setMode(preset.mode);
  $$('.preset-button').forEach(button => button.classList.toggle('selected', button.dataset.preset === name));
  $('#preset-status').textContent = 'template active';
}

function syncControlLabels() {
  $('#length-value').textContent = $('#length').value;
  $('#word-count-value').textContent = $('#word-count').value;
  $('#quantity-value').textContent = $('#quantity').value;
}

function applyCompatibility(name) {
  if (mode !== 'password') setMode('password');
  const rules = {
    flexible: { charset:'', ambiguous:$('#exclude-ambiguous').checked },
    wifi: { charset:'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*+=?-_', ambiguous:true },
    url: { charset:'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789-_', ambiguous:true },
    digits: { charset:'0123456789', ambiguous:false }
  };
  const rule = rules[name] || rules.flexible;
  $('#custom-charset').value = rule.charset;
  $('#exclude-ambiguous').checked = rule.ambiguous;
  clearPresetSelection();
  generate();
}

function animateLogo() {
  const logo = $('#brand-mark');
  if (!logo) return;
  logo.classList.remove('is-generating');
  void logo.offsetWidth;
  logo.classList.add('is-generating');
}

function saveFeedbackPreference(event) {
  try { localStorage.setItem(`cipherly-${event.target.id}`, String(event.target.checked)); } catch (error) { /* storage is optional */ }
}

function readFeedbackPreference(id) {
  try { return localStorage.getItem(`cipherly-${id}`) === 'true'; } catch (error) { return false; }
}

function playSuccessFeedback() {
  if ($('#sound-feedback').checked) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const context = new AudioContext();
        const now = context.currentTime;
        [523.25, 783.99].forEach((frequency, index) => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = 'sine';
          oscillator.frequency.value = frequency;
          gain.gain.setValueAtTime(0.0001, now + index * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.055, now + index * 0.07 + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.07 + 0.16);
          oscillator.connect(gain).connect(context.destination);
          oscillator.start(now + index * 0.07);
          oscillator.stop(now + index * 0.07 + 0.17);
        });
        window.setTimeout(() => context.close(), 420);
      }
    } catch (error) { /* sound is optional */ }
  }
  if ($('#haptic-feedback').checked && 'vibrate' in navigator) navigator.vibrate([12, 28, 12]);
}

function randomInt(max) {
  if (max <= 0) return 0;
  const range = 0x100000000;
  const limit = range - (range % max);
  const buffer = new Uint32Array(1);
  do { crypto.getRandomValues(buffer); } while (buffer[0] >= limit);
  return buffer[0] % max;
}
function pick(source) { return source[randomInt(source.length)]; }
function shuffle(items) { for (let i=items.length-1;i>0;i--){const j=randomInt(i+1);[items[i],items[j]]=[items[j],items[i]];} return items; }
function cleanAmbiguous(value) { return $('#exclude-ambiguous').checked ? value.replace(/[O0Il1]/g,'') : value; }
function getCharset() {
  const custom = $('#custom-charset').value.replace(/\s/g, '');
  if (custom) return [...new Set(cleanAmbiguous(custom))].join('');
  return cleanAmbiguous(Object.entries(sets).filter(([key]) => $(`#${key}`).checked).map(([,value]) => value).join(''));
}
function getEnabledSets() {
  const custom = $('#custom-charset').value.replace(/\s/g, '');
  if (custom) return [cleanAmbiguous(custom)];
  return Object.entries(sets).filter(([key]) => $(`#${key}`).checked).map(([,value]) => cleanAmbiguous(value)).filter(Boolean);
}
function makePassword() {
  const length = Number($('#length').value);
  const alphabet = getCharset();
  if (!alphabet) return '';
  const enabled = getEnabledSets();
  const chars = enabled.map(set => pick(set));
  while (chars.length < length) chars.push(pick(alphabet));
  return shuffle(chars).slice(0,length).join('');
}
function makePassphrase() {
  const count = Number($('#word-count').value);
  const selected = Array.from({length:count}, () => { const word=pick(words); return $('#capitalize').checked ? word[0].toUpperCase()+word.slice(1) : word; });
  if ($('#phrase-number').checked) selected.push(String(randomInt(90)+10));
  let result = selected.join($('#phrase-separator').value);
  if ($('#phrase-symbol').checked) result += pick('!@#$%&*?');
  return result;
}
function entropy() {
  if (mode === 'passphrase') return Math.round(Number($('#word-count').value)*Math.log2(words.length)+($('#phrase-number').checked?6.5:0)+($('#phrase-symbol').checked?3:0));
  const alphabet=getCharset(); return alphabet ? Math.round(Number($('#length').value)*Math.log2(alphabet.length)) : 0;
}
function updateStrength(bits) {
  const level = bits < 55 ? 1 : bits < 75 ? 2 : bits < 105 ? 3 : 4;
  meterBars.forEach((bar,i)=>{bar.classList.toggle('filled',i<level);bar.classList.toggle('best',level===4&&i<level);});
  strengthMeter.classList.remove('is-updated');
  void strengthMeter.offsetWidth;
  strengthMeter.classList.add('is-updated');
  $('#strength-label').textContent = bits ? ['weak','fair','strong','excellent'][level-1] : 'choose a character set';
  $('#entropy-label').textContent = bits ? `${bits} bits` : '— bits';
}
function markGenerated() {
  const now = new Date();
  $('#generated-time').textContent = `generated ${now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
  outputPanel.classList.remove('is-success');
  void outputPanel.offsetWidth;
  outputPanel.classList.add('is-success');
}
function renderSingle(value) {
  resultAvailable = Boolean(value);
  output.classList.remove('hidden');
  output.textContent = value || 'Choose at least one character';
  singleMeta.classList.remove('hidden');
  bulkOutput.classList.add('hidden');
  updateStrength(value ? entropy() : 0);
  updateResultTools();
  markGenerated();
}
function renderBulk(values, message = '') {
  resultAvailable = values.length > 0;
  output.classList.add('hidden'); singleMeta.classList.add('hidden'); bulkOutput.classList.remove('hidden');
  bulkOutput.replaceChildren();
  values.forEach((value, i) => {
    const row = document.createElement('div');
    const number = document.createElement('b');
    const secret = document.createElement('span');
    row.className = 'bulk-row';
    number.textContent = String(i + 1).padStart(2, '0');
    secret.textContent = value;
    row.append(number, secret);
    bulkOutput.append(row);
  });
  if (message) {
    const notice = document.createElement('p');
    notice.className = 'bulk-empty';
    notice.textContent = message;
    bulkOutput.append(notice);
  }
  updateResultTools();
  markGenerated();
}
function generate(shouldAnimate = false) {
  copyStatus.textContent='';
  if (shouldAnimate) animateLogo();
  if (mode === 'bulk') {
    const amount = Number($('#quantity').value);
    const alphabet = getCharset();
    const length = Number($('#length').value);
    const capacity = BigInt(alphabet.length) ** BigInt(length);
    const values = new Set();
    let attempts = 0;
    let message = '';
    if (!alphabet.length) {
      message = 'Choose at least one character set before generating a batch.';
    } else if (capacity < BigInt(amount)) {
      message = `This character set and length allow only ${capacity} unique password${capacity === 1n ? '' : 's'}; increase the length or broaden the set.`;
    } else {
      while (values.size < amount && attempts < amount * 100) {
        const value = makePassword();
        if (value) values.add(value);
        attempts++;
      }
      if (values.size < amount) message = `Generated ${values.size} of ${amount} unique passwords. Increase the length or broaden the set, then try again.`;
    }
    renderBulk([...values], message);
    copyStatus.textContent = message;
    if (shouldAnimate && values.size) playSuccessFeedback();
  } else renderSingle(mode === 'password' ? makePassword() : makePassphrase());
  if (shouldAnimate && mode !== 'bulk' && output.textContent && !output.textContent.startsWith('Choose')) playSuccessFeedback();
}
function setMode(next) {
  mode=next;
  if (activePreset && ((['phrase','strong-phrase'].includes(activePreset) && next !== 'passphrase') || (!['phrase','strong-phrase'].includes(activePreset) && next !== 'password'))) clearPresetSelection();
  $$('.mode-tab').forEach(tab=>{const active=tab.dataset.mode===mode;tab.classList.toggle('active',active);tab.setAttribute('aria-selected',active);tab.tabIndex=active?0:-1;});
  ['password','passphrase','bulk'].forEach(name=> $(`#${name}-controls`).classList.toggle('hidden',name!==mode));
  $('#mode-note').textContent=mode==='password'?'random password':mode==='passphrase'?'memorable passphrase':'unique password batch';
  $('#output-kicker').textContent=mode==='bulk'?'your fresh batch':'your new secret';
  generate();
}
async function copyResult() {
  const text=mode==='bulk'?[...bulkOutput.querySelectorAll('.bulk-row span')].map(el=>el.textContent).join('\n'):output.textContent;
  if(!resultAvailable||!text||text.startsWith('Choose')) return;
  try {
    await navigator.clipboard.writeText(text);
    copyButton.classList.add('is-copied');
    copyButton.innerHTML = 'Copied <span>✓</span>';
    copyStatus.textContent=mode==='bulk'?'Batch copied to clipboard.':'Copied to clipboard — clear it when you’re done.';
    window.clearTimeout(copyButton.resetTimer);
    copyButton.resetTimer = window.setTimeout(() => { copyButton.classList.remove('is-copied'); copyButton.innerHTML = `Copy result <span>${copyShortcutLabel}</span>`; }, 2200);
  }
  catch { copyStatus.textContent='Clipboard access unavailable — select and copy manually.'; }
}
function downloadResult() {
  const text=mode==='bulk'?[...bulkOutput.querySelectorAll('.bulk-row span')].map(el=>el.textContent).join('\n'):output.textContent;
  if(!resultAvailable||!text||text.startsWith('Choose')) return;
  const blob=new Blob([text+'\n'],{type:'text/plain'}); const link=document.createElement('a'); link.href=URL.createObjectURL(blob); link.download=`cipherly-${mode}.txt`; link.click(); window.setTimeout(()=>URL.revokeObjectURL(link.href),1000); copyStatus.textContent='Downloaded as a text file.';
}
$('#theme-toggle').addEventListener('click',()=>setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
$$('.mode-tab').forEach(tab=>tab.addEventListener('click',()=>setMode(tab.dataset.mode)));
$('.mode-tabs').addEventListener('keydown',event=>{
  const tabs=$$('.mode-tab');
  const current=tabs.indexOf(event.target.closest('.mode-tab'));
  if(current<0)return;
  const next=event.key==='ArrowRight'?(current+1)%tabs.length:event.key==='ArrowLeft'?(current-1+tabs.length)%tabs.length:event.key==='Home'?0:event.key==='End'?tabs.length-1:-1;
  if(next<0)return;
  event.preventDefault();
  setMode(tabs[next].dataset.mode);
  tabs[next].focus();
});
$$('.preset-button').forEach(button=>button.addEventListener('click',()=>applyPreset(button.dataset.preset)));
$('#generate-button').addEventListener('click',()=>generate(true)); $('#copy-button').addEventListener('click',copyResult); $('#download-button').addEventListener('click',downloadResult);
visibilityButton.addEventListener('click',()=>setResultHidden(!resultHidden)); clearButton.addEventListener('click',clearResult); $('#reset-settings').addEventListener('click',resetSettings);
$('#phrase-separator').addEventListener('change',()=>{clearPresetSelection();if(mode==='passphrase')generate();});
$('#length').addEventListener('input',()=>{$('#length-value').textContent=$('#length').value;clearPresetSelection();generate();}); $('#word-count').addEventListener('input',()=>{$('#word-count-value').textContent=$('#word-count').value;clearPresetSelection();generate();}); $('#quantity').addEventListener('input',()=>{$('#quantity-value').textContent=$('#quantity').value;clearPresetSelection();generate();});
$$('#password-controls input,#passphrase-controls input,#bulk-controls input,#custom-charset,#exclude-ambiguous').forEach(input=>input.addEventListener(input.tagName==='TEXTAREA'?'input':'change',()=>{clearPresetSelection();generate();}));
$('#compatibility').addEventListener('change',event=>applyCompatibility(event.target.value));
['sound-feedback','haptic-feedback'].forEach(id=>{$(`#${id}`).checked=readFeedbackPreference(id);$(`#${id}`).addEventListener('change',saveFeedbackPreference);});
document.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.shiftKey&&event.key.toLowerCase()==='c'){event.preventDefault();copyResult();}else if(event.key==='Enter'&&!event.target.closest('button,a,select,summary,input,textarea,[contenteditable="true"]'))generate(true);});
syncControlLabels();
setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
generate();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
