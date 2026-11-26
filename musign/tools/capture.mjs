/* =========================================================
   작업 사이트 캡처 + 링크 확인 프로그램

   하는 일
   1. js/works-data.js 에 있는 작업 46개의 링크를 하나씩 연다
   2. 열리면 첫 화면을 찍어 images/works/아이디.jpg 로 저장한다
      - 랜딩페이지(시리즈): 휴대폰 화면 (390 x 520, 2배 해상도)
      - 그 밖의 사이트: PC 화면 (1200 x 1600)
   3. 링크가 살아 있는지를 js/works-status.js 에 기록한다
      페이지는 이 파일을 읽어서, 죽은 링크는 링크 없이 작업 내용만 보여 준다

   사용법 (tools 폴더에서)
     npm install
     npx playwright install chromium      처음 한 번만 (크롬이 깔려 있으면 생략하고 --channel=chrome)
     npm run capture

   옵션 (npm run capture -- 다음에 붙인다)
     --only=dokgong,tnjad      이 작업만 다시 찍기 (나머지 기록은 그대로 둠)
     --base=http://localhost:5500/musign/     ../tnjbiz/ 같은 상대 주소를 풀 때 기준 주소
     --channel=chrome          설치된 크롬으로 실행
     --show                    브라우저 창을 띄워서 보면서 실행
   ========================================================= */

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..'); // musign 폴더

// 옵션 읽기: --key=value
const args = Object.fromEntries(process.argv.slice(2).map((a) => {
    const [key, ...rest] = a.replace(/^--/, '').split('=');
    return [key, rest.length ? rest.join('=') : true];
}));
const BASE = args.base || 'https://6hyein.github.io/portfolio/musign/';
const ONLY = args.only ? String(args.only).split(',').map((s) => s.trim()) : null;
const CONCURRENCY = 4;

// 브라우저용 데이터 파일을 그대로 읽는다 (const WORKS = [...] 를 실행해서 꺼냄)
async function loadScript(file, names) {
    const code = await fs.readFile(file, 'utf8');
    const box = {};
    vm.runInNewContext(`${code}\n;__out = { ${names.join(', ')} };`, box);
    return box.__out;
}

const { WORKS } = await loadScript(path.join(root, 'js/works-data.js'), ['WORKS']);
const statusFile = path.join(root, 'js/works-status.js');
const outDir = path.join(root, 'images/works');
await fs.mkdir(outDir, { recursive: true });

// 일부만 다시 찍을 때는 이전 기록을 이어서 쓴다
let status = {};
if (ONLY) {
    try { status = (await loadScript(statusFile, ['WORK_STATUS'])).WORK_STATUS; } catch (e) { status = {}; }
}

const targets = WORKS.filter((w) => !ONLY || ONLY.includes(w.id));
if (!targets.length) {
    console.log('찍을 작업이 없습니다. --only 에 적은 아이디를 확인해 주세요.');
    process.exit(1);
}

const browser = await chromium.launch({
    headless: !args.show,
    channel: args.channel || undefined
});

// 화면 크기 두 가지
const pc = await browser.newContext({ viewport: { width: 1200, height: 1600 } });
const mobile = await browser.newContext({
    viewport: { width: 390, height: 520 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
});

// 스크롤해야 나타나는 요소(AOS 등)를 처음부터 보이게 하는 스타일
const REVEAL_CSS = `
    [data-aos] { opacity: 1 !important; transform: none !important; transition: none !important; }
    *, *::before, *::after { animation-play-state: paused !important; caret-color: transparent !important; }
`;

async function check(work) {
    const result = { ok: false, thumb: false };

    if (!work.url) {
        // 로그인, 관리자 페이지: 링크가 없는 작업
        return { ok: null, thumb: false, note: work.note || '링크 없음' };
    }

    const url = new URL(work.url, BASE).href;
    const context = work.series ? mobile : pc;
    const page = await context.newPage();

    try {
        const response = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
        result.http = response ? response.status() : 0;
        result.ok = !!response && response.status() < 400;

        // 다른 사이트로 넘어갔는지 (도메인이 바뀌었으면 사이트가 바뀐 것일 수 있음)
        const finalHost = new URL(page.url()).host;
        if (finalHost !== new URL(url).host) result.note = `${finalHost} 로 이동함`;

        if (result.ok) {
            await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => {});
            await page.addStyleTag({ content: REVEAL_CSS }).catch(() => {});
            await page.waitForTimeout(1200);

            // 내용이 거의 없는 페이지(빈 화면, 주차 도메인 등)는 표시만 해 둔다
            const textLength = await page.evaluate(() => document.body ? document.body.innerText.trim().length : 0);
            if (textLength < 20) result.note = (result.note ? result.note + ', ' : '') + '내용이 거의 없음';

            // 데이터에서 dead: true 로 정해 둔 작업은 바뀐 화면을 찍지 않는다
            if (!work.dead) {
                await page.screenshot({ path: path.join(outDir, `${work.id}.jpg`), type: 'jpeg', quality: 82 });
                result.thumb = true;
            }
        }
    } catch (error) {
        result.ok = false;
        result.note = error.message.split('\n')[0].slice(0, 80);
    } finally {
        await page.close();
    }

    if (work.dead) result.ok = false;
    return result;
}

// 4개씩 동시에
const queue = [...targets];
let done = 0;
async function worker() {
    while (queue.length) {
        const work = queue.shift();
        const result = await check(work);
        result.checked = new Date().toISOString().slice(0, 10);
        status[work.id] = result;
        done += 1;
        const mark = result.ok === null ? '-' : result.ok ? 'O' : 'X';
        console.log(`[${String(done).padStart(2)}/${targets.length}] ${mark} ${work.id.padEnd(20)} ${work.title}${result.note ? '  (' + result.note + ')' : ''}`);
    }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await browser.close();

// js/works-status.js 다시 쓰기 (데이터 순서대로)
const ordered = WORKS.filter((w) => status[w.id]).map((w) => `    '${w.id}': ${JSON.stringify(status[w.id])}`);
await fs.writeFile(statusFile,
    `/* tools/capture.mjs 가 만든 파일입니다. 직접 고치지 않아도 됩니다.\n` +
    `   ok: 링크가 열렸는지 (null 은 링크가 없는 작업), thumb: images/works/ 에 캡처가 있는지 */\n` +
    `const WORK_STATUS = {\n${ordered.join(',\n')}\n};\n`);

// 요약
const all = Object.values(status);
const dead = WORKS.filter((w) => status[w.id] && status[w.id].ok === false);
const moved = WORKS.filter((w) => status[w.id] && status[w.id].note && status[w.id].ok);
const summary = [
    `링크 열림 ${all.filter((s) => s.ok === true).length}개, 안 열림 ${dead.length}개, 링크 없음 ${all.filter((s) => s.ok === null).length}개`,
    dead.length ? '\n안 열린 링크 (페이지에서는 링크 없이 작업 내용만 보입니다)\n' + dead.map((w) => `- ${w.id} ${w.title} ${w.url}`).join('\n') : '',
    moved.length ? '\n열리긴 했지만 확인이 필요한 링크 (화면을 보고, 사이트가 바뀌었으면 works-data.js 에 dead: true)\n' + moved.map((w) => `- ${w.id} ${w.title}: ${status[w.id].note}`).join('\n') : ''
].join('\n');
console.log('\n' + summary);
await fs.writeFile(path.join(here, 'last-report.txt'), summary + '\n');
console.log('\n캡처: images/works/ , 기록: js/works-status.js');
