const clockEl = document.getElementById("clock");
function pad(n){ return String(n).padStart(2, "0"); }

function updateClock(){
  if (!clockEl) return;
  const now = new Date();
  clockEl.textContent =
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
updateClock();
setInterval(updateClock, 1000);

const items = [
  "Assessoria de comunicação",
  "gestão de redes sociais, clipping, edição e postagem de materiais",
  " atuação em comunicação institucional",
];

(function buildTicker(){
  const track = document.getElementById("tickerTrack");
  if (!track) return;

  const frag = document.createDocumentFragment();

  function addChunk(){
    items.forEach((t, idx) => {
      const span = document.createElement("span");
      span.className = "tickItem";
      span.textContent = t;
      frag.appendChild(span);

      const sep = document.createElement("span");
      sep.className = "sep";
      sep.textContent = "•";
      frag.appendChild(sep);
    });
  }

  addChunk();
  addChunk(); 
  track.textContent = "";
  track.appendChild(frag);
})();


(function injectCaretCSS(){
  if (document.getElementById("tw-style")) return;
  const style = document.createElement("style");
  style.id = "tw-style";
  style.textContent = `
    .tw-caret{
      display:inline-block;
      margin-left:2px;
      opacity:.95;
      animation: twblink .8s step-end infinite;
    }
    @keyframes twblink{ 50%{ opacity:0; } }
  `;
  document.head.appendChild(style);
})();

function typeLine(el, text, speed=55){
  el.textContent = ""; 
  const caret = document.createElement("span");
  caret.className = "tw-caret";
  caret.textContent = "▌";
  el.appendChild(caret);

  let i = 0;
  return new Promise((resolve) => {
    const tick = () => {
      if (i < text.length){
        caret.insertAdjacentText("beforebegin", text[i++]);
        setTimeout(tick, speed);
      } else {
        caret.remove();
        resolve();
      }
    };
    tick();
  });
}

async function runTypewriter(){
  const lines = document.querySelectorAll(".typewriter__line");
  if (lines.length < 2) return;

  const t1 = lines[0].getAttribute("data-text") || "";
  const t2 = lines[1].getAttribute("data-text") || "";

  await typeLine(lines[0], t1, 55);
  await new Promise(r => setTimeout(r, 220));
  await typeLine(lines[1], t2, 55);
}

document.addEventListener("DOMContentLoaded", runTypewriter);

