const SUPABASE_URL = 'https://xeegdoyfxgbaqvuzvcib.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZWdkb3lmeGdiYXF2dXp2Y2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxODgwMzksImV4cCI6MjA5Nzc2NDAzOX0.S4wdP_yx2VlCWeMz8T2ruXy44ehIFzxSNcmSSme_yD4';

const SUB_OPTIONS = {
  '반도체': ['HBM', 'NAND', 'DRAM', 'SSD'],
  '디스플레이': ['OLED', 'LCD', 'MicroLED'],
};

let currentUrl = '';

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  currentUrl = tabs[0].url || '';
  document.getElementById('url-box').textContent = currentUrl;
});

document.getElementById('top').addEventListener('change', () => {
  const top = document.getElementById('top').value;
  const sub = document.getElementById('sub');
  sub.innerHTML = '<option value="">세부 기술</option>';
  if (top && SUB_OPTIONS[top]) {
    SUB_OPTIONS[top].forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      sub.appendChild(opt);
    });
    sub.disabled = false;
  } else {
    sub.disabled = true;
  }
  updateButton();
});

['sub', 'source'].forEach((id) => {
  document.getElementById(id).addEventListener('change', updateButton);
});

function updateButton() {
  const top = document.getElementById('top').value;
  const sub = document.getElementById('sub').value;
  const source = document.getElementById('source').value;
  document.getElementById('save-btn').disabled = !(top && sub && source);
}

document.getElementById('save-btn').addEventListener('click', async () => {
  const top = document.getElementById('top').value;
  const sub = document.getElementById('sub').value;
  const source = document.getElementById('source').value;
  const btn = document.getElementById('save-btn');
  const msg = document.getElementById('msg');

  btn.disabled = true;
  btn.textContent = '저장 중...';
  msg.textContent = '';
  msg.className = 'msg';

  try {
    const sumRes = await fetch(`${SUPABASE_URL}/functions/v1/summarize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: currentUrl }),
    });
    const ai = await sumRes.json();

    const res = await fetch(`${SUPABASE_URL}/rest/v1/articles`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=ignore-duplicates',
      },
      body: JSON.stringify({
        url: currentUrl,
        title: ai.title || '',
        summary: ai.summary || '',
        tags: ai.tags || [],
        top_category: top,
        sub_category: sub,
        source_type: source,
        company: null,
        manually_added: true,
      }),
    });

    if (res.ok) {
      msg.textContent = '저장됐습니다!';
      msg.className = 'msg success';
    } else {
      const err = await res.json();
      throw new Error(err.message || '저장 실패');
    }
  } catch (e) {
    msg.textContent = `저장 실패: ${e.message}`;
    msg.className = 'msg error';
  } finally {
    btn.disabled = false;
    btn.textContent = '저장';
  }
});
