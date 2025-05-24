import { LambdaError } from "./LambdaError.mjs";

const REQUIRED_PARAM_ERROR = (data = null) => new LambdaError(400, "Required URL parameter is missing", data);
const MALFORMED_URL_ERROR = (data = null) => new LambdaError(400, "Malformed URL", data);
const UNSUPPORTED_URL_ERROR = (data = null) => new LambdaError(400, "Unsupported YouTube URL", data);

/**
 * @param {string} url 
 * @returns {URL}
 */
function tryParseUrl(url) {
  try {
    return new URL(url);
  } catch {
    throw MALFORMED_URL_ERROR({ url });
  }
}

/**
 * @param {URL} url 
 * @returns {{
 *   id: string,
 *   type: "shorts" | "video" | "share",
 *   url: URL
 * }}
 */
function tryExtractThumbnailUrl(url) {
  const vo = {
    url: url,
    "shorts" () { return this.url.pathname.slice(8);     },
    "video"  () { return this.url.searchParams.get("v"); },
    "share"  () { return this.url.pathname.slice(1);     },
    get type() {
        return this.url.pathname.startsWith("/shorts") ? "shorts"
             : this.url.pathname.startsWith("/watch")  ? "video"
             : "share";
    },
    get id() {
        return this[this.type]();
    },
    get thumbnail() {
        return new URL(`https://i.ytimg.com/vi/${this.id}/maxresdefault.jpg`);
    }
  };

  if (!/^(www.)?youtu((.be$)|(be.com$))/i.exec(vo.url.hostname)) {
    throw UNSUPPORTED_URL_ERROR({ url });
  }

  return {
    id: vo.id,
    type: vo.type,
    url: vo.thumbnail
  }
}

export const handler = LambdaError.handle((event) => {
  event.queryStringParameters ??= {};

  const { queryStringParameters } = event;

  if (!queryStringParameters.url) {
    throw REQUIRED_PARAM_ERROR({ param: "url" });
  }

  const url = tryParseUrl(queryStringParameters.url);

  return tryExtractThumbnailUrl(url);
});
