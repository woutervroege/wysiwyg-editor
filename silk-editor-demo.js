import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import './silk-editor.js';

/**
 * `silk-editor-demo`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/slp-ui-page.html
 */
class SilkEditorDemo extends PolymerElement {
  static get template() {
    return html`
      <style>
          article {
            display: inline-block;
            outline: none;
          }

          blockquote {
            font-size: 24px;
          }

          blockquote:before, blockquote:after {
            content: '"';
          }
      </style>

      <silk-editor
        editing="{{editing}}"
      ></silk-editor>

      <article
        id="article"
        contenteditable="true"
        spellcheck="false"
        on-input="_htmlChanged"
        on-focus="_handleFocus"
        on-blur="_handleBlur"
      ></article>
    `
  }


  static get properties() {
    return {

      editing: {
        type: Boolean
      },

      content: {
        type: String,
        observer: '_contentChanged'
      },

      _focused: {
        type: Boolean,
        value: false
      }

    }
  }

  _contentChanged(content) {
    if(this.editing || this._focused) return;
    var $article = this.shadowRoot.querySelector('#article');
    $article.innerHTML = content;
  }

  _htmlChanged(evt) {
    this.content = evt.target.innerHTML;
  }

  _handleFocus() {
    this._focused = true;
  }

  _handleBlur() {
    this._focused = false;
  }

}

window.customElements.define('silk-editor-demo', SilkEditorDemo);