import { Picker } from 'emoji-mart';
import data from '@emoji-mart/data';
import { createPopper } from '@popperjs/core';
import './style.css';

const MOBILE_PICKER_MEDIA = '(max-width: 768px)';

const textarea = document.getElementById('send_textarea');

if (!(textarea instanceof HTMLTextAreaElement)) {
    throw new Error('Element with id "send_textarea" is not a textarea.');
}

/**
 * Insert text at the current cursor position in a textarea or input field.
 * @param {string} newText The text to insert
 * @param {HTMLTextAreaElement|HTMLInputElement} el The textarea or input element
 */
function typeInTextarea(newText, el = document.activeElement) {
    const [start, end] = [el.selectionStart, el.selectionEnd];

    if (start === null || end === null) {
        el.value += newText;
        return;
    }

    el.setRangeText(newText, start, end, 'end');
}

/**
 * Insert an emoji into the textarea.
 * @param {{native: string}} inputEmoji Emoji object
 * @returns
 */
let targetTextarea = textarea;
let pickerAnchor;
let popper;

function insertEmoji(inputEmoji) {
    const emoji = inputEmoji.native;
    typeInTextarea(emoji, targetTextarea);
    targetTextarea.focus();
    picker.classList.add('displayNone');
    popper.update();
    const event = new Event('input', { bubbles: true, cancelable: true });
    targetTextarea.dispatchEvent(event);
}

/**
 * Gets the language code from the local storage.
 * @returns {string} Language code
 */
function getLanguageCode() {
    const language = localStorage.getItem('language');
    const languageCode = language ? String(language.split('-')[0]).trim().toLowerCase() : 'en';
    return languageCode;
}

/**
 * Get locale data based on the language code.
 * @returns {Promise<any>} Locale data
 */
async function getLocaleData() {
    const languageCode = getLanguageCode();

    switch (languageCode) {
        case 'ar':
            return await import('@emoji-mart/data/i18n/ar.json');
        case 'be':
            return await import('@emoji-mart/data/i18n/be.json');
        case 'cs':
            return await import('@emoji-mart/data/i18n/cs.json');
        case 'de':
            return await import('@emoji-mart/data/i18n/de.json');
        case 'en':
            return await import('@emoji-mart/data/i18n/en.json');
        case 'es':
            return await import('@emoji-mart/data/i18n/es.json');
        case 'fa':
            return await import('@emoji-mart/data/i18n/fa.json');
        case 'fi':
            return await import('@emoji-mart/data/i18n/fi.json');
        case 'fr':
            return await import('@emoji-mart/data/i18n/fr.json');
        case 'hi':
            return await import('@emoji-mart/data/i18n/hi.json');
        case 'it':
            return await import('@emoji-mart/data/i18n/it.json');
        case 'ja':
            return await import('@emoji-mart/data/i18n/ja.json');
        case 'ko':
            return await import('@emoji-mart/data/i18n/ko.json');
        case 'nl':
            return await import('@emoji-mart/data/i18n/nl.json');
        case 'pl':
            return await import('@emoji-mart/data/i18n/pl.json');
        case 'pt':
            return await import('@emoji-mart/data/i18n/pt.json');
        case 'ru':
            return await import('@emoji-mart/data/i18n/ru.json');
        case 'sa':
            return await import('@emoji-mart/data/i18n/sa.json');
        case 'tr':
            return await import('@emoji-mart/data/i18n/tr.json');
        case 'uk':
            return await import('@emoji-mart/data/i18n/uk.json');
        case 'vi':
            return await import('@emoji-mart/data/i18n/vi.json');
        case 'zh':
            return await import('@emoji-mart/data/i18n/zh.json');
        default:
            return await import('@emoji-mart/data/i18n/en.json');
    }
}

const i18n = await getLocaleData();
const pickerOptions = {
    onEmojiSelect: insertEmoji,
    i18n: i18n,
    locale: getLanguageCode(),
    data: data,
    previewPosition: 'none',
    skinTonePosition: 'search',
};

function fixPickerEmojiLayout(pickerElement) {
    const shadowRoot = pickerElement.shadowRoot;
    if (!shadowRoot || shadowRoot.querySelector('#st-emoji-picker-layout-fix')) return;

    const style = document.createElement('style');
    style.id = 'st-emoji-picker-layout-fix';
    style.textContent = `
        .emoji-mart-emoji { height: 32px !important; line-height: 32px !important; }
        .emoji-mart-emoji > span { line-height: 32px !important; }
    `;
    shadowRoot.appendChild(style);
}

const picker = new Picker(pickerOptions);
fixPickerEmojiLayout(picker);
const buttonContainer = document.getElementById('rightSendForm');
const addEmojiButton = document.createElement('div');
addEmojiButton.id = 'addEmojiButton';
addEmojiButton.title = 'Insert emoji';
addEmojiButton.classList.add('fa-solid', 'fa-icons', 'interactable');
addEmojiButton.tabIndex = 0;
popper = createPopper(addEmojiButton, picker, {
    placement: 'top-end',
    modifiers: [],
});
picker.classList.add('displayNone');
buttonContainer.insertAdjacentElement('afterbegin', addEmojiButton);
function togglePicker(anchor, target) {
    targetTextarea = target;
    if (anchor !== pickerAnchor) {
        popper.destroy();
        popper = createPopper(anchor, picker, { placement: 'top-end', modifiers: [] });
        pickerAnchor = anchor;
    }
    picker.classList.toggle('displayNone');
    popper.update();

    if (!picker.classList.contains('displayNone')) {
        const search = picker.shadowRoot?.querySelector('input[type="search"]');
        if (search instanceof HTMLInputElement) {
            search.value = '';
            search.dispatchEvent(new Event('input'));
            search.focus();
        }
    } else {
        targetTextarea.focus();
    }
}
buttonContainer.addEventListener('click', () => togglePicker(addEmojiButton, textarea));
document.body.appendChild(picker);

function resetPickerSearch(pickerElement) {
    const search = pickerElement.shadowRoot?.querySelector('input[type="search"]');
    if (search instanceof HTMLInputElement) {
        search.value = '';
        search.dispatchEvent(new Event('input'));
        search.focus();
    }
}

let copilotPicker;
let copilotPopper;
let copilotTarget;
function openCopilotPicker(target, anchor) {
    if (window.matchMedia(MOBILE_PICKER_MEDIA).matches) {
        copilotPicker?.classList.add('displayNone');
        return false;
    }
    if (!copilotPicker) {
        copilotTarget = target;
        copilotPicker = new Picker({
            ...pickerOptions,
            onEmojiSelect: inputEmoji => {
                typeInTextarea(inputEmoji.native, copilotTarget);
                copilotTarget.focus();
                copilotPicker.classList.add('displayNone');
                copilotPopper.update();
                copilotTarget.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            },
        });
        fixPickerEmojiLayout(copilotPicker);
        copilotPicker.classList.add('displayNone');
        document.body.appendChild(copilotPicker);
    }
    copilotTarget = target;
    if (anchor === pickerAnchor && !copilotPicker.classList.contains('displayNone')) {
        copilotPicker.classList.add('displayNone');
        copilotPopper?.update();
        return false;
    }
    if (copilotPopper) copilotPopper.destroy();
    copilotPopper = createPopper(anchor, copilotPicker, { placement: 'top-end', modifiers: [] });
    pickerAnchor = anchor;
    copilotPicker.classList.remove('displayNone');
    copilotPopper.update();
    resetPickerSearch(copilotPicker);
    return true;
}

window.STEmojiPicker = {
    openFor(target, anchor) {
        if (!(target instanceof HTMLTextAreaElement) || !(anchor instanceof HTMLElement)) return;
        return openCopilotPicker(target, anchor);
    },
};
window.matchMedia(MOBILE_PICKER_MEDIA).addEventListener('change', event => {
    if (event.matches) {
        copilotPicker?.classList.add('displayNone');
    }
});
document.body.addEventListener('click', (event) => {
    if (!picker.classList.contains('displayNone') && !picker.contains(event.target) && !event.target.closest('#addEmojiButton')) {
        picker.classList.add('displayNone');
        popper.update();
    }
    if (copilotPicker && !copilotPicker.classList.contains('displayNone') && !copilotPicker.contains(event.target) && !event.target.closest('.scp-emoji-btn')) {
        copilotPicker.classList.add('displayNone');
        copilotPopper?.update();
    }
});
document.body.addEventListener('keyup', (event) => {
    if (!picker.classList.contains('displayNone') && event.key === 'Escape') {
        picker.classList.add('displayNone');
        popper.update();
    }
    if (copilotPicker && !copilotPicker.classList.contains('displayNone') && event.key === 'Escape') {
        copilotPicker.classList.add('displayNone');
        copilotPopper?.update();
    }
});
