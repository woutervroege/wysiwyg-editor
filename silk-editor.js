import { LitElement, html } from 'lit-element';
import './silk-icon.js';

/**
 * `silk-editor-demo`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class SilkEditor extends LitElement {
  render() {
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
          display: flex;
          visibility: hidden;
        }

        :host([editing]) #formatting-bar {
          display: flex;
          visibility: visible;
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
        
        ${this.buttons.map(button => {
    return html`
            <button
              data-type="${button.type}"
              data-action="${button.name}"
              @click="${this._handleButtonTap}"
              ?data-enabled="${this._buttonEnabled(button.name, button.type)}"
            >
              <silk-icon icon="format-${button.name}" ?hidden="${!button.icon}"></silk-icon>
              <span ?hidden="${button.icon}">${button.name}</span>
            </button>
          `;
  })}

      </section>
    `;
  }

  static get properties() {
    return {
      
      editing: {
        type: Boolean,
        reflect: true,
      },

      options: {
        type: Array,
      },

      buttons: {
        type: Array,
      },

      selectedText: {
        type: String,
        readOnly: true,
      },

      _selectedLink: {
        type: String,
      },

      _selectedNodesTree: {
        type: Array,
      },

      _lastButtonCmd: {
        type: String,
      }

    };
  }

  constructor() {
    super();

    this.editing = false;
    this.options = ['bold', 'italic', 'strikethrough', 'underline', 'h1', 'h2', 'blockquote', 'justify-left', 'justify-center', 'justify-right', 'justify-full', 'indent', 'outdent', 'link', 'clear'];
    this.selectedText = null;
    this._selectedLink = null;
    this._selectedNodesTree = [];

    document.addEventListener('selectionchange', this._handleSelectionChange.bind(this));
  }

  updated(props) {
    if(props.has('editing')) this.dispatchEvent(new CustomEvent('editing-changed', {detail: {value: this.editing}}));
    
    if(props.has('selectedText')) {
      this.editing = this.selectedText;
      this._moveFormattingBar();
    }
  }

  get buttons() {
    var options = this.options || [];
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
        });
        break;
      case 'indent':
      case 'outdent':
        buttons.push({
          name: optionName.charAt(0).toUpperCase() + optionName.substr(1),
          type: 'normal',
          icon: true
        });
        break;
      case 'clear':
      case 'blockquote':
        buttons.push({
          name: optionName,
          type: 'block',
          icon: true
        });
        break;
      case 'justify-left':
      case 'justify-right':
      case 'justify-center':
      case 'justify-full':
        buttons.push({
          name: optionName.replace(/(-\w)/g, function(m){return m[1].toUpperCase();}),
          type: 'normal',
          icon: true
        });
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
        });
        break;
      case 'link':
        buttons.push({
          name: optionName,
          type: 'link',
          icon: true
        });
        break;
      }
    }
    return buttons;
  }

  get editing() {
    return this._editing;
  }

  set editing(selectedText) {
    const oldVal = this._editing;
    this._editing = !!this.selectedText;
    this.requestUpdate('editing', oldVal);
  }

  _handleSelectionChange() {
    var selection = window.getSelection().toString();
    var hasSelection = selection.replace(/\s|\r\n/g, '').length > 0;
    if(!hasSelection) return this.selectedText = null;
    this.selectedText = window.getSelection().toString() || null;

    this._selectedLink = null;
    this._setSelectedNodesTree();

  }

  _setSelectedNodesTree() {
    var _selectedNodesTree = [];
    if(!this.selectedText) return;
    var currentElement = window.getSelection().getRangeAt(0).startContainer.parentElement;
    if(!currentElement) return this._selectedNodesTree = _selectedNodesTree;

    var nodeName = currentElement.nodeName.toLowerCase();

    while(currentElement.contentEditable !== 'true') {
      if(nodeName == 'a') { this._selectedLink = currentElement.href; }
      _selectedNodesTree.push(currentElement);
      currentElement = currentElement.parentElement;
      if(!currentElement) return;
      nodeName = currentElement.nodeName.toLowerCase();
    }
    this._selectedNodesTree = _selectedNodesTree;

  }

  _getElement() {
    if(window.getSelection().rangeCount === 0) return;
    let currentElement = window.getSelection().getRangeAt(0).startContainer.parentElement;
    if(!currentElement) return;
    while(currentElement.contentEditable !== 'true') {
      currentElement = currentElement.parentElement;
    }
    return currentElement;
  }

  _buttonEnabled(state, buttonType) {
    switch(buttonType) {
    case 'normal':
      return this._stateEnabled(state);
    case 'block':
      return this._blockEnabled(state);
    case 'link':
      return this._blockEnabled('a');
    }
  }

  _stateEnabled(state) {
    return document.queryCommandState(state);
  }

  _blockEnabled(state) {
    const selectedNames = new Set(this._selectedNodesTree.map(item => item.nodeName.toLowerCase()));
    const blockEnabled = selectedNames.has(state);
    return blockEnabled;
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
    window.requestAnimationFrame(() => {this._lastButtonCmd = action; });
  }

  _toggleState(cmd) {
    document.execCommand(cmd, false);
  }

  _toggleBlock(cmd) {


    var selection = window.getSelection();
    var range = selection.getRangeAt(0);

    this._setSelectedNodesTree();  
    let selectedNodeNames = new Set(this._selectedNodesTree.map(item => item.nodeName.toLowerCase()));
    let selectedItem = this._selectedNodesTree[this._selectedNodesTree.length-1];
    if(!selectedItem) return;

    try {
      range.selectNode(selectedItem);
      range.deleteContents();
      let newEl;

      if(cmd === 'clear') {
        document.createElement('span');
        newEl.innerHTML = selectedItem.innerText;
      } else {
        const blockEnabled = selectedNodeNames.has(cmd);
        document.createElement(blockEnabled ? 'span' : cmd);
        newEl.innerHTML = selectedItem.innerHTML;
      }

      selection.removeAllRanges();
      range.insertNode(newEl);

    } catch(e) { (() => {})(); }

    if(window.ShadyCSS) this._applyShadyClasses();

  }

  _applyShadyClasses() {
    var $element = this._getElement();
    if(!$element) return;
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

    const top =  (selectionBox.top - formattingBarBox.height - 16) + 'px';
    const left = (selectionBox.left - (formattingBarBox.width/2)) + (selectionBox.width/2) + 'px';

    formattingBar.style.setProperty('top', top);
    formattingBar.style.setProperty('left', left);
  }

}

window.customElements.define('silk-editor', SilkEditor);