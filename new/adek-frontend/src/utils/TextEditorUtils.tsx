import DOMPurify from "dompurify";

export const TextEditorUtils = {
  /** ------------------------------
   *  ✔ SANITIZE HTML (Safe Cleaning)
   * ------------------------------ */
  sanitizeHTML(html: string): string {
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
    });
  },

  /** ------------------------------
   *  ✔ CHARACTER COUNT (Visible Text)
   * ------------------------------ */
  getCharacterCount(html: string): number {
    if (!html) return 0;
    const text = html.replace(/<[^>]+>/g, ""); // remove HTML tags
    return text.trim().length;
  },

  /** ------------------------------
   * ✔ HTML → PLAIN TEXT
   * ------------------------------ */
  htmlToText(html: string): string {
    if (!html) return "";
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .trim();
  },

  /** ------------------------------
   *  ✔ WORD COUNT
   * ------------------------------ */
  getWordCount(html: string): number {
    const text = this.htmlToText(html);
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  },

  /** ------------------------------
   * ✔ EXTRACT HEADINGS FOR TOC
   * ------------------------------ */
  extractHeadings(html: string): { level: number; text: string }[] {
    const result: { level: number; text: string }[] = [];
    if (!html) return result;

    const regex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
    let match;

    while ((match = regex.exec(html)) !== null) {
      const level = Number(match[1]);
      const text = match[2].replace(/<[^>]+>/g, "");
      result.push({ level, text });
    }

    return result;
  },

  /** ------------------------------
   * ✔ STRIP ALL HTML COMPLETELY
   * ------------------------------ */
  stripHTML(html: string): string {
    return html.replace(/<[^>]+>/g, "").trim();
  },

  /** ------------------------------
   * ✔ LIMIT HTML CONTENT BY LENGTH
   * ------------------------------ */
  limitContent(html: string, max: number): string {
    const text = this.stripHTML(html);
    if (text.length <= max) return html;

    const trimmed = text.substring(0, max);
    return `<p>${trimmed}...</p>`;
  },

  /** ------------------------------
   * ✔ CLEAN EMPTY TAGS
   * ------------------------------ */
  removeEmptyTags(html: string): string {
    return html.replace(/<(\w+)[^>]*>\s*<\/\1>/g, "");
  },
};
