import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import './silk-icon.js';

/**
 * `silk-editor-demo`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class SilkEditor extends GestureEventListeners(PolymerElement) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
          padding: 0;
          margin: 0;
          
          --silk-formatting-bar: {
            position: fixed;
            z-index: 11;
            visibility: visible;
            opacity: 1;
            display: flex;
            align-items: center;
            padding: 3px 6px;
            border-radius: 5px;
            background-color: #323232;
            transition: 0.3s 0.1s opacity, 0.1s visibility, 0.1s 0.1s transform ease-in-out;
            transform: translateY(0);
          };

          --silk-formatting-bar-after: {
            position: absolute;
            content: '';
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 9px 9px 0 9px;
            border-color: #323232 transparent transparent transparent;
          }

          --silk-formatting-bar-hidden: {
            visibility: hidden;
            opacity: 0;
            transform: translateY(16px);
            transition: 0.1s opacity, 0.1s visibility, 0.1s transform ease-in-out;
          }

          --formatting-button: {
            background-color: transparent;
            border: 0;
            outline: none;
            cursor: pointer;
            border: 1px solid transparent;
            border-radius: 3px;
            margin: 3px 0;
            --silk-icon-fill: rgba(255, 255, 255, 0.9);
            color: var(--silk-icon-fill, rgba(255, 255, 255, 0.9));
          };

          --formatting-button-hover: {
            --silk-icon-fill: rgba(255, 255, 255, 1);
            color: rgba(255, 255, 255, 1);
          }

          --formatting-button-disabled: {
            opacity: 0.5;
            pointer-events: none;
          }

          --formatting-button-selected: {
            --silk-icon-fill: #4ec2a5;
            color: #4ec2a5;
          }

          --formatting-button-icon-size: 22px;

        }

        button {
          @apply --formatting-button;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        button > * {
          display: block;
          width: var(--formatting-button-icon-size);
          height: var(--formatting-button-icon-size);
          box-sizing: border-box;
          pointer-events: none;
        }

        button span {
          font-size: 16px;
          font-weight: 700;
        }

        button:hover {
          @apply --formatting-button-hover;
        }

        button[disabled] {
          @apply --formatting-button-hover;
        }

        button[data-enabled] {
          @apply --formatting-button-selected;
        }

        #formatting-bar {
          @apply --silk-formatting-bar;
          display: none;
        }

        :host([editing]) #formatting-bar {
          display: flex;
        }

        #formatting-bar:after {
          @apply --silk-formatting-bar-after;
        }

        #formatting-bar[data-hidden] {
          @apply --silk-formatting-bar-hidden;
        }

        [hidden] {
          display: none!important;
        }
      </style>

      <section id="formatting-bar">
        <dom-repeat items="[[buttons]]" as="button">
          <template>
            <button
              data-type$="[[button.type]]"
              data-action$="[[button.name]]"
              on-tap="_handleButtonTap"
              data-enabled$="[[_buttonEnabled(button.name, button.type, selectedText, content, _selectedNodeNamesTree.*, _lastButtonCmd)]]"
            >
              <silk-icon icon="format-[[button.name]]" hidden$="[[!button.icon]]"></silk-icon>
              <span hidden$="[[button.icon]]">[[button.name]]</span>
            </button>
          </template>
        </dom-repeat>
      </section>
    `
  }

  static get properties() {
    return {
      
      editing: {
        type: Boolean,
        value: false,
        computed: '_computeEditing(selectedText)',
        notify: true,
        reflectToAttribute: true,
      },

      options: {
        type: Array,
        value: ['bold', 'italic', 'strikethrough', 'underline', 'h1', 'h2', 'blockquote', 'justify-left', 'justify-center', 'justify-right', 'justify-full', 'indent', 'outdent', 'link', 'clear']
      },

      buttons: {
        type: Array,
        computed: '_computeButtons(options.*)'
      },

      selectedText: {
        type: String,
        value: null,
        readOnly: true,
        observer: '_moveFormattingBar'
      },

      _selectedLink: {
        type: String,
        value: null
      },

      _selectedNodeNamesTree: {
        type: Array,
        value: []
      },

      _lastButtonCmd: {
        type: String,
      }

    }
  }

  constructor() {
    super();
    document.addEventListener('selectionchange', this._handleSelectionChange.bind(this));
  }

  _computeButtons(optionsChange) {
    var options = optionsChange.base || [];
    var buttons = [];
    for(var i in options) {
      var optionName = options[i];
      switch(optionName) {
        case 'bold':
        case 'italic':
        case 'underline':
        case 'strikethrough':
          buttons.push({
            name: optionName,
            type: 'normal',
            icon: true
          })
          break;
        case 'indent':
        case 'outdent':
          buttons.push({
            name: optionName.charAt(0).toUpperCase() + optionName.substr(1),
            type: 'normal',
            icon: true
          })
          break;
        case 'clear':
        case 'blockquote':
          buttons.push({
            name: optionName,
            type: 'block',
            icon: true
          })
          break;
        case 'justify-left':
        case 'justify-right':
        case 'justify-center':
        case 'justify-full':
          buttons.push({
            name: optionName.replace(/(\-\w)/g, function(m){return m[1].toUpperCase();}),
            type: 'normal',
            icon: true
          })
          break;
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          buttons.push({
            name: optionName,
            type: 'block',
            icon: false
          })
          break;
        case 'link':
          buttons.push({
            name: optionName,
            type: 'link',
            icon: true
          })
          break;
      }
    }
    return buttons;
  }

  _computeEditing(selectedText) {
    return !!selectedText;
  }

  _handleSelectionChange() {
    this._setSelectedText(window.getSelection().toString() || null);

    var _selectedNodeNamesTree = [];
    this._selectedLink = null;

    if(!this.selectedText) return;

    var currentElement = window.getSelection().getRangeAt(0).startContainer.parentElement;
    var nodeName = currentElement.nodeName.toLowerCase();

    while(currentElement.contentEditable !== 'true') {
      if(nodeName == 'a') { this._selectedLink = currentElement.href; }
      _selectedNodeNamesTree.push(nodeName);
      currentElement = currentElement.parentElement;
      nodeName = currentElement.nodeName.toLowerCase();
    }
    this._selectedNodeNamesTree = _selectedNodeNamesTree;
  }

  _getElement() {
    var currentElement = window.getSelection().getRangeAt(0).startContainer.parentElement;
    while(currentElement.contentEditable !== 'true') {
      currentElement = currentElement.parentElement;
    }
    return currentElement;
  }

  _buttonEnabled(state, buttonType) {
    switch(buttonType) {
      case 'normal':
        return this._stateEnabled(state);
        break;
      case 'block':
        return this._blockEnabled(state);
        break;
      case 'link':
        return this._blockEnabled('a');
        break;
    }
  }

  _stateEnabled(state) {
    return document.queryCommandState(state);
  }

  _blockEnabled(state) {
    return this._selectedNodeNamesTree.indexOf(state) !== -1;
  }

  _handleButtonTap(evt) {
    var btnElement = evt.target;
    var type = btnElement.dataset.type;
    var action = btnElement.dataset.action;
    switch(type) {
      case 'normal':
        this._toggleState(action);
        break;
      case 'block':
        this._toggleBlock(action);
        break;
      case 'link':
        this._toggleLink();
        break;
    }
    window.requestAnimationFrame(() => {this._lastButtonCmd = action });
  }

  _toggleState(cmd) {
    document.execCommand(cmd, false);
  }

  _toggleBlock(cmd) {
    var blockType = (this._selectedNodeNamesTree.indexOf(cmd) !== -1 || cmd === 'clear') ? 'p' : cmd;
    document.execCommand('formatBlock', false, blockType);
    if(window.ShadyCSS) this._applyShadyClasses();
  }

  _applyShadyClasses() {
    var $element = this._getElement();
    var elementClasses = Array.from($element.classList);

    var shadyClasses = elementClasses.splice(elementClasses.indexOf('style-scope'));
    var element = window.getSelection().getRangeAt(0).startContainer.parentElement;

    while(element.contentEditable !== 'true') {
      for(var i=0;i<shadyClasses.length;i++) {
        element.classList.add(shadyClasses[i]);
      }
      element = element.parentElement;
    }

  }

  _toggleLink() {
    var linkUrl = window.prompt('Please type in a link', (this._selectedLink || 'https://'));
    if(linkUrl === null) return;
    if(linkUrl === '') return document.execCommand('unlink', false);
    document.execCommand('createLink', false, linkUrl);
  }

  _moveFormattingBar() {
    try {
      var selectionBox = window.getSelection().getRangeAt(0).getBoundingClientRect();
    } catch(err) {
      return;
    }

    var formattingBar = this.shadowRoot.querySelector('#formatting-bar');
    var formattingBarBox = formattingBar.getBoundingClientRect();

    formattingBar.style.top = (selectionBox.top - formattingBarBox.height - 16) + 'px';
    formattingBar.style.left = (selectionBox.left - (formattingBarBox.width/2)) + (selectionBox.width/2) + 'px';
  }

}

window.customElements.define('silk-editor', SilkEditor);