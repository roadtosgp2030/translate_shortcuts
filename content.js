(() => {
  'use strict';

  // Google Translate is a single-page app that re-renders its panels, so every
  // lookup happens at key-press time. Elements are found by `jsname` (stable
  // across UI languages) and fall back to aria-labels in English and Vietnamese.

  const isVisible = (el) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };

  const visible = (selector) => [...document.querySelectorAll(selector)].filter(isVisible);

  const byJsname = (jsname) => visible(`[jsname="${jsname}"]`)[0];

  const byLabel = (...labels) =>
    visible('button,[role=button],a,input,textarea').find((el) => {
      const label = el.getAttribute('aria-label') || '';
      return labels.some((l) => label.startsWith(l));
    });

  const find = (jsname, ...labels) => byJsname(jsname) || byLabel(...labels);

  // Save, Listen-to-source and Listen-to-translation all share jsname="UsVyAb".
  const sharedButtons = () => visible('button[jsname="UsVyAb"]');
  const isStar = (el) => /star/.test(el.innerText || '');
  const listenButtons = () => sharedButtons().filter((el) => !isStar(el));

  const el = {
    textMode: () => find('bl4nBb', 'Text translation', 'Dịch văn bản'),
    imageMode: () => find('SHEbFd', 'Image translation', 'Dịch hình ảnh'),
    documentMode: () => find('qDeCrf', 'Document translation', 'Dịch tài liệu'),
    websiteMode: () => find('n87sxd', 'Website translation', 'Dịch trang web'),

    sourceText: () => find('BJE2fc', 'Source text', 'Văn bản nguồn'),
    websiteUrl: () => byJsname('YPqjbf') || visible('input[type=url]')[0],
    clear: () => find('X5DuWc', 'Clear source text', 'Xóa văn bản nguồn', 'Xoá URL trang web', 'Clear website URL'),
    voice: () => find('Sz6qce', 'Translate by voice', 'Dịch bằng giọng nói'),
    listenSource: () =>
      byLabel('Listen to source text', 'Nghe văn bản nguồn') || listenButtons()[0],
    listenTranslation: () =>
      byLabel('Listen to translation', 'Nghe bản dịch') || listenButtons()[1],
    model: () => byLabel('Text translation model', 'Mô hình dịch văn bản'),
    inputTools: () => byLabel('Show the Input Tools menu', 'Hiển thị trình đơn Công cụ nhập'),

    save: () =>
      sharedButtons().find(isStar) ||
      byLabel('Save translation', 'Lưu bản dịch', 'Remove from saved', 'Xóa khỏi mục đã lưu'),
    copy: () => find('kImuFf', 'Copy translation', 'Sao chép bản dịch'),
    search: () => find('vLv7Lb', 'Search with Google', 'Tìm kiếm bằng Google'),
    rate: () => find('IOOiDc', 'Rate this translation', 'Xếp hạng bản dịch này'),
    share: () => find('ymIaV', 'Share translation', 'Chia sẻ bản dịch'),
    // Single words get a "View dictionary" link that opens a details side panel.
    openDictionary: () => byJsname('PbDcyb'),
    closeDetails: () => find('l7qC9d', 'Close details', 'Đóng thông tin chi tiết'),

    moreSource: () => find('RCbdJd', 'More source languages', 'Ngôn ngữ nguồn khác'),
    moreTarget: () => find('zumM6d', 'More target languages', 'Ngôn ngữ đích khác'),
    swap: () => find('dnDxad', 'Swap languages', 'Hoán đổi ngôn ngữ'),

    history: () => byJsname('cpynB'),
    saved: () => byJsname('GxFwEe'),
    theme: () => find('jerT5', 'Switch between light and dark theme', 'Chuyển đổi giữa giao diện sáng và tối'),
    settings: () => find('dq27Te', 'Settings', 'Tùy chọn cài đặt'),

    browseFiles: () => find('DagSrd', 'Browse your files', 'Duyệt qua các tệp'),
    pasteImage: () => find('xcJrbc', 'Paste an image from clipboard', 'Dán hình ảnh từ bảng nhớ tạm'),
  };

  // The first visible language tablist is the source bar, the second the target bar.
  const languageTabs = (side) => {
    const lists = visible('[role=tablist]').filter((l) => l.querySelector('[data-language-code]'));
    const list = lists[side === 'source' ? 0 : 1];
    return list ? [...list.querySelectorAll('[role=tab]')].filter(isVisible) : [];
  };

  const toast = (() => {
    let node;
    let timer;
    return (message) => {
      if (!node) {
        node = document.createElement('div');
        node.className = 'gts-toast';
        node.setAttribute('role', 'status');
        document.body.appendChild(node);
      }
      node.textContent = message;
      node.classList.add('gts-show');
      clearTimeout(timer);
      timer = setTimeout(() => node.classList.remove('gts-show'), 1600);
    };
  })();

  const press = (getter, missingMessage) => () => {
    const target = getter();
    if (!target || target.disabled) {
      toast(missingMessage);
      return;
    }
    target.click();
  };

  const focusInput = () => {
    const input = el.websiteUrl() || el.sourceText();
    if (!input) return toast('Không tìm thấy ô nhập');
    input.focus();
    input.select();
  };

  const copyTranslation = async () => {
    const button = el.copy();
    if (button && !button.disabled) {
      button.click(); // Google Translate shows its own "copied" notice.
      return;
    }
    const text = visible('span[jsname="W297wb"]').map((s) => s.innerText).join('');
    if (!text) return toast('Chưa có bản dịch để sao chép');
    await navigator.clipboard.writeText(text);
    toast('Đã sao chép bản dịch');
  };

  const selectLanguageTab = (side, code) => () => {
    const tab = languageTabs(side).find((t) => t.getAttribute('data-language-code') === code);
    if (!tab) return toast('Không tìm thấy ngôn ngữ');
    tab.click();
  };

  const cycleLanguage = (side, step) => () => {
    const tabs = languageTabs(side);
    if (!tabs.length) return toast('Không tìm thấy thanh ngôn ngữ');
    const current = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    const next = tabs[(current + step + tabs.length) % tabs.length];
    next.click();
    toast(next.innerText.trim());
  };

  // ---- Shortcut table -----------------------------------------------------
  // `code` is KeyboardEvent.code (physical key), so Telex/VNI input methods and
  // non-US layouts do not interfere. All shortcuts use Alt (never AltGr, which
  // reports as Ctrl+Alt) and avoid Alt+D/E/F, which Chrome reserves.

  const SHORTCUTS = [
    { group: 'Chế độ dịch' },
    { keys: 'Alt+1', code: 'Digit1', label: 'Dịch văn bản', run: press(el.textMode, 'Không tìm thấy tab Văn bản') },
    { keys: 'Alt+2', code: 'Digit2', label: 'Dịch hình ảnh', run: press(el.imageMode, 'Không tìm thấy tab Hình ảnh') },
    { keys: 'Alt+3', code: 'Digit3', label: 'Dịch tài liệu', run: press(el.documentMode, 'Không tìm thấy tab Tài liệu') },
    { keys: 'Alt+4', code: 'Digit4', label: 'Dịch trang web', run: press(el.websiteMode, 'Không tìm thấy tab Trang web') },

    { group: 'Ngôn ngữ' },
    { keys: 'Alt+S', code: 'KeyS', label: 'Hoán đổi ngôn ngữ (có sẵn: Ctrl+Shift+S)', run: press(el.swap, 'Chưa thể hoán đổi ngôn ngữ') },
    { keys: 'Alt+Q', code: 'KeyQ', label: 'Chọn ngôn ngữ nguồn (mở ô tìm kiếm)', run: press(el.moreSource, 'Không tìm thấy bộ chọn ngôn ngữ nguồn') },
    { keys: 'Alt+W', code: 'KeyW', label: 'Chọn ngôn ngữ đích (mở ô tìm kiếm)', run: press(el.moreTarget, 'Không tìm thấy bộ chọn ngôn ngữ đích') },
    { keys: 'Alt+Z', code: 'KeyZ', label: 'Nguồn: Phát hiện ngôn ngữ', run: selectLanguageTab('source', 'auto') },
    { keys: 'Alt+[  /  Alt+]', code: 'BracketLeft', alsoCode: 'BracketRight', label: 'Ngôn ngữ nguồn gần đây: trước / sau', run: cycleLanguage('source', -1), alsoRun: cycleLanguage('source', 1) },
    { keys: 'Alt+Shift+[  /  ]', code: 'BracketLeft', alsoCode: 'BracketRight', shift: true, label: 'Ngôn ngữ đích gần đây: trước / sau', run: cycleLanguage('target', -1), alsoRun: cycleLanguage('target', 1) },

    { group: 'Văn bản nguồn' },
    { keys: 'Alt+I  hoặc  /', code: 'KeyI', label: 'Đưa con trỏ vào ô nhập (văn bản hoặc URL)', run: focusInput },
    { keys: 'Alt+X', code: 'KeyX', label: 'Xóa văn bản nguồn', run: press(el.clear, 'Không có gì để xóa') },
    { keys: 'Alt+V', code: 'KeyV', label: 'Dịch bằng giọng nói (bật/tắt micro)', run: press(el.voice, 'Ngôn ngữ này không hỗ trợ giọng nói') },
    { keys: 'Alt+J', code: 'KeyJ', label: 'Nghe văn bản nguồn / dừng', run: press(el.listenSource, 'Chưa có văn bản để nghe') },
    { keys: 'Alt+M', code: 'KeyM', label: 'Chọn mô hình dịch (Nâng cao / Cổ điển)', run: press(el.model, 'Không có tùy chọn mô hình dịch') },
    { keys: 'Alt+Shift+I', code: 'KeyI', shift: true, label: 'Mở Công cụ nhập (bàn phím ảo, viết tay)', run: press(el.inputTools, 'Không có Công cụ nhập cho ngôn ngữ này') },

    { group: 'Bản dịch' },
    { keys: 'Alt+C', code: 'KeyC', label: 'Sao chép bản dịch', run: copyTranslation },
    { keys: 'Alt+K', code: 'KeyK', label: 'Nghe bản dịch / dừng', run: press(el.listenTranslation, 'Chưa có bản dịch để nghe') },
    { keys: 'Alt+B', code: 'KeyB', label: 'Lưu / bỏ lưu bản dịch (ngôi sao)', run: press(el.save, 'Chưa có bản dịch để lưu') },
    { keys: 'Alt+G', code: 'KeyG', label: 'Tìm bản dịch trên Google', run: press(el.search, 'Chưa có bản dịch để tìm') },
    { keys: 'Alt+R', code: 'KeyR', label: 'Đánh giá bản dịch', run: press(el.rate, 'Chưa có bản dịch để đánh giá') },
    { keys: 'Alt+O', code: 'KeyO', label: 'Chia sẻ bản dịch', run: press(el.share, 'Chưa có bản dịch để chia sẻ') },
    { keys: 'Alt+A', code: 'KeyA', label: 'Mở / đóng từ điển (khi dịch một từ)', run: press(() => el.closeDetails() || el.openDictionary(), 'Không có mục từ điển cho văn bản này') },

    { group: 'Hình ảnh & tài liệu' },
    { keys: 'Alt+U', code: 'KeyU', label: 'Chọn tệp để tải lên', run: press(el.browseFiles, 'Hãy chuyển sang tab Hình ảnh hoặc Tài liệu (Alt+2 / Alt+3)') },
    { keys: 'Alt+P', code: 'KeyP', label: 'Dán hình ảnh từ bộ nhớ tạm', run: press(el.pasteImage, 'Hãy chuyển sang tab Hình ảnh (Alt+2)') },

    { group: 'Trang' },
    { keys: 'Alt+H', code: 'KeyH', label: 'Lịch sử dịch', run: press(el.history, 'Không tìm thấy Lịch sử') },
    { keys: 'Alt+L', code: 'KeyL', label: 'Bản dịch đã lưu', run: press(el.saved, 'Không tìm thấy mục Đã lưu') },
    { keys: 'Alt+T', code: 'KeyT', label: 'Đổi giao diện sáng / tối', run: press(el.theme, 'Không tìm thấy nút giao diện') },
    { keys: 'Alt+,', code: 'Comma', label: 'Cài đặt', run: press(el.settings, 'Không tìm thấy Cài đặt') },
    { keys: 'Alt+/  hoặc  ?', code: 'Slash', label: 'Hiện / ẩn bảng phím tắt này', run: () => toggleHelp() },

    { group: 'Mọi trang web' },
    { keys: 'Alt+Shift+T', label: 'Dịch văn bản đang chọn trong tab Google Dịch (đổi được ở chrome://extensions/shortcuts)' },
    { keys: 'Chuột phải', label: 'Dịch "…" bằng Google Dịch' },
  ];

  const bindings = new Map();
  for (const s of SHORTCUTS) {
    if (!s.code) continue;
    bindings.set(`${s.shift ? 'S' : ''}${s.code}`, s.run);
    if (s.alsoCode) bindings.set(`${s.shift ? 'S' : ''}${s.alsoCode}`, s.alsoRun);
  }

  // ---- Help overlay -------------------------------------------------------

  let help;

  const buildHelp = () => {
    const overlay = document.createElement('div');
    overlay.className = 'gts-overlay';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) toggleHelp(false);
    });

    const panel = document.createElement('div');
    panel.className = 'gts-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Phím tắt Google Dịch');

    const title = document.createElement('h2');
    title.textContent = 'Phím tắt Google Dịch';
    panel.appendChild(title);

    const columns = document.createElement('div');
    columns.className = 'gts-columns';
    let section;
    for (const s of SHORTCUTS) {
      if (s.group) {
        section = document.createElement('section');
        const h = document.createElement('h3');
        h.textContent = s.group;
        section.appendChild(h);
        columns.appendChild(section);
        continue;
      }
      const row = document.createElement('div');
      row.className = 'gts-row';
      const keys = document.createElement('kbd');
      keys.textContent = s.keys;
      const label = document.createElement('span');
      label.textContent = s.label;
      row.append(keys, label);
      section.appendChild(row);
    }
    panel.appendChild(columns);

    const footer = document.createElement('p');
    footer.className = 'gts-footer';
    footer.textContent = 'Esc để đóng';
    panel.appendChild(footer);

    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    return overlay;
  };

  function toggleHelp(force) {
    help = help || buildHelp();
    const show = force ?? !help.classList.contains('gts-show');
    help.classList.toggle('gts-show', show);
  }

  // ---- Keyboard dispatch --------------------------------------------------

  const isTyping = (target) =>
    target instanceof HTMLElement &&
    (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

  window.addEventListener(
    'keydown',
    (e) => {
      if (e.isComposing) return;

      if (e.key === 'Escape' && help?.classList.contains('gts-show')) {
        e.preventDefault();
        e.stopPropagation();
        toggleHelp(false);
        return;
      }

      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const run = bindings.get(`${e.shiftKey ? 'S' : ''}${e.code}`);
        if (!run) return;
        e.preventDefault();
        e.stopPropagation();
        run();
        return;
      }

      // Single-key shortcuts only when the user is not typing.
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
      if (e.key === '/') {
        e.preventDefault();
        focusInput();
      } else if (e.key === '?') {
        e.preventDefault();
        toggleHelp();
      }
    },
    true,
  );
})();
