import { LitElement, html, css } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import './silk-editor.js';

/**
 * `silk-editor-demo`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/slp-ui-page.html
 */
class SilkEditorDemo extends LitElement {
  
  static get styles() {
    return css`
      article {
        display: inline-block;
        outline: none;
        font-family: sans-serif;
      }

      blockquote {
        font-size: 24px;
      }

      blockquote:before, blockquote:after {
        content: '"';
      }
    `;
  }
  
  render() {
    return html`
      <silk-editor
        ?editing="${this.editing}"
        @editing-changed="${(e) => this.editing = e.detail.value}"
      ></silk-editor>

      <article
        id="article"
        contenteditable="true"
        spellcheck="false"
        @input="${this._htmlChanged}"
        @focus="${this._handleFocus}"
        @blur="${this._handleBlur}"
      >${unsafeHTML(this.articleContents)}</article>
    `;
  }


  static get properties() {
    return {

      editing: {
        type: Boolean
      },

      content: {
        type: String,
      },

      articleContents: {
        type: String
      },

      _focused: {
        type: Boolean,
      }

    };
  }

  constructor() {
    super();
    this._focused = false;
  }

  updated(props) {
    if(props.has('content')) this.articleContents = this.content;
  }

  set articleContents(html) {
    if(this.editing || this._focused) return;
    const oldVal = this._articleContents;
    this._articleContents = html;
    this.requestUpdate('articleContents', oldVal);
  }

  get articleContents() {
    return this._articleContents;
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