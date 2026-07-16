export type EmailLayoutParams = {
  previewText?: string;
  title: string;
  contentHtml: string;
  actionLabel?: string;
  actionUrl?: string;
  footerText?: string;
};

export function buildEmailLayout(
  params: EmailLayoutParams,
): string {
  const actionHtml =
    params.actionLabel && params.actionUrl
      ? `
        <table
          role="presentation"
          border="0"
          cellpadding="0"
          cellspacing="0"
          style="margin: 32px auto 8px;"
        >
          <tr>
            <td
              align="center"
              bgcolor="#c9a96e"
              style="border-radius: 2px;"
            >
              <a
                href="${escapeHtmlAttribute(params.actionUrl)}"
                target="_blank"
                rel="noopener noreferrer"
                style="
                  display: inline-block;
                  padding: 14px 28px;
                  font-family: Arial, Helvetica, sans-serif;
                  font-size: 13px;
                  font-weight: 700;
                  letter-spacing: 1.2px;
                  line-height: 1;
                  text-decoration: none;
                  text-transform: uppercase;
                  color: #090909;
                  background-color: #c9a96e;
                  border-radius: 2px;
                "
              >
                ${escapeHtml(params.actionLabel)}
              </a>
            </td>
          </tr>
        </table>
      `
      : '';

  const previewText = params.previewText
    ? `
      <div
        style="
          display: none;
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          color: transparent;
        "
      >
        ${escapeHtml(params.previewText)}
      </div>
    `
    : '';

  return `
<!doctype html>
<html lang="ro">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    />
    <title>${escapeHtml(params.title)}</title>
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #050505;
      color: #f4efe6;
    "
  >
    ${previewText}

    <table
      role="presentation"
      width="100%"
      border="0"
      cellpadding="0"
      cellspacing="0"
      style="
        width: 100%;
        background-color: #050505;
        padding: 32px 12px;
      "
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            width="100%"
            border="0"
            cellpadding="0"
            cellspacing="0"
            style="
              width: 100%;
              max-width: 640px;
              background-color: #0c0c0c;
              border: 1px solid #29241c;
            "
          >
            <tr>
              <td
                align="center"
                style="
                  padding: 38px 32px 28px;
                  border-bottom: 1px solid #29241c;
                "
              >
                <div
                  style="
                    font-family: Georgia, 'Times New Roman', serif;
                    font-size: 30px;
                    font-weight: 400;
                    letter-spacing: 2px;
                    line-height: 1.2;
                    color: #d7bb83;
                  "
                >
                  SUNSHINE RESORT
                </div>

                <div
                  style="
                    margin-top: 8px;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 10px;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    color: #8f877a;
                  "
                >
                  Adults Only · Luxury Retreat
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding: 42px 38px 34px;">
                <h1
                  style="
                    margin: 0 0 24px;
                    font-family: Georgia, 'Times New Roman', serif;
                    font-size: 30px;
                    font-weight: 400;
                    line-height: 1.25;
                    color: #f4efe6;
                  "
                >
                  ${escapeHtml(params.title)}
                </h1>

                <div
                  style="
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 15px;
                    line-height: 1.75;
                    color: #c8c1b5;
                  "
                >
                  ${params.contentHtml}
                </div>

                ${actionHtml}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 24px 38px 32px;
                  border-top: 1px solid #29241c;
                  font-family: Arial, Helvetica, sans-serif;
                  font-size: 12px;
                  line-height: 1.6;
                  color: #777065;
                  text-align: center;
                "
              >
                ${
                  params.footerText
                    ? escapeHtml(params.footerText)
                    : 'Sunshine Resort · Relaxare, intimitate și confort în natură.'
                }

                <br />

                <span style="color: #a38e68;">
                  Acesta este un mesaj automat.
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeHtmlAttribute(value: string): string {
  return escapeHtml(value);
}